import { Meteor } from 'meteor/meteor';
import { callbacks } from 'meteor/rocketchat:callbacks';
import { Template } from 'meteor/templating';
import { ChatSubscription, Rooms, Users, Subscriptions } from 'meteor/rocketchat:models';
import { UiTextContext, getUserPreference, roomTypes } from 'meteor/rocketchat:utils';
import { settings } from 'meteor/rocketchat:settings';

Template.roomList.helpers({
	rooms() {
		/*
			modes:
				sortby activity/alphabetical
				merge channels into one list
				show favorites
				show unread
		*/
		if (this.anonymous) {
			//return Rooms.find({ t: 'c' }, { sort: { name: 1 } });
		}

		const user = Users.findOne(Meteor.userId(), {
			fields: {
				'settings.preferences.sidebarSortby': 1,
				'settings.preferences.sidebarShowFavorites': 1,
				'settings.preferences.sidebarShowUnread': 1,
				'settings.preferences.sidebarShowThreads': 1,
				'services.tokenpass': 1,
			},
		});

		const sortBy = getUserPreference(user, 'sidebarSortby') || 'alphabetical';
		const query = {
			open: true,
		};

		const sort = {};

		if (sortBy === 'activity') {
			sort.lm = -1;
		} else { // alphabetical
			sort[this.identifier === 'd' && settings.get('UI_Use_Real_Name') ? 'lowerCaseFName' : 'lowerCaseName'] = /descending/.test(sortBy) ? -1 : 1;
		}

		if (this.identifier === 'unread') {
			query.alert = true;
			query.hideUnreadStatus = { $ne: true };

			return ChatSubscription.find(query, { sort });
		}

		const favoritesEnabled = !!(settings.get('Favorite_Rooms') && getUserPreference(user, 'sidebarShowFavorites'));

		if (this.identifier === 'f') {
			query.f = favoritesEnabled;
		} else {
			let types = [this.identifier];

			if (this.identifier === 'merged') {
				//types = ['c', 'p', 'd'];
				types = ['p', 'd'];
			}

			if (this.identifier === 'thread') {
				//types = ['c', 'p', 'd'];
				types = ['p', 'd'];
				query.prid = { $exists: true };
			}

			if (this.identifier === 'unread' || this.identifier === 'tokens') {
				types = ['p'];
				//types = ['c', 'p'];
			}

			if (['p'].includes(this.identifier)) {
				query.tokens = { $exists: false };
			} else if (this.identifier === 'tokens' && user && user.services && user.services.tokenpass) {
				query.tokens = { $exists: true };
			}

			// if we display threads as a separate group, we should hide them from the other lists
			if (getUserPreference(user, 'sidebarShowThreads')) {
				query.prid = { $exists: false };
			}

			if (getUserPreference(user, 'sidebarShowUnread')) {
				query.$or = [
					{ alert: { $ne: true } },
					{ hideUnreadStatus: true },
				];
			}
			query.t = { $in: types };
			if (favoritesEnabled) {
				query.f = { $ne: favoritesEnabled };
			}
		}
		return ChatSubscription.find(query, { sort });
	},

	isLivechat() {		
		return this.identifier === 'l';
	},
	showLiveTab(){
		$('.sidebar__footer .tabs .livechatTab.padding-top-tabs').css("display", "block");
	},

	shouldAppear(group, rooms) {
		/*
		if is a normal group ('channel' 'private' 'direct')
		or is favorite and has one room
		or is unread and has one room
		*/

		return !['c', 'unread', 'f'].includes(group.identifier);
		//return !['c','unread', 'f'].includes(group.identifier) || (rooms.length || (rooms.count && rooms.count()));
	},

	roomType(room) {
		//console.log(room);
		//Finneg
		if (room.identifier != "c") {
			//console.log(room)
			return `type-${room.header || room.identifier}`;
		}

		/*
		if (room.header || room.identifier) {
			return `type-${ room.header || room.identifier }`;
		}
		*/
	},

	nameRoom(room){
		let name= room.fname.replace(/ /g,'')
		return name
	},

	noSubscriptionText() {
		const instance = Template.instance();
		return roomTypes.roomTypes[instance.data.identifier].getUiText(UiTextContext.NO_ROOMS_SUBSCRIBED) || 'No_channels_yet';
	},

	showRoomCounter() {
		return getUserPreference(Meteor.userId(), 'roomCounterSidebar');
	},

});

Template.roomList.onCreated(function() {
	this.clase = new ReactiveVar('');
	this.nameSala = new ReactiveVar('');
});


