import DS from 'ember-data';

export default DS.Model.extend({
  genius_id: DS.attr('number'),
  song_title: DS.attr('string'),
  primary_artist: DS.attr('string'),
  album: DS.attr('string'),
  release_date: DS.attr('string'),
  samples: DS.hasMany('sample', { async: true })
});
