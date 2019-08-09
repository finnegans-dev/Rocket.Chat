import { Meteor } from 'meteor/meteor';
import { ReactiveVar } from 'meteor/reactive-var';
import { lazyloadtick } from 'meteor/rocketchat:lazy-load';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Template } from 'meteor/templating';
import { SideNav, menu } from 'meteor/rocketchat:ui-utils';
import { settings } from 'meteor/rocketchat:settings';
import { roomTypes, getUserPreference } from 'meteor/rocketchat:utils';
import { Users } from 'meteor/rocketchat:models';




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
	'click .contextTab' (){
		let directMessageOnTab = $('.directMessageTab.tab-type-d')[0];
		let livechatOnTab = $('.livechatTab')[0];
		let contextOnTab = $('.directMessageTab.tab-type-p')[0];
		contextOnTab.hidden = false;
		$('.tabs .contextTab').addClass('active-tab');
		$('.tabs .directTab').removeClass('active-tab');
		$('.tabs .livechatTab').removeClass('active-tab');
		!directMessageOnTab.hidden ? directMessageOnTab.hidden = true : 
		!livechatOnTab.hidden ? livechatOnTab.hidden = true : '';
		
	},
	'click .directTab' (){
		let directMessageOnTab = $('.directMessageTab.tab-type-d')[0];
		let livechatOnTab = $('.livechatTab')[0];
		let contextOnTab = $('.directMessageTab.tab-type-p')[0];
		directMessageOnTab.hidden = false;
		$('.tabs .directTab').addClass('active-tab');
		$('.tabs .contextTab').removeClass('active-tab');
		$('.tabs .livechatTab').removeClass('active-tab');
		!contextOnTab.hidden ? contextOnTab.hidden = true : 
		!livechatOnTab.hidden ? livechatOnTab.hidden = true : '';
	},
	'click .livechatTab' (){
		let directMessageOnTab = $('.directMessageTab.tab-type-d')[0];
		let livechatOnTab = $('.livechatTab');
		let contextOnTab = $('.directMessageTab.tab-type-p')[0];
		livechatOnTab[0].hidden = false;
		$('.tabs .livechatTab').addClass('active-tab');
		$('.tabs .contextTab').removeClass('active-tab');
		$('.tabs .directTab').removeClass('active-tab');
		!contextOnTab.hidden ? contextOnTab.hidden = true : 
		!directMessageOnTab.hidden ? directMessageOnTab.hidden = true : '';
	},
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
	let directMessageOnTab = $('.directMessageTab.tab-type-d');
	let livechatOnTab = $('.livechatTab')[0];
	directMessageOnTab[0].hidden = true;
	$('.tabs .contextTab').addClass('active-tab');
	livechatOnTab ? livechatOnTab.hidden = true : $('.livechatTab')[1].hidden = true;
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
