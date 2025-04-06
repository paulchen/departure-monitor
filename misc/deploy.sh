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

cd "$BASE_DIR"

DEPLOY_HASH=`sha256sum misc/deploy.sh`
git pull || exit 1
if [ "$DEPLOY_HASH" != "`sha256sum misc/deploy.sh`" ]; then
	misc/deploy.sh
	exit $?
fi

docker pull nginx:latest || exit 1

. ~/.nvm/nvm.sh || exit 1
nvm install lts/jod || exit 1

npm install || exit 1
npm run build -- --configuration production --aot || exit 1


if [ "$1" == "--full-rebuild" ]; then
	docker build . -t departure-monitor:latest --no-cache || exit 1
else
	docker build . -t departure-monitor:latest || exit 1
	sudo systemctl restart "$SYSTEMD_UNIT" || exit 1
fi

