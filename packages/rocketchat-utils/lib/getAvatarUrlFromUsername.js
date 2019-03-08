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
/*
	//let test = Meteor.users.find({}, { fields: { name: 1, username: 1, emails: 1 } })
	//console.log(test)
	//console.log(username);
	let usuario;
	let email = undefined;
	try {
		//let test = Users.find({}).fetch();
		Meteor.call("test", username, function(err, result) {
			if(err){
				console.log("Error Find")
				return `${path}/avatar/${encodeURIComponent(username)}?_dc=${random}`;
			}else{
				if(result){
					email = result[0].emails[0].address;
					return `${path}/avatar/${encodeURIComponent(email)}?_dc=${random}`;
				}else{
					return `${path}/avatar/${encodeURIComponent(username)}?_dc=${random}`;
				}

			}
			
		});

	} catch (error) {
		console.log("ERROR")
		console.log(error)
		return `${path}/avatar/${encodeURIComponent(username)}?_dc=${random}`;
	}
	*/
	/*
	if (username == user.username) {
		return `${path}/avatar/${encodeURIComponent(user.emails[0].address)}?_dc=${random}`;
	} else {
		return `${path}/avatar/${encodeURIComponent(username)}?_dc=${random}`;
	}
	*/

	return `${ path }/avatar/${ encodeURIComponent(username) }?_dc=${ random }`;

};

Meteor.methods({
	test: function (username) {
		return Users.find({username: username}).fetch();
	}
});

