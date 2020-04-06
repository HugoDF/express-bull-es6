FROM node:lts
WORKDIR '/var/www/app'
COPY package*.json ./
RUN npm ci
COPY . .
RUN chown -R node:node /var/www/app
USER node
