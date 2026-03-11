#!/bin/bash
# Warn on catch blocks without :unknown type annotation
INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')
if [ -z "$FILE_PATH" ]; then exit 0; fi
echo "$FILE_PATH" | grep -qE '\.(ts|tsx)$' || exit 0
if grep -nE "\bcatch\s*\(\w+\)" "$FILE_PATH" | grep -vE ":\s*unknown" | head -3 | grep -q "."; then
  echo "Warning: catch block without explicit :unknown type annotation" >&2
  exit 2
fi
exit 0
