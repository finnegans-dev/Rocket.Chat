import { Meteor } from 'meteor/meteor';
import { Base } from './_Base';
import _ from 'underscore';

export class GoTokens extends Base {
	constructor(...args) {
		super(...args);

		this.tryEnsureIndex({ userId: 1 });
		this.tryEnsureIndex({ goToken: 1 });
	}
}

export default new GoTokens('gotokens');
