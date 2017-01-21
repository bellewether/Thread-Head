import Ember from 'ember';

export default Ember.Component.extend({
  // //
  // //  main.js
  // //
  // //  A project template for using arbor.js
  // Renderer: function(canvas) {
  //   console.log(canvas);
  // },

    Renderer: function(canvas, arbor){
      canvas = $(canvas).get(0);
      var ctx = canvas.getContext("2d");
      var gfx = arbor.Graphics(canvas)
      var particleSystem;

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
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(pt1.x, pt1.y);
            ctx.lineTo(pt2.x, pt2.y);
            ctx.stroke(); //draw it
          });

          // var nodeBoxes = {};
          particleSystem.eachNode(function(node, pt){
            // node: {mass:#, p:{x,y}, name:"", data:{}}
            // pt:   {x:#, y:#}  node position in screen coords

            // draw a rectangle centered at pt
            var w = 10;
            ctx.fillStyle = (node.data.sample_type) ? "orange" : "black";
            ctx.fillRect(pt.x-w/2, pt.y-w/2, w,w);

            if (node.data.shape=='dot'){
            gfx.oval(pt.x-w/2, pt.y-w/2, w,w, {fill:ctx.fillStyle})
            ctx.fillStyle = "white"
            ctx.fillText(node.data.song_title||"", pt.x, pt.y+4)
            // nodeBoxes[node.name] = [pt.x-w/2, pt.y-w/2, w,w]
            }else{
            gfx.rect(pt.x-w/2, pt.y-10, w,20, 4, {fill:ctx.fillStyle})
            // nodeBoxes[node.name] = [pt.x-w/2, pt.y-11, w, 22]
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
    var sys = arbor.ParticleSystem(1000, 600, 0.5); // create the system with sensible repulsion/stiffness/friction
    // arbor.Graphics = Graphics;
    sys.parameters({gravity:true}); // use center-gravity to make the graph settle nicely
    sys.renderer = this.Renderer("#viewport", arbor); // our newly created renderer will have its .init() method called shortly by sys...

    // add some nodes to the graph and watch it go...
    var data = {
      "nodes": {
        "song": {mass:.5, fixed:true, x:500, y:100, song_title: "Thinkin Bout You", primary_artist: "Frank Ocean", samples: 5, shape: "dot"},
        "sample1": {mass:1.5, song_title: "What You Want", primary_artist: "Logic", sample_type: false},
        "sample2": {mass:1.5, song_title: "Drive By", primary_artist: "Eric Bellinger", sample_type: false},
        "sample3": {mass:1, song_title: "Thinking About Forever", primary_artist: "Bridget Kelly", sample_type: true}

      },
      "edges": {
        "song": {"sample1":{}, "sample2":{}, "sample3":{}}
      }
    };
    sys.graft(data);
    // sys.addNode('song', {mass:.5, fixed:true, x:500, y:100, song_title: "Thinkin Bout You", primary_artist: "Frank Ocean", samples: 5, shape: "circle"});
    // sys.addNode('sample1', {mass:1.5, song_title: "What You Want", primary_artist: "Logic", sample_type: false});
    // sys.addNode('sample2', {mass:1.5, song_title: "Drive By", primary_artist: "Eric Bellinger", sample_type: false});
    // sys.addNode('sample3', {mass:1, song_title: "Thinking About Forever", primary_artist: "Bridget Kelly", sample_type: true});
    // sys.addNode('sample4', {mass:1, song_title: "Thinking About You", primary_artist: "Tori Kelly"});
    // sys.addNode('sample5', {mass:1, song_title: "Thinkin bout you", primary_artist: "Daniela Andrade"});
    //
    // sys.addEdge('song', 'sample1', {length: 35});
    // sys.addEdge('song', 'sample2', {length: 35});
    // sys.addEdge('song', 'sample3', {length: 80});
    // sys.addEdge('song', 'sample4', {length: 80});
    // sys.addEdge('song', 'sample5', {length: 80});




    // sys.addEdge('a','b');
    // sys.addEdge('a','c');
    // sys.addEdge('a','d');
    // sys.addEdge('a','e');
    // sys.addNode('f', {alone:true, mass:.25});

  }
});
