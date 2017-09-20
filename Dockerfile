FROM node:6.11.3-alpine
EXPOSE 4420

ENV SERVICE_DIR=/srv/weather

COPY . ${SERVICE_DIR}
WORKDIR ${SERVICE_DIR}

RUN npm install

ENTRYPOINT [ "npm", "start" ]