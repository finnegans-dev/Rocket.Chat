
import { Meteor } from 'meteor/meteor';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Template } from 'meteor/templating';
import _ from 'underscore';
import { HTTP } from 'meteor/http'

/*
Finneg
*/

Template.loginGO.onCreated(function () {
    let token = FlowRouter.getParam("token");
    let email = FlowRouter.current().queryParams.email;
    let url = 'https://go-test.finneg.com/'
    let root = 'https://go-test.finneg.com/chat/'



    //window.localStorage.setItem("Meteor.loginToken", "");
    window.localStorage.setItem("Meteor.loginToken:/:/chat", "");

    root = __meteor_runtime_config__.ROOT_URL;
    //console.log(__meteor_runtime_config__);
    url = root.substring(0,root.lastIndexOf(`/c`)+1);
    //root = 'http://localhost:3000/';

    HTTP.call('GET', `${url}auth/token/info?access_token=${token}`, function (err, res) {
        if (err) {
            console.log(err)
            console.log("Error de Autenticacion")
        } else {
            //console.log(res);
            let dominio = res.data.domain;
            let dominioLow = dominio.toLowerCase();
            let emailRes = res.data.email;
            let contextoToken = res.data.lastContext.id;

            if (email == emailRes) {

                let pass = "";
                let i = 0;
                let top = email.length;
                while (pass.length <= 8) {
                    pass += email[i] + "" + parseInt(top / 2);
                    top--;
                    i++;
                }
                HTTP.post(`${root}api/v1/login`, {
                    data: {
                        "user": email,
                        "password": pass
                    }
                }, function (error, response) {
                    if (error) {
                        //Redirigo a registrar
                        console.log(error);
                        FlowRouter.go(`/registrarGO/${token}?email=${email}`);
                        //  FlowRouter.go
                    } else {

                        //console.log(response.data);
                        let data = JSON.parse(response.content)
                        //console.log(data)
                        let idUser = data.data.userId;
                        let tokenChat = data.data.authToken;
                        //invitacionesLogin/:idUser/:dominio/:contexto
                        let js;
                        let arrayContextos = [];

                        let idContexto = "{eco." + dominio + ".default.context}";
                        if (contextoToken != idContexto) {

                            HTTP.get(`${url}api/1/contexts?access_token=${token}`, function (err, data) {
                                if (err) {
                                    console.log(err)
                                } else {

                                    let contexts = data.data;
                                    contexts.forEach(element => {
                                        HTTP.get(`${url}api/1/contexts/${element.id}?access_token=${token}`, function (err, data) {
                                            if (err) {
                                                console.log(err)
                                            } else {
                                                //console.log(data.data.modules);
                                                data.data.modules.forEach(modules => {
                                                    if (modules.id == "ecoChat") {
                                                        arrayContextos.push(element.name)
                                                        HTTP.post(`${root}api/v1/invitaciones/${element.name}/${dominioLow}/${idUser}`, {}, function (err, data) {
                                                            if (err) {
                                                                console.log(err)
                                                            } else {
                                                                console.log(data)
                                                            }
                                                            js = JSON.stringify({ "contextos": arrayContextos })
                                                            window.localStorage.setItem('contextos', js)
                                                            window.localStorage.setItem("Meteor.loginToken:/:/chat", tokenChat);
                                                            //window.localStorage.setItem("Meteor.loginToken", token);
                                                            window.localStorage.setItem("dominio", dominioLow);

                                                            FlowRouter.go(`/home`);
                                                        })
                                                    }
                                                })
                                            }
                                        });


                                    });
                                    //JSON.parse(window.localStorage.getItem('contextos'));
                                }
                            })

                        } else {

                            HTTP.get(`${url}api/1/contexts?access_token=${token}`, function (err, data) {
                                if (err) {
                                    console.log(err)
                                } else {

                                    let contexts = data.data;
                                    contexts.forEach(element => {
                                        HTTP.get(`${url}api/1/contexts/${element.id}?access_token=${token}`, function (err, data) {
                                            if (err) {
                                                console.log(err)
                                            } else {
                                                //console.log(data.data.modules);
                                                data.data.modules.forEach(modules => {
                                                    if (modules.id == "ecoChat") {
                                                        arrayContextos.push(element.name)
                                                        js = JSON.stringify({ "contextos": arrayContextos })
                                                        window.localStorage.setItem('contextos', js)
                                                    }
                                                })
                                            }
                                        });


                                    });
                                    //JSON.parse(window.localStorage.getItem('contextos'));
                                }
                            })

                            window.localStorage.setItem("Meteor.loginToken:/:/chat", tokenChat);
                            //window.localStorage.setItem("Meteor.loginToken", token);
                            window.localStorage.setItem("dominio", dominioLow);
                            FlowRouter.go(`/home`);

                        }




                    }
                });

            }

        }
    });

});

function contextos() {

}
