#!/bin/bash

envsubst < /usr/share/nginx/html/assets/env.template.js > /usr/share/nginx/html/assets/env.js
rm /usr/share/nginx/html/assets/env.template.js

if [ "$BASE_HREF" != "" ]; then
  sed -e 's/<base href="\/">/<base href="${BASE_HREF}">/' < /usr/share/nginx/html/index.html > /opt/html/index.template.html
  envsubst < /opt/html/index.template.html > /usr/share/nginx/html/index.html
fi

trap 'killall -SIGTERM nginx' SIGTERM

nginx -g "daemon off;" &
wait $!

