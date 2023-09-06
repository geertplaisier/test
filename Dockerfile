FROM node:16.13.2 AS builder

ARG BASE_HREF=/

WORKDIR /app

COPY ./package.json /app
COPY ./package-lock.json /app
RUN npm install

COPY . /app

RUN npm run test
RUN npm run build -- --base-href=${BASE_HREF}

FROM nginx:1.21.6-alpine

COPY --from=builder /app/dist/app /usr/share/nginx/html

COPY docker/nginx.conf /etc/nginx/nginx.conf
COPY docker/api-proxy.conf.template /etc/nginx/templates/api-proxy.conf.template
COPY docker/admin-proxy.conf.template /etc/nginx/templates/admin-proxy.conf.template
COPY docker/enable-proxies.sh /docker-entrypoint.d/enable-proxies.sh

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --retries=2 CMD wget --spider --header 'Accept: text/html' http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
