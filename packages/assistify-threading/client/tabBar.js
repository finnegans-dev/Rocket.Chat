import { Meteor } from 'meteor/meteor';
import { TabBar } from 'meteor/rocketchat:ui-utils';

Meteor.startup(function() {
	return TabBar.addButton({
		groups: ['channel', 'group', 'direct'],
		id: 'threads',
		i18nTitle: 'Temas',
		icon: 'thread',
		template: 'threadsTabbar',
		order: 10,
	});
});
