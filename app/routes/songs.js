import Ember from 'ember';

export default Ember.Route.extend({
  model(params) {
    return this.store.findRecord('song', params.genius_id);
  }

  // model(params) {
  //   let song = this.store.findRecord('song', params.genius_id);
  //
  //   return Ember.RSVP.hash({
  //     song: song,
  //     samples: song.then(samples => song.get('samples'))
  //   })
  // },
  //
  // setupController(controller, hash) {
  //       controller.set('song', hash.song)
  //       controller.set('samples', hash.samples)
  // },

  // afterModel: function(model) {
  //   return model.get('samples');
  // }
});
