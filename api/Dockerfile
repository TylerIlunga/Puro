FROM node:latest

WORKDIR /opt/app

ADD . /opt/app

ADD package.json /tmp/package.json

RUN cd /tmp && npm install

RUN mkdir -p /opt/app && cp -a /tmp/node_modules /opt/app/

EXPOSE 3000

CMD npm start