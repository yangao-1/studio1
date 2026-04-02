#!/bin/bash
sed -i '174,180d' /workspaces/studio1/app.js
node -c /workspaces/studio1/app.js
