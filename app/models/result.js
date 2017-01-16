import DS from 'ember-data';

export default DS.Model.extend({
  title: DS.attr('string'),
  full_title: DS.attr('string'),
  primary_artist: DS.attr('string')
});
