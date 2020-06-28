FROM node:12.18.1-slim

WORKDIR /usr/src/app
COPY package.json .
RUN npm install

EXPOSE 80
CMD [ "npm", "start" ]

COPY . .
