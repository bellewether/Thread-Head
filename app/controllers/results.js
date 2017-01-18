import Ember from 'ember';

export default Ember.Controller.extend({
  // filterSort: ['title'],
  // sortedCategories: Ember.computed.sort('model', 'filterSort'),

  actions: {
    filterBySearchWord(param) {
      if (param !== '') {
        return this.get('store').query('result', { q: param });
      } else {
        // return this.get('store').findAll('rental');
      }
    }
  }

});
