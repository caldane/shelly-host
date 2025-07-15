FROM node:24
# Update Debian packages to reduce vulnerabilities
RUN apt update && apt upgrade -y
RUN apt install -y curl

EXPOSE 4500

RUN mkdir -p /app/server

WORKDIR /app/server

COPY package*.json ./

RUN npm i

COPY . .

CMD ["npm", "run", "dev"]