import { FlowRouter } from 'meteor/kadira:flow-router';
import { Template } from 'meteor/templating';
import _ from 'underscore';
import { HTTP } from 'meteor/http'


Template.registrarGO.onCreated(function () {

    let url = 'https://go-test.finneg.com'

    Meteor.call('getEnv', "ROOT_URL", function (err, results) {
        if(results){
            url = results;
        }
    });


    HTTP.call('GET', '/api/v1/permisos', function (err, res) { });

    let token = FlowRouter.getParam("token");
    let email = FlowRouter.getParam("email");
    let urlTokenGo =
        HTTP.call('GET', `${url}/auth/token/info?access_token=${token}`, function (err, res) {
            if (err) {
                console.log("Error de Autenticacion")
            } else {
                console.log(res.data)
                if (email == res.data.email) {
                    let dominio = res.data.domain;

                    HTTP.call('GET', `${url}/api/1/users/${dominio}/${email}?access_token=${token}`, function (err, res) {
                        if (err) {
                            console.log(err.toString())
                            console.log("Ha ocurrido un error")
                        } else {
                            let pass = "";
                            let i = 0;
                            let top = email.length;
                            let dominios = res.data.domains;
                            while (pass.length <= 8) {
                                pass += email[i] + "" + parseInt(top / 2);
                                top--;
                                i++;
                            }

                            let username = res.data.firstName + res.data.lastName + "-" + email;
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


                            HTTP.post('/api/v1/users.register', { data: user }, function (err, data) {
                                if (err) {
                                    console.log("Error")
                                    console.log(err.toString())
                                } else {
                                    console.log("Usuario registrado correctamente")
                                    console.log(data);
                                    let res = JSON.parse(data.content)
                                    HTTP.post(`/api/v1/invitaciones/${token}/${dominio}/${res.user._id}`, {}, function (err, data) {
                                        FlowRouter.go(`/chat/loginGO/${token}&email=${email}`);
                                    })


                                }
                            });


                        }
                    });

                }
            }
        });

});

