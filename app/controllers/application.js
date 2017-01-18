import Ember from 'ember';

export default Ember.Controller.extend({

  actions: {
    search(query){
      return this.store.query('result', query);      
    }

  }
});
