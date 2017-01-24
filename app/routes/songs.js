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

  // afterModel: function(model) {
  //   var sample_song_hash = {}
  //   var samples = model.get('samples');
  //   for(var i=0; i<samples.get('length'); i++) {
  //     var sample = samples.objectAt(i);
  //     var sample_id = sample.get('genius_id');
  //     var sample_song = this.store.findRecord('song', sample_id);
  //
  //     sample_song_hash[sample_id] = { sample_song };
  //
  //   };
  //   return sample_song_hash.then(function(result){
  //     self.set('authors', result);
  //   ;
  // }
});
