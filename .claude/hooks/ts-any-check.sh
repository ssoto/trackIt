#!/bin/bash
# Warn on unqualified "any" types in TypeScript files
INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')
if [ -z "$FILE_PATH" ]; then exit 0; fi
echo "$FILE_PATH" | grep -qE '\.(ts|tsx)$' || exit 0
if grep -nE "\bany\b" "$FILE_PATH" | grep -vE "(// eslint-disable|// @ts-|// any:|as any // justified)" | head -5 | grep -q "."; then
  echo "Warning: file contains unqualified \"any\" types — consider using \"unknown\" with type guards" >&2
  exit 2
fi
exit 0
