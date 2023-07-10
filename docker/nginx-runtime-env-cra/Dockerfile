FROM nginx:1.22.0-alpine

RUN rm -rf /etc/nginx/conf.d

RUN apk add --update nodejs
RUN apk add --update npm
RUN npm install -g runtime-env-cra@0.2.4
