import { Tracker } from 'meteor/tracker';
import { Session } from 'meteor/session';
import { Template } from 'meteor/templating';
import { t } from 'meteor/rocketchat:utils';
import { settings } from 'meteor/rocketchat:settings';
import { roomTypes } from 'meteor/rocketchat:utils';
import { Rooms } from 'meteor/rocketchat:models';
import { callbacks } from 'meteor/rocketchat:callbacks';

Template.chatRoomItem.helpers({
	roomData() {
		const openedRoom = Tracker.nonreactive(() => Session.get('openedRoom'));
		const unread = this.unread > 0 ? this.unread : false;
		// if (this.unread > 0 && (!hasFocus || openedRoom !== this.rid)) {
		// 	unread = this.unread;
		// }

		const active = [this.rid, this._id].includes((id) => id === openedRoom);

		const archivedClass = this.archived ? 'archived' : false;

		this.alert = !this.hideUnreadStatus && this.alert; // && (!hasFocus || FlowRouter.getParam('_id') !== this.rid);

		const icon = roomTypes.getIcon(this);
		const avatar = !icon;

		//const name = roomTypes.getRoomName(this.t, this);
		//console.log(this)
		let { fname } = this;
		let nameRoom;
		if (this.t == 'd') {
			if (fname.substring(0, fname.indexOf('-')) != "") {
				nameRoom = fname.substring(0, fname.indexOf('-')) || roomTypes.getRoomName(this.t, this);
			} else {
				nameRoom = fname.substring(fname.indexOf('-') + 1, fname.length) || roomTypes.getRoomName(this.t, this);
			}

		} else {
			nameRoom = fname.substring(fname.indexOf('-') + 1, fname.length) || roomTypes.getRoomName(this.t, this);
		}

		const roomData = {
			...this,
			icon,
			avatar,
			username: this.name,
			route: roomTypes.getRouteLink(this.t, this),
			name: nameRoom,
			unread,
			active,
			archivedClass,
			status: this.t === 'd' || this.t === 'l',
		};
		roomData.username = roomData.username || roomData.name;

		// hide icon for threads
		if (this.prid) {
			roomData.darken = true;
		}

		if (!this.lastMessage && settings.get('Store_Last_Message')) {
			const room = Rooms.findOne(this.rid || this._id, { fields: { lastMessage: 1 } });
			roomData.lastMessage = (room && room.lastMessage) || { msg: t('No_messages_yet') };
		}
		return roomData;
	},
	//Modificaciones Finneg
	//Finneg
	dominio() {
		let { fname } = this;
		console.log(fname)
		let contextos = JSON.parse(window.localStorage.getItem('contextos'));
		if(this.prid){
			return false;
		}
		let dominioURL = window.localStorage.getItem('dominio');
		let dominio = fname.substring(0, fname.indexOf('-'));
		let contexto = fname.substring(fname.indexOf('-')+1, fname.length);
		
		if (fname[0] == fname[0].toUpperCase()) {
			return true;
		}
		//console.log(contextos.contextos)
		let aux = false;
		if(contextos.contextos){
			contextos.contextos.forEach(element => {
				if(dominio==dominioURL && contexto == element){
					aux = true;
				}
			});
		}
		
		
		return aux;
		/*
		if (dominio != "") {
			return dominio == dominioURL.toLowerCase();
		} else {
			return true;
		}*/

	}
});

Template.chatRoomItem.events({
	'click .test ': function (event) {
		//console.log("ANTES: " + window.localStorage.getItem('dominio'));
		//window.localStorage.setItem('dominio', "test");
		//console.log("Luego: " + window.localStorage.getItem('dominio'));
		//this.dominio
	}
});

callbacks.add('enter-room', (sub) => {
	const items = $('.rooms-list .sidebar-item');
	items.filter('.sidebar-item--active').removeClass('sidebar-item--active');
	if (sub) {
		items.filter(`[data-id=${sub._id}]`).addClass('sidebar-item--active');
	}
	return sub;
});
