#!/usr/bin/env node
// clarity-loop/hooks/protect-system-docs.js
// PreToolUse hook: blocks direct Edit/Write to protected paths.
//
// Protected paths come from config.protectedPaths (if set) or default to
// {docsRoot}/system/ for backward compatibility with user projects.
//
// Exempt files (always allowed within a protected path):
//   - .manifest.md  — auto-generated doc index written by generate-manifest.js
//
// Pipeline bypass: if .pipeline-authorized exists at the project root with valid
// structured content, edits are allowed. Valid operations: bootstrap, merge, correct.
//
// Reads the tool input from stdin (JSON with tool_name and tool_input).
// Outputs JSON with permissionDecision if the edit should be blocked.

const fs = require('fs');
const path = require('path');
const { loadConfig, resolveProtectedPaths } = require('./config');

function main() {
  // Read the hook input from stdin
  let input = '';
  try {
    input = fs.readFileSync(0, 'utf8');
  } catch {
    // Can't read stdin — allow
    process.exit(0);
  }

  // Extract the file path from tool_input
  let filePath = '';
  try {
    const data = JSON.parse(input);
    const toolInput = data.tool_input || {};
    filePath = toolInput.file_path || '';
  } catch {
    // Invalid JSON — allow
    process.exit(0);
  }

  // If we couldn't extract a path, allow the operation
  if (!filePath) {
    process.exit(0);
  }

  // Normalize the path for consistent matching (handles Windows backslashes)
  const normalizedPath = filePath.replace(/\\/g, '/');

  // Load config from project root (cwd for hooks)
  const projectRoot = process.cwd();
  const config = loadConfig(projectRoot);

  // Resolve the list of protected paths (absolute)
  const protectedPaths = resolveProtectedPaths(projectRoot, config);

  // Check if the file is within any protected path (requires a path boundary)
  let matchedProtectedPath = null;
  for (const p of protectedPaths) {
    const np = p.replace(/\\/g, '/');
    if (normalizedPath.startsWith(np + '/') || normalizedPath === np) {
      matchedProtectedPath = np;
      break;
    }
  }

  if (!matchedProtectedPath) {
    // Not under any protected path — allow
    process.exit(0);
  }

  // --- Exempt files within protected path ---
  const afterPrefix = normalizedPath.substring(matchedProtectedPath.length + 1);
  if (afterPrefix === '.manifest.md') {
    // Auto-generated index — written by generate-manifest.js hook
    process.exit(0);
  }

  // --- Pipeline authorization bypass ---
  // Marker is at project root (path-independent)
  const markerPath = path.join(projectRoot, '.pipeline-authorized');

  try {
    const markerContent = fs.readFileSync(markerPath, 'utf8');
    const match = markerContent.match(/^operation:\s*([a-z]+)/m);
    if (match) {
      const operation = match[1];
      if (operation === 'bootstrap' || operation === 'merge' || operation === 'correct') {
        // Valid authorization — allow the edit
        process.exit(0);
      }
    }
    // Invalid marker content — fall through to deny
  } catch {
    // Marker doesn't exist — fall through to deny
  }

  // Build deny message listing the protected paths
  const protectedList = protectedPaths
    .map(p => path.relative(projectRoot, p))
    .join(', ');

  // Block the edit
  const denyMessage = [
    'Direct edits to ' + protectedList + ' are blocked by Clarity Loop.',
    'These paths are pipeline-managed. Authorized paths:',
    '  - /cl-researcher bootstrap  (initial doc creation)',
    '  - /cl-reviewer merge        (apply approved proposals)',
    '  - /cl-reviewer correct       (targeted fixes from audit/review findings)',
    'All three create a temporary .pipeline-authorized marker at the project root that allows edits.'
  ].join('\n');

  const denyJson = JSON.stringify({
    permissionDecision: 'deny',
    reason: denyMessage
  }, null, 2);

  process.stdout.write(denyJson + '\n');
  process.exit(0);
}

main();
