import Ember from 'ember';
import config from './config/environment';

const Router = Ember.Router.extend({
  location: config.locationType
});

Router.map(function() {
  this.route('songs', { path: '/songs/:genius_id' });
  this.route('results');
});

export default Router;
