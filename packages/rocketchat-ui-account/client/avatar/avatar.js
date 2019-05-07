import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';
import { Template } from 'meteor/templating';
import { getAvatarUrlFromUsername } from 'meteor/rocketchat:utils';

Template.avatar.helpers({
	src() {
		/* Color Avatar
		Finneg
		let { url } = Template.instance().data;
		if (!url) {
			let { username } = this;
			if (username == null && this.userId != null) {
				const user = Meteor.users.findOne(this.userId);
				username = user && user.username;
			}
			if (username == null) {
				return;
			}
			Session.get(`avatar_random_${ username }`);

			if (this.roomIcon) {
				username = `@${ username }`;
			}

			url = getAvatarUrlFromUsername(username);
		}
		return url;
		*/
		let { url } = Template.instance().data;
		if (!url) {
			let { username } = this;
			//console.log("username " + username)
			if (username == null && this.userId != null) {
				const user = Meteor.users.findOne(this.userId);
				username = user && user.username;
				
			}
			if (username == null) {
				return;
			}
			Session.get(`avatar_random_${username}`);

			if (this.roomIcon) {
				username = `@${username}`;
			}
			let email = username.substring(username.indexOf('-') + 1, username.lenght);
			//console.log(email)
			url = getAvatarUrlFromUsername(email);
			//url = `${ path }/avatar/${ encodeURIComponent(username) }?_dc=${ random }`;


		}
		return url;
	},
});
