FROM node:16-slim

ENV NODE_ENV=production

WORKDIR /opt/discord-bot-thecodinglove

COPY package.json package-lock.json ./

RUN npm install --production

COPY src .

CMD [ "node", "index.js" ]
