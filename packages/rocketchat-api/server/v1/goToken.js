import { Meteor } from 'meteor/meteor';
import { GoTokens } from 'meteor/rocketchat:models';
import { API } from '../api';


//APIS goToken
/*Finneg
*/

API.v1.addRoute('gotoken/:userID/:goToken', {
	post() {
		userID = this.urlParams.userID;
		gotoken = this.urlParams.goToken;

		let user = GoTokens.findOne({userId: userID});

		user ? GoTokens.update({userId: userID},{$set: {goToken: gotoken}}) : GoTokens.insert({ userId: userID, goToken: gotoken });

		return API.v1.success({
			status: 'ok',
			user
		});
	}
});