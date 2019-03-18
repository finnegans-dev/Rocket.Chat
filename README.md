
![](https://user-images.githubusercontent.com/551004/43643393-884b00a4-9701-11e8-94d8-14c46d1f3660.png)

<h1 align="center">
  The Ultimate Open Source WebChat Platform
</h1>

# Instalación

* meteor npm install

# Ejecución

* meteor run


# Rutas

* http://localhost:3000/chat/loginGO/{token}&email={email} 

# Docker

* Build
meteor build --directory /tmp/rocketchat-build

* Imagen de docker
cp Dockerfile /tmp/rocketchat-build
cd /tmp/rocketchat-build
docker build -t rocketchat:custombuild .

* Run
docker run --name rocketchat-custombuild -p 3000:3000 --env MONGO_URL={URL Mongo} --env ROOT_URL={URL} -d rocketchat:custombuild


