FROM node:alpine
WORKDIR /usr/scr/app
COPY ./src ./
RUN npm i
CMD [ "node", "index.js" ]