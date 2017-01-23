import Ember from 'ember';

export default Ember.Component.extend({
    store: Ember.inject.service(),

    createNodeData: function() {
      console.log(">>>>>>>>>>>>>>getting a song!");
      var current_song = this.get('current_song'); // internal model whatever that means
      var current_id = current_song.get('genius_id');
      var current_song_title = current_song.get('song_title');
      var current_primary_artist = current_song.get('primary_artist');

      var current_samples = current_song.get('samples');

      console.log("current id is: " + current_id);
      console.log("current song is: " + current_song_title);


      var nodes = {};
      nodes[current_song_title] = { id: current_id, song_title: current_song_title, primary_artist: current_primary_artist, color: 'black', shape: 'dot' }; //add genius_id for additional calls

      var edges = {};
      edges[current_song_title] = {};

      var numSamples = current_samples.get('length');

      for(var i=0; i<numSamples; i++) {
        var sample = current_samples.objectAt(i);
        var sample_title = sample.get('song_title');
        var primary_artist = sample.get('primary_artist');
        var id = sample.get('genius_id');
        var sample_type = sample.get('sample_type');

        nodes[sample_title] = { id: id, song_title: sample_title, primary_artist: primary_artist, sample_type: sample_type }; //add genius_id for additional calls
        edges[current_song_title][sample_title] = {};

      };

      var data = {
        "nodes": nodes,
        "edges": edges
      };

      return data;
    },

    Renderer: function(canvas){
      canvas = $(canvas).get(0);
      var ctx = canvas.getContext("2d");
      var gfx = arbor.Graphics(canvas)
      var particleSystem;
      // var kanye_song = this.get('store').get('song');
      // console.log(">>>>>>>>>>>>>" + kanye_song);

      var that = {
        init: function(system){
          //
          // the particle system will call the init function once, right before the
          // first frame is to be drawn. it's a good place to set up the canvas and
          // to pass the canvas size to the particle system
          //
          // save a reference to the particle system for use in the .redraw() loop
          particleSystem = system;

          // inform the system of the screen dimensions so it can map coords for us.
          // if the canvas is ever resized, screenSize should be called again with
          // the new dimensions
          particleSystem.screenSize(canvas.width, canvas.height);
          particleSystem.screenPadding(80); // leave an extra 80px of whitespace per side

          // set up some event handlers to allow for node-dragging
          that.initMouseHandling();
        },

        redraw:function(){
          //
          // redraw will be called repeatedly during the run whenever the node positions
          // change. the new positions for the nodes can be accessed by looking at the
          // .p attribute of a given node. however the p.x & p.y values are in the coordinates
          // of the particle system rather than the screen. you can either map them to
          // the screen yourself, or use the convenience iterators .eachNode (and .eachEdge)
          // which allow you to step through the actual node objects but also pass an
          // x,y point in the screen's coordinate system
          //
          ctx.fillStyle = "gray";
          ctx.fillRect(0,0, canvas.width, canvas.height);

          particleSystem.eachEdge(function(edge, pt1, pt2){
            // edge: {source:Node, target:Node, length:#, data:{}}
            // pt1:  {x:#, y:#}  source position in screen coords
            // pt2:  {x:#, y:#}  target position in screen coords

            // draw a line from pt1 to pt2
            ctx.strokeStyle = "rgba(0,0,0, .333)";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(pt1.x, pt1.y);
            ctx.lineTo(pt2.x, pt2.y);
            ctx.stroke(); //draw it
          });

          var nodeBoxes = {};
          particleSystem.eachNode(function(node, pt){
            // node: {mass:#, p:{x,y}, name:"", data:{}}
            // pt:   {x:#, y:#}  node position in screen coords

            // determine the box size and round off the coords if we'll be
            // drawing a text label (awful alignment jitter otherwise...)
            var title = node.data.song_title||""
            var artist = node.data.primary_artist||""

            // TODO: add a conditional to limit the width of the bubbles, split text instead
            var w = ctx.measureText(""+title).width + 20
            var l = ctx.measureText(""+artist).width + 20
            if (w > l) {
              if (!(""+title).match(/^[ \t]*$/)){
                pt.x = Math.floor(pt.x)
                pt.y = Math.floor(pt.y)
              } else {
                title = null
              }
            } else {
              if (!(""+artist).match(/^[ \t]*$/)){
                pt.x = Math.floor(pt.x)
                pt.y = Math.floor(pt.y)
              } else {
                artist = null
              }
            }

            // draw a rectangle centered at pt
            // console.log(node.data.color);
            // if (node.data.color) ctx.fillStyle = node.data.color
            // else ctx.fillStyle = "rgba(0,0,0,.2)"
            // if (node.data.color=='none') ctx.fillStyle = "white"
            //
            ctx.fillStyle = (node.data.sample_type) ? "red" : "black";

            // ctx.fillRect(pt.x-w/2, pt.y-w/2, w,w);
            // if (node.data.label=='dot'){
            // if (node.data.label=='dot'){
            if (node.data.color) {
              gfx.oval(pt.x-w/2, pt.y-w/2, w,w, {fill:node.data.color})
            } else if (node.data.sample_type == "parent" || node.data.sample_type == "cover"){
              gfx.oval(pt.x-w/2, pt.y-w/2, w,w, {fill:"orange"})
            } else if (node.data.sample_type == "child") {
              gfx.oval(pt.x-w/2, pt.y-w/2, w,w, {fill:"purple"})
            } else {
              gfx.oval(pt.x-w/2, pt.y-w/2, w,w, {fill:"pink"})
            }
            // if (node.data.label=='dot'){
            // ctx.fillStyle = "white"
            // ctx.fillText(node.data.song_title||"", pt.x, pt.y+4)
            // nodeBoxes[node.name] = [pt.x-w/2, pt.y-w/2, w,w]
            // }else{
            // gfx.rect(pt.x-w/2, pt.y-10, w,20, 4, {fill:ctx.fillStyle})
            // nodeBoxes[node.name] = [pt.x-w/2, pt.y-11, w, 22]
            // }

            // if (node.data.shape=='dot'){
            // gfx.oval(pt.x-w/2, pt.y-w/2, w,w, {fill:ctx.fillStyle})
            // nodeBoxes[node.name] = [pt.x-w/2, pt.y-w/2, w,w]
            // }else{
            // gfx.rect(pt.x-w/2, pt.y-10, w,20, 4, {fill:ctx.fillStyle})
            // nodeBoxes[node.name] = [pt.x-w/2, pt.y-11, w, 22]
            // }

            // draw the text
            if (node.data.song_title){
            ctx.font = "15px Titillium Web"
            ctx.textAlign = "center"
            ctx.fillStyle = "white"
            if (node.data.color=='none') ctx.fillStyle = '#333333'
            ctx.fillText(node.data.song_title||"", pt.x, pt.y-16)
            ctx.fillText("by", pt.x, pt.y)
            ctx.fillText(node.data.primary_artist||"", pt.x, pt.y+16)
            }
          });
        },

        initMouseHandling:function(){
          // no-nonsense drag and drop (thanks springy.js)
          var dragged = null;

          // set up a handler object that will initially listen for mousedowns then
          // for moves and mouseups while dragging
          var handler = {
            clicked: function(e){
              var pos = $(canvas).offset();
              var _mouseP = arbor.Point(e.pageX-pos.left, e.pageY-pos.top);
              dragged = particleSystem.nearest(_mouseP);

              if (dragged && dragged.node !== null){
                // while we're dragging, don't let physics move the node
                dragged.node.fixed = true;
              }

              $(canvas).bind('mousemove', handler.dragged);
              $(window).bind('mouseup', handler.dropped);

              return false;
            },
            dragged:function(e){
              var pos = $(canvas).offset();
              var s = arbor.Point(e.pageX-pos.left, e.pageY-pos.top);

              if (dragged && dragged.node !== null){
                var p = particleSystem.fromScreen(s);
                dragged.node.p = p;
              }

              return false;
            },

            dropped:function(e){
              if (dragged===null || dragged.node===undefined) return
              if (dragged.node !== null) dragged.node.fixed = false
              dragged.node.tempMass = 1000;
              dragged = null;
              $(canvas).unbind('mousemove', handler.dragged);
              $(window).unbind('mouseup', handler.dropped);
              var _mouseP = null;
              return false;
            }
          };

          // start listening
          $(canvas).mousedown(handler.clicked);

        }

        // initMouseOver: function(e) {
        //   console.log("I hovered over this node");
        //
        //   var hover = null;
        //
        //   var handler = {
        //     mouseover:function(e){
        //       var pos = $(canvas).offset();
        //       var _mouseP = arbor.Point(e.pageX-pos.left, e.pageY-pos.top);
        //       hover = particleSystem.nearest(_mouseP);
        //
        //       if (hover && hover.node !== null){
        //         dragged.node.fixed = true;
        //         console.log("I hovered over this node");
        //       }
        //     }
        //
        //   }
        //   // start listening
        //   $(canvas).mouseover(handler.mouseover);
        // }
      };
      return that;
    },

  didInsertElement() {
    // var kanye_song = this.getSong();
    // console.log(song);
    // console.log(song.song_title);
    // console.log(kanye_song.get('primary_artist'));



    var sys = arbor.ParticleSystem(1000, 600, 0.5); // create the system with sensible repulsion/stiffness/friction
    sys.parameters({gravity:true}); // use center-gravity to make the graph settle nicely
    sys.renderer = this.Renderer("#viewport"); // our newly created renderer will have its .init() method called shortly by sys...

    // add some nodes to the graph and watch it go...
    // var data = {
    //   "nodes": {
    //     "song": {mass:.5, fixed:true, x:500, y:100, song_title: "Thinkin Bout You", primary_artist: "Frank Ocean", samples: 5, 'shape': "dot"},
    //     "sample1": {mass:1.5, song_title: "What You Want", primary_artist: "Logic", sample_type: false, 'shape': "dot"},
    //     "sample2": {mass:1.5, song_title: "Drive By", primary_artist: "Eric Bellinger", sample_type: false, 'shape': "dot"},
    //     "sample3": {mass:1, song_title: "Thinking About Forever", primary_artist: "Bridget Kelly", sample_type: true}
    //
    //   },
    //   "edges": {
    //     "song": {"sample1":{}, "sample2":{}, "sample3":{}}
    //   }
    // };

    //call a function that returns a data hash object of nodes and edges
    //then call sys.graft(whatever the previous function returns)
    var data = this.createNodeData();
    console.log(data);
    sys.graft(data);

  }
});
