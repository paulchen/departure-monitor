FROM nginx:latest
COPY ./misc/nginx.conf /etc/nginx/conf.d/default.conf
COPY dist/departure-monitor /usr/share/nginx/html
EXPOSE 80

