#!/bin/bash

SCRIPT_DIR=`dirname "$0"`
SCRIPT_DIR=`realpath "$SCRIPT_DIR"`
BASE_DIR=`realpath "$SCRIPT_DIR/.."`

cd "$SCRIPT_DIR"
if [ ! -f deploy.conf ]; then
	echo deploy.conf does not exist
	exit 1
fi

. deploy.conf

. ~/.nvm/nvm.sh || exit 1
nvm use lts/gallium || exit 1

cd "$BASE_DIR"

git pull || exit 1

npm install || exit 1
npm run build -- --configuration production --aot --base-href="$BASE_HREF" || exit 1

docker build -t departure-monitor:latest . || exit 1

sudo systemctl restart "$SYSTEMD_UNIT" || exit 1

