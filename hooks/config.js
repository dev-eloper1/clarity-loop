// clarity-loop/hooks/config.js
// Shared config loader for hooks and init.
// Reads .clarity-loop.json from the project root, falls back to defaults.

const fs = require('fs');
const path = require('path');

const DEFAULT_CONFIG = { version: 1, docsRoot: 'docs', protectedPaths: null };

/**
 * Load .clarity-loop.json from the project root.
 * Falls back to DEFAULT_CONFIG if the file is missing, invalid JSON, or has empty docsRoot.
 */
function loadConfig(projectRoot) {
  const configPath = path.join(projectRoot, '.clarity-loop.json');
  let config = { ...DEFAULT_CONFIG };

  try {
    let raw = fs.readFileSync(configPath, 'utf8');
    // Strip UTF-8 BOM if present (common on Windows editors)
    raw = raw.replace(/^\uFEFF/, '');
    const parsed = JSON.parse(raw);

    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      if (typeof parsed.version === 'number') {
        config.version = parsed.version;
      }
      if (typeof parsed.docsRoot === 'string' && parsed.docsRoot.trim() !== '') {
        // Normalize: backslashes to forward slashes, strip trailing slashes
        config.docsRoot = parsed.docsRoot.replace(/\\/g, '/').replace(/\/+$/, '');
      }
      if (Array.isArray(parsed.protectedPaths)) {
        config.protectedPaths = parsed.protectedPaths.filter(
          p => typeof p === 'string' && p.trim() !== ''
        );
      }
    }
  } catch (err) {
    if (err.code !== 'ENOENT') {
      // File exists but is invalid — warn and use defaults
      process.stderr.write(`Warning: Invalid .clarity-loop.json — using defaults. (${err.message})\n`);
    }
    // ENOENT (file missing) is expected — silently use defaults
  }

  return config;
}

/**
 * Resolve a documentation path from the project root and config.
 * resolveDocPath('/project', config, 'system', 'ARCHITECTURE.md')
 * => '/project/docs/system/ARCHITECTURE.md' (with default docsRoot)
 */
function resolveDocPath(projectRoot, config, ...segments) {
  return path.join(projectRoot, config.docsRoot, ...segments);
}

/**
 * Resolve the list of protected paths as absolute paths.
 * If config.protectedPaths is set, each entry is resolved relative to projectRoot.
 * If absent or null, defaults to [{docsRoot}/system] (backward-compatible).
 */
function resolveProtectedPaths(projectRoot, config) {
  if (Array.isArray(config.protectedPaths) && config.protectedPaths.length > 0) {
    return config.protectedPaths.map(p => path.join(projectRoot, p));
  }
  return [path.join(projectRoot, config.docsRoot, 'system')];
}

module.exports = { DEFAULT_CONFIG, loadConfig, resolveDocPath, resolveProtectedPaths };
