FROM node:24-alpine3.21

# Update Alpine packages to reduce vulnerabilities
RUN apk update && apk upgrade --no-cache
RUN apk add --no-cache curl

EXPOSE 4500

RUN mkdir -p /app/server

WORKDIR /app/server

COPY package*.json ./

RUN npm i

COPY . ./

CMD ["npm", "run", "dev"]