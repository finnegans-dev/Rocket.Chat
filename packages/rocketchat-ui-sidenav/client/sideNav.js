import { Meteor } from 'meteor/meteor';
import { ReactiveVar } from 'meteor/reactive-var';
import { lazyloadtick } from 'meteor/rocketchat:lazy-load';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Template } from 'meteor/templating';
import { SideNav, menu } from 'meteor/rocketchat:ui-utils';
import { settings } from 'meteor/rocketchat:settings';
import { roomTypes, getUserPreference } from 'meteor/rocketchat:utils';
import { Users } from 'meteor/rocketchat:models';


import { HTTP } from 'meteor/http'

Template.sideNav.helpers({
	flexTemplate() {
		return SideNav.getFlex().template;
	},

	flexData() {
		return SideNav.getFlex().data;
	},

	footer() {
		return String(settings.get('Layout_Sidenav_Footer')).trim();
	},

	roomType() {
		return roomTypes.getTypes().map((roomType) => ({
			template: roomType.customTemplate || 'roomList',
			data: {
				header: roomType.header,
				identifier: roomType.identifier,
				isCombined: roomType.isCombined,
				label: roomType.label,
			},
		}));
	},

	loggedInUser() {
		return !!Meteor.userId();
	},

	sidebarViewMode() {
		const viewMode = getUserPreference(Meteor.userId(), 'sidebarViewMode');
		return viewMode ? viewMode : 'condensed';
	},

	sidebarHideAvatar() {
		return getUserPreference(Meteor.userId(), 'sidebarHideAvatar');
	},

	/*Finneg
	*/
	usuarios: function () {
		/*
		const instance = Template.instance();
		return instance.usersArray;
		*/
		return Template.instance().state.get('usuarios')
	}

});

Template.sideNav.events({
	'click .close-flex'() {
		return SideNav.closeFlex();
	},

	'click .arrow'() {
		return SideNav.toggleCurrent();
	},

	'scroll .rooms-list'() {
		lazyloadtick();
		return menu.updateUnreadBars();
	},

	'dropped .sidebar'(e) {
		return e.preventDefault();
	},

	'mouseenter .sidebar-item__link'(e) {
		const element = e.currentTarget;
		setTimeout(() => {
			const ellipsedElement = element.querySelector('.sidebar-item__ellipsis');
			const isTextEllipsed = ellipsedElement.offsetWidth < ellipsedElement.scrollWidth;

			if (isTextEllipsed) {
				element.setAttribute('title', element.getAttribute('aria-label'));
			} else {
				element.removeAttribute('title');
			}
		}, 0);
	},
	'click .button-usuarios'() {
		console.log("BOTON")
		console.log(this.usersArray)

	},
});

Template.sideNav.onRendered(function () {
	SideNav.init();
	menu.init();
	lazyloadtick();

	const first_channel_login = settings.get('First_Channel_After_Login');
	const room = roomTypes.findRoom('c', first_channel_login, Meteor.userId());

	if (room !== undefined && room._id !== '') {
		FlowRouter.go(`/channel/${first_channel_login}`);
	}

	return Meteor.defer(() => menu.updateUnreadBars());
});

Template.sideNav.onCreated(function () {
	this.groupedByType = new ReactiveVar(false);

	var instance = this;
	let name = "dpcomercializadoratest-contexto1"
	let token = window.localStorage.getItem("Meteor.loginToken")
	let userId = window.localStorage.getItem("Meteor.userId")
	this.usersArray = ["TEST", "TEST2"];

	//const instance = this
	instance.state = new ReactiveDict()
	instance.state.set('usuarios', [])

	this.autorun(() => {
		const user = Users.findOne(Meteor.userId(), {
			fields: {
				'settings.preferences.sidebarGroupByType': 1,
			},
		});
		
		HTTP.get(`/api/v1/groups.members?roomName=${name}`, {
			headers: {
				"X-Auth-Token": token,
				"X-User-Id": userId
			}
		}, function (err, res) {
			if (err) {
				console.log(err)
			} else {
				if (res) {
					console.log(res.data.members)
					//usersArray = res.data.members;
					instance.state.set('usuarios', res.data.members);
				}
				
			}
		});

		const userPref = getUserPreference(user, 'sidebarGroupByType');
		this.groupedByType.set(userPref ? userPref : settings.get('UI_Group_Channels_By_Type'));
	});
});
