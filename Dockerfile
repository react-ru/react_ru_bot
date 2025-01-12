FROM node:20-alpine AS builder

WORKDIR /var/react_ru_bot

COPY . .

RUN mkdir data
RUN npm install --only=production
RUN npm run migrate:latest

FROM node:20-alpine

WORKDIR /var/react_ru_but

COPY --from=builder /var/react_ru_bot ./

ENTRYPOINT [ "npm", "start" ]
