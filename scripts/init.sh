#!/usr/bin/env bash
# clarity-loop/scripts/init.sh
# Thin wrapper — delegates to init.js for cross-platform compatibility.
# On Windows (without bash), run: node scripts/init.js
exec node "$(dirname "$0")/init.js" "$@"
