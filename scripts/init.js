#!/usr/bin/env node
// clarity-loop/scripts/init.js
// Scaffolds the documentation pipeline directory structure and tracking files.
// Includes collision detection for existing docs directories.
// Idempotent — safe to run multiple times.

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { DEFAULT_CONFIG, loadConfig, resolveDocPath } = require('../hooks/config');

// Resolve project root and plugin root
const projectRoot = process.env.CLARITY_LOOP_PROJECT_ROOT || process.cwd();
const pluginRoot = process.env.CLARITY_LOOP_PLUGIN_ROOT || path.resolve(__dirname, '..');

function log(msg) {
  process.stdout.write(msg + '\n');
}

function prompt(question) {
  if (!process.stdin.isTTY) {
    // Non-interactive (piped stdin, CI) — return empty to trigger defaults/cancellation
    return Promise.resolve('');
  }
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.on('close', () => resolve(''));
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

/**
 * Detect if the target directory already has a Clarity Loop installation.
 * Checks for structural signals that are unique to Clarity Loop.
 */
function isExistingInstallation(rootPath) {
  const signals = [
    path.join(rootPath, 'system', '.manifest.md'),
    path.join(rootPath, 'reviews', 'proposals'),
    path.join(rootPath, 'reviews', 'audit'),
  ];
  return signals.some((s) => fs.existsSync(s));
}

/**
 * Check a directory for existing non-Clarity-Loop .md files.
 * Returns an array of filenames that don't have the clarity-loop-managed marker.
 */
function findNonManagedFiles(dirPath) {
  const foreign = [];
  if (!fs.existsSync(dirPath)) return foreign;

  let entries;
  try {
    entries = fs.readdirSync(dirPath);
  } catch {
    return foreign;
  }

  for (const name of entries) {
    if (!name.endsWith('.md')) continue;
    // Skip known Clarity Loop internal files
    if (name === '.manifest.md' || name === '.pipeline-authorized') continue;

    const filePath = path.join(dirPath, name);
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      if (!content.includes('<!-- clarity-loop-managed -->')) {
        foreign.push(name);
      }
    } catch {
      // Can't read — assume foreign
      foreign.push(name);
    }
  }

  return foreign;
}

/**
 * Run collision detection for all documentation directories.
 * Returns the docsRoot to use (may be user-chosen if collisions found).
 */
async function detectCollisions(defaultRoot) {
  // If this is already a Clarity Loop installation (upgrade scenario), skip collision
  // detection. Files from pre-marker versions won't have the managed marker but are
  // still ours — don't flag them as foreign.
  const docsPath = path.join(projectRoot, defaultRoot);
  if (isExistingInstallation(docsPath)) {
    log('  Existing Clarity Loop installation detected — skipping collision check.');
    return defaultRoot;
  }

  const dirsToCheck = ['system', 'research', 'proposals', 'specs'];
  const trackingFiles = ['RESEARCH_LEDGER.md', 'PROPOSAL_TRACKER.md', 'STATUS.md', 'DECISIONS.md'];

  const collisions = [];

  for (const dir of dirsToCheck) {
    const dirPath = path.join(projectRoot, defaultRoot, dir);
    const foreign = findNonManagedFiles(dirPath);
    if (foreign.length > 0) {
      collisions.push({ path: `${defaultRoot}/${dir}/`, files: foreign });
    }
  }

  for (const file of trackingFiles) {
    const filePath = path.join(projectRoot, defaultRoot, file);
    if (fs.existsSync(filePath)) {
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        if (!content.includes('<!-- clarity-loop-managed -->')) {
          collisions.push({ path: `${defaultRoot}/${file}`, files: [file] });
        }
      } catch {
        collisions.push({ path: `${defaultRoot}/${file}`, files: [file] });
      }
    }
  }

  if (collisions.length === 0) {
    return defaultRoot;
  }

  // Non-interactive mode: can't prompt, use default with a warning
  if (!process.stdin.isTTY) {
    log('');
    log(`\u26A0 Found existing files in ${defaultRoot}/ that may collide with Clarity Loop.`);
    log('  Using default root (non-interactive mode). Set docsRoot in .clarity-loop.json to change.');
    return defaultRoot;
  }

  // Report collisions
  const totalFiles = collisions.reduce((n, c) => n + c.files.length, 0);
  log('');
  log(`\u26A0 Found ${totalFiles} existing file(s) not created by Clarity Loop:`);
  for (const c of collisions) {
    log(`  ${c.path}: ${c.files.join(', ')}`);
  }
  log('');
  log('  The protection hook will block edits to files in the system/ directory.');
  log('');
  log('  Options:');
  log(`    1. Use '${defaultRoot}/' anyway (existing ${defaultRoot}/system/ files will be protected)`);
  log('    2. Use a different root [enter path, e.g. clarity-docs]');
  log('    3. Cancel');
  log('');

  // Prompt with validation loop
  while (true) {
    const answer = await prompt('  Choice [2]: ');

    if (answer === '1') {
      return defaultRoot;
    } else if (answer === '3') {
      log('Cancelled.');
      process.exit(0);
    } else if (answer === '' || answer === '2') {
      const customRoot = await prompt('  Enter docs root path (e.g. clarity-docs): ');
      if (!customRoot) {
        log('No path provided. Cancelled.');
        process.exit(1);
      }
      // Normalize: strip trailing slashes and backslashes
      return customRoot.replace(/[\\/]+$/, '');
    } else {
      log(`  Invalid choice: "${answer}". Please enter 1, 2, or 3.`);
    }
  }
}

