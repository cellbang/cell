#/bin/bash

set -o allexport
source .env.malagu.local set
set +o allexport

if [ -f '.env.deploy.local' ]; then
  cp .env.deploy.local .malagu/dist/backend/.env
fi
malagu deploy -m fc -s
