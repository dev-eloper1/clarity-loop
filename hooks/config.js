// clarity-loop/hooks/config.js
// Shared config loader for hooks and init.
// Reads .clarity-loop.json from the project root, falls back to defaults.

const fs = require('fs');
const path = require('path');

const DEFAULT_CONFIG = { version: 1, docsRoot: 'docs' };

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

module.exports = { DEFAULT_CONFIG, loadConfig, resolveDocPath };
