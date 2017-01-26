import Ember from 'ember';

export default Ember.Component.extend({
  store: Ember.inject.service(),

  createNodeData: function() {
    //what if each sample's samples were created as nodes here and hidden?
    var current_song = this.get('current_song');
    console.log("this is the current song model" + current_song);
    var current_id = current_song.get('song');
    var current_song_title = current_song.get('song_title');
    var current_primary_artist = current_song.get('primary_artist');

    var current_samples = current_song.get('samples');

    //create SS nodes...
    // come back to this if you have time!
    // var sample = current_samples.objectAt(0);
    // var id = sample.get('genius_id');
    // var ss = this.get('store').findRecord('song', id).then(function() { console.log(ss.get('song_title')); });
    // console.log("What?"+ss);


    var nodes = {};
    nodes[current_song_title] = { id: current_id, song_title: current_song_title, primary_artist: current_primary_artist, color: 'gray', shape: 'dot', font_size: "bold 14px Titillium Web" }; //add genius_id for additional calls

    var edges = {};
    edges[current_song_title] = {};

    var numSamples = current_samples.get('length');

    for(var i=0; i<numSamples; i++) {
      var sample = current_samples.objectAt(i);
      var sample_title = sample.get('song_title');
      var primary_artist = sample.get('primary_artist');
      var id = sample.get('genius_id');
      var sample_type = sample.get('sample_type');

      nodes[sample_title] = { id: id, song_title: sample_title, primary_artist: primary_artist, sample_type: sample_type, link: 'songs/' + id }; //add genius_id for additional calls
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
        ctx.fillStyle = "#0d0411";
        ctx.fillRect(0,0, canvas.width, canvas.height);

        particleSystem.eachEdge(function(edge, pt1, pt2){
          // edge: {source:Node, target:Node, length:#, data:{}}
          // pt1:  {x:#, y:#}  source position in screen coords
          // pt2:  {x:#, y:#}  target position in screen coords

          // draw a line from pt1 to pt2
          ctx.strokeStyle = "rgba(187, 184, 184, 1)";
          ctx.lineWidth = 1.25;
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
          var title_length = ctx.measureText(""+title).width + 20
          var artist_length = ctx.measureText(""+artist).width + 20
          var length = null;
          if (title_length > artist_length) {
            // if (!(""+title).match(/^[ \t]*$/)){
              pt.x = Math.floor(pt.x)
              pt.y = Math.floor(pt.y)
              length = title_length;
            // } else {
            //   title = null
            // }
          } else {
            // if (!(""+artist).match(/^[ \t]*$/)){
              pt.x = Math.floor(pt.x)
              pt.y = Math.floor(pt.y)
              length = artist_length;
            // } else {
            //   artist = null
            // }
          }

          if (length <= 60) {
            length = length + 20;
          }

          // draw a circle centered at pt
          if (node.data.color) {
            gfx.oval(pt.x-length/2, pt.y-length/2, length,length, {fill:node.data.color})
          } else if (node.data.sample_type == "parent" || node.data.sample_type == "cover"){
            gfx.oval(pt.x-length/2, pt.y-length/2, length,length, {fill:"#af4a01"})
          } else if (node.data.sample_type == "child") {
            gfx.oval(pt.x-length/2, pt.y-length/2, length,length, {fill:"#592494"})
            // gfx.oval(pt.x-length/2, pt.y-length/2, length,length, {fill:""})

          } else {
            gfx.oval(pt.x-length/2, pt.y-length/2, length,length, {fill:"pink"})
          }

          // draw the text
          if (node.data.song_title){
            if (node.data.font_size) {
              ctx.font = "bold 14px Titillium Web"
              ctx.textAlign = "center"
              ctx.fillStyle = "black"
            } else {
              ctx.font = "bold 14px Titillium Web"
              ctx.textAlign = "center"
              ctx.fillStyle = "white"
            }
            // if (node.data.color=='none') ctx.fillStyle = '#333333'
            ctx.fillText(node.data.song_title||"", pt.x, pt.y-15)
            ctx.fillText("by", pt.x, pt.y)
            ctx.fillText(node.data.primary_artist||"", pt.x, pt.y+16)
            // ctx.fillText(node.data.sample_type + " sample", pt.x, pt.y+25)
          }
        });
      },

      initMouseHandling:function(){
        // no-nonsense drag and drop (thanks springy.js)
        var dragged = null;
        var nearest = null;
        var _mouseP = null;
        var selected = null;
        var mouse_is_down = false;
        var mouse_is_moving = false;
        // var mouse_is_up = true;

        // set up a handler object that will initially listen for mousedowns then
        // for moves and mouseups while dragging
        var handler = {

          clicked: function(e){
            var pos = $(canvas).offset();
            _mouseP = arbor.Point(e.pageX - pos.left, e.pageY - pos.top)
            dragged = nearest = selected = particleSystem.nearest(_mouseP);

            if (nearest && nearest.node !== null && nearest.distance < 50) {
              if (nearest.node.data.link) {
                var link = nearest.node.data.link
                window.location = link
              }
            }
            $(canvas).unbind('mousemove', handler.mousemove);
            $(canvas).bind('mousemove', handler.dragged);
            $(canvas).bind('mouseup', handler.dropped);

            return false;
          },

          mousemove: function(e) {
            if(!mouse_is_down){
              var pos = $(canvas).offset();
              _mouseP = arbor.Point(e.pageX-pos.left, e.pageY-pos.top)
              nearest = particleSystem.nearest(_mouseP);

              if (!nearest.node) return false
              selected = (nearest.distance < 50) ? nearest : null
              if(selected && selected.node.data.link){
                $(canvas).addClass('linkable')
              } else {
                $(canvas).removeClass('linkable')
              }
            }
            return false
          },

          mousedown: function(e){
            var pos = $(canvas).offset();
            var _mouseP = arbor.Point(e.pageX-pos.left, e.pageY-pos.top);
            selected = nearest = dragged = particleSystem.nearest(_mouseP);

            if (dragged.node !== null){
              // while we're dragging, don't let physics move the node
              dragged.node.fixed = true;
            }

            mouse_is_down = true;
            mouse_is_moving = false;

            $(canvas).bind('mousemove', handler.dragged);
            $(canvas).bind('mouseup', handler.dropped);

            return false;
          },

          dragged:function(e){

            var pos = $(canvas).offset();
            var s = arbor.Point(e.pageX-pos.left, e.pageY-pos.top);

            if (!nearest) return
            if (dragged !==null && dragged.node !== null){
              var p = particleSystem.fromScreen(s);
              dragged.node.p = p;
              mouse_is_moving = true;
            }
            return false;
          },

          dropped:function(e){
            if (dragged===null || dragged.node===undefined) return
            if (dragged.node !== null) dragged.node.fixed = false
            dragged.node.tempMass = 1000;
            dragged = null;
            selected = null;
            $(canvas).unbind('mousemove', handler.dragged);
            $(window).unbind('mouseup', handler.dropped);
            $(canvas).bind('mousemove', handler.mousemove);
            _mouseP = null;

            if (mouse_is_moving) {
              console.log("was_dragged")
            } else {
              handler.clicked(e)
            }

            mouse_is_down = false
            return false;
          },
        };

        // start listening
        $(canvas).mousedown(handler.clicked);
        $(canvas).mousemove(handler.mousemove);
        $(canvas).mouseup(handler.dropped);

      }
    };
    return that;
  },

  didInsertElement() {

    var sys = arbor.ParticleSystem(1000, 600, 0.5); // create the system with sensible repulsion/stiffness/friction
    sys.parameters({gravity:true}); // use center-gravity to make the graph settle nicely
    sys.renderer = this.Renderer("#viewport"); // our newly created renderer will have its .init() method called shortly by sys...

    //call a function that returns a data hash object of nodes and edges
    //then call sys.graft(with whatever the previous function returns)
    var data = this.createNodeData();
    sys.graft(data);

  }
});
