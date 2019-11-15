import { Meteor } from 'meteor/meteor';
import { ReactiveVar } from 'meteor/reactive-var';
import { lazyloadtick } from 'meteor/rocketchat:lazy-load';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Template } from 'meteor/templating';
import { SideNav, menu } from 'meteor/rocketchat:ui-utils';
import { settings } from 'meteor/rocketchat:settings';
import { roomTypes, getUserPreference } from 'meteor/rocketchat:utils';
import { Users } from 'meteor/rocketchat:models';

import { HTTP } from 'meteor/http';
import { Rooms } from 'meteor/rocketchat:models';
import { call } from 'meteor/rocketchat:ui-utils';
import { callbacks } from 'meteor/rocketchat:callbacks';
import _ from 'underscore';



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
});

Template.sideNav.events({
	/*'click .contextTab' (){                                               
		let directMessageOnTab = $('.directMessageTab.tab-type-d');
		let livechatOnTab = $('.livechatTabRoom');
		let contextOnTab = $('.directMessageTab.tab-type-p');
		contextOnTab.css("display", "block");
		directMessageOnTab.css("display", "none");
		livechatOnTab.css("display", "none");
		$('.tabs .contextTab').addClass('active-tab');
		$('.tabs .directTab').removeClass('active-tab');
		$('.tabs .livechatTab').removeClass('active-tab');
		!livechatOnTab.hidden ? livechatOnTab.hidden = true : '';
		
	},
	'click .directTab' (){
		let directMessageOnTab = $('.directMessageTab.tab-type-d');
		let livechatOnTab = $('.livechatTabRoom');
		let contextOnTab = $('.directMessageTab.tab-type-p');
		directMessageOnTab.css("display", "block");
		contextOnTab.css("display", "none");
		livechatOnTab.css("display", "none");
		$('.tabs .directTab').addClass('active-tab');
		$('.tabs .contextTab').removeClass('active-tab');
		$('.tabs .livechatTab').removeClass('active-tab');
		!contextOnTab.hidden ? contextOnTab.hidden = true : 
		!livechatOnTab.hidden ? livechatOnTab.hidden = true : '';
	},
	'click .livechatTab' (){
		let directMessageOnTab = $('.directMessageTab.tab-type-d');
		let livechatOnTab = $('.livechatTabRoom');
		let contextOnTab = $('.directMessageTab.tab-type-p');
		livechatOnTab.css("display", "block");
		directMessageOnTab.css("display", "none");
		contextOnTab.css("display", "none");
		$('.tabs .livechatTab').addClass('active-tab');
		$('.tabs .contextTab').removeClass('active-tab');
		$('.tabs .directTab').removeClass('active-tab');
	},*/
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
			let isTextEllipsed = false;
			try{
				isTextEllipsed = ellipsedElement.offsetWidth < ellipsedElement.scrollWidth;
			}catch{}
			

			if (isTextEllipsed) {
				element.setAttribute('title', element.getAttribute('aria-label'));
			} else {
				element.removeAttribute('title');
			}
		}, 0);
	},
});

Template.sideNav.onRendered(function () {
	/*let directMessageOnTab = $('.directMessageTab.tab-type-d');
	let livechatTabRoom = $('.livechatTabRoom');
	directMessageOnTab.css("display", "none");
	livechatTabRoom.css("display", "none");
	$('.tabs .contextTab').addClass('active-tab');    Esto lo acabo de comentar*/
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

async function inviteAdmsToPrivateRoom (){
	const nameContextAndDomain = localStorage.getItem('contextDomain').trim();
	const roomContext = Rooms.find({name: nameContextAndDomain }).fetch();
	const prid = roomContext[0]._id;
	let temas = Rooms.find({ prid: prid }).fetch();

	if ( temas.length < 1){
	console.log('MENOR QUE 1 SIDENAV')
	const t_name = `Sala_${Meteor.user().name}`;
	let pmid;
	const reply = '';
	const users = [];

	const result = await call('createThread', { prid, pmid, t_name, reply, users });

	callbacks.run('afterCreateThread', Meteor.user(), result);

	const cu = localStorage.getItem('currentuser');
	const { domain, token } = JSON.parse(cu);

		HTTP.call('POST', `api/v1/customInvitations/${result.prid}/${result.rid}/${domain}/${token}`, function (err, res) {
				if (err) {
					console.log(err)
					console.log("Error de Autenticacion")
				} else {
					console.log('Created private thread')
					// FlowRouter.go(`/group/${result.name}`);
				}
			});
	}
	// console.log('MAYOR QUE 1 SIDENAV')
}

Template.sideNav.onCreated(function () {
	const isVertical = localStorage.getItem('isVertical');
	 root = __meteor_runtime_config__.ROOT_URL;
    //console.log(__meteor_runtime_config__);
	url = root.substring(0, root.lastIndexOf(`/c`) + 1);
	if ( isVertical.toLocaleUpperCase() == 'SI' ){

		const cu = localStorage.getItem('currentuser');
		const { domain, token, email } = JSON.parse(cu);
		root = __meteor_runtime_config__.ROOT_URL;    
		url = root.substring(0, root.lastIndexOf(`/c`) + 1);
		// url= 'https://go-test.finneg.com/'
		//go-test.finneg
		HTTP.call('GET' ,`${url}api/1/users/profile/${domain}/${email}?access_token=${token}`, function (err, res) {
			const isContextCreate = res.data.contextCreation;
			
			if ( !isContextCreate ){
				inviteAdmsToPrivateRoom();
			}

		});

	}
	this.groupedByType = new ReactiveVar(false);

	this.autorun(() => {
		const user = Users.findOne(Meteor.userId(), {
			fields: {
				'settings.preferences.sidebarGroupByType': 1,
			},
		});
		const userPref = getUserPreference(user, 'sidebarGroupByType');
		this.groupedByType.set(userPref ? userPref : settings.get('UI_Group_Channels_By_Type'));
	});
});
