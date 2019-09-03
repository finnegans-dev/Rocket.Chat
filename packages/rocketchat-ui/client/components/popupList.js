import { Template } from 'meteor/templating';
import { settings } from 'meteor/rocketchat:settings';
import { Rooms } from 'meteor/rocketchat:models';

let usuarios = new ReactiveVar([]);
Template.popupList.helpers({
	config() {
		return {
			template: this.data.template_list || 'popupList_default',
			data: {
				noMatchTemplate: this.data.noMatchTemplate,
				template_item: this.data.template_item || 'popupList_item_default',
				items: this.items,
				onClick: this.data.onClick || function () { },
				modifier: this.data.modifier || function (text) { return text; },
			},

		};
	},
	open() {
		const instance = Template.instance();
		return instance.data.items.length > 0;
	},
});

Template.popupList_default.onCreated(function () {
	const nameRoom = localStorage.getItem('contextDomain').trim();
	const roomsSearch = Rooms.find({ name: nameRoom }).fetch();
	const idRoom = roomsSearch[0]._id;

	Meteor.call('getUsersOfRoom', idRoom, true, (error, users) => {
		if (error) {
			console.log(error)
		} else {
			let usuariosRoom = users.records;
			usuarios.set(usuariosRoom)
		}
	})

})

Template.noMatch.onCreated(function () {})

Template.popupList_default.helpers({

	config(item) {
		let u = usuarios.get();
		let find = false;
		if (u.length > 0) {
			u.forEach(u => {
				if (item.username == u.username) {
					find = true;
				}
			});
		}
		if (find) {
			return {
				template: this.template_item || 'popupList_item_default',
				data: {
					item,
					onClick: this.onClick,
					modifier: this.modifier,
				},
			};
		}else{
			return {
				template: 'noMatch',				
				data: {
					item: this.item,
					onClick: this.onClick,
					modifier: this.modifier,
				},
			};
		}

	},

});

Template.popupList_item_default.helpers({
	showRealNames() {
		return settings.get('UI_Use_Real_Name');
	},
});
