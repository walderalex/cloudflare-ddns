FROM node:18.19.0-alpine

WORKDIR /app

COPY package-lock.json .
COPY package.json .
COPY index.js .

RUN npm ci

CMD ["node", "."]



