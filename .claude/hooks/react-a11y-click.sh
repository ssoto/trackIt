#!/bin/bash
# Warning: <div onClick> without accessibility attributes found
INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')
if [ -z "$FILE_PATH" ]; then exit 0; fi
node -e 'const f=process.argv[1]||'\'''\'';if(!f.endsWith('\''.tsx'\'')&&!f.endsWith('\''.jsx'\''))process.exit(0);const c=require('\''fs'\'').readFileSync(f,'\''utf8'\'');const lines=c.split('\''\n'\'');let found=false;for(let i=0;i<lines.length;i++){if(/<div\s[^>]*onClick/.test(lines[i])&&!/role=/.test(lines[i])){process.stderr.write('\''<div onClick> at line '\''+(i+1)+'\'' — use <button> or add role + tabIndex + keyboard handler\n'\'');found=true}}if(found)process.exit(1)' -- "$FILE_PATH" 2>/dev/null
RESULT=$?
if [ $RESULT -ne 0 ]; then
  echo "Warning: <div onClick> without accessibility attributes found" >&2
  exit 2
fi
exit 0
