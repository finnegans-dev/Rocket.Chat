# creates a nodejs app bundle
meteor build --directory /tmp/rocketchat-build

# create docker image
cp Dockerfile /tmp/rocketchat-build
cd /tmp/rocketchat-build
docker build -t rocketchat:custombuild .

# run
docker run --name rocketchat-custombuild -p 3000:3000 --env MONGO_URL=mongodb://localhost:27017/rocketchat --env MONGO_OPLOG_URL=mongodb://localhost:27017/local -d rocketchat:custombuild