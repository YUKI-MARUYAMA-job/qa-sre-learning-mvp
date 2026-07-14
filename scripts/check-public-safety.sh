#!/usr/bin/env bash
set -euo pipefail

echo "Checking for files that should not be committed to a public repository..."

unsafe_files="$(
  find . \
    \( \
      -name ".env" \
      -o -name ".env.*" \
      -o -name "*.pem" \
      -o -name "*.key" \
      -o -name "*.p12" \
      -o -name "*.pfx" \
      -o -name "*.crt" \
      -o -name "*.cer" \
      -o -name "*.code-profile" \
      -o -name "*.bundle" \
      -o -name "*.mobileprovision" \
      -o -name "id_rsa" \
      -o -name "id_dsa" \
      -o -name "id_ecdsa" \
      -o -name "id_ed25519" \
    \) \
    -not -name ".env.example" \
    -not -name ".env.sample" \
    -not -path "./.git/*" \
    -not -path "./node_modules/*" \
    -not -path "./dist/*" \
    -not -path "./coverage/*" \
    -print
)"

if [[ -n "$unsafe_files" ]]; then
  echo "Public safety check failed. Potentially unsafe files were found:" >&2
  echo "$unsafe_files" >&2
  echo >&2
  echo "Remove these files, rename them to safe templates, or add safe placeholders only." >&2
  exit 1
fi

echo "Public safety check passed."
