FROM node:16-alpine
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# install packages
COPY package*.json ./
RUN npm install

# copy everything
COPY . .

# start the server
EXPOSE 8000
CMD [ "npm", "start" ]
