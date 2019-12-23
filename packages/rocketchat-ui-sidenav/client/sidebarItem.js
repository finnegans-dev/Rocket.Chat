import { Meteor } from 'meteor/meteor';
import { ReactiveVar } from 'meteor/reactive-var';
import { Session } from 'meteor/session';
import { Template } from 'meteor/templating';
import { t, getUserPreference, roomTypes } from 'meteor/rocketchat:utils';
import moment from 'moment';
import { popover, renderMessageBody } from 'meteor/rocketchat:ui-utils';
import { Users, ChatSubscription } from 'meteor/rocketchat:models';
import { settings } from 'meteor/rocketchat:settings';
import { hasAtLeastOnePermission } from 'meteor/rocketchat:authorization';
import { menu } from 'meteor/rocketchat:ui-utils';
import { modal } from 'meteor/rocketchat:ui-utils';

import { Rooms } from 'meteor/rocketchat:models';

Template.sidebarItem.helpers({
	or(...args) {
		args.pop();
		return args.some((arg) => arg);
	},
	streaming() {
		return this.streamingOptions && Object.keys(this.streamingOptions).length;
	},
	isRoom() {
		return this.rid || this._id;
	},
	isExtendedViewMode() {
		return getUserPreference(Meteor.userId(), 'sidebarViewMode') === 'extended';
	},
	lastMessage() {
		return this.lastMessage && Template.instance().renderedMessage;
	},
	lastMessageTs() {
		return this.lastMessage && Template.instance().lastMessageTs.get();
	},
	mySelf() {
		return this.t === 'd' && this.name === Template.instance().user.username;
	},
	isLivechatQueue() {
		return this.pathSection === 'livechat-queue';
	},
	//Finneg lista temas
	// temas() {
	// 	console.log('ENTRÓ')
	// 	if (this._id) {
	// 		console.log('_id', this._id);
	// 		console.log('rid', this.rid);
	// const nameContextAndDomain = localStorage.getItem('contextDomain').trim();
	// const roomContext = Rooms.find({name: nameContextAndDomain }).fetch();
	// console.log('room',roomContext)
	// console.log(this.roomID.get())
	// console.log(this.roomID)
	// console.log(Template.instance().roomID.get())
	// if ( Template.instance().roomID.get() == this.rid){
	// let temas = Rooms.find({ prid: this.rid }).fetch(); 
	// console.log('ACAAAAAAAAAAAAAAAAAAAA')
	// return temas;

	// }
	/* Al cargar la lista de contextos, se cargan la lista de temas, entonces habria que hacer que se carguen al hacer 
	click en un contexto. */
	// } else {
	// return;
	// }
	// },
	nombreTema(tema) {
		let name = tema.substring(tema.indexOf('-') + 1, tema.length);
		return name
	},
	isShowSubject() {
		/* Siempre va a ser true, entonces siempre se van a mostrar,
		habria que hacer una reactiveVar para que reaccione a los cambios en el click del contexto, y en ese caso se muestren*/
		return Template.instance().isShowSubject.get();
	},
	isLive() {
		//this.t != "l" && 
		return !this.username;
	},
	roomID() {
		return Template.instance().roomID.get();
	},
	subjectList() {
		return Template.instance().privatesSubjects.get();
	}

});


function timeAgo(time) {
	const now = new Date();
	const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);

	return (
		(now.getDate() === time.getDate() && moment(time).format('LT')) ||
		(yesterday.getDate() === time.getDate() && t('yesterday')) ||
		moment(time).format('L')
	);
}
function setLastMessageTs(instance, ts) {
	if (instance.timeAgoInterval) {
		clearInterval(instance.timeAgoInterval);
	}

	instance.lastMessageTs.set(timeAgo(ts));

	instance.timeAgoInterval = setInterval(() => {
		requestAnimationFrame(() => instance.lastMessageTs.set(timeAgo(ts)));
	}, 60000);
}




Template.sidebarItem.onRendered(() => {
	setTimeout(() => {
		if ($('li.sidebar-item.sidebar-item--active')[0] != undefined) {
			$('li.sidebar-item.sidebar-item--active')[0].id = 'click';
			$('#click').filter('li.sidebar-item.sidebar-item--active').trigger("click");
		}
	}, 500)

});

