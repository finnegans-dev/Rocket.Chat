import * as Models from '..';
import { Base } from './_Base';

export class Token extends Base {
	constructor(...args) {
		super(...args);
		this.tryEnsureIndex({ name: 1 });
    }
}

export default new Token('token');