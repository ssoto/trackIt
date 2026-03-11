#!/bin/bash
# Warning: enum declaration found — prefer const arrays with as const and derived union types
INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')
if [ -z "$FILE_PATH" ]; then exit 0; fi
echo "$FILE_PATH" | grep -qE '\.(ts|tsx)$' || exit 0
if grep -qEn '^\s*enum\s+' "$FILE_PATH" 2>/dev/null; then
  echo "Warning: enum declaration found — prefer const arrays with as const and derived union types" >&2
  exit 2
fi
exit 0
