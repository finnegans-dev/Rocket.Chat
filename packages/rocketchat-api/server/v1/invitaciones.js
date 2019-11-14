import { Meteor } from 'meteor/meteor';
import { Users, Permissions, Token } from 'meteor/rocketchat:models';
import { Rooms } from 'meteor/rocketchat:models';
import { API } from '../api';
import { HTTP } from 'meteor/http'
import _ from 'underscore';
import { Subscriptions } from 'meteor/rocketchat:models';
import { GoTokens } from 'meteor/rocketchat:models';
import { hasPermission } from 'meteor/rocketchat:authorization';

//APIS Invitaciones
/*Finneg
*/
import { Random } from 'meteor/random'
import { Date } from 'core-js';

API.v1.addRoute('invitaciones/:contexto/:dominio/:idUser/:isVertical', {
	post() {

		let contexto = this.urlParams.contexto;
		let dominio = this.urlParams.dominio.toLowerCase();
		let idUsuario = this.urlParams.idUser
		let isVertical = this.urlParams.isVertical;
		let rooms = Rooms.find({}).fetch();
		const { username } = Users.findOneById(idUsuario)

		//const userBot = Users.find({roles: "bot"}).fetch();


		let existeSala = false;
		let salas = [];
		rooms.forEach(element => {
			if (element.name != undefined) {
				let dominioRoom = element.name.substring(0, element.name.indexOf('-'))
				let contextoRoom = element.name.substring(element.name.indexOf('-') + 1, element.name.lenght)
				if (dominioRoom == dominio && contextoRoom == contexto) {
					existeSala = true;
					const { _id: rid, t: type } = Rooms.findOneByIdOrName(element._id);

					if (!rid || type !== 'p') {
						throw new Meteor.Error('error-room-not-found', 'The required "roomId" or "roomName" param provided does not match any group');
					}
					// console.log(rid)
					/* agrega todos los usuarios que se loguean al general de la sala */
					Meteor.runAsUser(idUsuario, () => Meteor.call('addUserToRoom', { rid, username }));
					// HTTP.get(`api/v1/addBot/${rid}`, {}, function (err, res) {
					// 	if (err) {
					// 		console.log(err);
					// 	} else {
					// 		console.log(res);
					// 	}
					// });
				}
			}
		});

		console.log('asdqwdeqdq')
		if (!existeSala) {

			// if (isVertical.toLocaleUpperCase() != "SI"){

			console.log("fsafsda")
			// let name = dominio + "-contexto" + Random.hexString(2);
			let name = dominio + "-" + contexto;
			Meteor.runAsUser(idUsuario, () => {
				id = Meteor.call('createPrivateGroup', name, [], true); /* falta validar si es vertical, en ese caso que sea readonly, pero por ahroa es todo vertical. */
			});
		} else {
			const cu = localStorage.getItem('currentuser');
			const { domain, token, email } = JSON.parse(cu);
			root = __meteor_runtime_config__.ROOT_URL;
			url = root.substring(0, root.lastIndexOf(`/c`) + 1);
			url = 'https://go-test.finneg.com/';
			HTTP.call('GET', `${url}api/1/users/profile/${domain}/${email}?access_token=${token}`, async function (err, res) {

				const isContextCreate = res.data.contextCreation;

				if (!isContextCreate) {
					const nameContextAndDomain = localStorage.getItem('contextDomain').trim();
					const roomContext = Rooms.find({ name: nameContextAndDomain }).fetch();

					const prid = roomContext[0]._id;
					let temas = Rooms.find({ prid: prid }).fetch();
					if (temas.length < 1) {
						console.log('MENOR QUE 1')

						const t_name = `Sala_${Meteor.user().name}`;
						let pmid;
						const reply = '';
						const users = [];

						const result = await call('createThread', { prid, pmid, t_name, reply, users });

						callbacks.run('afterCreateThread', Meteor.user(), result)
						const cu = localStorage.getItem('currentuser');
						const { domain, token } = JSON.parse(cu);
						HTTP.call('POST', `api/v1/customInvitations/${result.prid}/${result.rid}/${domain}/${token}`, async function (err, res) {
							if (err) {
								console.log(err)
								console.log("Error de Autenticacion")
							} else {
								console.log('------------------------------------')
								// FlowRouter.go(`/group/${result.rid}`);
							}
						});
					}
				}

			});
			// }


		}

		return API.v1.success({
			status: 'ok',
			group: this.composeRoomWithLastMessage(Rooms.findOneById(rid, { fields: API.v1.defaultFieldsToExclude }), idUser),

		});

	},
});

