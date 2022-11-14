FROM node

ARG bot_token
ARG database_url=data/db.sqlite3
ARG log_to_chat_ids
ARG confirmations_to_chat_ids

WORKDIR /react_ru_bot
ADD data/ ./data
RUN rm ${database_url}
ADD lib/ ./lib
ADD migrations/ ./migrations
ADD seeds/ ./seeds
ADD index.ts .
ADD knexfile.ts .
ADD tsconfig.json .
ADD package.json .
ADD package-lock.json .
RUN npm install --no-save
RUN npm run migrate --all
RUN npm run seed

ENV NODE_ENV=production
ENV BOT_TOKEN=${bot_token}
ENV DATABASE_URL=${database_url}
ENV LOG_TO_CHAT_IDS=${log_to_chat_ids}
ENV CONFIRMATIONS_TO_CHAT_IDS=${confirmations_to_chat_ids}

CMD [ "npm", "start" ]
