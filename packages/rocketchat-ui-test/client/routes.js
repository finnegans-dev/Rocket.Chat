import { FlowRouter } from 'meteor/kadira:flow-router';
import { BlazeLayout } from 'meteor/kadira:blaze-layout';

FlowRouter.route('/test', {
	name: 'test',
	action() {
		BlazeLayout.render('test');
	},
});
