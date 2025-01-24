FROM nginx:latest

RUN apt-get update && apt-get install --no-install-recommends --no-install-suggests -y psmisc
RUN addgroup --gid 1025 mygroup && adduser --disabled-password --ingroup mygroup --system myuser
RUN mkdir -p /var/cache/nginx && chown -R myuser /var/cache/nginx
RUN touch /var/run/nginx.pid && chown myuser /var/run/nginx.pid
RUN mkdir /opt/html && chown myuser /opt/html

COPY ./misc/docker-entrypoint.sh /opt
COPY ./misc/nginx.conf /etc/nginx/conf.d/default.conf
COPY dist/departure-monitor /usr/share/nginx/html

RUN chown -R myuser /usr/share/nginx/html/assets /usr/share/nginx/html/index.html

USER myuser
EXPOSE 80

HEALTHCHECK --interval=5m --timeout=10s CMD curl http://localhost/ || exit 1

STOPSIGNAL SIGTERM

CMD [ "/opt/docker-entrypoint.sh" ]
