Package.describe({
	name: 'test',
	version: '0.1.0',
	summary: '',
	git: '',
	documentation: 'README.md',
});

Package.onUse(function(api) {
	api.use([
		'ecmascript',
		'templating',
		'rocketchat:utils',
		'rocketchat:lib',
		'rocketchat:ui',
		'rocketchat:assets',
		'rocketchat:2fa',
		'kadira:flow-router',
		'kadira:blaze-layout',
	]);
	api.mainModule('client/index.js', 'client');
});
 