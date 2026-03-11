#!/bin/bash
# Warning: useEffect missing cleanup for subscription/timer — add a cleanup return
INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')
if [ -z "$FILE_PATH" ]; then exit 0; fi
node -e 'const f=process.argv[1]||'\'''\'';if(!f.endsWith('\''.tsx'\'')&&!f.endsWith('\''.jsx'\''))process.exit(0);const c=require('\''fs'\'').readFileSync(f,'\''utf8'\'');if(/useEffect\s*\(/.test(c)&&/(subscribe|addEventListener|setInterval|setTimeout|on\()/.test(c)&&!/return\s*(\(\)\s*=>|function)/.test(c)){process.stderr.write('\''useEffect with subscription/timer but no cleanup return detected'\'');process.exit(1)}' -- "$FILE_PATH" 2>/dev/null
RESULT=$?
if [ $RESULT -ne 0 ]; then
  echo "Warning: useEffect missing cleanup for subscription/timer — add a cleanup return" >&2
  exit 2
fi
exit 0
