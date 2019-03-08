import { FlowRouter } from 'meteor/kadira:flow-router';
import { Template } from 'meteor/templating';
import _ from 'underscore';
import { HTTP } from 'meteor/http'


Template.registrarGO.onCreated(function () {
    //{ "user": "albano", "password": "1234" }
    console.log(FlowRouter.getParam("email"))
    //https://go-test.finneg.com/api/1/features/DPCOMERCIALIZADORATEST/list?access_token=91d18233-d7e9-46f0-a578-acfdfa5d6dd2;
    let token = FlowRouter.getParam("token");
    //let dominio = FlowRouter.getParam("dominio");
    let email = FlowRouter.getParam("email");
    let urlTokenGo =
        HTTP.call('GET', `https://go-test.finneg.com/auth/token/info?access_token=${token}`, function (err, res) {
            if (err) {
                console.log("Error de Autenticacion")
            } else {
                console.log(res.data)
                if (email == res.data.email) {
                    let dominio = res.data.domain;

                    HTTP.call('GET', `https://go-test.finneg.com/api/1/users/${dominio}/${email}?access_token=${token}`, function (err, res) {
                        if (err) {
                            console.log("Ha ocurrido un error")
                        } else {
                            let pass = "";
                            let i = 0;
                            let top = email.length;
                            while (pass.length <= 8) {
                                pass += email[i] + "" + parseInt(top / 2);
                                top--;
                                i++;
                            }

                            let username = res.data.firstName + res.data.lastName + "-" + email ;
                            let name = res.data.firstName + " " + res.data.lastName
                            
                            /*
                            let de = 'ÁÃÀÄÂÉËÈÊÍÏÌÎÓÖÒÔÚÜÙÛÑÇáãàäâéëèêíïìîóöòôúüùûñç',
                                a = 'AAAAAEEEEIIIIOOOOUUUUNCaaaaaeeeeiiiioooouuuunc',
                                re = new RegExp('[' + de + ']', 'ug');

                            let text = username.replace(                                    re,
                                    match => a.charAt(de.indexOf(match))
                                );
                            username = text;
                            username = username.replace(/ /g, "")
                            */
                            let user = { 'username': username, 'email': email, 'pass': pass, 'name': name };


                            HTTP.post('http://localhost:3000/api/v1/users.register', { data: user }, function (err, data) {
                                if (err) {
                                    console.log("Error")
                                    console.log(err)
                                } else {
                                    console.log("Usuario registrado correctamente")
                                    console.log(data);
                                    FlowRouter.go(`/loginGO/${token}&email=${email}`);
                                }
                            });


                        }
                    });

                }
            }
        });

});

