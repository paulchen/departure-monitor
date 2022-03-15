FROM nginx:latest

RUN addgroup --gid 1025 mygroup && adduser --disabled-password --ingroup mygroup --system myuser
RUN mkdir -p /var/cache/nginx && chown -R myuser /var/cache/nginx
RUN touch /var/run/nginx.pid && chown myuser /var/run/nginx.pid

USER myuser

COPY ./misc/nginx.conf /etc/nginx/conf.d/default.conf
COPY dist/departure-monitor /usr/share/nginx/html
EXPOSE 80


