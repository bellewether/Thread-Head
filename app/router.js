import Ember from 'ember';
import config from './config/environment';

const Router = Ember.Router.extend({
  location: config.locationType
});

Router.map(function() {
  this.route('results');
  this.route('songs', { path: '/songs/:genius_id' });
});

export default Router;
