FROM node:lts-slim

RUN mkdir -p /usr/src/app

WORKDIR /usr/src/app

EXPOSE 8000

# You can change this
CMD [ "npm", "start" ]
