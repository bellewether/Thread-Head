import Ember from 'ember';

export default Ember.Controller.extend({
  actions: {
    transitiontoResults: function() {
      console.log("transitiontoResults from the router was called!")
      this.transitionTo('results');
    }
  }
});
