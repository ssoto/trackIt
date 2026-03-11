#!/bin/bash
# Warning: @ts-ignore found — prefer @ts-expect-error with description
INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')
if [ -z "$FILE_PATH" ]; then exit 0; fi
echo "$FILE_PATH" | grep -qE '\.(ts|tsx)$' || exit 0
if grep -qEn '@ts-ignore' "$FILE_PATH" 2>/dev/null; then
  echo "Warning: @ts-ignore found — prefer @ts-expect-error with description" >&2
  exit 2
fi
exit 0
