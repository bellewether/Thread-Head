import Ember from 'ember';

export default Ember.Route.extend({

  actions: {
    transitiontoResults: function() {
      console.log("transitiontoResults from the router was called!")
      this.transitionTo('results');
    }
  }
});
