
import { Meteor } from 'meteor/meteor';
import { ReactiveVar } from 'meteor/reactive-var';
import { Tracker } from 'meteor/tracker';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Session } from 'meteor/session';
import { Template } from 'meteor/templating';
import { RocketChat, handleError } from 'meteor/rocketchat:lib';
import { t } from 'meteor/rocketchat:utils';
import _ from 'underscore';
import s from 'underscore.string';
import toastr from 'toastr';
import { HTTP } from 'meteor/http'

/*
Modificaciones Albano
*/

Template.loginGO.onCreated(function () {
    //{ "user": "albano", "password": "1234" }
    console.log(FlowRouter.getParam("email"))
    //https://go-test.finneg.com/auth/token/info?access_token={}
    let token = FlowRouter.getParam("token");
    //let dominio = FlowRouter.getParam("dominio") +"";
    //let domLowe = dominio.toLowerCase();
    let email = FlowRouter.getParam("email");

    let urlTokenGo =
        HTTP.call('GET', `https://go-test.finneg.com/auth/token/info?access_token=${token}`, function (err, res) {
            if (err) {
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
                
                    HTTP.call('POST', 'http://localhost:3000/api/v1/login', {
                        data: {
                            "user": email,
                            "password": pass
                        }
                    }, function (error, response) {
                        if (error) {
                            //Redirigo a registrar
                            console.log(error);
                            //  FlowRouter.go
                        } else {
                            //console.log(response.data);
                            let data = JSON.parse(response.content)
                            console.log(data)
                            let token = data.data.authToken;
                            window.localStorage.setItem("Meteor.loginToken", token);
                            window.localStorage.setItem("dominio", dominioLow);
                            FlowRouter.go(`/home`);
                        }
                    });

                }

            }
        });



});