Template.sidebarItem.onCreated(function () {
	this.user = Users.findOne(Meteor.userId(), { fields: { username: 1 } });

	this.lastMessageTs = new ReactiveVar();
	this.roomID = new ReactiveVar();
	this.privatesSubjects = new ReactiveVar();
	this.isShowSubject = new ReactiveVar(false);
	this.timeAgoInterval;


	this.autorun(() => {
		const currentData = Template.currentData();

		if (!currentData.lastMessage || getUserPreference(Meteor.userId(), 'sidebarViewMode') !== 'extended') {
			return clearInterval(this.timeAgoInterval);
		}

		if (!currentData.lastMessage._id) {
			return this.renderedMessage = currentData.lastMessage.msg;
		}

		setLastMessageTs(this, currentData.lastMessage.ts);

		if (currentData.lastMessage.t === 'e2e' && currentData.lastMessage.e2e !== 'done') {
			return this.renderedMessage = '******';
		}

		const otherUser = settings.get('UI_Use_Real_Name') ? currentData.lastMessage.u.name || currentData.lastMessage.u.username : currentData.lastMessage.u.username;
		const renderedMessage = renderMessageBody(currentData.lastMessage).replace(/<br\s?\\?>/g, ' ');
		const sender = this.user._id === currentData.lastMessage.u._id ? t('You') : otherUser;

		if (currentData.t === 'd' && Meteor.userId() !== currentData.lastMessage.u._id) {
			this.renderedMessage = currentData.lastMessage.msg === '' ? t('Sent_an_attachment') : renderedMessage;
		} else {
			this.renderedMessage = currentData.lastMessage.msg === '' ? t('user_sent_an_attachment', { user: sender }) : `${sender}: ${renderedMessage}`;
		}
	});
});


Template.sidebarItem.events({
	'click .temas': function (event, instance) {
		let temas = $('.active-temas');


		// console.log(event)
		// console.log(instance)
		for (let i = 0; i < temas.length; i++) {
			temas.children().removeClass('active');
		}

		$(event.currentTarget).addClass('active');

	},
	'click li.sidebar-item': async function (e, i) {
		i.privatesSubjects.set([]);
		let temas = $('.active-temas');
		i.isShowSubject.set(false);
		i.roomID.set(i.data.rid);

		if (this.rid == i.data.rid) {
			i.isShowSubject.set(true);
			let subjects = await Rooms.find({ prid: i.data.rid }).fetch();
			i.privatesSubjects.set(subjects);
		}

		for (let i = 0; i < temas.length; i++) {
			temas.children().removeClass('active');
		}

	},
	'click [data-id], click .sidebar-item__link'() {
		return menu.close();
	},
	'click .context'(e) {
		//console.log(e.currentTarget.innerHTML);
		let a = e.currentTarget.className;
		//console.log(a)
		let test = $('.context li')
		//console.log(test)
		for (let i = 0; i < test.length; i++) {
			//console.log(test[i])

		}
		//console.log(test);
		//let find = test.find('.temas-contexto');
		//console.log(find)
	},
	'click .sidebar-item__menu'(e) {
		e.preventDefault();

		const canLeave = () => {
			const roomData = Session.get(`roomData${this.rid}`);

			if (!roomData) { return false; }

			if (roomData.t === 'c' && !hasAtLeastOnePermission('leave-c')) { return false; }
			if (roomData.t === 'p' && !hasAtLeastOnePermission('leave-p')) { return false; }

			return !(((roomData.cl != null) && !roomData.cl) || (['d', 'l'].includes(roomData.t)));
		};

		const canFavorite = settings.get('Favorite_Rooms') && ChatSubscription.find({ rid: this.rid }).count() > 0;
		const isFavorite = () => {
			const sub = ChatSubscription.findOne({ rid: this.rid }, { fields: { f: 1 } });
			if (((sub != null ? sub.f : undefined) != null) && sub.f) {
				return true;
			}
			return false;
		};

		const items = [{
			icon: 'eye-off',
			name: t('Hide_room'),
			type: 'sidebar-item',
			id: 'hide',
		}];

		if (this.alert) {
			items.push({
				icon: 'flag',
				name: t('Mark_as_read'),
				type: 'sidebar-item',
				id: 'read',
			});
		} else {
			items.push({
				icon: 'flag',
				name: t('Mark_as_unread'),
				type: 'sidebar-item',
				id: 'unread',
			});
		}

		if (canFavorite) {
			items.push({
				icon: 'star',
				name: t(isFavorite() ? 'Unfavorite' : 'Favorite'),
				modifier: isFavorite() ? 'star-filled' : 'star',
				type: 'sidebar-item',
				id: 'favorite',
			});
		}

		if (canLeave()) {
			items.push({
				icon: 'sign-out',
				name: t('Leave_room'),
				type: 'sidebar-item',
				id: 'leave',
				modifier: 'error',
			});
		}

		const config = {
			popoverClass: 'sidebar-item',
			columns: [
				{
					groups: [
						{
							items,
						},
					],
				},
			],
			data: {
				template: this.t,
				rid: this.rid,
				name: this.name,
			},
			currentTarget: e.currentTarget,
			offsetHorizontal: -e.currentTarget.clientWidth,
		};

		popover.open(config);
	},
});

Template.sidebarItemIcon.helpers({
	isRoom() {
		return this.rid || this._id;
	},
	status() {
		if (this.t === 'd') {
			return Session.get(`user_${this.username}_status`) || 'offline';
		}

		if (this.t === 'l') {
			return roomTypes.getUserStatus('l', this.rid) || 'offline';
		}

		return false;
	},

});
