import Ember from 'ember';

export default Ember.Controller.extend({
  // filterSort: ['title'],
  // sortedCategories: Ember.computed.sort('model', 'filterSort'),

  queryParams: ['q'],
    q: null
});
