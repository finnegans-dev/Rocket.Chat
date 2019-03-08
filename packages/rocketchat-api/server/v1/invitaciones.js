import { Meteor } from 'meteor/meteor';
import { Match, check } from 'meteor/check';
import { TAPi18n } from 'meteor/tap:i18n';
import { Users, Subscriptions } from 'meteor/rocketchat:models';
import { hasPermission } from 'meteor/rocketchat:authorization';
import { settings } from 'meteor/rocketchat:settings';
import { getURL } from 'meteor/rocketchat:utils';
import {
	validateCustomFields,
	saveUser,
	saveCustomFieldsWithoutValidation,
	checkUsernameAvailability,
	setUserAvatar,
	saveCustomFields,
} from 'meteor/rocketchat:lib';
import Busboy from 'busboy';

import { Rooms } from 'meteor/rocketchat:models';
import { API } from '../api';
import { HTTP } from 'meteor/http'
import _ from 'underscore';
//APIS Invitaciones

API.v1.addRoute('invitaciones/:token/:dominio', {
	post() {
		let token = this.urlParams.token;
		let dominio = this.urlParams.dominio;
		let rooms = Rooms.find({}).fetch();
		console.log("t " + token + " d " + dominio);
		let salas = []
		rooms.forEach(element => {
			if (element.name != undefined) {
				let dominioRoom = element.name.substring(0, element.name.indexOf('-'))
				let contextoRoom = element.name.substring(element.name.indexOf('-') + 1, element.name.lenght)
				console.log("Dominio Room: " + dominioRoom + " Contexto Room: " + contextoRoom);
				if (dominioRoom == dominio) {
					console.log(element._id);

				}
			}
		});

		let id = 'NrNwzwvs5s3xLvCsy';
		//let username = 'FacundoMiño-facu_s2@hotmail.com'
		//const { username } = this.getUserFromParams();
		let idUser = 'rbfnwvxpF5D3GSfsL';
		//Meteor.call('addUserToRoom', { id, username});
		const data =  { roomId: 'NrNwzwvs5s3xLvCsy', userId: '8DfKGpZeerFRroADN' }
		
		const { _id: rid, t: type } = Rooms.findOneByIdOrName(id);
		
		if (!rid || type !== 'p') {
			throw new Meteor.Error('error-room-not-found', 'The required "roomId" or "roomName" param provided does not match any group');
		}
		const {username} = Users.findOneById(idUser)
		Meteor.runAsUser(idUser, () => Meteor.call('addUserToRoom', { rid, username}));
		console.log(username)
		//Meteor.call('addUserToRoom', { rid, username });

		return API.v1.success({
			status: 'ok',
			group: this.composeRoomWithLastMessage(Rooms.findOneById(rid, { fields: API.v1.defaultFieldsToExclude }), idUser),
		
		});
	},
});

API.v1.addRoute('administrador/:token', {
	post() {
		let token = this.urlParams.token
		return API.v1.success({
			status: 'ok'
		});
	},
});
