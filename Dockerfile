FROM node:16-alpine

RUN mkdir -p /usr/src/app

WORKDIR /usr/src/app

EXPOSE 8000

# You can change this
CMD [ "npm", "start" ]
