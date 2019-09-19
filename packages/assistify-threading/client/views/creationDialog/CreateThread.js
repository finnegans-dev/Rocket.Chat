import { Meteor } from 'meteor/meteor';
import { roomTypes } from 'meteor/rocketchat:utils';
import { callbacks } from 'meteor/rocketchat:callbacks';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { AutoComplete } from 'meteor/mizzao:autocomplete';
import { ChatRoom } from 'meteor/rocketchat:models';
import { Blaze } from 'meteor/blaze';
import { call } from 'meteor/rocketchat:ui-utils';

import { TAPi18n } from 'meteor/tap:i18n';
import toastr from 'toastr';
import { HTTP } from 'meteor/http'

import { Rooms } from 'meteor/rocketchat:models';

Template.CreateThread.helpers({

	onSelectUser() {
		return Template.instance().onSelectUser;
	},
	disabled() {
		if (Template.instance().selectParent.get()) {
			return 'disabled';
		}
	},
	targetChannelText() {
		const instance = Template.instance();
		const parentChannel = instance.parentChannel.get();
		return parentChannel && `${TAPi18n.__('Thread_target_channel_prefix')} "${parentChannel}"`;
	},
	createIsDisabled() {
		const instance = Template.instance();
		if (instance.threadName.get()) {
			return '';
		}
		return 'disabled';
	},
	parentChannel() {
		const instance = Template.instance();
		return instance.parentChannel.get();
	},
	selectedUsers() {
		const { message } = this;
		const users = Template.instance().selectedUsers.get();
		if (message) {
			users.unshift(message.u);
		}
		return users;
	},

	onClickTagUser() {
		return Template.instance().onClickTagUser;
	},
	deleteLastItemUser() {
		return Template.instance().deleteLastItemUser;
	},
	onClickTagRoom() {
		return Template.instance().onClickTagRoom;
	},
	deleteLastItemRoom() {
		return Template.instance().deleteLastItemRoom;
	},
	selectedRoom() {
		return Template.instance().selectedRoom.get();
	},
	onSelectRoom() {
		return Template.instance().onSelectRoom;
	},
	roomCollection() {
		return ChatRoom;
	},
	roomSelector() {
		return (expression) => ({ name: { $regex: `.*${expression}.*` } });
	},
	roomModifier() {
		return (filter, text = '') => {
			const f = filter.get();
			return `#${f.length === 0 ? text : text.replace(new RegExp(filter.get()), (part) => `<strong>${part}</strong>`)}`;
		};
	},
	userModifier() {
		return (filter, text = '') => {
			const f = filter.get();
			return `@${f.length === 0 ? text : text.replace(new RegExp(filter.get()), (part) => `<strong>${part}</strong>`)}`;
		};
	},
	channelName() {
		return Template.instance().threadName.get();
	},
	threadPrivate() {
		return Template.instance().threadPrivate.get();
	},
	// isVerticalChat(){
	// 	return Template.instance().isVerticalChat.get();
	// }

});


Template.CreateThread.events({
	'input #thread_name'(e, t) {
		t.threadName.set(e.target.value);
	},
	'change .js-input-check'(e, t) {
		//console.log(e.currentTarget.checked)
		t.threadPrivate.set(e.currentTarget.checked)
	},
	'input #thread_message'(e, t) {
		const { value } = e.target;
		t.reply.set(value);
	},
	async 'submit #create-thread, click .js-save-thread'(event, instance) {
		event.preventDefault();
		const parentChannel = instance.parentChannel.get();
		const { pmid } = instance;
		//Finneg
		//Le agrego el dominio por defecto
		const t_name = localStorage.getItem('dominio') + "-" + instance.threadName.get();
		//console.log(t_name)
		const users = instance.selectedUsers.get().map(({ username }) => username).filter((value, index, self) => self.indexOf(value) === index);

		const nameContextAndDomain = localStorage.getItem('contextDomain').trim();
		const roomContext = Rooms.find({name: nameContextAndDomain }).fetch();
		
		//const prid = instance.parentChannelId.get();
		const prid = roomContext[0]._id;
		const reply = instance.reply.get();

		//Tema privado

		if (!prid) {
			const errorText = TAPi18n.__('Invalid_room_name', `${parentChannel}...`);
			return toastr.error(errorText);
		}
		const result = await call('createThread', { prid, pmid, t_name, reply, users });
		// console.log( { prid, pmid, t_name, reply, users })

		
		// callback to enable tracking
		callbacks.run('afterCreateThread', Meteor.user(), result);

		if (instance.data.onCreate) {
			if (!instance.threadPrivate.get()) {
				HTTP.call('POST', `api/v1/invitacionesTemas/${result.prid}/${result.rid}`, function (err, res) {
					if (err) {
						console.log(err)
						console.log("Error de Autenticacion")
					} else {
						console.log("OK")
					}
				});
			}
			instance.data.onCreate(result);
		}

		roomTypes.openRouteLink(result.t, result);

	},
});

Template.CreateThread.onRendered(function () {
	this.find(this.data.rid ? '#thread_name' : '#parentChannel').focus();
});

