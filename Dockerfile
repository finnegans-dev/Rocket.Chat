#FROM rocketchat/base:8
FROM alpine

ADD . /app

RUN set -x \
  && cd /app/bundle/programs/server/ \
  && npm install 

WORKDIR /app/bundle

ENV PORT=3000 \
    ROOT_URL=http://localhost:3000 \
    DEPLOY_METHOD=docker \
    NODE_ENV=production \
    MONGO_URL=mongodb://mongo:27017/rocketchat \
    Accounts_AvatarStorePath=/app/uploads
    

EXPOSE 3000

CMD ["node", "main.js"]