Template.roomList.events({
	'click .rooms-list__list.type-p .test ': function (event, instance) {
		
		let nombreSala = event.currentTarget.className;
		let name = nombreSala.substring(nombreSala.indexOf('-') + 1, nombreSala.length);
		$('.rooms-list__type-text.Contextos')[0].innerHTML = name.toUpperCase();
		//Cambio nombre al contexto y lo pongo como general
		
		//Temas
		$('.context .temas-contexto').addClass('cerrar');
		let clase = '.'+event.currentTarget.classList[0]+'.'+event.currentTarget.classList[1] + ' .context .temas-contexto.cerrar';
		$(clase).removeClass('cerrar')
		
		
		//Contextos
		clase = '.rooms-list__list.type-p .' + event.currentTarget.classList[0] + '.'+ event.currentTarget.classList[1];
		$('.rooms-list__list.type-p .test').addClass('contexto-noactivo')
		$(clase).removeClass('contexto-noactivo')

		$('.sidebar__toolbar-button.rc-tooltip.rc-tooltip--down.js-button.class-edit-rounded').addClass('show');

		$('.content-background-color').addClass('content-background-color-grey');
		
		//Avatares
		clase = '.'+event.currentTarget.classList[0]+'.'+event.currentTarget.classList[1] + ' .context .icon-contexto.cerrar';
		$(clase).removeClass('cerrar')
		clase = '.'+event.currentTarget.classList[0]+'.'+event.currentTarget.classList[1] + ' .context .sidebar-item__picture.avatar-contexto';
		$(clase).addClass('cerrar')

		//Name
		//sidebar-item__ellipsis
		
		clase = '.'+event.currentTarget.classList[0]+'.'+event.currentTarget.classList[1] + ' .context .sidebar-item__ellipsis';
			
		if($(clase)[0].innerHTML!="General"){
			instance.clase.set(clase);
			instance.nameSala.set($(clase)[0].innerHTML);
			$(clase)[0].innerHTML = "General"
		}

		//flecha de back
		$('.back-context').addClass('back-context-room');   
		
		
	}, 
	'click .clickTitulo': function(event, instance){
		$('.sidebar__toolbar-button.rc-tooltip.rc-tooltip--down.js-button.class-edit-rounded.show').removeClass('show');
		$('.rooms-list__type-text.Contextos')[0].innerHTML = "Contextos"
		$('.rooms-list__list.type-p .test').removeClass('contexto-noactivo')
		$('.context .temas-contexto').addClass('cerrar');
		//Avatares
		$('.context .icon-contexto').addClass('cerrar')
		//sidebar-item__picture avatar-contexto cerrar
		$('.context .sidebar-item__picture.avatar-contexto.cerrar').removeClass('cerrar')
		
		//Nombre
		$(instance.clase.get())[0].innerHTML = instance.nameSala.get();

		$('.back-context').removeClass('back-context-room');             
		
	},
	'click .back-context-room': function(event, instance){
		$('.back-context').removeClass('back-context-room')
		$('.sidebar__toolbar-button.rc-tooltip.rc-tooltip--down.js-button.class-edit-rounded.show').removeClass('show');
	},
	'click .test': function(e, i){
		let classList = e.currentTarget.className;
		const roomName = classList.replace('test','');
		roomName ? localStorage.setItem("contextDomain", roomName) : '';
	}
});

const getLowerCaseNames = (room, nameDefault = '', fnameDefault = '') => {
	const name = room.name || nameDefault;
	const fname = room.fname || fnameDefault || name;
	return {
		lowerCaseName: name.toLowerCase(),
		lowerCaseFName: fname.toLowerCase(),
	};
};

const mergeSubRoom = (subscription) => {
	const room = Rooms.findOne(subscription.rid) || { _updatedAt: subscription.ts };
	subscription.lastMessage = room.lastMessage;
	subscription.lm = room._updatedAt;
	subscription.streamingOptions = room.streamingOptions;
	return Object.assign(subscription, getLowerCaseNames(subscription));
};

const mergeRoomSub = (room) => {
	const sub = Subscriptions.findOne({ rid: room._id });
	if (!sub) {
		return room;
	}

	Subscriptions.update({
		rid: room._id,
	}, {
			$set: {
				lastMessage: room.lastMessage,
				lm: room._updatedAt,
				streamingOptions: room.streamingOptions,
				...getLowerCaseNames(room, sub.name, sub.fname),
			},
		});

	return room;
};

callbacks.add('cachedCollection-received-rooms', mergeRoomSub);
callbacks.add('cachedCollection-sync-rooms', mergeRoomSub);
callbacks.add('cachedCollection-loadFromServer-rooms', mergeRoomSub);

callbacks.add('cachedCollection-received-subscriptions', mergeSubRoom);
callbacks.add('cachedCollection-sync-subscriptions', mergeSubRoom);
callbacks.add('cachedCollection-loadFromServer-subscriptions', mergeSubRoom);
