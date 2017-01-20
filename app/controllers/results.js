import Ember from 'ember';

export default Ember.Controller.extend({
  actions: {
    filterBySearchWord(param) {
      if (param !== '') {
        return this.get('store').query('result', { q: param });
      }
    }

    // search(param) {
    //   if ()
    // }
  }



});