API.v1.addRoute('invitaciones/:contexto/:dominio/:idUser', {
	post() {

		let contexto = this.urlParams.contexto;
		let dominio = this.urlParams.dominio.toLowerCase();
		let idUsuario = this.urlParams.idUser
		let isVertical = this.urlParams.isVertical;
		let rooms = Rooms.find({}).fetch();
		const { username } = Users.findOneById(idUsuario)

		//const userBot = Users.find({roles: "bot"}).fetch();
		
		let existeSala = false;
		let salas = [];
		rooms.forEach(element => {
			if (element.name != undefined) {
				let dominioRoom = element.name.substring(0, element.name.indexOf('-'))
				let contextoRoom = element.name.substring(element.name.indexOf('-') + 1, element.name.lenght)
				if (dominioRoom == dominio && contextoRoom == contexto) {
					existeSala = true;
					const { _id: rid, t: type } = Rooms.findOneByIdOrName(element._id);

					if (!rid || type !== 'p') {
						throw new Meteor.Error('error-room-not-found', 'The required "roomId" or "roomName" param provided does not match any group');
					}
					
					Meteor.runAsUser(idUsuario, () => Meteor.call('addUserToRoom', { rid, username }));
					// HTTP.get(`api/v1/addBot/${rid}`, {}, function (err, res) {
					// 	if (err) {
					// 		console.log(err);
					// 	} else {
					// 		console.log(res);
					// 	}
					// });
				}
			}
		});

		if (!existeSala) {
			let name = dominio + "-" + contexto;
			Meteor.runAsUser(idUsuario, () => {
				id = Meteor.call('createPrivateGroup', name, [], true); /* falta validar si es vertical, en ese caso que sea readonly, pero por ahroa es todo vertical. */
			});
		}

		return API.v1.success({
			status: 'ok',
			group: this.composeRoomWithLastMessage(Rooms.findOneById(rid, { fields: API.v1.defaultFieldsToExclude }), idUser),

		});

	},
});

API.v1.addRoute('invitacionesLogin/:idUser/:dominio/:contexto', {
	post() {
		let idUsuario = this.urlParams.idUser;
		let dominio = this.urlParams.dominio.toLowerCase();
		let contexto = this.urlParams.contexto;
		let rooms = Rooms.find({}).fetch();
		const { username } = Users.findOneById(idUsuario)
		//URL Contextos
		//https://go-test.finneg.com/api/1/contexts?access_token=

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


		return API.v1.success({
			status: 'ok'
		});

	}
});

