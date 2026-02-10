#!/usr/bin/env node
// clarity-loop/hooks/protect-system-docs.js
// PreToolUse hook: blocks direct Edit/Write to {docsRoot}/system/ files.
//
// Exempt files (always allowed):
//   - .manifest.md          — auto-generated doc index
//   - .pipeline-authorized  — skills create/delete this marker
//
// Pipeline bypass: if {docsRoot}/system/.pipeline-authorized exists with valid
// structured content, edits are allowed. Valid operations: bootstrap, merge, correct.
//
// Reads the tool input from stdin (JSON with tool_name and tool_input).
// Outputs JSON with permissionDecision if the edit should be blocked.

const fs = require('fs');
const path = require('path');
const { loadConfig } = require('./config');

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

  // Build the system docs prefix from config
  const systemPrefix = config.docsRoot + '/system/';

  // Check if the path targets {docsRoot}/system/ at a path boundary
  // (must be preceded by / or start of string to avoid substring matches like my-doc/system/)
  const prefixIndex = normalizedPath.indexOf(systemPrefix);
  if (prefixIndex < 0 || (prefixIndex > 0 && normalizedPath[prefixIndex - 1] !== '/')) {
    // Not a system doc path — allow
    process.exit(0);
  }

  // --- Exempt files: manifest and pipeline-authorized marker ---
  const afterPrefix = normalizedPath.substring(prefixIndex + systemPrefix.length);
  if (afterPrefix === '.manifest.md' || afterPrefix.startsWith('.manifest.md')) {
    process.exit(0);
  }
  if (afterPrefix === '.pipeline-authorized' || afterPrefix.startsWith('.pipeline-authorized')) {
    process.exit(0);
  }

  // --- Pipeline authorization bypass ---
  // Derive project root from the file path by stripping everything from docsRoot onwards
  const derivedRoot = prefixIndex > 0 ? normalizedPath.substring(0, prefixIndex) : projectRoot;
  const markerPath = path.join(derivedRoot, config.docsRoot, 'system', '.pipeline-authorized');

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

  // Block the edit
  const denyMessage = [
    'Direct edits to ' + config.docsRoot + '/system/ are blocked by Clarity Loop.',
    'System docs are pipeline-managed. Authorized paths:',
    '  - /doc-researcher bootstrap  (initial doc creation)',
    '  - /doc-reviewer merge        (apply approved proposals)',
    '  - /doc-reviewer correct       (targeted fixes from audit/review findings)',
    'All three create a temporary .pipeline-authorized marker that allows edits.'
  ].join('\n');

  const denyJson = JSON.stringify({
    permissionDecision: 'deny',
    reason: denyMessage
  }, null, 2);

  process.stdout.write(denyJson + '\n');
  process.exit(0);
}

main();
