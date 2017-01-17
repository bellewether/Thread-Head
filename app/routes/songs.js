import Ember from 'ember';

export default Ember.Route.extend({
  model(params) {
    return this.store.findRecord('song', params.genius_id);
  },

  afterModel: function(model) {
    return model.get('samples');
  }
});
