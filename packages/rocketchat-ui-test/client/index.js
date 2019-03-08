import './routes';
import './test.html';

import { Meteor } from 'meteor/meteor';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Template } from 'meteor/templating';
import { settings } from 'meteor/rocketchat:settings';
import { Users } from 'meteor/rocketchat:models';
import { hasRole } from 'meteor/rocketchat:authorization';

Template.setupWizardFinal.onCreated(function() {});