import { Session } from 'meteor/session';
import { settings } from 'meteor/rocketchat:settings';

import { Users } from 'meteor/rocketchat:models';

import { Meteor } from 'meteor/meteor';
import { DDPRateLimiter } from 'meteor/ddp-rate-limiter';

export const getAvatarUrlFromUsername = function (username) {
	const externalSource = (settings.get('Accounts_AvatarExternalProviderUrl') || '').trim().replace(/\/$/, '');

	if (externalSource !== '') {
		return externalSource.replace('{username}', username);
	}
	const key = `avatar_random_${username}`;
	const random = typeof Session !== 'undefined' && typeof Session.keys[key] !== 'undefined' ? Session.keys[key] : 0;
	if (username == null) {
		return;
	}
	const cdnPrefix = (settings.get('CDN_PREFIX') || '').trim().replace(/\/$/, '');
	const pathPrefix = (__meteor_runtime_config__.ROOT_URL_PATH_PREFIX || '').trim().replace(/\/$/, '');
	let path = pathPrefix;

	if (cdnPrefix) {
		path = cdnPrefix + pathPrefix;
	}

	path = __meteor_runtime_config__.ROOT_URL;
	/*Finneg
	*/
	//return `${ path }/avatar/${ encodeURIComponent(username) }?_dc=${ random }`;
	return `${ path }avatar/${ encodeURIComponent(username) }?_dc=${ random }`;
};

Meteor.methods({
	test: function (username) {
		return Users.find({username: username}).fetch();
	}
});