//Invitacion de temas
API.v1.addRoute('invitacionesTemas/:roomId/:temaId', {
	post() {
		let roomId = this.urlParams.roomId;
		let temaId = this.urlParams.temaId;

		root = __meteor_runtime_config__.ROOT_URL;

		let prefix = root.substring(0, root.lastIndexOf(`/c`) + 1);
		// let prefix = 'http://localhost:4000/';

		let notificationData = {
			product: "ecoChat",
			event: "invite",
			subject: "",
			message: "",
			destination: ""
		};

		const subscriptions = Subscriptions.findByRoomId(roomId, {
			fields: { 'u._id': 1 },
		});

		const members = subscriptions.fetch().map((s) => s.u && s.u._id);

		const { _id: rid, t: type, fname: tname, u: owner } = Rooms.findOneByIdOrName(temaId);


		if (!rid || type !== 'p') {
			throw new Meteor.Error('error-room-not-found', 'The required "roomId" or "roomName" param provided does not match any group');
		}

		let token = GoTokens.find({ userId: owner._id }).fetch();

		let splitOwner = owner.username.split('-');

		let url = `${prefix}api/1/notifications/notify?access_token=${token[0].goToken}`;

		members.forEach(element => {
			const { username } = Users.findOneById(element)
			Meteor.runAsUser(element, () => Meteor.call('addUserToRoom', { rid, username }));

			let splitUser = username.split('-');
			let splitTName = tname.split('-');

			if (splitOwner[1] != splitUser[1]) {
				notificationData.message = `${splitOwner[0]} te invitó al tema ${splitTName[1]}`;
				notificationData.destination = splitUser[1];

				HTTP.post(url, { data: notificationData }, function (err, data) {
					if (err) {
						console.log(err);
					}
				});
			}
		})

		return API.v1.success({
			status: 'ok'
		});
	}
})
/* invitacion solo a administradores de contexto + usuario*/
API.v1.addRoute('customInvitations/:roomId/:temaId/:domain/:token', {
	post() {
		let roomId = this.urlParams.roomId;
		let temaId = this.urlParams.temaId;

		root = __meteor_runtime_config__.ROOT_URL;
		url = root.substring(0, root.lastIndexOf(`/c`) + 1);
		url = 'https://go-test.finneg.com/';
		console.log(`${this.urlParams.domain}---- ${this.urlParams.token}----- `);
		// go-test.finneg
		/* Hay que reemplazar esta api por una que traiga solo los adm de contextos, o bien, por mientras usar esta pero ver el tema que se actualicen
		los datos, porque por el momento llegan todos falsos en ese campo*/
		HTTP.call('GET', `${url}api/1/users/${this.urlParams.domain}?access_token=${this.urlParams.token}`, function (err, res) {

			const filterData = res.data.filter(f => f.email == 'jsantacruz@finnegans.com.ar');
			const filterData2 = res.data.filter(f => f.email == 'albano.borsotti@gmail.com');
			// const filterData = res.data.filter( f => f.contextCreation === true);
			const subscriptions = Subscriptions.findByRoomId(roomId, {
				fields: { 'u._id': 1 },
			});

			const members = subscriptions.fetch().map((s) => s.u && s.u._id);
			const { _id: rid, t: type, fname: tname, u: owner } = Rooms.findOneByIdOrName(temaId);

			const isVerticalChat = true;

			members.forEach(element => {
				const { emails, username } = Users.findOneById(element)
				/* aca deberia iterar el array de adm de contextos, y compararlos con los emails[0].address, si coinciden, agregarlos a la sala.*/
				if (filterData[0].email == emails[0].address) {
					console.log('equals');
					Meteor.runAsUser(element, () => Meteor.call('addUserToRoom', { rid, username, isVerticalChat }));
				}
				if (filterData2[0].email == emails[0].address) {
					console.log('equals2');
					Meteor.runAsUser(element, () => Meteor.call('addUserToRoom', { rid, username, isVerticalChat }));
				}

			});

			return API.v1.success({
				status: 'ok'
			});

		});



	}
})

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


API.v1.addRoute('addBot/:idRoom', {
	get() {

		let idRoom = this.urlParams.idRoom;
		let usuarios = Users.find({ roles: "bot" }).fetch();
		let idUserBot = usuarios[0]._id;
		const { _id: rid, t: type } = Rooms.findOneByIdOrName(idRoom);
		if (!rid || type !== 'p') {
			throw new Meteor.Error('error-room-not-found', 'The required "roomId" or "roomName" param provided does not match any group');
		}
		const { username } = Users.findOneById(idUserBot)

		Meteor.runAsUser(idUserBot, () => Meteor.call('addUserToRoom', { rid, username }));


		return API.v1.success({
			status: 'ok',
		});
	}

})

API.v1.addRoute('permisos', {
	get() {
		let permisos = [{ "_id": "add-user-to-any-p-room", "roles": ["admin", "user", "bot"] },
		{ "_id": "call-management", "roles": ["admin", "user"] },
		{ "_id": "create-p", "roles": ["admin", "user"] },
		{ "_id": "create-d", "roles": ["admin", "user"] }]

		Object.keys(permisos).forEach((key) => {
			const element = permisos[key];
			Permissions.createOrUpdate(element._id, element.roles);
		});
		//const result = Meteor.runAsUser(this.userId, () => Meteor.call('permissions/get'));

		return API.v1.success({
			status: 'OK',
		});
	}
});

API.v1.addRoute('ping', {
	get() {
		return API.v1.success({
			status: 'OK',
			v: '14-Nov'
		});
	}
});

API.v1.addRoute('restartServer', { authRequired: true }, {
	post() {
		Meteor.setTimeout(() => {
			Meteor.setTimeout(() => {
				console.warn('Call to process.exit() timed out, aborting.');
				process.abort();
			}, 1000);
			process.exit(1);
		}, 1000);

		return API.v1.success({
			message: 'The_server_will_restart_in_s_seconds'
		});
	}
});

API.v1.addRoute('direct/:username', {
	post() {
		let username = this.urlParams.username;
		const findResult = findDirectMessageRoom({ username: username }, this.user);
		console.log(this.requestParams())
		console.log("================")
		console.log(this.user)
		return API.v1.success({
			room: findResult.room,
		});
	},
	get() {
		let test = Token.find().fetch()
		return API.v1.success({
			test: test,
		});
	}
});
