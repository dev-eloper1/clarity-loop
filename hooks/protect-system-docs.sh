#!/usr/bin/env bash
# DEPRECATED: This file is replaced by protect-system-docs.js (Node.js).
# The hooks.json now points to the .js version. This file is kept for one release
# cycle and will be removed in a future version.
#
# clarity-loop/hooks/protect-system-docs.sh
# PreToolUse hook: blocks direct Edit/Write to docs/system/ files.
#
# Exempt files (always allowed):
#   - .manifest.md          — auto-generated doc index
#   - .pipeline-authorized  — skills create/delete this marker
#
# Pipeline bypass: if docs/system/.pipeline-authorized exists with valid
# structured content, edits are allowed. Valid operations: bootstrap, merge, correct.
#
# Reads the tool input from stdin (JSON with tool_name and tool_input).
# Outputs JSON with permissionDecision if the edit should be blocked.

set -euo pipefail

# Read the hook input from stdin
input=$(cat)

# Extract the file path from tool_input
# The field is "file_path" for both Edit and Write tools
file_path=$(echo "$input" | python3 -c "
import sys, json
data = json.load(sys.stdin)
tool_input = data.get('tool_input', {})
print(tool_input.get('file_path', ''))
" 2>/dev/null || echo "")

# If we couldn't extract a path, allow the operation
if [ -z "$file_path" ]; then
  exit 0
fi

# Check if the path targets docs/system/
if echo "$file_path" | grep -q 'docs/system/'; then

  # --- Exempt files: manifest and pipeline-authorized marker ---
  if echo "$file_path" | grep -q 'docs/system/\.manifest\.md'; then
    exit 0
  fi
  if echo "$file_path" | grep -q 'docs/system/\.pipeline-authorized'; then
    exit 0
  fi

  # --- Pipeline authorization bypass ---
  # If a .pipeline-authorized marker exists with valid content, allow the edit.
  # Valid marker must have an "operation:" line with value bootstrap, merge, or correct.
  project_root=$(echo "$file_path" | sed 's|/docs/system/.*||')
  marker="$project_root/docs/system/.pipeline-authorized"

  if [ -f "$marker" ]; then
    # Validate marker content: must contain operation: bootstrap|merge|correct
    # Use sed for portability (grep -P not available on macOS)
    operation=$(sed -n 's/^operation:[[:space:]]*\([a-z]*\).*/\1/p' "$marker" 2>/dev/null | head -1)
    if [ "$operation" = "bootstrap" ] || [ "$operation" = "merge" ] || [ "$operation" = "correct" ]; then
      # Valid authorization — allow the edit
      exit 0
    fi
    # Invalid marker content — fall through to deny
  fi

  # Block the edit
  cat <<'DENY_JSON'
{
  "permissionDecision": "deny",
  "reason": "Direct edits to docs/system/ are blocked by Clarity Loop. System docs are pipeline-managed. Authorized paths:\n  - /doc-researcher bootstrap  (initial doc creation)\n  - /doc-reviewer merge        (apply approved proposals)\n  - /doc-reviewer correct       (targeted fixes from audit/review findings)\nAll three create a temporary .pipeline-authorized marker that allows edits."
}
DENY_JSON
  exit 0
fi

# Not a system doc path — allow
exit 0
