import { Meteor } from 'meteor/meteor';
import { Users, Permissions  } from 'meteor/rocketchat:models';
import { Rooms } from 'meteor/rocketchat:models';
import { API } from '../api';
import { HTTP } from 'meteor/http'
import _ from 'underscore';
//APIS Invitaciones
/*Finneg
*/
import { Random } from 'meteor/random'

API.v1.addRoute('invitaciones/:token/:dominio/:idUser', {
	post() {
		
		let token = this.urlParams.token;
		let dominio = this.urlParams.dominio.toLowerCase();
		let idUsuario = this.urlParams.idUser
		let rooms = Rooms.find({}).fetch();
		const { username } = Users.findOneById(idUsuario)
		

		let existeSala = false;
		let salas = [];
		rooms.forEach(element => {
			if (element.name != undefined) {
				let dominioRoom = element.name.substring(0, element.name.indexOf('-'))
				let contextoRoom = element.name.substring(element.name.indexOf('-') + 1, element.name.lenght)
				if (dominioRoom == dominio) {
					existeSala = true;
					const { _id: rid, t: type } = Rooms.findOneByIdOrName(element._id);
					if (!rid || type !== 'p') {
						throw new Meteor.Error('error-room-not-found', 'The required "roomId" or "roomName" param provided does not match any group');
					}

					Meteor.runAsUser(idUsuario, () => Meteor.call('addUserToRoom', { rid, username }));
				}
			}
		});

		if(!existeSala){
			
			//let name = dominio + "-contexto" + Random.hexString(2);
			let name = dominio + "-" + dominio;
			Meteor.runAsUser(idUsuario, () => {
				id = Meteor.call('createPrivateGroup', name, [], false);
			});
		}

		return API.v1.success({
			status: 'ok',
			group: this.composeRoomWithLastMessage(Rooms.findOneById(rid, { fields: API.v1.defaultFieldsToExclude }), idUser),

		});

	},
});

API.v1.addRoute('administrador/:token/:dominio/:idUsuario/:roomId', {
	post() {
		let token = this.urlParams.token;
		let dominio = this.urlParams.dominio;
		let idUsuario = this.urlParams.idUsuario;
		let roomId = this.urlParams.roomId;

		const { username } = Users.findOneById(idUsuario);

		Meteor.runAsUser(idUsuario, () => {
			Meteor.call('authorization:addUserToRole', 'admin', username, roomId);
		});

		return API.v1.success({
			status: 'ok',
			role: Roles.findOneByIdOrName('admin', { fields: API.v1.defaultFieldsToExclude })
		});
	},
});

//API Crear Grupos 
API.v1.addRoute('grupos/:token/:dominio/:idUsuario', {
	//vPfbJB7om7BwJydNt
	post() {
		const readOnly = false;
		let token = this.urlParams.token;
		let dominio = this.urlParams.dominio;
		let idUsuario = this.urlParams.idUsuario;

		let name = dominio + "-test" + Random.hexString(2);
		console.log(name)
		/*
		Meteor.runAsUser(idUsuario, () => {
			id = Meteor.call('createPrivateGroup', name, [], readOnly);
		});
		*/
		return API.v1.success({
			status: 'OK'
			//group: this.composeRoomWithLastMessage(Rooms.findOneById(id.rid, { fields: API.v1.defaultFieldsToExclude }), this.userId),
		});
	}


});


API.v1.addRoute('permisos',{
	get(){
		let permisos = [{"_id": "add-user-to-any-p-room", "roles": ["admin", "user"]},
		{"_id": "call-management", "roles": ["admin", "user"]},
		{"_id": "create-p", "roles": ["admin", "user"]},
		{"_id": "create-d", "roles": ["admin", "user"]} ]

		Object.keys(permisos).forEach((key) => {
			const element = permisos[key];
			Permissions.createOrUpdate(element._id, element.roles);
		});
		//const result = Meteor.runAsUser(this.userId, () => Meteor.call('permissions/get'));

		return API.v1.success({
			status:'OK',
		});
	}
});

API.v1.addRoute('ping',{
	get(){
		return API.v1.success({
			status:'OK',
		});
	}
});