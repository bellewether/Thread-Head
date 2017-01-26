import Ember from 'ember';
import config from './config/environment';

const Router = Ember.Router.extend({
  location: config.locationType
});

Router.map(function() {
  this.route('results', { path: '/search' });
  this.route('songs', { path: '/songs/:genius_id' });
  this.route('about');
});

export default Router;
