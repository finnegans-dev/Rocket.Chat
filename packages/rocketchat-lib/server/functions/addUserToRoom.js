import { Meteor } from 'meteor/meteor';
import { Rooms, Subscriptions, Messages } from 'meteor/rocketchat:models';
import { hasPermission } from 'meteor/rocketchat:authorization';
import { callbacks } from 'meteor/rocketchat:callbacks';
import { HTTP } from 'meteor/http';
import { GoTokens } from 'meteor/rocketchat:models';

export const addUserToRoom = function(rid, user, inviter, silenced) {
	const now = new Date();
	const room = Rooms.findOneById(rid);

	// Check if user is already in room
	const subscription = Subscriptions.findOneByRoomIdAndUserId(rid, user._id);
	if (subscription) {
		return;
	}

	if (room.t === 'c' || room.t === 'p') {
		// Add a new event, with an optional inviter
		callbacks.run('beforeAddedToRoom', { user, inviter }, room);

		// Keep the current event
		callbacks.run('beforeJoinRoom', user, room);
	}

	const muted = room.ro && !hasPermission(user._id, 'post-readonly');
	if (muted) {
		Rooms.muteUsernameByRoomId(rid, user.username);
	}

	Subscriptions.createWithRoomAndUser(room, user, {
		ts: now,
		open: true,
		alert: true,
		unread: 1,
		userMentions: 1,
		groupMentions: 0,
	});

	root = __meteor_runtime_config__.ROOT_URL;

	let prefix = root.substring(0,root.lastIndexOf(`/c`)+1);
	// let prefix = 'http://localhost:4000/';

	let notificationData = {
		product:"ecoChat",
		event:"invite",
		subject: "",
		message: "",
		destination: ""
	};

	let token = GoTokens.find({userId: inviter._id}).fetch();

	let splitInviter = inviter.username.split('-');
	let splitTName = room.fname.split('-');
	let splitUser = user.username.split('-');
	
	let url = `${prefix}api/1/notifications/notify?access_token=${token[0].goToken}`;

	notificationData.message = `${splitInviter[0]} te invitó al tema ${splitTName[1]}`;
	notificationData.destination = splitUser[1];

	HTTP.post(url, {data: notificationData}, function (err, data) {
		if(err){
			console.log(err);
		}       
	});

	if (!silenced) {
		if (inviter) {
			Messages.createUserAddedWithRoomIdAndUser(rid, user, {
				ts: now,
				u: {
					_id: inviter._id,
					username: inviter.username,
				},
			});
		} else {
			Messages.createUserJoinWithRoomIdAndUser(rid, user, { ts: now });
		}
	}

	if (room.t === 'c' || room.t === 'p') {
		Meteor.defer(function() {
			// Add a new event, with an optional inviter
			callbacks.run('afterAddedToRoom', { user, inviter }, room);

			// Keep the current event
			callbacks.run('afterJoinRoom', user, room);
		});
	}

	return true;
};
