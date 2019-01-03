FROM node:current-slim

COPY api api/
COPY lib lib/
COPY middleware middleware/
COPY index.js .
COPY package.json .
COPY package-lock.json .

RUN npm install

CMD [ "node", "index.js" ]