async function main() {
  log(`Initializing Clarity Loop in: ${projectRoot}`);
  log(`Plugin root: ${pluginRoot}`);

  // --- Determine docsRoot ---
  const configPath = path.join(projectRoot, '.clarity-loop.json');
  let config;
  let docsRoot;

  if (fs.existsSync(configPath)) {
    // Config already exists — use it, skip collision detection
    config = loadConfig(projectRoot);
    docsRoot = config.docsRoot;
    log(`  Using configured docs root: ${docsRoot}/`);
  } else {
    // No config yet — run collision detection
    docsRoot = await detectCollisions(DEFAULT_CONFIG.docsRoot);
    config = { ...DEFAULT_CONFIG, docsRoot };

    // Write .clarity-loop.json
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2) + '\n');
    log(`  [created] .clarity-loop.json (docsRoot: "${docsRoot}")`);
  }

  // --- Create directories ---
  const dirs = [
    'system',
    'research',
    'proposals',
    'reviews/proposals',
    'reviews/audit',
    'reviews/design',
    'specs',
    'designs',
    'context',
  ];

  for (const dir of dirs) {
    const target = resolveDocPath(projectRoot, config, dir);
    if (fs.existsSync(target)) {
      log(`  [exists] ${docsRoot}/${dir}/`);
    } else {
      fs.mkdirSync(target, { recursive: true });
      log(`  [created] ${docsRoot}/${dir}/`);
    }
  }

  // --- Copy tracking file templates ---
  const templates = [
    { src: 'research-ledger.md', dest: 'RESEARCH_LEDGER.md' },
    { src: 'proposal-tracker.md', dest: 'PROPOSAL_TRACKER.md' },
    { src: 'status.md', dest: 'STATUS.md' },
    { src: 'decisions.md', dest: 'DECISIONS.md' },
  ];

  for (const { src, dest } of templates) {
    const target = resolveDocPath(projectRoot, config, dest);
    if (fs.existsSync(target)) {
      log(`  [exists] ${docsRoot}/${dest}`);
    } else {
      const srcPath = path.join(pluginRoot, 'templates', src);
      fs.copyFileSync(srcPath, target);
      log(`  [created] ${docsRoot}/${dest}`);
    }
  }

  // --- Add .manifest.md and .pipeline-authorized to .gitignore ---
  const gitignorePath = path.join(projectRoot, '.gitignore');
  const gitignoreEntries = [
    `${docsRoot}/system/.manifest.md`,
    `${docsRoot}/system/.pipeline-authorized`,
  ];

  if (fs.existsSync(gitignorePath)) {
    let gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
    for (const entry of gitignoreEntries) {
      if (gitignoreContent.includes(entry)) {
        log(`  [exists] .gitignore entry for ${entry}`);
      } else {
        gitignoreContent += `\n# Clarity Loop \u2014 auto-generated\n${entry}\n`;
        log(`  [added] .gitignore entry for ${entry}`);
      }
    }
    fs.writeFileSync(gitignorePath, gitignoreContent);
  } else {
    let content = '# Clarity Loop \u2014 auto-generated\n';
    for (const entry of gitignoreEntries) {
      content += `${entry}\n`;
    }
    fs.writeFileSync(gitignorePath, content);
    log('  [created] .gitignore with Clarity Loop entries');
  }

  // --- Generate initial manifest if system docs exist ---
  const systemDir = resolveDocPath(projectRoot, config, 'system');
  let hasSystemDocs = false;
  try {
    const entries = fs.readdirSync(systemDir);
    hasSystemDocs = entries.some((e) => e.endsWith('.md') && e !== '.manifest.md');
  } catch {
    // Directory doesn't exist or can't be read
  }

  if (hasSystemDocs) {
    log('');
    log('System docs found. Generating initial manifest...');
    const generateManifest = path.join(pluginRoot, 'hooks', 'generate-manifest.js');
    const { execFileSync } = require('child_process');
    try {
      execFileSync('node', [generateManifest, '--init'], {
        cwd: projectRoot,
        env: { ...process.env, CLARITY_LOOP_PROJECT_ROOT: projectRoot },
        stdio: 'inherit',
      });
      log(`  [generated] ${docsRoot}/system/.manifest.md`);
    } catch (err) {
      log(`  [warning] Could not generate manifest: ${err.message}`);
    }
  } else {
    log('');
    log(`No system docs found in ${docsRoot}/system/ \u2014 manifest will be generated`);
    log('automatically when you add system docs.');
  }

  log('');
  log('Clarity Loop initialized. You\'re ready to go.');
  log('');
  log('Next steps:');
  log(`  1. Add your system docs to ${docsRoot}/system/`);
  log('  2. Run /doc-researcher research "topic" to start a research cycle');
}

main().catch((err) => {
  process.stderr.write(`Error: ${err.message}\n`);
  process.exit(1);
});
