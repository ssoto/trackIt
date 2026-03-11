#!/bin/bash
# Warning: multiple useEffect+setState chains detected — consider consolidating
INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')
if [ -z "$FILE_PATH" ]; then exit 0; fi
node -e 'const f=process.argv[1]||'\'''\'';if(!f.endsWith('\''.tsx'\'')&&!f.endsWith('\''.jsx'\''))process.exit(0);const c=require('\''fs'\'').readFileSync(f,'\''utf8'\'');const m=c.match(/useEffect\s*\(\s*\(\)\s*=>\s*\{[^}]*setState[^}]*\}\s*,\s*\[[^\]]*\]\s*\)/g);if(m&&m.length>=3){process.stderr.write(m.length+'\'' useEffect+setState chains — consolidate into event handlers or useReducer'\'');process.exit(1)}' -- "$FILE_PATH" 2>/dev/null
RESULT=$?
if [ $RESULT -ne 0 ]; then
  echo "Warning: multiple useEffect+setState chains detected — consider consolidating" >&2
  exit 2
fi
exit 0
