import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';
import { Template } from 'meteor/templating';
import { getAvatarUrlFromUsername } from 'meteor/rocketchat:utils';

import { HTTP } from 'meteor/http';

import { getEmail } from './getEmail'

import { Users } from 'meteor/rocketchat:models';
import { settings } from 'meteor/rocketchat:settings';
import { DDPRateLimiter } from 'meteor/ddp-rate-limiter';

Template.avatar.onCreated(function () {

});

Template.avatar.helpers({

	src() {

		let { url } = Template.instance().data;
		if (!url) {
			let { username } = this;
			//console.log("username " + username)
			if (username == null && this.userId != null) {
				const user = Meteor.users.findOne(this.userId);
				username = user && user.username;
				console.log(user)
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

