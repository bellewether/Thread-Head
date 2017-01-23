import Ember from 'ember';

export default Ember.Component.extend({
  actions: {
    transition: function() {
      this.get('resultsLink')();
    }
  },

  Renderer: function(canvas){
    canvas = $(canvas).get(0);
    var ctx = canvas.getContext("2d");
    var gfx = arbor.Graphics(canvas)
    var particleSystem;

    var that = {
      init: function(system){
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
        // redraw will be called repeatedly during the run whenever the node positions
        // change. the new positions for the nodes can be accessed by looking at the
        // .p attribute of a given node. however the p.x & p.y values are in the coordinates
        // of the particle system rather than the screen. you can either map them to
        // the screen yourself, or use the convenience iterators .eachNode (and .eachEdge)
        // which allow you to step through the actual node objects but also pass an
        // x,y point in the screen's coordinate system
        //
        ctx.fillStyle = "white";
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
          var label = node.data.label||""

          var w = ctx.measureText(""+label).width + 10
          if (!(""+label).match(/^[ \t]*$/)){
            pt.x = Math.floor(pt.x)
            pt.y = Math.floor(pt.y)
          } else {
            label = null
          }


          if (node.data.color) {
            gfx.oval(pt.x-w/2, pt.y-w/2, w,w, {fill:node.data.color})
          } else {
            gfx.oval(pt.x-w/2, pt.y-w/2, w,w, {fill:"grey"})
          }

          // draw the text
          if (node.data.label){
            ctx.font = "13px Titillium Web"
            ctx.textAlign = "center"
            ctx.fillStyle = "white"
            if (node.data.color=='none') ctx.fillStyle = '#333333'
            ctx.fillText(node.data.label||"", pt.x, pt.y+3)
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
            console.log("clicked!");
            console.log(dragged);
            // $(canvas).bind('mousemove', handler.dragged);
            // $(window).bind('mouseup', handler.dropped);

            return false;
          }//,
          // dragged:function(e){
          //   var pos = $(canvas).offset();
          //   var s = arbor.Point(e.pageX-pos.left, e.pageY-pos.top);
          //
          //   if (dragged && dragged.node !== null){
          //     var p = particleSystem.fromScreen(s);
          //     dragged.node.p = p;
          //   }
          //
          //   return false;
          // },
          //
          // dropped:function(e){
          //   if (dragged===null || dragged.node===undefined) return
          //   if (dragged.node !== null) dragged.node.fixed = false
          //   dragged.node.tempMass = 1000;
          //   dragged = null;
          //   $(canvas).unbind('mousemove', handler.dragged);
          //   $(window).unbind('mouseup', handler.dropped);
          //   var _mouseP = null;
          //   return false;
          // }
          // when you get back to this, it should be here inside the handler, adjust
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
        // start listening
        $(canvas).mousedown(handler.clicked);
      }

    };
    return that;
  },

  didInsertElement() {
    var sys = arbor.ParticleSystem(1000, 600, 0.5); // create the system with sensible repulsion/stiffness/friction
    sys.parameters({gravity:true}); // use center-gravity to make the graph settle nicely
    sys.renderer = this.Renderer("#viewport");

    var data = {
      "nodes": {
        "thread-head": { label: "Thread Head", color: "purple" },
        "about": { label: "about" },
        "sign-in": { label: "sign in" },
        "search": { label: "search", link: "https://localhost:4200/results" }
      },
      "edges": {
        "thread-head": { "about": {}, "sign-in": {}, "search": {} }
      }
    };
    sys.graft(data);

  }

});
