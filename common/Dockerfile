FROM node:24

RUN mkdir -p /app/common

WORKDIR /app/common

COPY package*.json ./

RUN npm i

COPY . .

CMD ["npm", "run", "start"]