Template.CreateThread.onCreated(function () {
	const { rid, message: msg } = this.data;
	const parentRoom = rid && ChatRoom.findOne(rid);
	// let isContextAdm = false;
	// if creating a thread from inside a thread, uses the same channel as parent channel
	const room = parentRoom && parentRoom.prid ? ChatRoom.findOne(parentRoom.prid) : parentRoom;
	
	if (room) {
		room.text = room.name;
		this.threadName = new ReactiveVar(`${room.name} - ${msg && msg.msg}`);
	} else {
		this.threadName = new ReactiveVar('');
	}
	// this.isVerticalChat = new ReactiveVar(false);
	
	this.pmid = msg && msg._id;

	this.parentChannel = new ReactiveVar(roomTypes.getRoomName(room));
	this.parentChannelId = new ReactiveVar(rid);
	
	this.selectParent = new ReactiveVar(!!rid);
	
	this.reply = new ReactiveVar('');
	
	this.threadPrivate = new ReactiveVar(false);
	
	this.selectedRoom = new ReactiveVar(room ? [room] : []);
	
	// console.log(Template.instance())

	// if ( !isContextAdm ){
	// 	this.isVerticalChat.set(true);
	// 	Template.instance().threadPrivate.set(true);
	// }
	
	this.onClickTagRoom = () => {
		this.selectedRoom.set([]);
	};
	this.deleteLastItemRoom = () => {
		this.selectedRoom.set([]);
	};

	this.onSelectRoom = ({ item: room }) => {
		room.text = room.name;
		this.selectedRoom.set([room]);
	};

	this.autorun(() => {
		const [room = {}] = this.selectedRoom.get();
		this.parentChannel.set(room && room.name); // determine parent Channel from setting and allow to overwrite
		this.parentChannelId.set(room && room._id);
	});


	this.selectedUsers = new ReactiveVar([]);
	this.onSelectUser = ({ item: user }) => {
		const users = this.selectedUsers.get();
		if (!users.find((u) => user.username === u.username)) {
			this.selectedUsers.set([...this.selectedUsers.get(), user].filter());
		}
	};
	this.onClickTagUser = (({ username }) => {
		this.selectedUsers.set(this.selectedUsers.get().filter((user) => user.username !== username));
	});
	this.deleteLastItemUser = (() => {
		const arr = this.selectedUsers.get();
		arr.pop();
		this.selectedUsers.set(arr);
	});


	// callback to allow setting a parent Channel or e. g. tracking the event using Piwik or GA
	const { parentChannel, reply } = callbacks.run('openThreadCreationScreen') || {};

	if (parentChannel) {
		this.parentChannel.set(parentChannel);
	}
	if (reply) {
		this.reply.set(reply);
	}
});

Template.SearchCreateThread.helpers({
	list() {
		return this.list;
	},
	items() {
		return Template.instance().ac.filteredList();
	},
	config() {
		const { filter } = Template.instance();
		const { noMatchTemplate, templateItem, modifier } = Template.instance().data;
		return {
			filter: filter.get(),
			template_item: templateItem,
			noMatchTemplate,
			modifier(text) {
				return modifier(filter, text);
			},
		};
	},
	autocomplete(key) {
		const instance = Template.instance();
		const param = instance.ac[key];
		return typeof param === 'function' ? param.apply(instance.ac) : param;
	},
});

Template.SearchCreateThread.events({
	'input input'(e, t) {
		const input = e.target;
		const position = input.selectionEnd || input.selectionStart;
		const { length } = input.value;
		document.activeElement === input && e && /input/i.test(e.type) && (input.selectionEnd = position + input.value.length - length);
		t.filter.set(input.value);
	},
	'click .rc-popup-list__item'(e, t) {
		t.ac.onItemClick(this, e);
	},
	'keydown input'(e, t) {
		t.ac.onKeyDown(e);
		if ([8, 46].includes(e.keyCode) && e.target.value === '') {
			const { deleteLastItem } = t;
			return deleteLastItem && deleteLastItem();
		}

	},
	'keyup input'(e, t) {
		t.ac.onKeyUp(e);
	},
	'focus input'(e, t) {
		t.ac.onFocus(e);
	},
	'blur input'(e, t) {
		t.ac.onBlur(e);
	},
	'click .rc-tags__tag'({ target }, t) {
		const { onClickTag } = t;
		return onClickTag & onClickTag(Blaze.getData(target));
	},
});
Template.SearchCreateThread.onRendered(function () {

	const { name } = this.data;

	this.ac.element = this.firstNode.querySelector(`[name=${name}]`);
	this.ac.$element = $(this.ac.element);
});

Template.SearchCreateThread.onCreated(function () {
	this.filter = new ReactiveVar('');
	this.selected = new ReactiveVar([]);
	this.onClickTag = this.data.onClickTag;
	this.deleteLastItem = this.data.deleteLastItem;

	const { collection, subscription, field, sort, onSelect, selector = (match) => ({ term: match }) } = this.data;
	this.ac = new AutoComplete(
		{
			selector: {
				anchor: '.rc-input__label',
				item: '.rc-popup-list__item',
				container: '.rc-popup-list__list',
			},
			onSelect,
			position: 'fixed',
			limit: 10,
			inputDelay: 300,
			rules: [
				{
					collection,
					subscription,
					field,
					matchAll: true,
					// filter,
					doNotChangeWidth: false,
					selector,
					sort,
				},
			],

		});
	this.ac.tmplInst = this;
});
