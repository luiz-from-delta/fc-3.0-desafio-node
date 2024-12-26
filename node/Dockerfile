FROM node:18-alpine

WORKDIR /app

COPY package*.json .

RUN chown -R node:node /app

USER node

COPY . .

EXPOSE 3000

ENTRYPOINT [ "sh", "-c", "npm install && node index.js" ]