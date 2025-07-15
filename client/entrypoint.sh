#!/bin/sh

# Generate env.js with the current container environment
cat <<EOF > /app/dist/env.js
window.env = {
  VITE_APP_BACKEND: "${VITE_APP_BACKEND}",
  VITE_APP_NAME: "${VITE_APP_NAME}"
};
EOF

exec "$@"
