
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
    let email = FlowRouter.getParam("email");
    let url = 'https://go-test.finneg.com/'
    let root = 'https://go-test.finneg.com/chat/'

    //let root = 'http://localhost:3000'
    Meteor.setTimeout(function () {
        console.log(__meteor_runtime_config__.ROOT_URL)
        console.log(__meteor_runtime_config__.ECO_URL)
        //let url = 'https://go-test.finneg.com/';
        //let root = 'http://localhost:3000/';

        //url = __meteor_runtime_config__.ECO_URL;
        //root = __meteor_runtime_config__.ROOT_URL;

    HTTP.call('GET', `${url}auth/token/info?access_token=${token}`, function (err, res) {
        if (err) {
            console.log(err)
            console.log("Error de Autenticacion")
        } else {
            console.log(res);
            let dominio = res.data.domain;
            let dominioLow = dominio.toLowerCase();
            let emailRes = res.data.email;
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
                        FlowRouter.go(`/registrarGO/${token}&email=${email}`);
                        //  FlowRouter.go
                    } else {
                        //console.log(response.data);
                        let data = JSON.parse(response.content)
                        console.log(data)
                        let idUser = data.data.userId;
                        let token = data.data.authToken;
                        //invitacionesLogin/:idUser/:dominio/:contexto
                        HTTP.post(`${root}api/v1/invitacionesLogin/${idUser}/${dominio}/${dominio}`, {}, function (err, data) {
                            if(err){
                                //console.log(err)
                            }else{
                                //console.log(data)
                            }
                        })
                        window.localStorage.setItem("Meteor.loginToken:/:/chat", token);
                        //window.localStorage.setItem("Meteor.loginToken", token);
                        window.localStorage.setItem("dominio", dominioLow);
                        window.localStorage.setItem("contexto", dominioLow);
                        //FlowRouter.go(`/home`);
                        FlowRouter.go(`/group/${dominioLow}-${dominioLow}`);
                    }
                });

            }

        }
    });



    }, 1000)

});
