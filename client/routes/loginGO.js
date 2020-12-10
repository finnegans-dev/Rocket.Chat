
import { Meteor } from 'meteor/meteor';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Template } from 'meteor/templating';
import _ from 'underscore';
import { HTTP } from 'meteor/http';

/*
Finneg
*/

Template.loginGO.onCreated(function () {
    let token = FlowRouter.getParam("token");
    let email = FlowRouter.current().queryParams.email;
    let isVertical = FlowRouter.current().queryParams.vertical;
    let url = 'https://go-test.finneg.com/'
    let root = 'https://go-test.finneg.com/chat/'

    
    //descomentar
    root = __meteor_runtime_config__.ROOT_URL;
    localStorage.removeItem("Meteor.loginToken:/:/chat");
    localStorage.setItem("isVertical", isVertical);
    
    url = root.substring(0, root.lastIndexOf(`/c`) + 1);
    //comentar
    //url = 'https://go-test.finneg.com/'
    //root = 'http://localhost:3000/';
    //window.localStorage.setItem("Meteor.loginToken", "");

    HTTP.call('GET', `${url}auth/token/info?access_token=${token}`, function (err, res) {
        if (err) {
            console.log(err)
            console.log("Error de Autenticacion")
        } else {
            let dominio = res.data.domain;
            let dominioLow = dominio.toLowerCase();
            let emailRes = res.data.email;
            let contextoID = res.data.lastContext.id;
            let contextoName = res.data.lastContext.name;

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
                    } else {
                        let data = JSON.parse(response.content)
                        let idUser = data.data.userId;
                        let tokenChat = data.data.authToken;
                        let js;

                        let defaultContext = "{eco." + dominio + ".default.context}";

                        HTTP.post(`api/v1/gotoken/${idUser}/${token}`, {}, function (err, data) {
                            if (err) {
                                console.log(err);
                            }
                        });

                        HTTP.get(`${url}api/1/contexts?withProduct=ecoChat&access_token=${token}`, function (err, data) {
                            if (err) {
                                console.log(err)
                                //localStorage.setItem("Meteor.loginToken", tokenChat);                                
                                localStorage.setItem("Meteor.loginToken:/:/chat", tokenChat);
                                localStorage.setItem("dominio", dominioLow);
                                FlowRouter.go(`/home`);
                            } else {
                                let contexts = data.data;
                                HTTP.post(`${root}api/v1/invitacionesContextos/${dominioLow}/${idUser}`, { data: contexts }, function (err, data) {
                                    if (err) {
                                        console.log(err)
                                        //localStorage.setItem("Meteor.loginToken", tokenChat);                                
                                        localStorage.setItem("Meteor.loginToken:/:/chat", tokenChat);
                                        localStorage.setItem("dominio", dominioLow);
                                        FlowRouter.go(`/home`);
                                    } else {
                                        js = JSON.stringify({ "contextos": data.data.contextNames });
                                        localStorage.setItem("contextos", js);
                                        //localStorage.setItem("Meteor.loginToken", tokenChat);
                                        localStorage.setItem("Meteor.loginToken:/:/chat", tokenChat);
                                        localStorage.setItem("dominio", dominioLow);
                                        if (contextoID != defaultContext) {
                                            let name = dominioLow + "-" + contextoName;
                                            localStorage.setItem("contextDomain", name);
                                            FlowRouter.go(`/group/${name}`);
                                            FlowRouter.reload();
                                        } else {
                                            FlowRouter.go(`/home`);
                                        }
                                    }
                                });
                            }
                        })
                    }
                });
            }
        }
    });
});

