FROM node:16

WORKDIR /app

RUN npm install -g typescript
RUN npm install -g ts-node

COPY . /app

RUN npm install

ENV PORT=80
EXPOSE 80

CMD ["ts-node", "server.ts"]
