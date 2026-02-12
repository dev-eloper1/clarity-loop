# Hooks

Clarity Loop uses Claude Code's hook system to enforce pipeline rules automatically. Two hooks run on every file edit — one before (protection), one after (manifest regeneration).

---

## Overview

| Hook | Type | Trigger | Purpose |
|------|------|---------|---------|
| **protect-system-docs** | `PreToolUse` | `Edit` or `Write` | Blocks unauthorized writes to system docs |
| **generate-manifest** | `PostToolUse` | `Edit` or `Write` | Regenerates the manifest when system docs change |

Both hooks read configuration from [`.clarity-loop.json`](pipeline-concepts.md#configuration) via the shared config loader.

---

## protect-system-docs

**File**: `hooks/protect-system-docs.js`
**Type**: PreToolUse (runs BEFORE the edit happens)
**Matcher**: `Edit|Write`

### What It Does

Checks if the target file is inside `{docsRoot}/system/`. If so:

1. **Exempt files** — `.manifest.md` and `.pipeline-authorized` are always allowed through
2. **Authorization check** — reads `{docsRoot}/system/.pipeline-authorized` for a valid marker
3. **If authorized** — allows the edit (marker contains operation type: `bootstrap`, `merge`, or `correct`)
4. **If not authorized** — blocks the edit with an error message explaining the three authorized paths

### Error Message

When blocked, the hook explains:
- System docs are pipeline-protected
- Three ways to authorize: bootstrap (initial setup), merge (approved proposals), correct (targeted fixes from audit)
- Suggests the appropriate skill to use

### The Authorization Marker

The `.pipeline-authorized` file is created by skills before they need to write to system docs and removed immediately after:

```
operation: merge
created: 2026-02-09T15:30:00Z
```

If a skill finds a stale marker on startup (from a crashed session), it helps clean up the interrupted operation.

---

## generate-manifest

**File**: `hooks/generate-manifest.js`
**Type**: PostToolUse (runs AFTER the edit completes)
**Matcher**: `Edit|Write`

### What It Does

Checks if the edited file is inside `{docsRoot}/system/`. If so, regenerates `{docsRoot}/system/.manifest.md`.

### Manifest Contents

The generated manifest includes:

| Section | Content |
|---------|---------|
| **Header** | Generated timestamp, content hash (SHA-256, first 16 chars) |
| **Documents table** | File path, line count, section count, last modified date |
| **Section index** | Per file: every `##` heading with start and end line numbers |
| **Cross-references** | Which docs reference which other docs (detected by file mentions) |

### Content Hashing

The manifest includes a content hash of all system docs combined. This enables staleness detection — if the hash hasn't changed, the manifest is current.

### When It Runs

- Automatically after any edit to a file in `{docsRoot}/system/`
- During initialization (`node scripts/init.js`) if system docs already exist
- Can be called directly: `node hooks/generate-manifest.js --init`

---

## hooks.json

**File**: `hooks/hooks.json`

Defines both hooks in Claude Code's hook configuration format:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "node ${CLAUDE_PLUGIN_ROOT}/hooks/protect-system-docs.js"
          }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "node ${CLAUDE_PLUGIN_ROOT}/hooks/generate-manifest.js"
          }
        ]
      }
    ]
  }
}
```

`${CLAUDE_PLUGIN_ROOT}` is resolved by Claude Code to the plugin's installation directory.

---

## config.js

**File**: `hooks/config.js`

Shared configuration loader used by both hooks and the init script.

### Functions

| Function | Purpose |
|----------|---------|
| `loadConfig(projectRoot)` | Reads `.clarity-loop.json`, falls back to `{ version: 1, docsRoot: "docs" }` |
| `resolveDocPath(projectRoot, config, ...segments)` | Resolves paths relative to docsRoot |

### Config File

```json
{
  "version": 1,
  "docsRoot": "docs"
}
```

If `.clarity-loop.json` is missing or invalid, hooks silently fall back to the default (`docs/`).

---

## Init Script

**File**: `scripts/init.js`

Scaffolds the documentation pipeline directory structure. Idempotent — safe to run multiple times.

### What It Creates

```bash
node clarity-loop/scripts/init.js
```

1. **Directories**: system, research, proposals, reviews/proposals, reviews/audit, reviews/design, specs, designs
2. **Tracking files**: DECISIONS.md, RESEARCH_LEDGER.md, PROPOSAL_TRACKER.md, STATUS.md (from templates)
3. **Config file**: `.clarity-loop.json` with chosen docsRoot
4. **Gitignore entries**: `.manifest.md` and `.pipeline-authorized`
5. **Initial manifest**: if system docs already exist

### Collision Detection

The script checks for existing directories that would collide with Clarity Loop's structure. If found:
- Detects existing Clarity Loop installation (checks for `.manifest.md`, `reviews/proposals`, etc.)
- Checks for non-managed files in target directories
- Prompts for an alternative docsRoot (e.g., `clarity-docs` instead of `docs`)

---

## Related

- [Pipeline Concepts](pipeline-concepts.md) — Protection model, manifest, configuration
- [cl-reviewer](cl-reviewer.md#merge) — Creates authorization markers during merge
- [cl-reviewer](cl-reviewer.md#correct) — Creates authorization markers during corrections
- [cl-researcher](cl-researcher.md#bootstrap) — Creates authorization markers during bootstrap
