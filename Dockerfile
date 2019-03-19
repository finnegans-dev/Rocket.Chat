#FROM rocketchat/base:8
FROM alpine

ARG SRC_PATH

#ADD . /app

ENV PORT=3000 \
    ROOT_URL=http://localhost:3000 \
    DEPLOY_METHOD=docker \
    SRC_PATH=./build/bundle \
    NODE_ENV=production \
    MONGO_URL=mongodb://mongo:27017/rocketchat \
    Accounts_AvatarStorePath=/app/uploads

RUN set -x \
  && cd /app/bundle/programs/server/ \
  && npm install 

COPY ${SRC_PATH} /app/bundle

COPY ./traefik /app/bundle

COPY run.sh /app/bundle

WORKDIR /app/bundle

RUN node main.js &

EXPOSE 9080 9081 3000

CMD ["sh", "run.sh"]