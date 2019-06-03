//Original Options
/*L.Map.mergeOptions({
  sleep: true,
  sleepTime: 750,
  wakeTime: 750,
  sleepNote: true,
  hoverToWake: true,
  sleepOpacity:.7
});*/
/*   // false if you want an unruly map
    sleep: true,

    // time(ms) until map sleeps on mouseout
    sleepTime: 750,

    // time(ms) until map wakes on mouseover
    wakeTime: 750,

    // defines whether the user is prompted on how to wake map
    sleepNote: true,

    // should hovering wake the map?
    hoverToWake: true,

    // specify a custom message to notify users how to wake
    wakeMessage: ('Click ' + (hoverToWake?' or Hover ' : '') + 'to Wake'),

    // opacity (between 0 and 1) of inactive map
    sleepOpacity: .7
*/
L.Map.mergeOptions({
    sleep: false,
    sleepTime: 750,
    wakeTime: 750,
    sleepNote: false,
    hoverToWake: true,
    sleepOpacity:1,
  });
  L.Map.Sleep = L.Handler.extend({
    addHooks: function () {
      if (this._map.options.sleepNote == true) {
        this.sleepNote = L.DomUtil.create('p', 'sleep-note', this._map._container);
      };
  
      this._sleepMap();
      this._enterTimeout = null;
      this._exitTimeout = null;
  
  
      var mapStyle = this._map.getContainer().style;
      mapStyle.WebkitTransition += 'opacity .2s';
      mapStyle.MozTransition += 'opacity .2s';
  
      var noteString = this._map.options.wakeMessage ||
        ('Click ' + (this._map.options.hoverToWake?'or Hover ':'') + 'to Enable Map');
      //var style = this.sleepNote.style;
      var style;
      if( this._map.options.sleepNote == true){
        style = this.sleepNote.style;
        this.sleepNote.appendChild(document.createTextNode( noteString ));
        style.maxWidth = '150px';
        style.transitionDuration = '.2s';
        style.zIndex = 5000;
        style.opacity = '0.9';
        style.margin = 'auto';
        style.textAlign = 'center';
        style.borderRadius = '4px';
        style.top = '50%';
        style.position = 'relative';
        style.padding = '5px';
        style.border = 'solid 2px black';
        style.background = 'white';
        style.boxShadow = 0;
      }
    },
  
    removeHooks: function () {
      if (!this._map.scrollWheelZoom.enabled()){
        this._map.scrollWheelZoom.enable();
      }
      L.DomUtil.setOpacity( this._map._container, 1);
      L.DomUtil.setOpacity( this.sleepNote, 0);
      this._removeSleepingListeners();
      this._removeAwakeListeners();
    },
  
    _wakeMap: function () {
      this._stopWaiting();
      this._map.scrollWheelZoom.enable();
      this._map.dragging.enable();
      L.DomUtil.setOpacity( this._map._container, 1);
      if( this._map.options.sleepNote == true){
        this.sleepNote.style.opacity = 0;
      };
      this._addAwakeListeners();
    },
  
    _sleepMap: function () {
      this._stopWaiting();
      this._map.scrollWheelZoom.disable();
      this._map.dragging.disable();
      L.DomUtil.setOpacity( this._map._container, this._map.options.sleepOpacity);
      if (this._map.options.sleepNote == true) {
        this.sleepNote.style.opacity = 0.9;
      };
      this._addSleepingListeners();
    },
  
    _wakePending: function () {
      this._map.once('mousedown', this._wakeMap, this);
      if (this._map.options.hoverToWake){
        var self = this;
        this._map.once('mouseout', this._sleepMap, this);
        self._enterTimeout = setTimeout(function(){
            self._map.off('mouseout', self._sleepMap, self);
            self._wakeMap();
        } , self._map.options.wakeTime);
      }
    },
  
    _sleepPending: function () {
      var self = this;
      self._map.once('mouseover', self._wakeMap, self);
      self._exitTimeout = setTimeout(function(){
          self._map.off('mouseover', self._wakeMap, self);
          self._sleepMap();
      } , self._map.options.sleepTime);
    },
  
    _addSleepingListeners: function(){
      this._map.once('mouseover', this._wakePending, this);
      if (L.Browser.touch) {
        this._map.once('click', this._wakePending, this);
      }
    },
  
    _addAwakeListeners: function(){
      this._map.once('mouseout', this._sleepPending, this);
      if (L.Browser.touch) {
        this._map.once('blur', this._sleepPending, this);
      }
    },
  
    _removeSleepingListeners: function(){
      this._map.options.hoverToWake &&
        this._map.off('mouseover', this._wakePending, this);
      this._map.off('mousedown', this._wakeMap, this);
    },
  
    _removeAwakeListeners: function(){
      this._map.off('mouseout', this._sleepPending, this);
    },
  
    _stopWaiting: function () {
      this._removeSleepingListeners();
      this._removeAwakeListeners();
      var self = this;
      if(this._enterTimeout) clearTimeout(self._enterTimeout);
      if(this._exitTimeout) clearTimeout(self._exitTimeout);
      this._enterTimeout = null;
      this._exitTimeout = null;
    }
  });
  
  L.Map.addInitHook('addHandler', 'sleep', L.Map.Sleep);
  
  
  (function(root, factory) {
    if (typeof define === 'function' && define.amd) {
      define(["leaflet"], factory);
    } else if (typeof exports === 'object') {
      module.exports = factory(require('leaflet'));
    } else {
      root.L.Control.DefaultExtent = factory(root.L);
    }
  }(this, function(L) {
  
  return (function () {
    /* global L */
    'use strict';
    L.Control.DefaultExtent = L.Control.extend({
      options: {
        position: 'topleft',
        text: 'Default Extent',
        title: 'Zoom to default extent',
        className: 'leaflet-control-defaultextent'
      },
      onAdd: function (map) {
        this._map = map;
        return this._initLayout();
      },
      setCenter: function (center) {
        this._center = center;
        return this;
      },
      setZoom: function (zoom) {
        this._zoom = zoom;
        return this;
      },
      _initLayout: function () {
        var container = L.DomUtil.create('div', 'leaflet-bar ' +
          this.options.className);
        this._container = container;
        this._fullExtentButton = this._createExtentButton(container);
  
        L.DomEvent.disableClickPropagation(container);
  
        this._map.whenReady(this._whenReady, this);
  
        return this._container;
      },
      _createExtentButton: function () {
        var link = L.DomUtil.create('a', this.options.className + '-toggle',
          this._container);
        link.href = '#';
        link.innerHTML = this.options.text;
        link.title = this.options.title;
  
        L.DomEvent
          .on(link, 'mousedown dblclick', L.DomEvent.stopPropagation)
          .on(link, 'click', L.DomEvent.stop)
          .on(link, 'click', this._zoomToDefault, this);
        return link;
      },
      _whenReady: function () {
        if (!this._center) {
          this._center = this._map.getCenter();
        }
        if (!this._zoom) {
          this._zoom = this._map.getZoom();
        }
        return this;
      },
      _zoomToDefault: function () {
        this._map.setView(this._center, this._zoom);
      }
    });
  
    L.Map.addInitHook(function () {
      if (this.options.defaultExtentControl) {
        this.addControl(new L.Control.DefaultExtent());
      }
    });
  
    L.control.defaultExtent = function (options) {
      return new L.Control.DefaultExtent(options);
    };
  
    return L.Control.DefaultExtent;
  
  }());
  ;
  
  }));
  
  L.Control.EasyPrint = L.Control.extend({
      options: {
          title: 'Print Map Image',
          position: 'topleft'
      },
  
      onAdd: function () {
          var container = L.DomUtil.create('div', 'leaflet-control-easyPrint leaflet-bar leaflet-control');
  
          this.link = L.DomUtil.create('a', 'leaflet-control-easyPrint-button leaflet-bar-part', container);
          this.link.id = "leafletEasyPrint";
          this.link.title = this.options.title;
  
          L.DomEvent.addListener(this.link, 'click', printPage, this.options);
  
          return container;
      }
  
  });
  
  L.easyPrint = function(options) {
      return new L.Control.EasyPrint(options);
  };
  
  function printPage(){
    alert('Only the map will be exported. Print is in beta. Results may vary.');
      if (this.elementsToHide){
          var htmlElementsToHide = document.querySelectorAll(this.elementsToHide);
  
          for (var i = 0; i < htmlElementsToHide.length; i++) {
              htmlElementsToHide[i].className = htmlElementsToHide[i].className + ' _epHidden';
          }
      }
      window.print();
  
      if (this.elementsToHide){
          var htmlElementsToHide = document.querySelectorAll(this.elementsToHide);
  
          for (var i = 0; i < htmlElementsToHide.length; i++) {
              htmlElementsToHide[i].className = htmlElementsToHide[i].className.replace(' _epHidden','');
          }
      }
  
  
  }
  
  /*  jQuery.print, version 1.0.3
   *  (c) Sathvik Ponangi, Doers' Guild
   * Licence: CC-By (http://creativecommons.org/licenses/by/3.0/)
   *--------------------------------------------------------------------------*/
  
  (function($) {"use strict";
      // A nice closure for our definitions
  
      function getjQueryObject(string) {
          // Make string a vaild jQuery thing
          var jqObj = $("");
          try {
              jqObj = $(string).clone();
          } catch(e) {
              jqObj = $("<span />").html(string);
          }
          return jqObj;
      }
  
      function isNode(o) {
          /* http://stackoverflow.com/a/384380/937891 */
          return !!( typeof Node === "object" ? o instanceof Node : o && typeof o === "object" && typeof o.nodeType === "number" && typeof o.nodeName === "string");
      }
  
  
      $.print = $.fn.print = function() {
          // Print a given set of elements
  
          var options, $this, self = this;
  
          // console.log("Printing", this, arguments);
  
          if ( self instanceof $) {
              // Get the node if it is a jQuery object
              self = self.get(0);
          }
  
          if (isNode(self)) {
              // If `this` is a HTML element, i.e. for
              // $(selector).print()
              $this = $(self);
              if (arguments.length > 0) {
                  options = arguments[0];
              }
          } else {
              if (arguments.length > 0) {
                  // $.print(selector,options)
                  $this = $(arguments[0]);
                  if (isNode($this[0])) {
                      if (arguments.length > 1) {
                          options = arguments[1];
                      }
                  } else {
                      // $.print(options)
                      options = arguments[0];
                      $this = $("html");
                  }
              } else {
                  // $.print()
                  $this = $("html");
              }
          }
  
          // Default options
          var defaults = {
              globalStyles : true,
              mediaPrint : false,
              stylesheet : null,
              noPrintSelector : ".no-print",
              iframe : true,
              append : null,
              prepend : null
          };
          // Merge with user-options
          options = $.extend({}, defaults, (options || {}));
  
          var $styles = $("");
          if (options.globalStyles) {
              // Apply the stlyes from the current sheet to the printed page
              $styles = $("style, link, meta, title");
          } else if (options.mediaPrint) {
              // Apply the media-print stylesheet
              $styles = $("link[media=print]");
          }
          if (options.stylesheet) {
              // Add a custom stylesheet if given
              $styles = $.merge($styles, $('<link rel="stylesheet" href="' + options.stylesheet + '">'));
          }
  
          // Create a copy of the element to print
          var copy = $this.clone();
          // Wrap it in a span to get the HTML markup string
          copy = $("<span/>").append(copy);
          // Remove unwanted elements
          copy.find(options.noPrintSelector).remove();
          // Add in the styles
          copy.append($styles.clone());
          // Appedned content
          copy.append(getjQueryObject(options.append));
          // Prepended content
          copy.prepend(getjQueryObject(options.prepend));
          // Get the HTML markup string
          var content = copy.html();
          // Destroy the copy
          copy.remove();
  
          var w, wdoc;
          if (options.iframe) {
              // Use an iframe for printing
              try {
                  var $iframe = $(options.iframe + "");
                  var iframeCount = $iframe.length;
                  if (iframeCount === 0) {
                      // Create a new iFrame if none is given
                      $iframe = $('<iframe height="0" width="0" border="0" wmode="Opaque"/>').prependTo('body').css({
                          "position" : "absolute",
                          "top" : -999,
                          "left" : -999
                      });
                  }
                  w = $iframe.get(0);
                  w = w.contentWindow || w.contentDocument || w;
                  wdoc = w.document || w.contentDocument || w;
                  wdoc.open();
                  wdoc.write(content);
                  wdoc.close();
                  setTimeout(function() {
                      // Fix for IE : Allow it to render the iframe
                      w.focus();
                      w.print();
                      setTimeout(function() {
                          // Fix for IE
                          if (iframeCount === 0) {
                              // Destroy the iframe if created here
                              $iframe.remove();
                          }
                      }, 100);
                  }, 250);
              } catch (e) {
                  // Use the pop-up method if iframe fails for some reason
                  console.error("Failed to print from iframe", e.stack, e.message);
                  w = window.open();
                  w.document.write(content);
                  w.document.close();
                  w.focus();
                  w.print();
                  w.close();
              }
          } else {
              // Use a new window for printing
              w = window.open();
              w.document.write(content);
              w.document.close();
              w.focus();
              w.print();
              w.close();
          }
          return this;
      };
  
  })(jQuery);
  
  /*! Version: 0.49.0
  Copyright (c) 2016 Dominik Moritz */
  
  !function(a,b){"function"==typeof define&&define.amd?define(["leaflet"],a):"object"==typeof exports&&("undefined"!=typeof b&&b.L?module.exports=a(L):module.exports=a(require("leaflet"))),"undefined"!=typeof b&&b.L&&(b.L.Locate=a(L))}(function(a){return a.Control.Locate=a.Control.extend({options:{position:"topleft",layer:void 0,drawCircle:!0,follow:!1,stopFollowingOnDrag:!1,remainActive:!1,markerClass:a.circleMarker,circleStyle:{color:"#136AEC",fillColor:"#136AEC",fillOpacity:.15,weight:2,opacity:.5},markerStyle:{color:"#136AEC",fillColor:"#2A93EE",fillOpacity:.7,weight:2,opacity:.9,radius:5},followCircleStyle:{},followMarkerStyle:{},icon:"fa fa-map-marker",iconLoading:"fa fa-spinner fa-spin",iconElementTag:"span",circlePadding:[0,0],metric:!0,onLocationError:function(a){alert(a.message)},onLocationOutsideMapBounds:function(a){a.stop(),alert(a.options.strings.outsideMapBoundsMsg)},setView:!0,keepCurrentZoomLevel:!1,showPopup:!0,strings:{title:"Show me where I am",metersUnit:"meters",feetUnit:"feet",popup:"You are within {distance} {unit} from this point",outsideMapBoundsMsg:"You seem located outside the boundaries of the map"},locateOptions:{maxZoom:1/0,watch:!0}},initialize:function(b){a.Map.addInitHook(function(){this.options.locateControl&&this.addControl(this)});for(var c in b)"object"==typeof this.options[c]?a.extend(this.options[c],b[c]):this.options[c]=b[c];a.extend(this.options.locateOptions,{setView:!1})},_activate:function(){this.options.setView&&(this._locateOnNextLocationFound=!0),this._active||this._map.locate(this.options.locateOptions),this._active=!0,this.options.follow&&this._startFollowing(this._map)},_deactivate:function(){this._map.stopLocate(),this._map.off("dragstart",this._stopFollowing,this),this.options.follow&&this._following&&this._stopFollowing(this._map)},drawMarker:function(b){void 0===this._event.accuracy&&(this._event.accuracy=0);var c=this._event.accuracy;this._locateOnNextLocationFound&&(this._isOutsideMapBounds()?this.options.onLocationOutsideMapBounds(this):this.options.keepCurrentZoomLevel?b.panTo([this._event.latitude,this._event.longitude]):b.fitBounds(this._event.bounds,{padding:this.options.circlePadding,maxZoom:this.options.keepCurrentZoomLevel?b.getZoom():this.options.locateOptions.maxZoom}),this._locateOnNextLocationFound=!1);var d,e;if(this.options.drawCircle)if(d=this._following?this.options.followCircleStyle:this.options.circleStyle,this._circle){this._circle.setLatLng(this._event.latlng).setRadius(c);for(e in d)this._circle.options[e]=d[e]}else this._circle=a.circle(this._event.latlng,c,d).addTo(this._layer);var f,g;this.options.metric?(f=c.toFixed(0),g=this.options.strings.metersUnit):(f=(3.2808399*c).toFixed(0),g=this.options.strings.feetUnit);var h;h=this._following?this.options.followMarkerStyle:this.options.markerStyle,this._marker?this.updateMarker(this._event.latlng,h):this._marker=this.createMarker(this._event.latlng,h).addTo(this._layer);var i=this.options.strings.popup;this.options.showPopup&&i&&this._marker.bindPopup(a.Util.template(i,{distance:f,unit:g}))._popup.setLatLng(this._event.latlng),this._toggleContainerStyle()},createMarker:function(a,b){return this.options.markerClass(a,b)},updateMarker:function(a,b){this._marker.setLatLng(a);for(var c in b)this._marker.options[c]=b[c]},removeMarker:function(){this._layer.clearLayers(),this._marker=void 0,this._circle=void 0},onAdd:function(b){var c=a.DomUtil.create("div","leaflet-control-locate leaflet-bar leaflet-control");this._layer=this.options.layer||new a.LayerGroup,this._layer.addTo(b),this._event=void 0;var d={};return a.extend(d,this.options.markerStyle,this.options.followMarkerStyle),this.options.followMarkerStyle=d,d={},a.extend(d,this.options.circleStyle,this.options.followCircleStyle),this.options.followCircleStyle=d,this._link=a.DomUtil.create("a","leaflet-bar-part leaflet-bar-part-single",c),this._link.href="#",this._link.title=this.options.strings.title,this._icon=a.DomUtil.create(this.options.iconElementTag,this.options.icon,this._link),a.DomEvent.on(this._link,"click",a.DomEvent.stopPropagation).on(this._link,"click",a.DomEvent.preventDefault).on(this._link,"click",function(){var a=void 0===this._event||this._map.getBounds().contains(this._event.latlng)||!this.options.setView||this._isOutsideMapBounds();!this.options.remainActive&&this._active&&a?this.stop():this.start()},this).on(this._link,"dblclick",a.DomEvent.stopPropagation),this._resetVariables(),this.bindEvents(b),c},bindEvents:function(a){a.on("locationfound",this._onLocationFound,this),a.on("locationerror",this._onLocationError,this),a.on("unload",this.stop,this)},start:function(){this._activate(),this._event?this.drawMarker(this._map):this._setClasses("requesting")},stop:function(){this._deactivate(),this._cleanClasses(),this._resetVariables(),this.removeMarker()},_onLocationError:function(a){3==a.code&&this.options.locateOptions.watch||(this.stop(),this.options.onLocationError(a))},_onLocationFound:function(a){this._event&&this._event.latlng.lat===a.latlng.lat&&this._event.latlng.lng===a.latlng.lng&&this._event.accuracy===a.accuracy||this._active&&(this._event=a,this.options.follow&&this._following&&(this._locateOnNextLocationFound=!0),this.drawMarker(this._map))},_startFollowing:function(){this._map.fire("startfollowing",this),this._following=!0,this.options.stopFollowingOnDrag&&this._map.on("dragstart",this._stopFollowing,this)},_stopFollowing:function(){this._map.fire("stopfollowing",this),this._following=!1,this.options.stopFollowingOnDrag&&this._map.off("dragstart",this._stopFollowing,this),this._toggleContainerStyle()},_isOutsideMapBounds:function(){return void 0===this._event?!1:this._map.options.maxBounds&&!this._map.options.maxBounds.contains(this._event.latlng)},_toggleContainerStyle:function(){this._container&&(this._following?this._setClasses("following"):this._setClasses("active"))},_setClasses:function(b){"requesting"==b?(a.DomUtil.removeClasses(this._container,"active following"),a.DomUtil.addClasses(this._container,"requesting"),a.DomUtil.removeClasses(this._icon,this.options.icon),a.DomUtil.addClasses(this._icon,this.options.iconLoading)):"active"==b?(a.DomUtil.removeClasses(this._container,"requesting following"),a.DomUtil.addClasses(this._container,"active"),a.DomUtil.removeClasses(this._icon,this.options.iconLoading),a.DomUtil.addClasses(this._icon,this.options.icon)):"following"==b&&(a.DomUtil.removeClasses(this._container,"requesting"),a.DomUtil.addClasses(this._container,"active following"),a.DomUtil.removeClasses(this._icon,this.options.iconLoading),a.DomUtil.addClasses(this._icon,this.options.icon))},_cleanClasses:function(){a.DomUtil.removeClass(this._container,"requesting"),a.DomUtil.removeClass(this._container,"active"),a.DomUtil.removeClass(this._container,"following"),a.DomUtil.removeClasses(this._icon,this.options.iconLoading),a.DomUtil.addClasses(this._icon,this.options.icon)},_resetVariables:function(){this._active=!1,this._locateOnNextLocationFound=this.options.setView,this._following=!1}}),a.control.locate=function(b){return new a.Control.Locate(b)},function(){var b=function(b,c,d){d=d.split(" "),d.forEach(function(d){a.DomUtil[b].call(this,c,d)})};a.DomUtil.addClasses=function(a,c){b("addClass",a,c)},a.DomUtil.removeClasses=function(a,c){b("removeClass",a,c)}}(),a.Control.Locate},window);
  //# sourceMappingURL=L.Control.Locate.min.js.map
  /*
    Leaflet.AwesomeMarkers, a plugin that adds colorful iconic markers for Leaflet, based on the Font Awesome icons
    (c) 2012-2013, Lennard Voogdt
  
    http://leafletjs.com
    https://github.com/lvoogdt
  *//*global L*/(function(e,t,n){"use strict";L.AwesomeMarkers={};L.AwesomeMarkers.version="2.0.1";L.AwesomeMarkers.Icon=L.Icon.extend({options:{iconSize:[35,45],iconAnchor:[17,42],popupAnchor:[1,-32],shadowAnchor:[10,12],shadowSize:[36,16],className:"awesome-marker",prefix:"glyphicon",spinClass:"fa-spin",icon:"home",markerColor:"blue",iconColor:"white"},initialize:function(e){e=L.Util.setOptions(this,e)},createIcon:function(){var e=t.createElement("div"),n=this.options;n.icon&&(e.innerHTML=this._createInner());n.bgPos&&(e.style.backgroundPosition=-n.bgPos.x+"px "+ -n.bgPos.y+"px");this._setIconStyles(e,"icon-"+n.markerColor);return e},_createInner:function(){var e,t="",n="",r="",i=this.options;i.icon.slice(0,i.prefix.length+1)===i.prefix+"-"?e=i.icon:e=i.prefix+"-"+i.icon;i.spin&&typeof i.spinClass=="string"&&(t=i.spinClass);i.iconColor&&(i.iconColor==="white"||i.iconColor==="black"?n="icon-"+i.iconColor:r="style='color: "+i.iconColor+"' ");return"<i "+r+"class='"+i.prefix+" "+e+" "+t+" "+n+"'></i>"},_setIconStyles:function(e,t){var n=this.options,r=L.point(n[t==="shadow"?"shadowSize":"iconSize"]),i;t==="shadow"?i=L.point(n.shadowAnchor||n.iconAnchor):i=L.point(n.iconAnchor);!i&&r&&(i=r.divideBy(2,!0));e.className="awesome-marker-"+t+" "+n.className;if(i){e.style.marginLeft=-i.x+"px";e.style.marginTop=-i.y+"px"}if(r){e.style.width=r.x+"px";e.style.height=r.y+"px"}},createShadow:function(){var e=t.createElement("div");this._setIconStyles(e,"shadow");return e}});L.AwesomeMarkers.icon=function(e){return new L.AwesomeMarkers.Icon(e)}})(this,document);
  
  !function(a){var b=function(){var b=a.documentMode;return"onhashchange"in a&&(void 0===b||b>7)}();L.Hash=function(a){this.onHashChange=L.Util.bind(this.onHashChange,this),a&&this.init(a)},L.Hash.parseHash=function(a){0===a.indexOf("#")&&(a=a.substr(1));var b=a.split("/");if(3==b.length){var c=parseInt(b[0],10),d=parseFloat(b[1]),e=parseFloat(b[2]);return!(isNaN(c)||isNaN(d)||isNaN(e))&&{center:new L.LatLng(d,e),zoom:c}}return!1},L.Hash.formatHash=function(a){var b=a.getCenter(),c=a.getZoom(),d=Math.max(0,Math.ceil(Math.log(c)/Math.LN2));return"#"+[c,b.lat.toFixed(d),b.lng.toFixed(d)].join("/")},L.Hash.prototype={map:null,lastHash:null,parseHash:L.Hash.parseHash,formatHash:L.Hash.formatHash,init:function(a){this.map=a,this.lastHash=null,this.onHashChange(),this.isListening||this.startListening()},removeFrom:function(a){this.changeTimeout&&clearTimeout(this.changeTimeout),this.isListening&&this.stopListening(),this.map=null},onMapMove:function(){if(this.movingMap||!this.map._loaded)return!1;var a=this.formatHash(this.map);this.lastHash!=a&&(location.replace(a),this.lastHash=a)},movingMap:!1,update:function(){var a=location.hash;if(a!==this.lastHash){var b=this.parseHash(a);b?(this.movingMap=!0,this.map.setView(b.center,b.zoom),this.movingMap=!1):this.onMapMove(this.map)}},changeDefer:100,changeTimeout:null,onHashChange:function(){if(!this.changeTimeout){var a=this;this.changeTimeout=setTimeout(function(){a.update(),a.changeTimeout=null},this.changeDefer)}},isListening:!1,hashChangeInterval:null,startListening:function(){this.map.on("moveend",this.onMapMove,this),b?L.DomEvent.addListener(a,"hashchange",this.onHashChange):(clearInterval(this.hashChangeInterval),this.hashChangeInterval=setInterval(this.onHashChange,50)),this.isListening=!0},stopListening:function(){this.map.off("moveend",this.onMapMove,this),b?L.DomEvent.removeListener(a,"hashchange",this.onHashChange):clearInterval(this.hashChangeInterval),this.isListening=!1}},L.hash=function(a){return new L.Hash(a)},L.Map.prototype.addHash=function(){this._hash=L.hash(this)},L.Map.prototype.removeHash=function(){this._hash.removeFrom()}}(window);
  !function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var n;"undefined"!=typeof window?n=window:"undefined"!=typeof global?n=global:"undefined"!=typeof self&&(n=self),n.omnivore=e()}}(function(){var e;return function r(e,n,t){function o(u,a){if(!n[u]){if(!e[u]){var s="function"==typeof require&&require;if(!a&&s)return s(u,!0);if(i)return i(u,!0);var f=new Error("Cannot find module '"+u+"'");throw f.code="MODULE_NOT_FOUND",f}var c=n[u]={exports:{}};e[u][0].call(c.exports,function(n){var r=e[u][1][n];return o(r?r:n)},c,c.exports,r,e,n,t)}return n[u].exports}for(var i="function"==typeof require&&require,u=0;u<t.length;u++)o(t[u]);return o}({1:[function(e,n){function r(e,n){"addData"in e&&e.addData(n),"setGeoJSON"in e&&e.setGeoJSON(n)}function t(e,n,t){var o=t||L.geoJson();return m(e,function(e,n){return e?o.fire("error",{error:e}):(r(o,JSON.parse(n.responseText)),void o.fire("ready"))}),o}function o(e,n,r){function t(e,r){return e?o.fire("error",{error:e}):(c(r.responseText,n,o),void o.fire("ready"))}var o=r||L.geoJson();return m(e,t),o}function i(e,n,r){function t(e,r){function t(){i=!0}var i;return e?o.fire("error",{error:e}):(o.on("error",t),l(r.responseText,n,o),o.off("error",t),void(i||o.fire("ready")))}var o=r||L.geoJson();return m(e,t),o}function u(e,n,r){function t(e,r){function t(){i=!0}var i;return e?o.fire("error",{error:e}):(o.on("error",t),p(r.responseXML||r.responseText,n,o),o.off("error",t),void(i||o.fire("ready")))}var o=r||L.geoJson();return m(e,t),o}function a(e,n,r){function t(e,r){function t(){i=!0}var i;return e?o.fire("error",{error:e}):(o.on("error",t),d(r.responseXML||r.responseText,n,o),o.off("error",t),void(i||o.fire("ready")))}var o=r||L.geoJson();return m(e,t),o}function s(e,n,r){function t(e,r){return e?o.fire("error",{error:e}):(h(r.responseText,n,o),void o.fire("ready"))}var o=r||L.geoJson();return m(e,t),o}function f(e,n,r){function t(e,r){return e?o.fire("error",{error:e}):(g(r.responseText,n,o),void o.fire("ready"))}var o=r||L.geoJson();return m(e,t),o}function c(e,n,t){var o="string"==typeof e?JSON.parse(e):e;t=t||L.geoJson();for(var i in o.objects){var u=E.feature(o,o.objects[i]);u.features?r(t,u.features):r(t,u)}return t}function l(e,n,t){function o(e,n){return e?t.fire("error",{error:e}):void r(t,n)}return t=t||L.geoJson(),n=n||{},y.csv2geojson(e,n,o),t}function p(e,n,t){var o=v(e);if(!o)return t.fire("error",{error:"Could not parse GPX"});t=t||L.geoJson();var i=S.gpx(o);return r(t,i),t}function d(e,n,t){var o=v(e);if(!o)return t.fire("error",{error:"Could not parse KML"});t=t||L.geoJson();var i=S.kml(o);return r(t,i),t}function g(e,n,t){t=t||L.geoJson(),n=n||{};for(var o=x.decode(e,n.precision),i={type:"LineString",coordinates:[]},u=0;u<o.length;u++)i.coordinates[u]=[o[u][1],o[u][0]];return r(t,i),t}function h(e,n,t){t=t||L.geoJson();var o=w(e);return r(t,o),t}function v(e){return"string"==typeof e?(new DOMParser).parseFromString(e,"text/xml"):e}var m=e("corslite"),y=e("csv2geojson"),w=e("wellknown"),x=e("polyline"),E=e("topojson/topojson.js"),S=e("togeojson");n.exports.polyline=f,n.exports.polyline.parse=g,n.exports.geojson=t,n.exports.topojson=o,n.exports.topojson.parse=c,n.exports.csv=i,n.exports.csv.parse=l,n.exports.gpx=u,n.exports.gpx.parse=p,n.exports.kml=a,n.exports.kml.parse=d,n.exports.wkt=s,n.exports.wkt.parse=h},{corslite:5,csv2geojson:6,polyline:9,togeojson:10,"topojson/topojson.js":11,wellknown:12}],2:[function(){},{}],3:[function(e,n){n.exports=e(2)},{"/Users/tmcw/src/leaflet-omnivore/node_modules/browserify/lib/_empty.js":2}],4:[function(e,n){function r(){}var t=n.exports={};t.nextTick=function(){var e="undefined"!=typeof window&&window.setImmediate,n="undefined"!=typeof window&&window.MutationObserver,r="undefined"!=typeof window&&window.postMessage&&window.addEventListener;if(e)return function(e){return window.setImmediate(e)};var t=[];if(n){var o=document.createElement("div"),i=new MutationObserver(function(){var e=t.slice();t.length=0,e.forEach(function(e){e()})});return i.observe(o,{attributes:!0}),function(e){t.length||o.setAttribute("yes","no"),t.push(e)}}return r?(window.addEventListener("message",function(e){var n=e.source;if((n===window||null===n)&&"process-tick"===e.data&&(e.stopPropagation(),t.length>0)){var r=t.shift();r()}},!0),function(e){t.push(e),window.postMessage("process-tick","*")}):function(e){setTimeout(e,0)}}(),t.title="browser",t.browser=!0,t.env={},t.argv=[],t.on=r,t.addListener=r,t.once=r,t.off=r,t.removeListener=r,t.removeAllListeners=r,t.emit=r,t.binding=function(){throw new Error("process.binding is not supported")},t.cwd=function(){return"/"},t.chdir=function(){throw new Error("process.chdir is not supported")}},{}],5:[function(e,n){function r(e,n,r){function t(e){return e>=200&&300>e||304===e}function o(){void 0===a.status||t(a.status)?n.call(a,null,a):n.call(a,a,null)}var i=!1;if("undefined"==typeof window.XMLHttpRequest)return n(Error("Browser not supported"));if("undefined"==typeof r){var u=e.match(/^\s*https?:\/\/[^\/]*/);r=u&&u[0]!==location.protocol+"//"+location.domain+(location.port?":"+location.port:"")}var a=new window.XMLHttpRequest;if(r&&!("withCredentials"in a)){a=new window.XDomainRequest;var s=n;n=function(){if(i)s.apply(this,arguments);else{var e=this,n=arguments;setTimeout(function(){s.apply(e,n)},0)}}}return"onload"in a?a.onload=o:a.onreadystatechange=function(){4===a.readyState&&o()},a.onerror=function(e){n.call(this,e||!0,null),n=function(){}},a.onprogress=function(){},a.ontimeout=function(e){n.call(this,e,null),n=function(){}},a.onabort=function(e){n.call(this,e,null),n=function(){}},a.open("GET",e,!0),a.send(null),i=!0,a}"undefined"!=typeof n&&(n.exports=r)},{}],6:[function(e,n){function r(e){return!!e.match(/(Lat)(itude)?/gi)}function t(e){return!!e.match(/(L)(on|ng)(gitude)?/i)}function o(e){return"object"==typeof e?Object.keys(e).length:0}function i(e){var n=[",",";","	","|"],r=[];return n.forEach(function(n){var t=c(n).parse(e);if(t.length>=1){for(var i=o(t[0]),u=0;u<t.length;u++)if(o(t[u])!==i)return;r.push({delimiter:n,arity:Object.keys(t[0]).length})}}),r.length?r.sort(function(e,n){return n.arity-e.arity})[0].delimiter:null}function u(e){var n=i(e);return n?c(n).parse(e):null}function a(e,n,o){o||(o=n,n={}),n.delimiter=n.delimiter||",";var u=n.latfield||"",a=n.lonfield||"",s=[],f={type:"FeatureCollection",features:s};if("auto"===n.delimiter&&"string"==typeof e&&(n.delimiter=i(e),!n.delimiter))return o({type:"Error",message:"Could not autodetect delimiter"});var p="string"==typeof e?c(n.delimiter).parse(e):e;if(!p.length)return o(null,f);if(!u||!a){for(var d in p[0])!u&&r(d)&&(u=d),!a&&t(d)&&(a=d);if(!u||!a){var g=[];for(var h in p[0])g.push(h);return o({type:"Error",message:"Latitude and longitude fields not present",data:p,fields:g})}}for(var v=[],m=0;m<p.length;m++)if(void 0!==p[m][a]&&void 0!==p[m][a]){var y,w,x,L=p[m][a],E=p[m][u];x=l(L,"EW"),x&&(L=x),x=l(E,"NS"),x&&(E=x),y=parseFloat(L),w=parseFloat(E),isNaN(y)||isNaN(w)?v.push({message:"A row contained an invalid value for latitude or longitude",row:p[m]}):(n.includeLatLon||(delete p[m][a],delete p[m][u]),s.push({type:"Feature",properties:p[m],geometry:{type:"Point",coordinates:[parseFloat(y),parseFloat(w)]}}))}o(v.length?v:null,f)}function s(e){for(var n=e.features,r={type:"Feature",geometry:{type:"LineString",coordinates:[]}},t=0;t<n.length;t++)r.geometry.coordinates.push(n[t].geometry.coordinates);return r.properties=n[0].properties,{type:"FeatureCollection",features:[r]}}function f(e){for(var n=e.features,r={type:"Feature",geometry:{type:"Polygon",coordinates:[[]]}},t=0;t<n.length;t++)r.geometry.coordinates[0].push(n[t].geometry.coordinates);return r.properties=n[0].properties,{type:"FeatureCollection",features:[r]}}var c=e("dsv"),l=e("sexagesimal");n.exports={isLon:t,isLat:r,csv:c.csv.parse,tsv:c.tsv.parse,dsv:c,auto:u,csv2geojson:a,toLine:s,toPolygon:f}},{dsv:7,sexagesimal:8}],7:[function(e,n){e("fs");n.exports=new Function('dsv.version = "0.0.3";\n\ndsv.tsv = dsv("\\t");\ndsv.csv = dsv(",");\n\nfunction dsv(delimiter) {\n  var dsv = {},\n      reFormat = new RegExp("[\\"" + delimiter + "\\n]"),\n      delimiterCode = delimiter.charCodeAt(0);\n\n  dsv.parse = function(text, f) {\n    var o;\n    return dsv.parseRows(text, function(row, i) {\n      if (o) return o(row, i - 1);\n      var a = new Function("d", "return {" + row.map(function(name, i) {\n        return JSON.stringify(name) + ": d[" + i + "]";\n      }).join(",") + "}");\n      o = f ? function(row, i) { return f(a(row), i); } : a;\n    });\n  };\n\n  dsv.parseRows = function(text, f) {\n    var EOL = {}, // sentinel value for end-of-line\n        EOF = {}, // sentinel value for end-of-file\n        rows = [], // output rows\n        N = text.length,\n        I = 0, // current character index\n        n = 0, // the current line number\n        t, // the current token\n        eol; // is the current token followed by EOL?\n\n    function token() {\n      if (I >= N) return EOF; // special case: end of file\n      if (eol) return eol = false, EOL; // special case: end of line\n\n      // special case: quotes\n      var j = I;\n      if (text.charCodeAt(j) === 34) {\n        var i = j;\n        while (i++ < N) {\n          if (text.charCodeAt(i) === 34) {\n            if (text.charCodeAt(i + 1) !== 34) break;\n            ++i;\n          }\n        }\n        I = i + 2;\n        var c = text.charCodeAt(i + 1);\n        if (c === 13) {\n          eol = true;\n          if (text.charCodeAt(i + 2) === 10) ++I;\n        } else if (c === 10) {\n          eol = true;\n        }\n        return text.substring(j + 1, i).replace(/""/g, "\\"");\n      }\n\n      // common case: find next delimiter or newline\n      while (I < N) {\n        var c = text.charCodeAt(I++), k = 1;\n        if (c === 10) eol = true; // \\n\n        else if (c === 13) { eol = true; if (text.charCodeAt(I) === 10) ++I, ++k; } // \\r|\\r\\n\n        else if (c !== delimiterCode) continue;\n        return text.substring(j, I - k);\n      }\n\n      // special case: last token before EOF\n      return text.substring(j);\n    }\n\n    while ((t = token()) !== EOF) {\n      var a = [];\n      while (t !== EOL && t !== EOF) {\n        a.push(t);\n        t = token();\n      }\n      if (f && !(a = f(a, n++))) continue;\n      rows.push(a);\n    }\n\n    return rows;\n  };\n\n  dsv.format = function(rows) {\n    if (Array.isArray(rows[0])) return dsv.formatRows(rows); // deprecated; use formatRows\n    var fieldSet = {}, fields = [];\n\n    // Compute unique fields in order of discovery.\n    rows.forEach(function(row) {\n      for (var field in row) {\n        if (!(field in fieldSet)) {\n          fields.push(fieldSet[field] = field);\n        }\n      }\n    });\n\n    return [fields.map(formatValue).join(delimiter)].concat(rows.map(function(row) {\n      return fields.map(function(field) {\n        return formatValue(row[field]);\n      }).join(delimiter);\n    })).join("\\n");\n  };\n\n  dsv.formatRows = function(rows) {\n    return rows.map(formatRow).join("\\n");\n  };\n\n  function formatRow(row) {\n    return row.map(formatValue).join(delimiter);\n  }\n\n  function formatValue(text) {\n    return reFormat.test(text) ? "\\"" + text.replace(/\\"/g, "\\"\\"") + "\\"" : text;\n  }\n\n  return dsv;\n}\n;return dsv')()},{fs:2}],8:[function(e,n){n.exports=function(e,n){if(n||(n="NSEW"),"string"!=typeof e)return null;var r=/^([0-9.]+)Â°? *(?:([0-9.]+)['â€™â€²â€˜] *)?(?:([0-9.]+)(?:''|"|â€|â€³) *)?([NSEW])?/,t=e.match(r);return t?t[4]&&-1===n.indexOf(t[4])?null:((t[1]?parseFloat(t[1]):0)+(t[2]?parseFloat(t[2])/60:0)+(t[3]?parseFloat(t[3])/3600:0))*(t[4]&&"S"===t[4]||"W"===t[4]?-1:1):null}},{}],9:[function(e,n){function r(e,n){e=Math.round(e*n),e<<=1,0>e&&(e=~e);for(var r="";e>=32;)r+=String.fromCharCode((32|31&e)+63),e>>=5;return r+=String.fromCharCode(e+63)}var t={};t.decode=function(e,n){for(var r,t,o=0,i=0,u=0,a=[],s=0,f=0,c=null,l=Math.pow(10,n||5);o<e.length;){c=null,s=0,f=0;do c=e.charCodeAt(o++)-63,f|=(31&c)<<s,s+=5;while(c>=32);r=1&f?~(f>>1):f>>1,s=f=0;do c=e.charCodeAt(o++)-63,f|=(31&c)<<s,s+=5;while(c>=32);t=1&f?~(f>>1):f>>1,i+=r,u+=t,a.push([i/l,u/l])}return a},t.encode=function(e,n){if(!e.length)return"";for(var t=Math.pow(10,n||5),o=r(e[0][0],t)+r(e[0][1],t),i=1;i<e.length;i++){var u=e[i],a=e[i-1];o+=r(u[0]-a[0],t),o+=r(u[1]-a[1],t)}return o},void 0!==typeof n&&(n.exports=t)},{}],10:[function(e,n,r){(function(t){toGeoJSON=function(){"use strict";function n(e){if(!e||!e.length)return 0;for(var n=0,r=0;n<e.length;n++)r=(r<<5)-r+e.charCodeAt(n)|0;return r}function o(e,n){return e.getElementsByTagName(n)}function i(e,n){return e.getAttribute(n)}function u(e,n){return parseFloat(i(e,n))}function a(e,n){var r=o(e,n);return r.length?r[0]:null}function s(e){return e.normalize&&e.normalize(),e}function f(e){for(var n=0,r=[];n<e.length;n++)r[n]=parseFloat(e[n]);return r}function c(e){var n={};for(var r in e)e[r]&&(n[r]=e[r]);return n}function l(e){return e&&s(e),e&&e.firstChild&&e.firstChild.nodeValue||""}function p(e){return f(e.replace(y,"").split(","))}function d(e){for(var n=e.replace(w,"").split(x),r=[],t=0;t<n.length;t++)r.push(p(n[t]));return r}function g(e){var n=[u(e,"lon"),u(e,"lat")],r=a(e,"ele"),t=a(e,"time");return r&&n.push(parseFloat(l(r))),{coordinates:n,time:t?l(t):null}}function h(){return{type:"FeatureCollection",features:[]}}function v(e){return void 0!==e.xml?e.xml:m.serializeToString(e)}var m,y=/\s*/g,w=/^\s*|\s*$/g,x=/\s+/;"undefined"!=typeof XMLSerializer?m=new XMLSerializer:"object"!=typeof r||"object"!=typeof t||t.browser||(m=new(e("xmldom").XMLSerializer));var L={kml:function(e){function r(e){var n,r;return e=e||"","#"===e.substr(0,1)&&(e=e.substr(1)),(6===e.length||3===e.length)&&(n=e),8===e.length&&(r=parseInt(e.substr(0,2),16)/255,n=e.substr(2)),[n,isNaN(r)?void 0:r]}function t(e){return f(e.split(" "))}function u(e){var n=o(e,"coord","gx"),r=[],i=[];0===n.length&&(n=o(e,"gx:coord"));for(var u=0;u<n.length;u++)r.push(t(l(n[u])));for(var a=o(e,"when"),u=0;u<a.length;u++)i.push(l(a[u]));return{coords:r,times:i}}function s(e){var n,r,t,i,f,c=[],g=[];if(a(e,"MultiGeometry"))return s(a(e,"MultiGeometry"));if(a(e,"MultiTrack"))return s(a(e,"MultiTrack"));if(a(e,"gx:MultiTrack"))return s(a(e,"gx:MultiTrack"));for(t=0;t<y.length;t++)if(r=o(e,y[t]))for(i=0;i<r.length;i++)if(n=r[i],"Point"==y[t])c.push({type:"Point",coordinates:p(l(a(n,"coordinates")))});else if("LineString"==y[t])c.push({type:"LineString",coordinates:d(l(a(n,"coordinates")))});else if("Polygon"==y[t]){var h=o(n,"LinearRing"),v=[];for(f=0;f<h.length;f++)v.push(d(l(a(h[f],"coordinates"))));c.push({type:"Polygon",coordinates:v})}else if("Track"==y[t]||"gx:Track"==y[t]){var m=u(n);c.push({type:"LineString",coordinates:m.coords}),m.times.length&&g.push(m.times)}return{geoms:c,coordTimes:g}}function c(e){var n,t=s(e),u={},f=l(a(e,"name")),c=l(a(e,"styleUrl")),p=l(a(e,"description")),d=a(e,"TimeSpan"),g=a(e,"ExtendedData"),h=a(e,"LineStyle"),v=a(e,"PolyStyle");if(!t.geoms.length)return[];if(f&&(u.name=f),c&&m[c]&&(u.styleUrl=c,u.styleHash=m[c]),p&&(u.description=p),d){var y=l(a(d,"begin")),w=l(a(d,"end"));u.timespan={begin:y,end:w}}if(h){var x=r(l(a(h,"color"))),L=x[0],E=x[1],S=parseFloat(l(a(h,"width")));L&&(u.stroke=L),isNaN(E)||(u["stroke-opacity"]=E),isNaN(S)||(u["stroke-width"]=S)}if(v){var b=r(l(a(v,"color"))),k=b[0],M=b[1],j=l(a(v,"fill")),N=l(a(v,"outline"));k&&(u.fill=k),isNaN(M)||(u["fill-opacity"]=M),j&&(u["fill-opacity"]="1"===j?1:0),N&&(u["stroke-opacity"]="1"===N?1:0)}if(g){var F=o(g,"Data"),P=o(g,"SimpleData");for(n=0;n<F.length;n++)u[F[n].getAttribute("name")]=l(a(F[n],"value"));for(n=0;n<P.length;n++)u[P[n].getAttribute("name")]=l(P[n])}t.coordTimes.length&&(u.coordTimes=1===t.coordTimes.length?t.coordTimes[0]:t.coordTimes);var C={type:"Feature",geometry:1===t.geoms.length?t.geoms[0]:{type:"GeometryCollection",geometries:t.geoms},properties:u};return i(e,"id")&&(C.id=i(e,"id")),[C]}for(var g=h(),m={},y=["Polygon","LineString","Point","Track","gx:Track"],w=o(e,"Placemark"),x=o(e,"Style"),L=0;L<x.length;L++)m["#"+i(x[L],"id")]=n(v(x[L])).toString(16);for(var E=0;E<w.length;E++)g.features=g.features.concat(c(w[E]));return g},gpx:function(e){function n(e,n){var r=o(e,n),t=[],i=[],u=r.length;if(!(2>u)){for(var a=0;u>a;a++){var s=g(r[a]);t.push(s.coordinates),s.time&&i.push(s.time)}return{line:t,times:i}}}function r(e){for(var r,t=o(e,"trkseg"),i=[],a=[],s=0;s<t.length;s++)r=n(t[s],"trkpt"),r.line&&i.push(r.line),r.times.length&&a.push(r.times);if(0!==i.length){var f=u(e);return a.length&&(f.coordTimes=1===i.length?a[0]:a),{type:"Feature",properties:f,geometry:{type:1===i.length?"LineString":"MultiLineString",coordinates:1===i.length?i[0]:i}}}}function t(e){var r=n(e,"rtept");if(r){var t={type:"Feature",properties:u(e),geometry:{type:"LineString",coordinates:r}};return r.times.length&&(t.geometry.times=r.times),t}}function i(e){var n=u(e);return n.sym=l(a(e,"sym")),{type:"Feature",properties:n,geometry:{type:"Point",coordinates:g(e).coordinates}}}function u(e){var n,r=["name","desc","author","copyright","link","time","keywords"],t={};for(n=0;n<r.length;n++)t[r[n]]=l(a(e,r[n]));return c(t)}var s,f,p=o(e,"trk"),d=o(e,"rte"),v=o(e,"wpt"),m=h();for(s=0;s<p.length;s++)f=r(p[s]),f&&m.features.push(f);for(s=0;s<d.length;s++)f=t(d[s]),f&&m.features.push(f);for(s=0;s<v.length;s++)m.features.push(i(v[s]));return m}};return L}(),"undefined"!=typeof n&&(n.exports=toGeoJSON)}).call(this,e("_process"))},{_process:4,xmldom:3}],11:[function(r,t){!function(){function r(e,n){function r(n){var r,t=e.arcs[0>n?~n:n],o=t[0];return e.transform?(r=[0,0],t.forEach(function(e){r[0]+=e[0],r[1]+=e[1]})):r=t[t.length-1],0>n?[r,o]:[o,r]}function t(e,n){for(var r in e){var t=e[r];delete n[t.start],delete t.start,delete t.end,t.forEach(function(e){o[0>e?~e:e]=1}),a.push(t)}}var o={},i={},u={},a=[],s=-1;return n.forEach(function(r,t){var o,i=e.arcs[0>r?~r:r];i.length<3&&!i[1][0]&&!i[1][1]&&(o=n[++s],n[s]=r,n[t]=o)}),n.forEach(function(e){var n,t,o=r(e),a=o[0],s=o[1];if(n=u[a])if(delete u[n.end],n.push(e),n.end=s,t=i[s]){delete i[t.start];var f=t===n?n:n.concat(t);i[f.start=n.start]=u[f.end=t.end]=f}else i[n.start]=u[n.end]=n;else if(n=i[s])if(delete i[n.start],n.unshift(e),n.start=a,t=u[a]){delete u[t.end];var c=t===n?n:t.concat(n);i[c.start=t.start]=u[c.end=n.end]=c}else i[n.start]=u[n.end]=n;else n=[e],i[n.start=a]=u[n.end=s]=n}),t(u,i),t(i,u),n.forEach(function(e){o[0>e?~e:e]||a.push([e])}),a}function o(e,n,t){function o(e){var n=0>e?~e:e;(c[n]||(c[n]=[])).push({i:e,g:f})}function i(e){e.forEach(o)}function u(e){e.forEach(i)}function a(e){"GeometryCollection"===e.type?e.geometries.forEach(a):e.type in l&&(f=e,l[e.type](e.arcs))}var s=[];if(arguments.length>1){var f,c=[],l={LineString:i,MultiLineString:u,Polygon:u,MultiPolygon:function(e){e.forEach(u)}};a(n),c.forEach(arguments.length<3?function(e){s.push(e[0].i)}:function(e){t(e[0].g,e[e.length-1].g)&&s.push(e[0].i)})}else for(var p=0,d=e.arcs.length;d>p;++p)s.push(p);return{type:"MultiLineString",arcs:r(e,s)}}function i(e,t){function o(e){e.forEach(function(n){n.forEach(function(n){(u[n=0>n?~n:n]||(u[n]=[])).push(e)})}),a.push(e)}function i(n){return d(s(e,{type:"Polygon",arcs:[n]}).coordinates[0])>0}var u={},a=[],f=[];return t.forEach(function(e){"Polygon"===e.type?o(e.arcs):"MultiPolygon"===e.type&&e.arcs.forEach(o)}),a.forEach(function(e){if(!e._){var n=[],r=[e];for(e._=1,f.push(n);e=r.pop();)n.push(e),e.forEach(function(e){e.forEach(function(e){u[0>e?~e:e].forEach(function(e){e._||(e._=1,r.push(e))})})})}}),a.forEach(function(e){delete e._}),{type:"MultiPolygon",arcs:f.map(function(t){var o=[];if(t.forEach(function(e){e.forEach(function(e){e.forEach(function(e){u[0>e?~e:e].length<2&&o.push(e)})})}),o=r(e,o),(n=o.length)>1)for(var a,s=i(t[0][0]),f=0;f<n;++f)if(s===i(o[f])){a=o[0],o[0]=o[f],o[f]=a;break}return o})}}function u(e,n){return"GeometryCollection"===n.type?{type:"FeatureCollection",features:n.geometries.map(function(n){return a(e,n)})}:a(e,n)}function a(e,n){var r={type:"Feature",id:n.id,properties:n.properties||{},geometry:s(e,n)};return null==n.id&&delete r.id,r}function s(e,n){function r(e,n){n.length&&n.pop();for(var r,t=c[0>e?~e:e],o=0,i=t.length;i>o;++o)n.push(r=t[o].slice()),s(r,o);0>e&&f(n,i)}function t(e){return e=e.slice(),s(e,0),e}function o(e){for(var n=[],t=0,o=e.length;o>t;++t)r(e[t],n);return n.length<2&&n.push(n[0].slice()),n}function i(e){for(var n=o(e);n.length<4;)n.push(n[0].slice());return n}function u(e){return e.map(i)}function a(e){var n=e.type;return"GeometryCollection"===n?{type:n,geometries:e.geometries.map(a)}:n in l?{type:n,coordinates:l[n](e)}:null}var s=m(e.transform),c=e.arcs,l={Point:function(e){return t(e.coordinates)},MultiPoint:function(e){return e.coordinates.map(t)},LineString:function(e){return o(e.arcs)},MultiLineString:function(e){return e.arcs.map(o)},Polygon:function(e){return u(e.arcs)},MultiPolygon:function(e){return e.arcs.map(u)}};return a(n)}function f(e,n){for(var r,t=e.length,o=t-n;o<--t;)r=e[o],e[o++]=e[t],e[t]=r}function c(e,n){for(var r=0,t=e.length;t>r;){var o=r+t>>>1;e[o]<n?r=o+1:t=o}return r}function l(e){function n(e,n){e.forEach(function(e){0>e&&(e=~e);var r=o[e];r?r.push(n):o[e]=[n]})}function r(e,r){e.forEach(function(e){n(e,r)})}function t(e,n){"GeometryCollection"===e.type?e.geometries.forEach(function(e){t(e,n)}):e.type in u&&u[e.type](e.arcs,n)}var o={},i=e.map(function(){return[]}),u={LineString:n,MultiLineString:r,Polygon:r,MultiPolygon:function(e,n){e.forEach(function(e){r(e,n)})}};e.forEach(t);for(var a in o)for(var s=o[a],f=s.length,l=0;f>l;++l)for(var p=l+1;f>p;++p){var d,g=s[l],h=s[p];(d=i[g])[a=c(d,h)]!==h&&d.splice(a,0,h),(d=i[h])[a=c(d,g)]!==g&&d.splice(a,0,g)}return i}function p(e,n){function r(e){u.remove(e),e[1][2]=n(e),u.push(e)}var t,o=m(e.transform),i=y(e.transform),u=v(),a=0;for(n||(n=g),e.arcs.forEach(function(e){var r=[];e.forEach(o);for(var i=1,a=e.length-1;a>i;++i)t=e.slice(i-1,i+2),t[1][2]=n(t),r.push(t),u.push(t);e[0][2]=e[a][2]=1/0;for(var i=0,a=r.length;a>i;++i)t=r[i],t.previous=r[i-1],t.next=r[i+1]});t=u.pop();){var s=t.previous,f=t.next;t[1][2]<a?t[1][2]=a:a=t[1][2],s&&(s.next=f,s[2]=t[2],r(s)),f&&(f.previous=s,f[0]=t[0],r(f))}return e.arcs.forEach(function(e){e.forEach(i)}),e}function d(e){for(var n,r=-1,t=e.length,o=e[t-1],i=0;++r<t;)n=o,o=e[r],i+=n[0]*o[1]-n[1]*o[0];return.5*i}function g(e){var n=e[0],r=e[1],t=e[2];return Math.abs((n[0]-t[0])*(r[1]-n[1])-(n[0]-r[0])*(t[1]-n[1]))}function h(e,n){return e[1][2]-n[1][2]}function v(){function e(e,n){for(;n>0;){var r=(n+1>>1)-1,o=t[r];if(h(e,o)>=0)break;t[o._=n]=o,t[e._=n=r]=e}}function n(e,n){for(;;){var r=n+1<<1,i=r-1,u=n,a=t[u];if(o>i&&h(t[i],a)<0&&(a=t[u=i]),o>r&&h(t[r],a)<0&&(a=t[u=r]),u===n)break;t[a._=n]=a,t[e._=n=u]=e}}var r={},t=[],o=0;return r.push=function(n){return e(t[n._=o]=n,o++),o},r.pop=function(){if(!(0>=o)){var e,r=t[0];return--o>0&&(e=t[o],n(t[e._=0]=e,0)),r}},r.remove=function(r){var i,u=r._;if(t[u]===r)return u!==--o&&(i=t[o],(h(i,r)<0?e:n)(t[i._=u]=i,u)),u},r}function m(e){if(!e)return w;var n,r,t=e.scale[0],o=e.scale[1],i=e.translate[0],u=e.translate[1];return function(e,a){a||(n=r=0),e[0]=(n+=e[0])*t+i,e[1]=(r+=e[1])*o+u}}function y(e){if(!e)return w;var n,r,t=e.scale[0],o=e.scale[1],i=e.translate[0],u=e.translate[1];return function(e,a){a||(n=r=0);var s=(e[0]-i)/t|0,f=(e[1]-u)/o|0;e[0]=s-n,e[1]=f-r,n=s,r=f}}function w(){}var x={version:"1.6.8",mesh:function(e){return s(e,o.apply(this,arguments))},meshArcs:o,merge:function(e){return s(e,i.apply(this,arguments))},mergeArcs:i,feature:u,neighbors:l,presimplify:p};"function"==typeof e&&e.amd?e(x):"object"==typeof t&&t.exports?t.exports=x:this.topojson=x}()},{}],12:[function(e,n){function r(e){function n(n){var r=e.substring(m).match(n);return r?(m+=r[0].length,r[0]):null}function r(e){return e&&v.match(/\d+/)&&(e.crs={type:"name",properties:{name:"urn:ogc:def:crs:EPSG::"+v}}),e}function t(){n(/^\s*/)}function i(){t();for(var e,r=0,i=[],u=[i],a=i;e=n(/^(\()/)||n(/^(\))/)||n(/^(\,)/)||n(o);){if("("==e)u.push(a),a=[],u[u.length-1].push(a),r++;else if(")"==e){if(a=u.pop(),!a)return;if(r--,0===r)break}else if(","===e)a=[],u[u.length-1].push(a);else{if(isNaN(parseFloat(e)))return null;a.push(parseFloat(e))}t()}return 0!==r?null:i}function u(){for(var e,r,i=[];r=n(o)||n(/^(\,)/);)","==r?(i.push(e),e=[]):(e||(e=[]),e.push(parseFloat(r))),t();return e&&i.push(e),i.length?i:null}function a(){if(!n(/^(point)/i))return null;if(t(),!n(/^(\()/))return null;var e=u();return e?(t(),n(/^(\))/)?{type:"Point",coordinates:e[0]}:null):null}function s(){if(!n(/^(multipoint)/i))return null;t();var e=i();return e?(t(),{type:"MultiPoint",coordinates:e}):null}function f(){if(!n(/^(multilinestring)/i))return null;t();var e=i();return e?(t(),{type:"MultiLineString",coordinates:e}):null}function c(){if(!n(/^(linestring)/i))return null;if(t(),!n(/^(\()/))return null;var e=u();return e&&n(/^(\))/)?{type:"LineString",coordinates:e}:null}function l(){return n(/^(polygon)/i)?(t(),{type:"Polygon",coordinates:i()}):null}function p(){return n(/^(multipolygon)/i)?(t(),{type:"MultiPolygon",coordinates:i()}):null}function d(){var e,r=[];if(!n(/^(geometrycollection)/i))return null;if(t(),!n(/^(\()/))return null;for(;e=g();)r.push(e),t(),n(/^(\,)/),t();return n(/^(\))/)?{type:"GeometryCollection",geometries:r}:null}function g(){return a()||c()||l()||s()||f()||p()||d()}var h=e.split(";"),e=h.pop(),v=(h.shift()||"").split("=").pop(),m=0;return r(g())}function t(e){function n(e){return 2===e.length?e[0]+" "+e[1]:3===e.length?e[0]+" "+e[1]+" "+e[2]:void 0}function r(e){return e.map(n).join(", ")}function o(e){return e.map(r).map(u).join(", ")}function i(e){return e.map(o).map(u).join(", ")}function u(e){return"("+e+")"}switch("Feature"===e.type&&(e=e.geometry),e.type){case"Point":return"POINT ("+n(e.coordinates)+")";case"LineString":return"LINESTRING ("+r(e.coordinates)+")";case"Polygon":return"POLYGON ("+o(e.coordinates)+")";case"MultiPoint":return"MULTIPOINT ("+r(e.coordinates)+")";case"MultiPolygon":return"MULTIPOLYGON ("+i(e.coordinates)+")";case"MultiLineString":return"MULTILINESTRING ("+o(e.coordinates)+")";case"GeometryCollection":return"GEOMETRYCOLLECTION ("+e.geometries.map(t).join(", ")+")";default:throw new Error("stringify requires a valid GeoJSON Feature or geometry object as input")}}n.exports=r,n.exports.parse=r,n.exports.stringify=t;var o=/^[-+]?([0-9]*\.[0-9]+|[0-9]+)([eE][-+]?[0-9]+)?/},{}]},{},[1])(1)});
  L.Control.Measure = L.Control.extend({
      options: {
          position: 'topleft'
      },
  
      onAdd: function (map) {
          var className = 'leaflet-control-zoom leaflet-bar leaflet-control',
              container = L.DomUtil.create('div', className);
  
          this._createButton('&#8674;', 'Measure', 'leaflet-control-measure leaflet-bar-part leaflet-bar-part-top-and-bottom', container, this._toggleMeasure, this);
  
          return container;
      },
  
      _createButton: function (html, title, className, container, fn, context) {
          var link = L.DomUtil.create('a', className, container);
          link.innerHTML = html;
          link.href = '#';
          link.title = title;
  
          L.DomEvent
              .on(link, 'click', L.DomEvent.stopPropagation)
              .on(link, 'click', L.DomEvent.preventDefault)
              .on(link, 'click', fn, context)
              .on(link, 'dblclick', L.DomEvent.stopPropagation);
  
          return link;
      },
  
      _toggleMeasure: function () {
          this._measuring = !this._measuring;
  
          if(this._measuring) {
              L.DomUtil.addClass(this._container, 'leaflet-control-measure-on');
              this._startMeasuring();
          } else {
              L.DomUtil.removeClass(this._container, 'leaflet-control-measure-on');
              this._stopMeasuring();
          }
      },
  
      _startMeasuring: function() {
          this._oldCursor = this._map._container.style.cursor;
          this._map._container.style.cursor = 'crosshair';
  
          this._doubleClickZoom = this._map.doubleClickZoom.enabled();
          this._map.doubleClickZoom.disable();
  
          L.DomEvent
              .on(this._map, 'mousemove', this._mouseMove, this)
              .on(this._map, 'click', this._mouseClick, this)
              .on(this._map, 'dblclick', this._finishPath, this)
              .on(document, 'keydown', this._onKeyDown, this);
  
          if(!this._layerPaint) {
              this._layerPaint = L.layerGroup().addTo(this._map);
          }
  
          if(!this._points) {
              this._points = [];
          }
      },
  
      _stopMeasuring: function() {
          this._map._container.style.cursor = this._oldCursor;
  
          L.DomEvent
              .off(document, 'keydown', this._onKeyDown, this)
              .off(this._map, 'mousemove', this._mouseMove, this)
              .off(this._map, 'click', this._mouseClick, this)
              .off(this._map, 'dblclick', this._mouseClick, this);
  
          if(this._doubleClickZoom) {
              this._map.doubleClickZoom.enable();
          }
  
          if(this._layerPaint) {
              this._layerPaint.clearLayers();
          }
  
          this._restartPath();
      },
  
      _mouseMove: function(e) {
          if(!e.latlng || !this._lastPoint) {
              return;
          }
  
          if(!this._layerPaintPathTemp) {
              this._layerPaintPathTemp = L.polyline([this._lastPoint, e.latlng], {
                  color: 'black',
                  weight: 1.5,
                  clickable: false,
                  dashArray: '6,3'
              }).addTo(this._layerPaint);
          } else {
              this._layerPaintPathTemp.spliceLatLngs(0, 2, this._lastPoint, e.latlng);
          }
  
          if(this._tooltip) {
              if(!this._distance) {
                  this._distance = 0;
              }
  
              this._updateTooltipPosition(e.latlng);
  
              var distance = e.latlng.distanceTo(this._lastPoint);
              this._updateTooltipDistance(this._distance + distance, distance);
          }
      },
  
      _mouseClick: function(e) {
          // Skip if no coordinates
          if(!e.latlng) {
              return;
          }
  
          // If we have a tooltip, update the distance and create a new tooltip, leaving the old one exactly where it is (i.e. where the user has clicked)
          if(this._lastPoint && this._tooltip) {
              if(!this._distance) {
                  this._distance = 0;
              }
  
              this._updateTooltipPosition(e.latlng);
  
              var distance = e.latlng.distanceTo(this._lastPoint);
              this._updateTooltipDistance(this._distance + distance, distance);
  
              this._distance += distance;
          }
          this._createTooltip(e.latlng);
  
  
          // If this is already the second click, add the location to the fix path (create one first if we don't have one)
          if(this._lastPoint && !this._layerPaintPath) {
              this._layerPaintPath = L.polyline([this._lastPoint], {
                  color: 'black',
                  weight: 2,
                  clickable: false
              }).addTo(this._layerPaint);
          }
  
          if(this._layerPaintPath) {
              this._layerPaintPath.addLatLng(e.latlng);
          }
  
          // Upate the end marker to the current location
          if(this._lastCircle) {
              this._layerPaint.removeLayer(this._lastCircle);
          }
  
          this._lastCircle = new L.CircleMarker(e.latlng, {
              color: 'black',
              opacity: 1,
              weight: 1,
              fill: true,
              fillOpacity: 1,
              radius:2,
              clickable: this._lastCircle ? true : false
          }).addTo(this._layerPaint);
  
          this._lastCircle.on('click', function() { this._finishPath(); }, this);
  
          // Save current location as last location
          this._lastPoint = e.latlng;
      },
  
      _finishPath: function() {
          // Remove the last end marker as well as the last (moving tooltip)
          if(this._lastCircle) {
              this._layerPaint.removeLayer(this._lastCircle);
          }
          if(this._tooltip) {
              this._layerPaint.removeLayer(this._tooltip);
          }
          if(this._layerPaint && this._layerPaintPathTemp) {
              this._layerPaint.removeLayer(this._layerPaintPathTemp);
          }
  
          // Reset everything
          this._restartPath();
      },
  
      _restartPath: function() {
          this._distance = 0;
          this._tooltip = undefined;
          this._lastCircle = undefined;
          this._lastPoint = undefined;
          this._layerPaintPath = undefined;
          this._layerPaintPathTemp = undefined;
      },
  
      _createTooltip: function(position) {
          var icon = L.divIcon({
              className: 'leaflet-measure-tooltip',
              iconAnchor: [-5, -5]
          });
          this._tooltip = L.marker(position, {
              icon: icon,
              clickable: false
          }).addTo(this._layerPaint);
      },
  
      _updateTooltipPosition: function(position) {
          this._tooltip.setLatLng(position);
      },
  
      _updateTooltipDistance: function(total, difference) {
          var totalRound = this._round(total),
              differenceRound = this._round(difference);
  
          var text = '<div class="leaflet-measure-tooltip-total">' + totalRound + ' mi</div>';
          if(differenceRound > 0 && totalRound != differenceRound) {
              text += '<div class="leaflet-measure-tooltip-difference">(+' + differenceRound + ' mi)</div>';
          }
  
          this._tooltip._icon.innerHTML = text;
      },
  
      _round: function(val) {
          return Math.round((val / 1609.34));
      },
  
      _onKeyDown: function (e) {
          if(e.keyCode == 27) {
              // If not in path exit measuring mode, else just finish path
              if(!this._lastPoint) {
                  this._toggleMeasure();
              } else {
                  this._finishPath();
              }
          }
      }
  });
  
  L.Map.mergeOptions({
      measureControl: false
  });
  
  L.Map.addInitHook(function () {
      if (this.options.measureControl) {
          this.measureControl = new L.Control.Measure();
          this.addControl(this.measureControl);
      }
  });
  
  L.control.measure = function (options) {
      return new L.Control.Measure(options);
  };
  
  !function(){function a(b,c,d){var e=a.resolve(b);if(null==e){d=d||b,c=c||"root";var f=new Error('Failed to require "'+d+'" from "'+c+'"');throw f.path=d,f.parent=c,f.require=!0,f}var g=a.modules[e];return g.exports||(g.exports={},g.client=g.component=!0,g.call(this,g.exports,a.relative(e),g)),g.exports}a.modules={},a.aliases={},a.resolve=function(b){"/"===b.charAt(0)&&(b=b.slice(1));for(var c=[b,b+".js",b+".json",b+"/index.js",b+"/index.json"],d=0;d<c.length;d++){var b=c[d];if(a.modules.hasOwnProperty(b))return b;if(a.aliases.hasOwnProperty(b))return a.aliases[b]}},a.normalize=function(a,b){var c=[];if("."!=b.charAt(0))return b;a=a.split("/"),b=b.split("/");for(var d=0;d<b.length;++d)".."==b[d]?a.pop():"."!=b[d]&&""!=b[d]&&c.push(b[d]);return a.concat(c).join("/")},a.register=function(b,c){a.modules[b]=c},a.alias=function(b,c){if(!a.modules.hasOwnProperty(b))throw new Error('Failed to alias "'+b+'", it does not exist');a.aliases[c]=b},a.relative=function(b){function c(a,b){for(var c=a.length;c--;)if(a[c]===b)return c;return-1}function d(c){var e=d.resolve(c);return a(e,b,c)}var e=a.normalize(b,"..");return d.resolve=function(d){var f=d.charAt(0);if("/"==f)return d.slice(1);if("."==f)return a.normalize(e,d);var g=b.split("/"),h=c(g,"deps")+1;return h||(h=0),d=g.slice(0,h+1).join("/")+"/deps/"+d},d.exists=function(b){return a.modules.hasOwnProperty(d.resolve(b))},d},a.register("calvinmetcalf-setImmediate/lib/index.js",function(a,b,c){"use strict";function d(){var a,b=0,c=g;for(g=[];a=c[b++];)a()}var e,f=[b("./nextTick"),b("./mutation"),b("./postMessage"),b("./messageChannel"),b("./stateChange"),b("./timeout")],g=[];f.some(function(a){var b=a.test();return b&&(e=a.install(d)),b});var h=function(a){var b,c;return arguments.length>1&&"function"==typeof a&&(c=Array.prototype.slice.call(arguments,1),c.unshift(void 0),a=a.bind.apply(a,c)),1===(b=g.push(a))&&e(d),b};h.clear=function(a){return a<=g.length&&(g[a-1]=function(){}),this},c.exports=h}),a.register("calvinmetcalf-setImmediate/lib/nextTick.js",function(a){"use strict";a.test=function(){return"object"==typeof process&&"[object process]"===Object.prototype.toString.call(process)},a.install=function(){return process.nextTick}}),a.register("calvinmetcalf-setImmediate/lib/postMessage.js",function(a,b){"use strict";var c=b("./global");a.test=function(){if(!c.postMessage||c.importScripts)return!1;var a=!0,b=c.onmessage;return c.onmessage=function(){a=!1},c.postMessage("","*"),c.onmessage=b,a},a.install=function(a){function b(b){b.source===c&&b.data===d&&a()}var d="com.calvinmetcalf.setImmediate"+Math.random();return c.addEventListener?c.addEventListener("message",b,!1):c.attachEvent("onmessage",b),function(){c.postMessage(d,"*")}}}),a.register("calvinmetcalf-setImmediate/lib/messageChannel.js",function(a,b){"use strict";var c=b("./global");a.test=function(){return!!c.MessageChannel},a.install=function(a){var b=new c.MessageChannel;return b.port1.onmessage=a,function(){b.port2.postMessage(0)}}}),a.register("calvinmetcalf-setImmediate/lib/stateChange.js",function(a,b){"use strict";var c=b("./global");a.test=function(){return"document"in c&&"onreadystatechange"in c.document.createElement("script")},a.install=function(a){return function(){var b=c.document.createElement("script");return b.onreadystatechange=function(){a(),b.onreadystatechange=null,b.parentNode.removeChild(b),b=null},c.document.documentElement.appendChild(b),a}}}),a.register("calvinmetcalf-setImmediate/lib/timeout.js",function(a){"use strict";a.test=function(){return!0},a.install=function(a){return function(){setTimeout(a,0)}}}),a.register("calvinmetcalf-setImmediate/lib/global.js",function(a,b,c){c.exports="object"==typeof global&&global?global:this}),a.register("calvinmetcalf-setImmediate/lib/mutation.js",function(a,b){"use strict";var c=b("./global"),d=c.MutationObserver||c.WebKitMutationObserver;a.test=function(){return d},a.install=function(a){var b=new d(a),e=c.document.createElement("div");return b.observe(e,{attributes:!0}),c.addEventListener("unload",function(){b.disconnect(),b=null},!1),function(){e.setAttribute("drainQueue","drainQueue")}}}),a.register("lie/lie.js",function(a,b,c){function d(a){function b(a,b){return d(function(c,d){k.push({resolve:a,reject:b,resolver:c,rejecter:d})})}function c(a,c){return l?l(a,c):b(a,c)}function h(a,b){for(var d,h,i=a?"resolve":"reject",j=0,m=k.length;m>j;j++)d=k[j],h=d[i],"function"==typeof h?g(f,h,b,d.resolver,d.rejecter):a?d.resolver(b):d.rejecter(b);l=e(c,b,a)}function i(a){l||h(!0,a)}function j(a){l||h(!1,a)}if(!(this instanceof d))return new d(a);var k=[],l=!1;this.then=c;try{a(function(a){a&&"function"==typeof a.then?a.then(i,j):i(a)},j)}catch(m){j(m)}}function e(a,b,c){return function(e,h){var i=c?e:h;return"function"!=typeof i?d(function(b,c){a(b,c)}):d(function(a,c){g(f,i,b,a,c)})}}function f(a,b,c,d){try{var e=a(b);e&&"function"==typeof e.then?e.then(c,d):c(e)}catch(f){d(f)}}var g=b("immediate");c.exports=d}),a.alias("calvinmetcalf-setImmediate/lib/index.js","lie/deps/immediate/lib/index.js"),a.alias("calvinmetcalf-setImmediate/lib/nextTick.js","lie/deps/immediate/lib/nextTick.js"),a.alias("calvinmetcalf-setImmediate/lib/postMessage.js","lie/deps/immediate/lib/postMessage.js"),a.alias("calvinmetcalf-setImmediate/lib/messageChannel.js","lie/deps/immediate/lib/messageChannel.js"),a.alias("calvinmetcalf-setImmediate/lib/stateChange.js","lie/deps/immediate/lib/stateChange.js"),a.alias("calvinmetcalf-setImmediate/lib/timeout.js","lie/deps/immediate/lib/timeout.js"),a.alias("calvinmetcalf-setImmediate/lib/global.js","lie/deps/immediate/lib/global.js"),a.alias("calvinmetcalf-setImmediate/lib/mutation.js","lie/deps/immediate/lib/mutation.js"),a.alias("calvinmetcalf-setImmediate/lib/index.js","lie/deps/immediate/index.js"),a.alias("calvinmetcalf-setImmediate/lib/index.js","immediate/index.js"),a.alias("calvinmetcalf-setImmediate/lib/index.js","calvinmetcalf-setImmediate/index.js"),a.alias("lie/lie.js","lie/index.js"),L.Util.Promise=a("lie")}(),L.Util.ajax=function(url,options){"use strict";if(options=options||{},options.jsonp)return L.Util.ajax.jsonp(url,options);var request,cancel,out=L.Util.Promise(function(resolve,reject){var Ajax;cancel=reject,Ajax=void 0===window.XMLHttpRequest?function(){try{return new ActiveXObject("Microsoft.XMLHTTP.6.0")}catch(a){try{return new ActiveXObject("Microsoft.XMLHTTP.3.0")}catch(b){reject("XMLHttpRequest is not supported")}}}:window.XMLHttpRequest;var response;request=new Ajax,request.open("GET",url),request.onreadystatechange=function(){4===request.readyState&&(request.status<400&&options.local||200===request.status?(window.JSON?response=JSON.parse(request.responseText):options.evil&&(response=eval("("+request.responseText+")")),resolve(response)):request.status?reject(request.statusText):reject("Attempted cross origin request without CORS enabled"))},request.send()});return out.then(null,function(a){return request.abort(),a}),out.abort=cancel,out},L.Util.jsonp=function(a,b){b=b||{};var c,d,e,f,g=document.getElementsByTagName("head")[0],h=L.DomUtil.create("script","",g),i=L.Util.Promise(function(i,j){f=j;var k=b.cbParam||"callback";b.callbackName?c=b.callbackName:(e="_"+(""+Math.random()).slice(2),c="L.Util.jsonp.cb."+e),h.type="text/javascript",e&&(L.Util.jsonp.cb[e]=function(a){g.removeChild(h),delete L.Util.jsonp.cb[e],i(a)}),d=-1===a.indexOf("?")?a+"?"+k+"="+c:a+"&"+k+"="+c,h.src=d}).then(null,function(a){return g.removeChild(h),delete L.Util.ajax.cb[e],a});return i.abort=f,i},L.Util.jsonp.cb={},L.GeoJSON.AJAX=L.GeoJSON.extend({defaultAJAXparams:{dataType:"json",callbackParam:"callback",local:!1,middleware:function(a){return a}},initialize:function(a,b){this.urls=[],a&&("string"==typeof a?this.urls.push(a):"function"==typeof a.pop?this.urls=this.urls.concat(a):(b=a,a=void 0));var c=L.Util.extend({},this.defaultAJAXparams);for(var d in b)this.defaultAJAXparams.hasOwnProperty(d)&&(c[d]=b[d]);this.ajaxParams=c,this._layers={},L.Util.setOptions(this,b),this.on("data:loaded",function(){this.filter&&this.refilter(this.filter)},this);var e=this;this.urls.length>0&&L.Util.Promise(function(a){a()}).then(function(){e.addUrl()})},clearLayers:function(){return this.urls=[],L.GeoJSON.prototype.clearLayers.call(this),this},addUrl:function(a){var b=this;a&&("string"==typeof a?b.urls.push(a):"function"==typeof a.pop&&(b.urls=b.urls.concat(a)));var c=b.urls.length,d=0;b.fire("data:loading"),b.urls.forEach(function(a){"json"===b.ajaxParams.dataType.toLowerCase()?L.Util.ajax(a,b.ajaxParams).then(function(a){var c=b.ajaxParams.middleware(a);b.addData(c),b.fire("data:progress",c)},function(a){b.fire("data:progress",{error:a})}):"jsonp"===b.ajaxParams.dataType.toLowerCase()&&L.Util.jsonp(a,b.ajaxParams).then(function(a){var c=b.ajaxParams.middleware(a);b.addData(c),b.fire("data:progress",c)},function(a){b.fire("data:progress",{error:a})})}),b.on("data:progress",function(){++d===c&&b.fire("data:loaded")})},refresh:function(a){a=a||this.urls,this.clearLayers(),this.addUrl(a)},refilter:function(a){"function"!=typeof a?(this.filter=!1,this.eachLayer(function(a){a.setStyle({stroke:!0,clickable:!0})})):(this.filter=a,this.eachLayer(function(b){a(b.feature)?b.setStyle({stroke:!0,clickable:!0}):b.setStyle({stroke:!1,clickable:!1})}))}}),L.geoJson.ajax=function(a,b){return new L.GeoJSON.AJAX(a,b)};
  (function (factory) {
      if(typeof define === 'function' && define.amd) {
      //AMD
          define(['leaflet'], factory);
      } else if(typeof module !== 'undefined') {
      // Node/CommonJS
          module.exports = factory(require('leaflet'));
      } else {
      // Browser globals
          if(typeof window.L === 'undefined')
              throw 'Leaflet must be loaded first';
          factory(window.L);
      }
  })(function (L) {
  
      function _getPath(obj, prop) {
          var parts = prop.split('.'),
              last = parts.pop(),
              len = parts.length,
              cur = parts[0],
              i = 1;
  
          if(len > 0)
              while((obj = obj[cur]) && i < len)
                  cur = parts[i++];
  
          if(obj)
              return obj[last];
      }
  
      function _isObject(obj) {
          return Object.prototype.toString.call(obj) === "[object Object]";
      }
  
  //TODO implement can do research on multiple sources layers and remote
  //TODO history: false,		//show latest searches in tooltip
  //FIXME option condition problem {autoCollapse: true, markerLocation: true} not show location
  //FIXME option condition problem {autoCollapse: false }
  //
  //TODO here insert function that search inputText FIRST in _recordsCache keys and if not find results..
  //  run one of callbacks search(sourceData,jsonpUrl or options.layer) and run this.showTooltip
  //
  //TODO change structure of _recordsCache
  //	like this: _recordsCache = {"text-key1": {loc:[lat,lng], ..other attributes.. }, {"text-key2": {loc:[lat,lng]}...}, ...}
  //	in this mode every record can have a free structure of attributes, only 'loc' is required
  //TODO important optimization!!! always append data in this._recordsCache
  //  now _recordsCache content is emptied and replaced with new data founded
  //  always appending data on _recordsCache give the possibility of caching ajax, jsonp and layersearch!
  //
  //TODO here insert function that search inputText FIRST in _recordsCache keys and if not find results..
  //  run one of callbacks search(sourceData,jsonpUrl or options.layer) and run this.showTooltip
  //
  //TODO change structure of _recordsCache
  //	like this: _recordsCache = {"text-key1": {loc:[lat,lng], ..other attributes.. }, {"text-key2": {loc:[lat,lng]}...}, ...}
  //	in this way every record can have a free structure of attributes, only 'loc' is required
  
  L.Control.Search = L.Control.extend({
      includes: L.Mixin.Events,
      //
      //	Name					Data passed			   Description
      //
      //Managed Events:
      //	search_locationfound	{latlng, title, layer} fired after moved and show markerLocation
      //	search_expanded			{}					   fired after control was expanded
      //  search_collapsed		{}					   fired after control was collapsed
      //
      //Public methods:
      //  setLayer()				L.LayerGroup()         set layer search at runtime
      //  showAlert()             'Text message'         show alert message
      //  searchText()			'Text searched'        search text by external code
      //
      options: {
          url: '',						//url for search by ajax request, ex: "search.php?q={s}". Can be function that returns string for dynamic parameter setting
          layer: null,					//layer where search markers(is a L.LayerGroup)
          sourceData: null,				//function that fill _recordsCache, passed searching text by first param and callback in second
          //TODO implements uniq option 'sourceData' that recognizes source type: url,array,callback or layer
          jsonpParam: null,				//jsonp param name for search by jsonp service, ex: "callback"
          propertyLoc: 'loc',			//field for remapping location, using array: ['latname','lonname'] for select double fields(ex. ['lat','lon'] ) support dotted format: 'prop.subprop.title'
          propertyName: 'title',		//property in marker.options(or feature.properties for vector layer) trough filter elements in layer,
          formatData: null,				//callback for reformat all data from source to indexed data object
          filterData: null,				//callback for filtering data from text searched, params: textSearch, allRecords
          moveToLocation: null,			//callback run on location found, params: latlng, title, map
          buildTip: null,				//function that return row tip html node(or html string), receive text tooltip in first param
          container: '',				//container id to insert Search Control
          zoom: null,					//default zoom level for move to location
          minLength: 1,					//minimal text length for autocomplete
          initial: true,				//search elements only by initial text
          casesensitive: false,			//search elements in case sensitive text
          autoType: true,				//complete input with first suggested result and select this filled-in text.
          delayType: 400,				//delay while typing for show tooltip
          tooltipLimit: -1,				//limit max results to show in tooltip. -1 for no limit.
          tipAutoSubmit: true,			//auto map panTo when click on tooltip
          firstTipSubmit: false,		//auto select first result con enter click
          autoResize: true,				//autoresize on input change
          collapsed: true,				//collapse search control at startup
          autoCollapse: false,			//collapse search control after submit(on button or on tips if enabled tipAutoSubmit)
          autoCollapseTime: 1200,		//delay for autoclosing alert and collapse after blur
          textErr: 'Location not found',	//error message
          textCancel: 'Cancel',		    //title in cancel button
          textPlaceholder: 'Search...',   //placeholder value
          position: 'topleft',
          hideMarkerOnCollapse: false,    //remove circle and marker on search control collapsed
          /*marker: {						//custom L.Marker or false for hide
              icon: false,				//custom L.Icon for maker location or false for hide
              animate: true,				//animate a circle over location found
              circle: {					//draw a circle in location found
                  radius: 10,
                  weight: 3,
                  color: '#e03',
                  stroke: true,
                  fill: false
              }
          }*/
      marker: false,
      },
  
      initialize: function(options) {
          L.Util.setOptions(this, options || {});
          this._inputMinSize = this.options.textPlaceholder ? this.options.textPlaceholder.length : 10;
          this._layer = this.options.layer || new L.LayerGroup();
          this._filterData = this.options.filterData || this._defaultFilterData;
          this._formatData = this.options.formatData || this._defaultFormatData;
          this._moveToLocation = this.options.moveToLocation || this._defaultMoveToLocation;
          this._autoTypeTmp = this.options.autoType;	//useful for disable autoType temporarily in delete/backspace keydown
          this._countertips = 0;		//number of tips items
          this._recordsCache = {};	//key,value table! that store locations! format: key,latlng
          this._curReq = null;
      },
  
      onAdd: function (map) {
          this._map = map;
          this._container = L.DomUtil.create('div', 'leaflet-control-search');
          this._input = this._createInput(this.options.textPlaceholder, 'search-input');
          this._tooltip = this._createTooltip('search-tooltip');
          this._cancel = this._createCancel(this.options.textCancel, 'search-cancel');
          this._button = this._createButton(this.options.textPlaceholder, 'search-button');
          this._alert = this._createAlert('search-alert');
  
          if(this.options.collapsed===false)
              this.expand(this.options.collapsed);
  
          if(this.options.marker) {
  
              if(this.options.marker instanceof L.Marker || this.options.marker instanceof L.CircleMarker)
                  this._markerSearch = this.options.marker;
  
              else if(_isObject(this.options.marker))
                  this._markerSearch = new L.Control.Search.Marker([0,0], this.options.marker);
  
              this._markerSearch._isMarkerSearch = true;
          }
  
          this.setLayer( this._layer );
  
          map.on({
              // 		'layeradd': this._onLayerAddRemove,
              // 		'layerremove': this._onLayerAddRemove
              'resize': this._handleAutoresize
              }, this);
          return this._container;
      },
      addTo: function (map) {
  
          if(this.options.container) {
              this._container = this.onAdd(map);
              this._wrapper = L.DomUtil.get(this.options.container);
              this._wrapper.style.position = 'relative';
              this._wrapper.appendChild(this._container);
          }
          else
              L.Control.prototype.addTo.call(this, map);
  
          return this;
      },
  
      onRemove: function(map) {
          this._recordsCache = {};
          // map.off({
          // 		'layeradd': this._onLayerAddRemove,
          // 		'layerremove': this._onLayerAddRemove
          // 	}, this);
      },
  
      // _onLayerAddRemove: function(e) {
      // 	//without this, run setLayer also for each Markers!! to optimize!
      // 	if(e.layer instanceof L.LayerGroup)
      // 		if( L.stamp(e.layer) != L.stamp(this._layer) )
      // 			this.setLayer(e.layer);
      // },
  
      setLayer: function(layer) {	//set search layer at runtime
          //this.options.layer = layer; //setting this, run only this._recordsFromLayer()
          this._layer = layer;
          //this._layer.addTo(this._map);
          return this;
      },
  
      showAlert: function(text) {
          text = text || this.options.textErr;
          this._alert.style.display = 'block';
          this._alert.innerHTML = text;
          clearTimeout(this.timerAlert);
          var that = this;
          this.timerAlert = setTimeout(function() {
              that.hideAlert();
          },this.options.autoCollapseTime);
          return this;
      },
  
      hideAlert: function() {
          this._alert.style.display = 'none';
          return this;
      },
  
      cancel: function() {
          this._input.value = '';
          this._handleKeypress({ keyCode: 8 });//simulate backspace keypress
          this._input.size = this._inputMinSize;
          this._input.focus();
          this._cancel.style.display = 'none';
          this._hideTooltip();
          return this;
      },
  
      expand: function(toggle) {
          toggle = typeof toggle === 'boolean' ? toggle : true;
          this._input.style.display = 'block';
          L.DomUtil.addClass(this._container, 'search-exp');
          if ( toggle !== false ) {
              this._input.focus();
              this._map.on('dragstart click', this.collapse, this);
          }
          this.fire('search_expanded');
          return this;
      },
  
      collapse: function() {
          this._hideTooltip();
          this.cancel();
          this._alert.style.display = 'none';
          this._input.blur();
          if(this.options.collapsed)
          {
              this._input.style.display = 'none';
              this._cancel.style.display = 'none';
              L.DomUtil.removeClass(this._container, 'search-exp');
              if (this.options.hideMarkerOnCollapse) {
                  this._map.removeLayer(this._markerSearch);
              }
              this._map.off('dragstart click', this.collapse, this);
          }
          this.fire('search_collapsed');
          return this;
      },
  
      collapseDelayed: function() {	//collapse after delay, used on_input blur
          if (!this.options.autoCollapse) return this;
          var that = this;
          clearTimeout(this.timerCollapse);
          this.timerCollapse = setTimeout(function() {
              that.collapse();
          }, this.options.autoCollapseTime);
          return this;
      },
  
      collapseDelayedStop: function() {
          clearTimeout(this.timerCollapse);
          return this;
      },
  
      ////start DOM creations
      _createAlert: function(className) {
          var alert = L.DomUtil.create('div', className, this._container);
          alert.style.display = 'none';
  
          L.DomEvent
              .on(alert, 'click', L.DomEvent.stop, this)
              .on(alert, 'click', this.hideAlert, this);
  
          return alert;
      },
  
      _createInput: function (text, className) {
          var label = L.DomUtil.create('label', className, this._container);
          var input = L.DomUtil.create('input', className, this._container);
          input.type = 'text';
          input.size = this._inputMinSize;
          input.value = '';
          input.autocomplete = 'off';
          input.autocorrect = 'off';
          input.autocapitalize = 'off';
          input.placeholder = text;
          input.style.display = 'none';
          input.role = 'search';
          input.id = input.role + input.type + input.size;
  
          label.htmlFor = input.id;
          label.style.display = 'none';
          label.value = text;
  
          L.DomEvent
              .disableClickPropagation(input)
              .on(input, 'keydown', this._handleKeypress, this)
              .on(input, 'blur', this.collapseDelayed, this)
              .on(input, 'focus', this.collapseDelayedStop, this);
  
          return input;
      },
  
      _createCancel: function (title, className) {
          var cancel = L.DomUtil.create('a', className, this._container);
          cancel.href = '#';
          cancel.title = title;
          cancel.style.display = 'none';
          cancel.innerHTML = "<span>&otimes;</span>";//imageless(see css)
  
          L.DomEvent
              .on(cancel, 'click', L.DomEvent.stop, this)
              .on(cancel, 'click', this.cancel, this);
  
          return cancel;
      },
  
      _createButton: function (title, className) {
          var button = L.DomUtil.create('a', className, this._container);
          button.href = '#';
          button.title = title;
  
          L.DomEvent
              .on(button, 'click', L.DomEvent.stop, this)
              .on(button, 'click', this._handleSubmit, this)
              .on(button, 'focus', this.collapseDelayedStop, this)
              .on(button, 'blur', this.collapseDelayed, this);
  
          return button;
      },
  
      _createTooltip: function(className) {
          var tool = L.DomUtil.create('ul', className, this._container);
          tool.style.display = 'none';
  
          var that = this;
          L.DomEvent
              .disableClickPropagation(tool)
              .on(tool, 'blur', this.collapseDelayed, this)
              .on(tool, 'mousewheel', function(e) {
                  that.collapseDelayedStop();
                  L.DomEvent.stopPropagation(e);//disable zoom map
              }, this)
              .on(tool, 'mouseover', function(e) {
                  that.collapseDelayedStop();
              }, this);
          return tool;
      },
  
      _createTip: function(text, val) {//val is object in recordCache, usually is Latlng
          var tip;
  
          if(this.options.buildTip)
          {
              tip = this.options.buildTip.call(this, text, val); //custom tip node or html string
              if(typeof tip === 'string')
              {
                  var tmpNode = L.DomUtil.create('div');
                  tmpNode.innerHTML = tip;
                  tip = tmpNode.firstChild;
              }
          }
          else
          {
              tip = L.DomUtil.create('li', '');
              tip.innerHTML = text;
          }
  
          L.DomUtil.addClass(tip, 'search-tip');
          tip._text = text; //value replaced in this._input and used by _autoType
  
          if(this.options.tipAutoSubmit)
              L.DomEvent
                  .disableClickPropagation(tip)
                  .on(tip, 'click', L.DomEvent.stop, this)
                  .on(tip, 'click', function(e) {
                      this._input.value = text;
                      this._handleAutoresize();
                      this._input.focus();
                      this._hideTooltip();
                      this._handleSubmit();
                  }, this);
  
          return tip;
      },
  
      //////end DOM creations
  
      _getUrl: function(text) {
          return (typeof this.options.url === 'function') ? this.options.url(text) : this.options.url;
      },
  
      _defaultFilterData: function(text, records) {
  
          var I, icase, regSearch, frecords = {};
  
          text = text.replace(/[.*+?^${}()|[\]\\]/g, '');  //sanitize remove all special characters
          if(text==='')
              return [];
  
          I = this.options.initial ? '^' : '';  //search only initial text
          icase = !this.options.casesensitive ? 'i' : undefined;
  
          regSearch = new RegExp(I + text, icase);
  
          //TODO use .filter or .map
          for(var key in records) {
              if( regSearch.test(key) )
                  frecords[key]= records[key];
          }
  
          return frecords;
      },
  
      showTooltip: function(records) {
          var tip;
  
          this._countertips = 0;
  
          this._tooltip.innerHTML = '';
          this._tooltip.currentSelection = -1;  //inizialized for _handleArrowSelect()
  
          for(var key in records)//fill tooltip
          {
              if(++this._countertips == this.options.tooltipLimit) break;
  
              tip = this._createTip(key, records[key] );
  
              this._tooltip.appendChild(tip);
          }
  
          if(this._countertips > 0)
          {
              this._tooltip.style.display = 'block';
              if(this._autoTypeTmp)
                  this._autoType();
              this._autoTypeTmp = this.options.autoType;//reset default value
          }
          else
              this._hideTooltip();
  
          this._tooltip.scrollTop = 0;
          return this._countertips;
      },
  
      _hideTooltip: function() {
          this._tooltip.style.display = 'none';
          this._tooltip.innerHTML = '';
          return 0;
      },
  
      _defaultFormatData: function(json) {	//default callback for format data to indexed data
          var propName = this.options.propertyName,
              propLoc = this.options.propertyLoc,
              i, jsonret = {};
  
          if( L.Util.isArray(propLoc) )
              for(i in json)
                  jsonret[ _getPath(json[i],propName) ]= L.latLng( json[i][ propLoc[0] ], json[i][ propLoc[1] ] );
          else
              for(i in json)
                  jsonret[ _getPath(json[i],propName) ]= L.latLng( _getPath(json[i],propLoc) );
          //TODO throw new Error("propertyName '"+propName+"' not found in JSON data");
          return jsonret;
      },
  
      _recordsFromJsonp: function(text, callAfter) {  //extract searched records from remote jsonp service
          L.Control.Search.callJsonp = callAfter;
          var script = L.DomUtil.create('script','leaflet-search-jsonp', document.getElementsByTagName('body')[0] ),
              url = L.Util.template(this._getUrl(text)+'&'+this.options.jsonpParam+'=L.Control.Search.callJsonp', {s: text}); //parsing url
              //rnd = '&_='+Math.floor(Math.random()*10000);
              //TODO add rnd param or randomize callback name! in recordsFromJsonp
          script.type = 'text/javascript';
          script.src = url;
          return { abort: function() { script.parentNode.removeChild(script); } };
      },
  
      _recordsFromAjax: function(text, callAfter) {	//Ajax request
        //console.log("_recordsFromAjax");
          if (window.XMLHttpRequest === undefined) {
              window.XMLHttpRequest = function() {
                  try { return new ActiveXObject("Microsoft.XMLHTTP.6.0"); }
                  catch  (e1) {
                      try { return new ActiveXObject("Microsoft.XMLHTTP.3.0"); }
                      catch (e2) { throw new Error("XMLHttpRequest is not supported"); }
                  }
              };
          }
          var IE8or9 = ( L.Browser.ie && !window.atob && document.querySelector ),
              request = IE8or9 ? new XDomainRequest() : new XMLHttpRequest(),
              url = L.Util.template(this._getUrl(text), {s: text});
  
          //rnd = '&_='+Math.floor(Math.random()*10000);
          //TODO add rnd param or randomize callback name! in recordsFromAjax
  
          request.open("GET", url);
          var that = this;
  
          request.onload = function() {
              callAfter( JSON.parse(request.responseText) );
          };
          request.onreadystatechange = function() {
              if(request.readyState === 4 && request.status === 200) {
                  this.onload();
              }
          };
  
          request.send();
          return request;
      },
  
      _recordsFromLayer: function() {	//return table: key,value from layer
          var that = this,
              retRecords = {},
              propName = this.options.propertyName,
              loc;
              //console.log("_recordsFromLayer");
          this._layer.eachLayer(function(layer) {
  
              if(layer.hasOwnProperty('_isMarkerSearch')) return;
  
              if(layer instanceof L.Marker || layer instanceof L.CircleMarker)
              {
                  try {
                      if(_getPath(layer.options,propName))
                      {
                          loc = layer.getLatLng();
                          loc.layer = layer;
                          retRecords[ _getPath(layer.options,propName) ] = loc;
  
                      }
                      else if(_getPath(layer.feature.properties,propName)){
  
                          loc = layer.getLatLng();
                          loc.layer = layer;
                          retRecords[ _getPath(layer.feature.properties,propName) ] = loc;
  
                      }
                      else
                          throw new Error("propertyName '"+propName+"' not found in marker");
  
                  }
                  catch(err){
                      if (console) { console.warn(err); }
                  }
              }
              else if(layer.hasOwnProperty('feature'))//GeoJSON
              {
                  try {
                      if(layer.feature.properties.hasOwnProperty(propName))
                      {
                          loc = layer.getBounds().getCenter();
                          loc.layer = layer;
                          retRecords[ layer.feature.properties[propName] ] = loc;
                      }
                      else
                          throw new Error("propertyName '"+propName+"' not found in feature");
                  }
                  catch(err){
                      if (console) { console.warn(err); }
                  }
              }
              else if(layer instanceof L.LayerGroup)
              {
                  //TODO: Optimize
                  /*layer.eachLayer(function(m) {
                      loc = m.getLatLng();
                      loc.layer = m;
                      retRecords[ m.feature.properties[propName] ] = loc;
                  });*/
                  layer.eachLayer(function(m) {
                      //console.log(m)
                      if (m._latlng) {
                        //console.log('point found');
                        loc = m._latlng;
                      }
                      if (m._latlngs) {
                        //console.log('non-point found');
                        loc = m.getBounds().getCenter();
                      }
                      //console.log(loc);
                      loc.layer = m;
                      retRecords[ m.feature.properties[propName] ] = loc;
                  });
              }
  
          },this);
  
          return retRecords;
      },
  
      _autoType: function() {
  
          //TODO implements autype without selection(useful for mobile device)
  
          var start = this._input.value.length,
              firstRecord = this._tooltip.firstChild._text,
              end = firstRecord.length;
  
          if (firstRecord.indexOf(this._input.value) === 0) { // If prefix match
              this._input.value = firstRecord;
              this._handleAutoresize();
  
              if (this._input.createTextRange) {
                  var selRange = this._input.createTextRange();
                  selRange.collapse(true);
                  selRange.moveStart('character', start);
                  selRange.moveEnd('character', end);
                  selRange.select();
              }
              else if(this._input.setSelectionRange) {
                  this._input.setSelectionRange(start, end);
              }
              else if(this._input.selectionStart) {
                  this._input.selectionStart = start;
                  this._input.selectionEnd = end;
              }
          }
      },
  
      _hideAutoType: function() {	// deselect text:
  
          var sel;
          if ((sel = this._input.selection) && sel.empty) {
              sel.empty();
          }
          else if (this._input.createTextRange) {
              sel = this._input.createTextRange();
              sel.collapse(true);
              var end = this._input.value.length;
              sel.moveStart('character', end);
              sel.moveEnd('character', end);
              sel.select();
          }
          else {
              if (this._input.getSelection) {
                  this._input.getSelection().removeAllRanges();
              }
              this._input.selectionStart = this._input.selectionEnd;
          }
      },
  
      _handleKeypress: function (e) {	//run _input keyup event
  
          switch(e.keyCode)
          {
              case 27://Esc
                  this.collapse();
              break;
              case 13://Enter
                  if(this._countertips == 1 || (this.options.firstTipSubmit && this._countertips > 0))
                      this._handleArrowSelect(1);
                  this._handleSubmit();	//do search
              break;
              case 38://Up
                  this._handleArrowSelect(-1);
              break;
              case 40://Down
                  this._handleArrowSelect(1);
              break;
              case  8://Backspace
              case 45://Insert
              case 46://Delete
                  this._autoTypeTmp = false;//disable temporarily autoType
              break;
              case 37://Left
              case 39://Right
              case 16://Shift
              case 17://Ctrl
              case 35://End
              case 36://Home
              break;
              default://All keys
  
                  if(this._input.value.length)
                      this._cancel.style.display = 'block';
                  else
                      this._cancel.style.display = 'none';
  
                  if(this._input.value.length >= this.options.minLength)
                  {
                      var that = this;
  
                      clearTimeout(this.timerKeypress);	//cancel last search request while type in
                      this.timerKeypress = setTimeout(function() {	//delay before request, for limit jsonp/ajax request
  
                          that._fillRecordsCache();
  
                      }, this.options.delayType);
                  }
                  else
                      this._hideTooltip();
          }
  
          this._handleAutoresize();
      },
  
      searchText: function(text) {
          var code = text.charCodeAt(text.length);
            //console.log("searchText");
          this._input.value = text;
  
          this._input.style.display = 'block';
          L.DomUtil.addClass(this._container, 'search-exp');
  
          this._autoTypeTmp = false;
  
          this._handleKeypress({keyCode: code});
      },
  
      _fillRecordsCache: function() {
        //console.log("_fillRecordsCache");
        sidebar.hide();
          var inputText = this._input.value,
              that = this, records;
  
          if(this._curReq && this._curReq.abort)
              this._curReq.abort();
          //abort previous requests
  
          L.DomUtil.addClass(this._container, 'search-load');
  
          if(this.options.layer)
          {
              //TODO _recordsFromLayer must return array of objects, formatted from _formatData
              this._recordsCache = this._recordsFromLayer();
  
              records = this._filterData( this._input.value, this._recordsCache );
  
              this.showTooltip( records );
  
              L.DomUtil.removeClass(this._container, 'search-load');
          }
          else
          {
              if(this.options.sourceData)
                  this._retrieveData = this.options.sourceData;
  
              else if(this.options.url)	//jsonp or ajax
                  this._retrieveData = this.options.jsonpParam ? this._recordsFromJsonp : this._recordsFromAjax;
  
              this._curReq = this._retrieveData.call(this, inputText, function(data) {
  
                  that._recordsCache = that._formatData(data);
  
                  //TODO refact!
                  if(that.options.sourceData)
                      records = that._filterData( that._input.value, that._recordsCache );
                  else
                      records = that._recordsCache;
  
                  that.showTooltip( records );
  
                  L.DomUtil.removeClass(that._container, 'search-load');
              });
          }
      },
  
      _handleAutoresize: function() {	//autoresize this._input
          //TODO refact _handleAutoresize now is not accurate
          if (this._input.style.maxWidth != this._map._container.offsetWidth) //If maxWidth isn't the same as when first set, reset to current Map width
              this._input.style.maxWidth = L.DomUtil.getStyle(this._map._container, 'width');
  
          if(this.options.autoResize && (this._container.offsetWidth + 45 < this._map._container.offsetWidth))
              this._input.size = this._input.value.length<this._inputMinSize ? this._inputMinSize : this._input.value.length;
      },
  
      _handleArrowSelect: function(velocity) {
        console.log("_handleArrowSelect");
          var searchTips = this._tooltip.hasChildNodes() ? this._tooltip.childNodes : [];
  
          for (i=0; i<searchTips.length; i++)
              L.DomUtil.removeClass(searchTips[i], 'search-tip-select');
  
          if ((velocity == 1 ) && (this._tooltip.currentSelection >= (searchTips.length - 1))) {// If at end of list.
              L.DomUtil.addClass(searchTips[this._tooltip.currentSelection], 'search-tip-select');
          }
          else if ((velocity == -1 ) && (this._tooltip.currentSelection <= 0)) { // Going back up to the search box.
              this._tooltip.currentSelection = -1;
          }
          else if (this._tooltip.style.display != 'none') {
              this._tooltip.currentSelection += velocity;
  
              L.DomUtil.addClass(searchTips[this._tooltip.currentSelection], 'search-tip-select');
  
              this._input.value = searchTips[this._tooltip.currentSelection]._text;
  
              // scroll:
              var tipOffsetTop = searchTips[this._tooltip.currentSelection].offsetTop;
  
              if (tipOffsetTop + searchTips[this._tooltip.currentSelection].clientHeight >= this._tooltip.scrollTop + this._tooltip.clientHeight) {
                  this._tooltip.scrollTop = tipOffsetTop - this._tooltip.clientHeight + searchTips[this._tooltip.currentSelection].clientHeight;
              }
              else if (tipOffsetTop <= this._tooltip.scrollTop) {
                  this._tooltip.scrollTop = tipOffsetTop;
              }
          }
      },
  
      _handleSubmit: function() {	//button and tooltip click and enter submit
        console.log("_handleSubmit");
          this._hideAutoType();
  
          this.hideAlert();
          this._hideTooltip();
  
          if(this._input.style.display == 'none')	//on first click show _input only
              this.expand();
          else
          {
              if(this._input.value === '')	//hide _input only
                  this.collapse();
              else
              {
                  var loc = this._getLocation(this._input.value);
  
                  if(loc===false)
                      this.showAlert();
                  else
                  {
                      this.showLocation(loc, this._input.value);
                      this.fire('search_locationfound', {
                              latlng: loc,
                              text: this._input.value,
                              layer: loc.layer ? loc.layer : null
                          });
                  }
              }
          }
      },
  
      _getLocation: function(key) {	//extract latlng from _recordsCache
  
          if( this._recordsCache.hasOwnProperty(key) )
              return this._recordsCache[key];//then after use .loc attribute
          else
              return false;
      },
  
      _defaultMoveToLocation: function(latlng, title, map) {
          if(this.options.zoom)
               this._map.setView(latlng, this.options.zoom);
           else
              this._map.panTo(latlng);
      },
  
      showLocation: function(latlng, title) {	//set location on map from _recordsCache
          var self = this;
  
          self._map.once('moveend zoomend', function(e) {
  
              if(self._markerSearch) {
                  self._markerSearch.addTo(self._map).setLatLng(latlng);
              }
  
          });
  
          self._moveToLocation(latlng, title, self._map);
          //FIXME autoCollapse option hide self._markerSearch before that visualized!!
          if(self.options.autoCollapse)
              self.collapse();
  
          return self;
      }
  });
  
  L.Control.Search.Marker = L.Marker.extend({
  
      includes: L.Mixin.Events,
  
      options: {
          icon: new L.Icon.Default(),
          animate: true,
          circle: {
              radius: 10,
              weight: 3,
              color: '#e03',
              stroke: true,
              fill: false
          }
      },
  
      initialize: function (latlng, options) {
          L.setOptions(this, options);
  
          if(options.icon === true)
              options.icon = new L.Icon.Default();
  
          L.Marker.prototype.initialize.call(this, latlng, options);
  
          if( _isObject(this.options.circle) )
              this._circleLoc = new L.CircleMarker(latlng, this.options.circle);
      },
  
      onAdd: function (map) {
          L.Marker.prototype.onAdd.call(this, map);
          if(this._circleLoc) {
              map.addLayer(this._circleLoc);
              if(this.options.animate)
                  this.animate();
          }
      },
  
      onRemove: function (map) {
          L.Marker.prototype.onRemove.call(this, map);
          if(this._circleLoc)
              map.removeLayer(this._circleLoc);
      },
  
      setLatLng: function (latlng) {
          L.Marker.prototype.setLatLng.call(this, latlng);
          if(this._circleLoc)
              this._circleLoc.setLatLng(latlng);
          return this;
      },
  
      _initIcon: function () {
          if(this.options.icon)
              L.Marker.prototype._initIcon.call(this);
      },
  
      _removeIcon: function () {
          if(this.options.icon)
              L.Marker.prototype._removeIcon.call(this);
      },
  
      animate: function() {
      //TODO refact animate() more smooth! like this: http://goo.gl/DDlRs
          if(this._circleLoc)
          {
              var circle = this._circleLoc,
                  tInt = 200,	//time interval
                  ss = 5,	//frames
                  mr = parseInt(circle._radius/ss),
                  oldrad = this.options.circle.radius,
                  newrad = circle._radius * 2,
                  acc = 0;
  
              circle._timerAnimLoc = setInterval(function() {
                  acc += 0.5;
                  mr += acc;	//adding acceleration
                  newrad -= mr;
  
                  circle.setRadius(newrad);
  
                  if(newrad<oldrad)
                  {
                      clearInterval(circle._timerAnimLoc);
                      circle.setRadius(oldrad);//reset radius
                      //if(typeof afterAnimCall == 'function')
                          //afterAnimCall();
                          //TODO use create event 'animateEnd' in L.Control.Search.Marker
                  }
              }, tInt);
          }
  
          return this;
      }
  });
  
  L.Map.addInitHook(function () {
      if (this.options.searchControl) {
          this.searchControl = L.control.search(this.options.searchControl);
          this.addControl(this.searchControl);
      }
  });
  
  L.control.search = function (options) {
      return new L.Control.Search(options);
  };
  
  return L.Control.Search;
  
  });
  
  /*
      Leaflet.label, a plugin that adds labels to markers and vectors for Leaflet powered maps.
      (c) 2012-2013, Jacob Toye, Smartrak
  
      https://github.com/Leaflet/Leaflet.label
      http://leafletjs.com
      https://github.com/jacobtoye
  */
  (function(){L.labelVersion="0.2.1-dev",L.Label=L.Class.extend({includes:L.Mixin.Events,options:{className:"",clickable:!1,direction:"right",noHide:!1,offset:[12,-15],opacity:1,zoomAnimation:!0},initialize:function(t,e){L.setOptions(this,t),this._source=e,this._animated=L.Browser.any3d&&this.options.zoomAnimation,this._isOpen=!1},onAdd:function(t){this._map=t,this._pane=this._source instanceof L.Marker?t._panes.markerPane:t._panes.popupPane,this._container||this._initLayout(),this._pane.appendChild(this._container),this._initInteraction(),this._update(),this.setOpacity(this.options.opacity),t.on("moveend",this._onMoveEnd,this).on("viewreset",this._onViewReset,this),this._animated&&t.on("zoomanim",this._zoomAnimation,this),L.Browser.touch&&!this.options.noHide&&L.DomEvent.on(this._container,"click",this.close,this)},onRemove:function(t){this._pane.removeChild(this._container),t.off({zoomanim:this._zoomAnimation,moveend:this._onMoveEnd,viewreset:this._onViewReset},this),this._removeInteraction(),this._map=null},setLatLng:function(t){return this._latlng=L.latLng(t),this._map&&this._updatePosition(),this},setContent:function(t){return this._previousContent=this._content,this._content=t,this._updateContent(),this},close:function(){var t=this._map;t&&(L.Browser.touch&&!this.options.noHide&&L.DomEvent.off(this._container,"click",this.close),t.removeLayer(this))},updateZIndex:function(t){this._zIndex=t,this._container&&this._zIndex&&(this._container.style.zIndex=t)},setOpacity:function(t){this.options.opacity=t,this._container&&L.DomUtil.setOpacity(this._container,t)},_initLayout:function(){this._container=L.DomUtil.create("div","leaflet-label "+this.options.className+" leaflet-zoom-animated"),this.updateZIndex(this._zIndex)},_update:function(){this._map&&(this._container.style.visibility="hidden",this._updateContent(),this._updatePosition(),this._container.style.visibility="")},_updateContent:function(){this._content&&this._map&&this._prevContent!==this._content&&"string"==typeof this._content&&(this._container.innerHTML=this._content,this._prevContent=this._content,this._labelWidth=this._container.offsetWidth)},_updatePosition:function(){var t=this._map.latLngToLayerPoint(this._latlng);this._setPosition(t)},_setPosition:function(t){var e=this._map,i=this._container,n=e.latLngToContainerPoint(e.getCenter()),o=e.layerPointToContainerPoint(t),s=this.options.direction,a=this._labelWidth,l=L.point(this.options.offset);"right"===s||"auto"===s&&o.x<n.x?(L.DomUtil.addClass(i,"leaflet-label-right"),L.DomUtil.removeClass(i,"leaflet-label-left"),t=t.add(l)):(L.DomUtil.addClass(i,"leaflet-label-left"),L.DomUtil.removeClass(i,"leaflet-label-right"),t=t.add(L.point(-l.x-a,l.y))),L.DomUtil.setPosition(i,t)},_zoomAnimation:function(t){var e=this._map._latLngToNewLayerPoint(this._latlng,t.zoom,t.center).round();this._setPosition(e)},_onMoveEnd:function(){this._animated&&"auto"!==this.options.direction||this._updatePosition()},_onViewReset:function(t){t&&t.hard&&this._update()},_initInteraction:function(){if(this.options.clickable){var t=this._container,e=["dblclick","mousedown","mouseover","mouseout","contextmenu"];L.DomUtil.addClass(t,"leaflet-clickable"),L.DomEvent.on(t,"click",this._onMouseClick,this);for(var i=0;e.length>i;i++)L.DomEvent.on(t,e[i],this._fireMouseEvent,this)}},_removeInteraction:function(){if(this.options.clickable){var t=this._container,e=["dblclick","mousedown","mouseover","mouseout","contextmenu"];L.DomUtil.removeClass(t,"leaflet-clickable"),L.DomEvent.off(t,"click",this._onMouseClick,this);for(var i=0;e.length>i;i++)L.DomEvent.off(t,e[i],this._fireMouseEvent,this)}},_onMouseClick:function(t){this.hasEventListeners(t.type)&&L.DomEvent.stopPropagation(t),this.fire(t.type,{originalEvent:t})},_fireMouseEvent:function(t){this.fire(t.type,{originalEvent:t}),"contextmenu"===t.type&&this.hasEventListeners(t.type)&&L.DomEvent.preventDefault(t),"mousedown"!==t.type?L.DomEvent.stopPropagation(t):L.DomEvent.preventDefault(t)}}),L.BaseMarkerMethods={showLabel:function(){return this.label&&this._map&&(this.label.setLatLng(this._latlng),this._map.showLabel(this.label)),this},hideLabel:function(){return this.label&&this.label.close(),this},setLabelNoHide:function(t){this._labelNoHide!==t&&(this._labelNoHide=t,t?(this._removeLabelRevealHandlers(),this.showLabel()):(this._addLabelRevealHandlers(),this.hideLabel()))},bindLabel:function(t,e){var i=this.options.icon?this.options.icon.options.labelAnchor:this.options.labelAnchor,n=L.point(i)||L.point(0,0);return n=n.add(L.Label.prototype.options.offset),e&&e.offset&&(n=n.add(e.offset)),e=L.Util.extend({offset:n},e),this._labelNoHide=e.noHide,this.label||(this._labelNoHide||this._addLabelRevealHandlers(),this.on("remove",this.hideLabel,this).on("move",this._moveLabel,this).on("add",this._onMarkerAdd,this),this._hasLabelHandlers=!0),this.label=new L.Label(e,this).setContent(t),this},unbindLabel:function(){return this.label&&(this.hideLabel(),this.label=null,this._hasLabelHandlers&&(this._labelNoHide||this._removeLabelRevealHandlers(),this.off("remove",this.hideLabel,this).off("move",this._moveLabel,this).off("add",this._onMarkerAdd,this)),this._hasLabelHandlers=!1),this},updateLabelContent:function(t){this.label&&this.label.setContent(t)},getLabel:function(){return this.label},_onMarkerAdd:function(){this._labelNoHide&&this.showLabel()},_addLabelRevealHandlers:function(){this.on("mouseover",this.showLabel,this).on("mouseout",this.hideLabel,this),L.Browser.touch&&this.on("click",this.showLabel,this)},_removeLabelRevealHandlers:function(){this.off("mouseover",this.showLabel,this).off("mouseout",this.hideLabel,this),L.Browser.touch&&this.off("click",this.showLabel,this)},_moveLabel:function(t){this.label.setLatLng(t.latlng)}},L.Icon.Default.mergeOptions({labelAnchor:new L.Point(9,-20)}),L.Marker.mergeOptions({icon:new L.Icon.Default}),L.Marker.include(L.BaseMarkerMethods),L.Marker.include({_originalUpdateZIndex:L.Marker.prototype._updateZIndex,_updateZIndex:function(t){var e=this._zIndex+t;this._originalUpdateZIndex(t),this.label&&this.label.updateZIndex(e)},_originalSetOpacity:L.Marker.prototype.setOpacity,setOpacity:function(t,e){this.options.labelHasSemiTransparency=e,this._originalSetOpacity(t)},_originalUpdateOpacity:L.Marker.prototype._updateOpacity,_updateOpacity:function(){var t=0===this.options.opacity?0:1;this._originalUpdateOpacity(),this.label&&this.label.setOpacity(this.options.labelHasSemiTransparency?this.options.opacity:t)},_originalSetLatLng:L.Marker.prototype.setLatLng,setLatLng:function(t){return this.label&&!this._labelNoHide&&this.hideLabel(),this._originalSetLatLng(t)}}),L.CircleMarker.mergeOptions({labelAnchor:new L.Point(0,0)}),L.CircleMarker.include(L.BaseMarkerMethods),L.Path.include({bindLabel:function(t,e){return this.label&&this.label.options===e||(this.label=new L.Label(e,this)),this.label.setContent(t),this._showLabelAdded||(this.on("mouseover",this._showLabel,this).on("mousemove",this._moveLabel,this).on("mouseout remove",this._hideLabel,this),L.Browser.touch&&this.on("click",this._showLabel,this),this._showLabelAdded=!0),this},unbindLabel:function(){return this.label&&(this._hideLabel(),this.label=null,this._showLabelAdded=!1,this.off("mouseover",this._showLabel,this).off("mousemove",this._moveLabel,this).off("mouseout remove",this._hideLabel,this)),this},updateLabelContent:function(t){this.label&&this.label.setContent(t)},_showLabel:function(t){this.label.setLatLng(t.latlng),this._map.showLabel(this.label)},_moveLabel:function(t){this.label.setLatLng(t.latlng)},_hideLabel:function(){this.label.close()}}),L.Map.include({showLabel:function(t){return this.addLayer(t)}}),L.FeatureGroup.include({clearLayers:function(){return this.unbindLabel(),this.eachLayer(this.removeLayer,this),this},bindLabel:function(t,e){return this.invoke("bindLabel",t,e)},unbindLabel:function(){return this.invoke("unbindLabel")},updateLabelContent:function(t){this.invoke("updateLabelContent",t)}})})(this,document);
  (function (root, factory) {
      if (typeof define === 'function' && define.amd) {
          // AMD. Register as an anonymous module.
          define(['leaflet'], factory);
      } else {
          // Assume leaflet is loaded into global object L already
          factory(L);
      }
  }(this, function (L) {
      'use strict';
  
      L.TileLayer.Provider = L.TileLayer.extend({
          initialize: function (arg, options) {
              var providers = L.TileLayer.Provider.providers;
  
              var parts = arg.split('.');
  
              var providerName = parts[0];
              var variantName = parts[1];
  
              if (!providers[providerName]) {
                  throw 'No such provider (' + providerName + ')';
              }
  
              var provider = {
                  url: providers[providerName].url,
                  options: providers[providerName].options
              };
  
              // overwrite values in provider from variant.
              if (variantName && 'variants' in providers[providerName]) {
                  if (!(variantName in providers[providerName].variants)) {
                      throw 'No such variant of ' + providerName + ' (' + variantName + ')';
                  }
                  var variant = providers[providerName].variants[variantName];
                  var variantOptions;
                  if (typeof variant === 'string') {
                      variantOptions = {
                          variant: variant
                      };
                  } else {
                      variantOptions = variant.options;
                  }
                  provider = {
                      url: variant.url || provider.url,
                      options: L.Util.extend({}, provider.options, variantOptions)
                  };
              } else if (typeof provider.url === 'function') {
                  provider.url = provider.url(parts.splice(1, parts.length - 1).join('.'));
              }
  
              var forceHTTP = window.location.protocol === 'file:' || provider.options.forceHTTP;
              if (provider.url.indexOf('//') === 0 && forceHTTP) {
                  provider.url = 'http:' + provider.url;
              }
  
              // replace attribution placeholders with their values from toplevel provider attribution,
              // recursively
              var attributionReplacer = function (attr) {
                  if (attr.indexOf('{attribution.') === -1) {
                      return attr;
                  }
                  return attr.replace(/\{attribution.(\w*)\}/,
                      function (match, attributionName) {
                          return attributionReplacer(providers[attributionName].options.attribution);
                      }
                  );
              };
              provider.options.attribution = attributionReplacer(provider.options.attribution);
  
              // Compute final options combining provider options with any user overrides
              var layerOpts = L.Util.extend({}, provider.options, options);
              L.TileLayer.prototype.initialize.call(this, provider.url, layerOpts);
          }
      });
  
      /**
       * Definition of providers.
       * see http://leafletjs.com/reference.html#tilelayer for options in the options map.
       */
  
      L.TileLayer.Provider.providers = {
          OpenStreetMap: {
              url: '//{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
              options: {
                  maxZoom: 19,
                  attribution:
                      '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              },
              variants: {
                  Mapnik: {},
                  BlackAndWhite: {
                      url: 'http://{s}.tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png',
                      options: {
                          maxZoom: 18
                      }
                  },
                  DE: {
                      url: 'http://{s}.tile.openstreetmap.de/tiles/osmde/{z}/{x}/{y}.png',
                      options: {
                          maxZoom: 18
                      }
                  },
                  France: {
                      url: 'http://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png',
                      options: {
                          attribution: '&copy; Openstreetmap France | {attribution.OpenStreetMap}'
                      }
                  },
                  HOT: {
                      url: 'http://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
                      options: {
                          attribution: '{attribution.OpenStreetMap}, Tiles courtesy of <a href="http://hot.openstreetmap.org/" target="_blank">Humanitarian OpenStreetMap Team</a>'
                      }
                  }
              }
          },
          OpenSeaMap: {
              url: 'http://tiles.openseamap.org/seamark/{z}/{x}/{y}.png',
              options: {
                  attribution: 'Map data: &copy; <a href="http://www.openseamap.org">OpenSeaMap</a> contributors'
              }
          },
          OpenTopoMap: {
              url: '//{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
              options: {
                  maxZoom: 16,
                  attribution: 'Map data: {attribution.OpenStreetMap}, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
              }
          },
          Thunderforest: {
              url: '//{s}.tile.thunderforest.com/{variant}/{z}/{x}/{y}.png',
              options: {
                  attribution:
                      '&copy; <a href="http://www.opencyclemap.org">OpenCycleMap</a>, {attribution.OpenStreetMap}',
                  variant: 'cycle'
              },
              variants: {
                  OpenCycleMap: 'cycle',
                  Transport: {
                      options: {
                          variant: 'transport',
                          maxZoom: 19
                      }
                  },
                  TransportDark: {
                      options: {
                          variant: 'transport-dark',
                          maxZoom: 19
                      }
                  },
                  Landscape: 'landscape',
                  Outdoors: 'outdoors'
              }
          },
          OpenMapSurfer: {
              url: 'http://openmapsurfer.uni-hd.de/tiles/{variant}/x={x}&y={y}&z={z}',
              options: {
                  maxZoom: 20,
                  variant: 'roads',
                  attribution: 'Imagery from <a href="http://giscience.uni-hd.de/">GIScience Research Group @ University of Heidelberg</a> &mdash; Map data {attribution.OpenStreetMap}'
              },
              variants: {
                  Roads: 'roads',
                  AdminBounds: {
                      options: {
                          variant: 'adminb',
                          maxZoom: 19
                      }
                  },
                  Grayscale: {
                      options: {
                          variant: 'roadsg',
                          maxZoom: 19
                      }
                  }
              }
          },
          Hydda: {
              url: 'http://{s}.tile.openstreetmap.se/hydda/{variant}/{z}/{x}/{y}.png',
              options: {
                  variant: 'full',
                  attribution: 'Tiles courtesy of <a href="http://openstreetmap.se/" target="_blank">OpenStreetMap Sweden</a> &mdash; Map data {attribution.OpenStreetMap}'
              },
              variants: {
                  Full: 'full',
                  Base: 'base',
                  RoadsAndLabels: 'roads_and_labels'
              }
          },
          MapQuestOpen: {
              /* Mapquest does support https, but with a different subdomain:
               * https://otile{s}-s.mqcdn.com/tiles/1.0.0/{type}/{z}/{x}/{y}.{ext}
               * which makes implementing protocol relativity impossible.
               */
              url: 'http://otile{s}.mqcdn.com/tiles/1.0.0/{type}/{z}/{x}/{y}.{ext}',
              options: {
                  type: 'map',
                  ext: 'jpg',
                  attribution:
                      'Tiles Courtesy of <a href="http://www.mapquest.com/">MapQuest</a> &mdash; ' +
                      'Map data {attribution.OpenStreetMap}',
                  subdomains: '1234'
              },
              variants: {
                  OSM: {},
                  Aerial: {
                      options: {
                          type: 'sat',
                          attribution:
                              'Tiles Courtesy of <a href="http://www.mapquest.com/">MapQuest</a> &mdash; ' +
                              'Portions Courtesy NASA/JPL-Caltech and U.S. Depart. of Agriculture, Farm Service Agency'
                      }
                  },
                  HybridOverlay: {
                      options: {
                          type: 'hyb',
                          ext: 'png',
                          opacity: 0.9
                      }
                  }
              }
          },
          MapBox: {
              url: '//api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}',
              options: {
                  attribution:
                      'Imagery from <a href="http://mapbox.com/about/maps/">MapBox</a> &mdash; ' +
                      'Map data {attribution.OpenStreetMap}',
                  subdomains: 'abcd'
              }
          },
          Stamen: {
              url: '//stamen-tiles-{s}.a.ssl.fastly.net/{variant}/{z}/{x}/{y}.png',
              options: {
                  attribution:
                      'Map tiles by <a href="http://stamen.com">Stamen Design</a>, ' +
                      '<a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; ' +
                      'Map data {attribution.OpenStreetMap}',
                  subdomains: 'abcd',
                  minZoom: 0,
                  maxZoom: 20,
                  variant: 'toner',
                  ext: 'png'
              },
              variants: {
                  Toner: 'toner',
                  TonerBackground: 'toner-background',
                  TonerHybrid: 'toner-hybrid',
                  TonerLines: 'toner-lines',
                  TonerLabels: 'toner-labels',
                  TonerLite: 'toner-lite',
                  Watercolor: {
                      options: {
                          variant: 'watercolor',
                          minZoom: 1,
                          maxZoom: 16
                      }
                  },
                  Terrain: {
                      options: {
                          variant: 'terrain',
                          minZoom: 4,
                          maxZoom: 18,
                          bounds: [[22, -132], [70, -56]]
                      }
                  },
                  TerrainBackground: {
                      options: {
                          variant: 'terrain-background',
                          minZoom: 4,
                          maxZoom: 18,
                          bounds: [[22, -132], [70, -56]]
                      }
                  },
                  TopOSMRelief: {
                      options: {
                          variant: 'toposm-color-relief',
                          ext: 'jpg',
                          bounds: [[22, -132], [51, -56]]
                      }
                  },
                  TopOSMFeatures: {
                      options: {
                          variant: 'toposm-features',
                          bounds: [[22, -132], [51, -56]],
                          opacity: 0.9
                      }
                  }
              }
          },
          Esri: {
              url: '//server.arcgisonline.com/ArcGIS/rest/services/{variant}/MapServer/tile/{z}/{y}/{x}',
              options: {
                  variant: 'World_Street_Map',
                  attribution: 'Tiles &copy; Esri'
              },
              variants: {
                  WorldStreetMap: {
                      options: {
                          attribution:
                              '{attribution.Esri} &mdash; ' +
                              'Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012'
                      }
                  },
                  DeLorme: {
                      options: {
                          variant: 'Specialty/DeLorme_World_Base_Map',
                          minZoom: 1,
                          maxZoom: 11,
                          attribution: '{attribution.Esri} &mdash; Copyright: &copy;2012 DeLorme'
                      }
                  },
                  WorldTopoMap: {
                      options: {
                          variant: 'World_Topo_Map',
                          attribution:
                              '{attribution.Esri} &mdash; ' +
                              'Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community'
                      }
                  },
                  WorldImagery: {
                      options: {
                          variant: 'World_Imagery',
                          attribution:
                              '{attribution.Esri} &mdash; ' +
                              'Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
                      }
                  },
                  WorldTerrain: {
                      options: {
                          variant: 'World_Terrain_Base',
                          maxZoom: 13,
                          attribution:
                              '{attribution.Esri} &mdash; ' +
                              'Source: USGS, Esri, TANA, DeLorme, and NPS'
                      }
                  },
                  WorldShadedRelief: {
                      options: {
                          variant: 'World_Shaded_Relief',
                          maxZoom: 13,
                          attribution: '{attribution.Esri} &mdash; Source: Esri'
                      }
                  },
                  WorldPhysical: {
                      options: {
                          variant: 'World_Physical_Map',
                          maxZoom: 8,
                          attribution: '{attribution.Esri} &mdash; Source: US National Park Service'
                      }
                  },
                  OceanBasemap: {
                      options: {
                          variant: 'Ocean_Basemap',
                          maxZoom: 13,
                          attribution: '{attribution.Esri} &mdash; Sources: GEBCO, NOAA, CHS, OSU, UNH, CSUMB, National Geographic, DeLorme, NAVTEQ, and Esri'
                      }
                  },
                  NatGeoWorldMap: {
                      options: {
                          variant: 'NatGeo_World_Map',
                          maxZoom: 16,
                          attribution: '{attribution.Esri} &mdash; National Geographic, Esri, DeLorme, NAVTEQ, UNEP-WCMC, USGS, NASA, ESA, METI, NRCAN, GEBCO, NOAA, iPC'
                      }
                  },
                  WorldGrayCanvas: {
                      options: {
                          variant: 'Canvas/World_Light_Gray_Base',
                          maxZoom: 16,
                          attribution: '{attribution.Esri} &mdash; Esri, DeLorme, NAVTEQ'
                      }
                  }
              }
          },
          OpenWeatherMap: {
              url: 'http://{s}.tile.openweathermap.org/map/{variant}/{z}/{x}/{y}.png',
              options: {
                  maxZoom: 19,
                  attribution: 'Map data &copy; <a href="http://openweathermap.org">OpenWeatherMap</a>',
                  opacity: 0.5
              },
              variants: {
                  Clouds: 'clouds',
                  CloudsClassic: 'clouds_cls',
                  Precipitation: 'precipitation',
                  PrecipitationClassic: 'precipitation_cls',
                  Rain: 'rain',
                  RainClassic: 'rain_cls',
                  Pressure: 'pressure',
                  PressureContour: 'pressure_cntr',
                  Wind: 'wind',
                  Temperature: 'temp',
                  Snow: 'snow'
              }
          },
          HERE: {
              /*
               * HERE maps, formerly Nokia maps.
               * These basemaps are free, but you need an API key. Please sign up at
               * http://developer.here.com/getting-started
               *
               * Note that the base urls contain '.cit' whichs is HERE's
               * 'Customer Integration Testing' environment. Please remove for production
               * envirionments.
               */
              url:
                  '//{s}.{base}.maps.cit.api.here.com/maptile/2.1/' +
                  'maptile/{mapID}/{variant}/{z}/{x}/{y}/256/png8?' +
                  'app_id={app_id}&app_code={app_code}',
              options: {
                  attribution:
                      'Map &copy; 1987-2014 <a href="http://developer.here.com">HERE</a>',
                  subdomains: '1234',
                  mapID: 'newest',
                  'app_id': '<insert your app_id here>',
                  'app_code': '<insert your app_code here>',
                  base: 'base',
                  variant: 'normal.day',
                  maxZoom: 20
              },
              variants: {
                  normalDay: 'normal.day',
                  normalDayCustom: 'normal.day.custom',
                  normalDayGrey: 'normal.day.grey',
                  normalDayMobile: 'normal.day.mobile',
                  normalDayGreyMobile: 'normal.day.grey.mobile',
                  normalDayTransit: 'normal.day.transit',
                  normalDayTransitMobile: 'normal.day.transit.mobile',
                  normalNight: 'normal.night',
                  normalNightMobile: 'normal.night.mobile',
                  normalNightGrey: 'normal.night.grey',
                  normalNightGreyMobile: 'normal.night.grey.mobile',
  
                  carnavDayGrey: 'carnav.day.grey',
                  hybridDay: {
                      options: {
                          base: 'aerial',
                          variant: 'hybrid.day'
                      }
                  },
                  hybridDayMobile: {
                      options: {
                          base: 'aerial',
                          variant: 'hybrid.day.mobile'
                      }
                  },
                  pedestrianDay: 'pedestrian.day',
                  pedestrianNight: 'pedestrian.night',
                  satelliteDay: {
                      options: {
                          base: 'aerial',
                          variant: 'satellite.day'
                      }
                  },
                  terrainDay: {
                      options: {
                          base: 'aerial',
                          variant: 'terrain.day'
                      }
                  },
                  terrainDayMobile: {
                      options: {
                          base: 'aerial',
                          variant: 'terrain.day.mobile'
                      }
                  }
              }
          },
          Acetate: {
              url: 'http://a{s}.acetate.geoiq.com/tiles/{variant}/{z}/{x}/{y}.png',
              options: {
                  attribution:
                      '&copy;2012 Esri & Stamen, Data from OSM and Natural Earth',
                  subdomains: '0123',
                  minZoom: 2,
                  maxZoom: 18,
                  variant: 'acetate-base'
              },
              variants: {
                  basemap: 'acetate-base',
                  terrain: 'terrain',
                  all: 'acetate-hillshading',
                  foreground: 'acetate-fg',
                  roads: 'acetate-roads',
                  labels: 'acetate-labels',
                  hillshading: 'hillshading'
              }
          },
          FreeMapSK: {
              url: 'http://{s}.freemap.sk/T/{z}/{x}/{y}.jpeg',
              options: {
                  minZoom: 8,
                  maxZoom: 16,
                  subdomains: ['t1', 't2', 't3', 't4'],
                  attribution:
                      '{attribution.OpenStreetMap}, vizualization CC-By-SA 2.0 <a href="http://freemap.sk">Freemap.sk</a>'
              }
          },
          MtbMap: {
              url: 'http://tile.mtbmap.cz/mtbmap_tiles/{z}/{x}/{y}.png',
              options: {
                  attribution:
                      '{attribution.OpenStreetMap} &amp; USGS'
              }
          },
          CartoDB: {
              url: 'http://{s}.basemaps.cartocdn.com/{variant}/{z}/{x}/{y}.png',
              options: {
                  attribution: '{attribution.OpenStreetMap} &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
                  subdomains: 'abcd',
                  maxZoom: 19,
                  variant: 'light_all'
              },
              variants: {
                  Positron: 'light_all',
                  PositronNoLabels: 'light_nolabels',
                  DarkMatter: 'dark_all',
                  DarkMatterNoLabels: 'dark_nolabels'
              }
          },
          HikeBike: {
              url: 'http://{s}.tiles.wmflabs.org/{variant}/{z}/{x}/{y}.png',
              options: {
                  maxZoom: 19,
                  attribution: '{attribution.OpenStreetMap}',
                  variant: 'hikebike'
              },
              variants: {
                  HikeBike: {},
                  HillShading: {
                      options: {
                          maxZoom: 15,
                          variant: 'hillshading'
                      }
                  }
              }
          },
          BasemapAT: {
              url: '//maps{s}.wien.gv.at/basemap/{variant}/normal/google3857/{z}/{y}/{x}.{format}',
              options: {
                  maxZoom: 19,
                  attribution: 'Datenquelle: <a href="www.basemap.at">basemap.at</a>',
                  subdomains: ['', '1', '2', '3', '4'],
                  format: 'png',
                  bounds: [[46.358770, 8.782379], [49.037872, 17.189532]],
                  variant: 'geolandbasemap'
              },
              variants: {
                  basemap: 'geolandbasemap',
                  grau: 'bmapgrau',
                  overlay: 'bmapoverlay',
                  highdpi: {
                      options: {
                          variant: 'bmaphidpi',
                          format: 'jpeg'
                      }
                  },
                  orthofoto: {
                      options: {
                          variant: 'bmaporthofoto30cm',
                          format: 'jpeg'
                      }
                  }
              }
          },
          NASAGIBS: {
              url: '//map1.vis.earthdata.nasa.gov/wmts-webmerc/{variant}/default/{time}/{tilematrixset}{maxZoom}/{z}/{y}/{x}.{format}',
              options: {
                  attribution:
                      'Imagery provided by services from the Global Imagery Browse Services (GIBS), operated by the NASA/GSFC/Earth Science Data and Information System ' +
                      '(<a href="https://earthdata.nasa.gov">ESDIS</a>) with funding provided by NASA/HQ.',
                  bounds: [[-85.0511287776, -179.999999975], [85.0511287776, 179.999999975]],
                  minZoom: 1,
                  maxZoom: 9,
                  format: 'jpg',
                  time: '',
                  tilematrixset: 'GoogleMapsCompatible_Level'
              },
              variants: {
                  ModisTerraTrueColorCR: 'MODIS_Terra_CorrectedReflectance_TrueColor',
                  ModisTerraBands367CR: 'MODIS_Terra_CorrectedReflectance_Bands367',
                  ViirsEarthAtNight2012: {
                      options: {
                          variant: 'VIIRS_CityLights_2012',
                          maxZoom: 8
                      }
                  },
                  ModisTerraLSTDay: {
                      options: {
                          variant: 'MODIS_Terra_Land_Surface_Temp_Day',
                          format: 'png',
                          maxZoom: 7,
                          opacity: 0.75
                      }
                  },
                  ModisTerraSnowCover: {
                      options: {
                          variant: 'MODIS_Terra_Snow_Cover',
                          format: 'png',
                          maxZoom: 8,
                          opacity: 0.75
                      }
                  },
                  ModisTerraAOD: {
                      options: {
                          variant: 'MODIS_Terra_Aerosol',
                          format: 'png',
                          maxZoom: 6,
                          opacity: 0.75
                      }
                  },
                  ModisTerraChlorophyll: {
                      options: {
                          variant: 'MODIS_Terra_Chlorophyll_A',
                          format: 'png',
                          maxZoom: 7,
                          opacity: 0.75
                      }
                  }
              }
          }
      };
  
      L.tileLayer.provider = function (provider, options) {
          return new L.TileLayer.Provider(provider, options);
      };
  
      return L;
  }));
  
  (function(){
  
  // This is for grouping buttons into a bar
  // takes an array of `L.easyButton`s and
  // then the usual `.addTo(map)`
  L.Control.EasyBar = L.Control.extend({
  
    options: {
      position:       'topleft',  // part of leaflet's defaults
      id:             null,       // an id to tag the Bar with
      leafletClasses: true        // use leaflet classes?
    },
  
  
    initialize: function(buttons, options){
  
      if(options){
        L.Util.setOptions( this, options );
      }
  
      this._buildContainer();
      this._buttons = [];
  
      for(var i = 0; i < buttons.length; i++){
        buttons[i]._bar = this;
        buttons[i]._container = buttons[i].button;
        this._buttons.push(buttons[i]);
        this.container.appendChild(buttons[i].button);
      }
  
    },
  
  
    _buildContainer: function(){
      this._container = this.container = L.DomUtil.create('div', '');
      this.options.leafletClasses && L.DomUtil.addClass(this.container, 'leaflet-bar easy-button-container leaflet-control');
      this.options.id && (this.container.id = this.options.id);
    },
  
  
    enable: function(){
      L.DomUtil.addClass(this.container, 'enabled');
      L.DomUtil.removeClass(this.container, 'disabled');
      this.container.setAttribute('aria-hidden', 'false');
      return this;
    },
  
  
    disable: function(){
      L.DomUtil.addClass(this.container, 'disabled');
      L.DomUtil.removeClass(this.container, 'enabled');
      this.container.setAttribute('aria-hidden', 'true');
      return this;
    },
  
  
    onAdd: function () {
      return this.container;
    },
  
    addTo: function (map) {
      this._map = map;
  
      for(var i = 0; i < this._buttons.length; i++){
        this._buttons[i]._map = map;
      }
  
      var container = this._container = this.onAdd(map),
          pos = this.getPosition(),
          corner = map._controlCorners[pos];
  
      L.DomUtil.addClass(container, 'leaflet-control');
  
      if (pos.indexOf('bottom') !== -1) {
        corner.insertBefore(container, corner.firstChild);
      } else {
        corner.appendChild(container);
      }
  
      return this;
    }
  
  });
  
  L.easyBar = function(){
    var args = [L.Control.EasyBar];
    for(var i = 0; i < arguments.length; i++){
      args.push( arguments[i] );
    }
    return new (Function.prototype.bind.apply(L.Control.EasyBar, args));
  };
  
  // L.EasyButton is the actual buttons
  // can be called without being grouped into a bar
  L.Control.EasyButton = L.Control.extend({
  
    options: {
      position:  'topleft',       // part of leaflet's defaults
  
      id:        null,            // an id to tag the button with
  
      type:      'replace',       // [(replace|animate)]
                                  // replace swaps out elements
                                  // animate changes classes with all elements inserted
  
      states:    [],              // state names look like this
                                  // {
                                  //   stateName: 'untracked',
                                  //   onClick: function(){ handle_nav_manually(); };
                                  //   title: 'click to make inactive',
                                  //   icon: 'fa-circle',    // wrapped with <a>
                                  // }
  
      leafletClasses:   true      // use leaflet styles for the button
    },
  
  
  
    initialize: function(icon, onClick, title, id){
  
      // clear the states manually
      this.options.states = [];
  
      // add id to options
      if(id != null){
        this.options.id = id;
      }
  
      // storage between state functions
      this.storage = {};
  
      // is the last item an object?
      if( typeof arguments[arguments.length-1] === 'object' ){
  
        // if so, it should be the options
        L.Util.setOptions( this, arguments[arguments.length-1] );
      }
  
      // if there aren't any states in options
      // use the early params
      if( this.options.states.length === 0 &&
          typeof icon  === 'string' &&
          typeof onClick === 'function'){
  
        // turn the options object into a state
        this.options.states.push({
          icon: icon,
          onClick: onClick,
          title: typeof title === 'string' ? title : ''
        });
      }
  
      // curate and move user's states into
      // the _states for internal use
      this._states = [];
  
      for(var i = 0; i < this.options.states.length; i++){
        this._states.push( new State(this.options.states[i], this) );
      }
  
      this._buildButton();
  
      this._activateState(this._states[0]);
  
    },
  
    _buildButton: function(){
  
      this.button = L.DomUtil.create('button', '');
  
      if (this.options.id ){
        this.button.id = this.options.id;
      }
  
      if (this.options.leafletClasses){
        L.DomUtil.addClass(this.button, 'easy-button-button leaflet-bar-part');
      }
  
      // don't let double clicks get to the map
      L.DomEvent.addListener(this.button, 'dblclick', L.DomEvent.stop);
  
      // take care of normal clicks
      L.DomEvent.addListener(this.button,'click', function(e){
        L.DomEvent.stop(e);
        this._currentState.onClick(this, this._map ? this._map : null );
        this._map.getContainer().focus();
      }, this);
  
      // prep the contents of the control
      if(this.options.type == 'replace'){
        this.button.appendChild(this._currentState.icon);
      } else {
        for(var i=0;i<this._states.length;i++){
          this.button.appendChild(this._states[i].icon);
        }
      }
    },
  
  
    _currentState: {
      // placeholder content
      stateName: 'unnamed',
      icon: (function(){ return document.createElement('span'); })()
    },
  
  
  
    _states: null, // populated on init
  
  
  
    state: function(newState){
  
      // activate by name
      if(typeof newState == 'string'){
  
        this._activateStateNamed(newState);
  
      // activate by index
      } else if (typeof newState == 'number'){
  
        this._activateState(this._states[newState]);
      }
  
      return this;
    },
  
  
    _activateStateNamed: function(stateName){
      for(var i = 0; i < this._states.length; i++){
        if( this._states[i].stateName == stateName ){
          this._activateState( this._states[i] );
        }
      }
    },
  
    _activateState: function(newState){
  
      if( newState === this._currentState ){
  
        // don't touch the dom if it'll just be the same after
        return;
  
      } else {
  
        // swap out elements... if you're into that kind of thing
        if( this.options.type == 'replace' ){
          this.button.appendChild(newState.icon);
          this.button.removeChild(this._currentState.icon);
        }
  
        if( newState.title ){
          this.button.title = newState.title;
        } else {
          this.button.removeAttribute('title');
        }
  
        // update classes for animations
        for(var i=0;i<this._states.length;i++){
          L.DomUtil.removeClass(this._states[i].icon, this._currentState.stateName + '-active');
          L.DomUtil.addClass(this._states[i].icon, newState.stateName + '-active');
        }
  
        // update classes for animations
        L.DomUtil.removeClass(this.button, this._currentState.stateName + '-active');
        L.DomUtil.addClass(this.button, newState.stateName + '-active');
  
        // update the record
        this._currentState = newState;
  
      }
    },
  
  
  
    enable: function(){
      L.DomUtil.addClass(this.button, 'enabled');
      L.DomUtil.removeClass(this.button, 'disabled');
      this.button.setAttribute('aria-hidden', 'false');
      return this;
    },
  
  
  
    disable: function(){
      L.DomUtil.addClass(this.button, 'disabled');
      L.DomUtil.removeClass(this.button, 'enabled');
      this.button.setAttribute('aria-hidden', 'true');
      return this;
    },
  
  
    removeFrom: function (map) {
  
      this._container.parentNode.removeChild(this._container);
      this._map = null;
  
      return this;
    },
  
    onAdd: function(){
      var containerObj = L.easyBar([this], {
        position: this.options.position,
        leafletClasses: this.options.leafletClasses
      });
      this._container = containerObj.container;
      return this._container;
    }
  
  
  });
  
  L.easyButton = function(/* args will pass automatically */){
    var args = Array.prototype.concat.apply([L.Control.EasyButton],arguments);
    return new (Function.prototype.bind.apply(L.Control.EasyButton, args));
  };
  
  /*************************
   *
   * util functions
   *
   *************************/
  
  // constructor for states so only curated
  // states end up getting called
  function State(template, easyButton){
  
    this.title = template.title;
    this.stateName = template.stateName ? template.stateName : 'unnamed-state';
  
    // build the wrapper
    this.icon = L.DomUtil.create('span', '');
  
    L.DomUtil.addClass(this.icon, 'button-state state-' + this.stateName.replace(/(^\s*|\s*$)/g,''));
    this.icon.innerHTML = buildIcon(template.icon);
    this.onClick = L.Util.bind(template.onClick?template.onClick:function(){}, easyButton);
  }
  
  function buildIcon(ambiguousIconString) {
  
    var tmpIcon;
  
    // does this look like html? (i.e. not a class)
    if( ambiguousIconString.match(/[&;=<>"']/) ){
  
      // if so, the user should have put in html
      // so move forward as such
      tmpIcon = ambiguousIconString;
  
    // then it wasn't html, so
    // it's a class list, figure out what kind
    } else {
        ambiguousIconString = ambiguousIconString.replace(/(^\s*|\s*$)/g,'');
        tmpIcon = L.DomUtil.create('span', '');
  
        if( ambiguousIconString.indexOf('fa-') === 0 ){
          L.DomUtil.addClass(tmpIcon, 'fa '  + ambiguousIconString)
        } else if ( ambiguousIconString.indexOf('glyphicon-') === 0 ) {
          L.DomUtil.addClass(tmpIcon, 'glyphicon ' + ambiguousIconString)
        } else {
          L.DomUtil.addClass(tmpIcon, /*rollwithit*/ ambiguousIconString)
        }
  
        // make this a string so that it's easy to set innerHTML below
        tmpIcon = tmpIcon.outerHTML;
    }
  
    return tmpIcon;
  }
  
  })();
  
  L.Control.Sidebar = L.Control.extend({
  
      includes: L.Mixin.Events,
  
      options: {
          closeButton: true,
          position: 'left',
          autoPan: true,
      },
  
      initialize: function (placeholder, options) {
          L.setOptions(this, options);
  
          // Find content container
          var content = this._contentContainer = L.DomUtil.get(placeholder);
  
          // Remove the content container from its original parent
          content.parentNode.removeChild(content);
  
          var l = 'leaflet-';
  
          // Create sidebar container
          var container = this._container =
              L.DomUtil.create('div', l + 'sidebar ' + this.options.position);
  
          // Style and attach content container
          L.DomUtil.addClass(content, l + 'control');
          container.appendChild(content);
  
          // Create close button and attach it if configured
          if (this.options.closeButton) {
              var close = this._closeButton =
                  L.DomUtil.create('a', 'close', container);
              close.innerHTML = '&times;';
          }
      },
  
      addTo: function (map) {
          var container = this._container;
          var content = this._contentContainer;
  
          // Attach event to close button
          if (this.options.closeButton) {
              var close = this._closeButton;
  
              L.DomEvent.on(close, 'click', this.hide, this);
          }
  
          L.DomEvent
              .on(container, 'transitionend',
                  this._handleTransitionEvent, this)
              .on(container, 'webkitTransitionEnd',
                  this._handleTransitionEvent, this);
  
          // Attach sidebar container to controls container
          var controlContainer = map._controlContainer;
          controlContainer.insertBefore(container, controlContainer.firstChild);
  
          this._map = map;
  
          // Make sure we don't drag the map when we interact with the content
          var stop = L.DomEvent.stopPropagation;
          var fakeStop = L.DomEvent._fakeStop || stop;
          L.DomEvent
              .on(content, 'contextmenu', stop)
              .on(content, 'click', fakeStop)
              .on(content, 'mousedown', stop)
              .on(content, 'touchstart', stop)
              .on(content, 'dblclick', fakeStop)
              .on(content, 'mousewheel', stop)
              .on(content, 'MozMousePixelScroll', stop);
  
          return this;
      },
  
      removeFrom: function (map) {
          //if the control is visible, hide it before removing it.
          this.hide();
  
          var container = this._container;
          var content = this._contentContainer;
  
          // Remove sidebar container from controls container
          var controlContainer = map._controlContainer;
          controlContainer.removeChild(container);
  
          //disassociate the map object
          this._map = null;
  
          // Unregister events to prevent memory leak
          var stop = L.DomEvent.stopPropagation;
          var fakeStop = L.DomEvent._fakeStop || stop;
          L.DomEvent
              .off(content, 'contextmenu', stop)
              .off(content, 'click', fakeStop)
              .off(content, 'mousedown', stop)
              .off(content, 'touchstart', stop)
              .off(content, 'dblclick', fakeStop)
              .off(content, 'mousewheel', stop)
              .off(content, 'MozMousePixelScroll', stop);
  
          L.DomEvent
              .off(container, 'transitionend',
                  this._handleTransitionEvent, this)
              .off(container, 'webkitTransitionEnd',
                  this._handleTransitionEvent, this);
  
          if (this._closeButton && this._close) {
              var close = this._closeButton;
  
              L.DomEvent.off(close, 'click', this.hide, this);
          }
  
          return this;
      },
  
      isVisible: function () {
          return L.DomUtil.hasClass(this._container, 'visible');
      },
  
      show: function () {
          if (!this.isVisible()) {
              L.DomUtil.addClass(this._container, 'visible');
              if (this.options.autoPan) {
                  this._map.panBy([-this.getOffset() / 2, 0], {
                      duration: 0.5
                  });
              }
              this.fire('show');
          }
      },
  
      hide: function (e) {
          if (this.isVisible()) {
              L.DomUtil.removeClass(this._container, 'visible');
              if (this.options.autoPan) {
                  this._map.panBy([this.getOffset() / 2, 0], {
                      duration: 0.5
                  });
              }
              this.fire('hide');
          }
          if(e) {
              L.DomEvent.stopPropagation(e);
          }
      },
  
      toggle: function () {
          if (this.isVisible()) {
              this.hide();
          } else {
              this.show();
          }
      },
  
      getContainer: function () {
          return this._contentContainer;
      },
  
      getCloseButton: function () {
          return this._closeButton;
      },
  
      setContent: function (content) {
          var container = this.getContainer();
  
          if (typeof content === 'string') {
              container.innerHTML = content;
          } else {
              // clean current content
              while (container.firstChild) {
                  container.removeChild(container.firstChild);
              }
  
              container.appendChild(content);
          }
  
          return this;
      },
  
      getOffset: function () {
          if (this.options.position === 'right') {
              return -this._container.offsetWidth;
          } else {
              return this._container.offsetWidth;
          }
      },
  
      _handleTransitionEvent: function (e) {
          if (e.propertyName == 'left' || e.propertyName == 'right')
              this.fire(this.isVisible() ? 'shown' : 'hidden');
      }
  });
  
  L.control.sidebar = function (placeholder, options) {
      return new L.Control.Sidebar(placeholder, options);
  };
  
  /*
   * L.Control.Loading is a control that shows a loading indicator when tiles are
   * loading or when map-related AJAX requests are taking place.
   */
  
  (function () {
  
      var console = window.console || {
          error: function () {},
          warn: function () {}
      };
  
      function defineLeafletLoading(L) {
          L.Control.Loading = L.Control.extend({
              options: {
                  position: 'topleft',
                  separate: false,
                  zoomControl: null,
                  spinjs: false,
                  spin: { 
                    lines: 7, 
                    length: 3, 
                    width: 3, 
                    radius: 5, 
                    rotate: 13, 
                    top: "83%"
                  }
              },
  
              initialize: function(options) {
                  L.setOptions(this, options);
                  this._dataLoaders = {};
  
                  // Try to set the zoom control this control is attached to from the 
                  // options
                  if (this.options.zoomControl !== null) {
                      this.zoomControl = this.options.zoomControl;
                  }
              },
  
              onAdd: function(map) {
                  if (this.options.spinjs && (typeof Spinner !== 'function')) {
                      return console.error("Leaflet.loading cannot load because you didn't load spin.js (http://fgnass.github.io/spin.js/), even though you set it in options.");
                  }
                  this._addLayerListeners(map);
                  this._addMapListeners(map);
  
                  // Try to set the zoom control this control is attached to from the map
                  // the control is being added to
                  if (!this.options.separate && !this.zoomControl) {
                      if (map.zoomControl) {
                          this.zoomControl = map.zoomControl;
                      } else if (map.zoomsliderControl) {
                          this.zoomControl = map.zoomsliderControl;
                      }
                  }
  
                  // Create the loading indicator
                  var classes = 'leaflet-control-loading';
                  var container;
                  if (this.zoomControl && !this.options.separate) {
                      // If there is a zoom control, hook into the bottom of it
                      container = this.zoomControl._container;
                      // These classes are no longer used as of Leaflet 0.6
                      classes += ' leaflet-bar-part-bottom leaflet-bar-part last';
  
                      // Loading control will be added to the zoom control. So the visible last element is not the
                      // last dom element anymore. So add the part-bottom class.
                      L.DomUtil.addClass(this._getLastControlButton(), 'leaflet-bar-part-bottom');
                  }
                  else {
                      // Otherwise, create a container for the indicator
                      container = L.DomUtil.create('div', 'leaflet-control-zoom leaflet-bar');
                  }
                  this._indicator = L.DomUtil.create('a', classes, container);
                  if (this.options.spinjs) {
                    this._spinner = new Spinner(this.options.spin).spin();
                    this._indicator.appendChild(this._spinner.el);
                  }
                  return container;
              },
  
              onRemove: function(map) {
                  this._removeLayerListeners(map);
                  this._removeMapListeners(map);
              },
  
              removeFrom: function (map) {
                  if (this.zoomControl && !this.options.separate) {
                      // Override Control.removeFrom() to avoid clobbering the entire
                      // _container, which is the same as zoomControl's
                      this._container.removeChild(this._indicator);
                      this._map = null;
                      this.onRemove(map);
                      return this;
                  }
                  else {
                      // If this control is separate from the zoomControl, call the
                      // parent method so we don't leave behind an empty container
                      return L.Control.prototype.removeFrom.call(this, map);
                  }
              },
  
              addLoader: function(id) {
                  this._dataLoaders[id] = true;
                  this.updateIndicator();
              },
  
              removeLoader: function(id) {
                  delete this._dataLoaders[id];
                  this.updateIndicator();
              },
  
              updateIndicator: function() {
                  if (this.isLoading()) {
                      this._showIndicator();
                  }
                  else {
                      this._hideIndicator();
                  }
              },
  
              isLoading: function() {
                  return this._countLoaders() > 0;
              },
  
              _countLoaders: function() {
                  var size = 0, key;
                  for (key in this._dataLoaders) {
                      if (this._dataLoaders.hasOwnProperty(key)) size++;
                  }
                  return size;
              },
  
              _showIndicator: function() {
                  // Show loading indicator
                  L.DomUtil.addClass(this._indicator, 'is-loading');
  
                  // If zoomControl exists, make the zoom-out button not last
                  if (!this.options.separate) {
                      if (this.zoomControl instanceof L.Control.Zoom) {
                          L.DomUtil.removeClass(this._getLastControlButton(), 'leaflet-bar-part-bottom');
                      }
                      else if (typeof L.Control.Zoomslider === 'function' && this.zoomControl instanceof L.Control.Zoomslider) {
                          L.DomUtil.removeClass(this.zoomControl._ui.zoomOut, 'leaflet-bar-part-bottom');
                      }
                  }
              },
  
              _hideIndicator: function() {
                  // Hide loading indicator
                  L.DomUtil.removeClass(this._indicator, 'is-loading');
  
                  // If zoomControl exists, make the zoom-out button last
                  if (!this.options.separate) {
                      if (this.zoomControl instanceof L.Control.Zoom) {
                          L.DomUtil.addClass(this._getLastControlButton(), 'leaflet-bar-part-bottom');
                      }
                      else if (typeof L.Control.Zoomslider === 'function' && this.zoomControl instanceof L.Control.Zoomslider) {
                          L.DomUtil.addClass(this.zoomControl._ui.zoomOut, 'leaflet-bar-part-bottom');
                      }
                  }
              },
  
              _getLastControlButton: function() {
                  var container = this.zoomControl._container,
                      index = container.children.length - 1;
  
                  // Find the last visible control button that is not our loading
                  // indicator
                  while (index > 0) {
                      var button = container.children[index];
                      if (!(this._indicator === button || button.offsetWidth === 0 || button.offsetHeight === 0)) {
                          break;
                      }
                      index--;
                  }
  
                  return container.children[index];
              },
  
              _handleLoading: function(e) {
                  this.addLoader(this.getEventId(e));
              },
  
              _handleLoad: function(e) {
                  this.removeLoader(this.getEventId(e));
              },
  
              getEventId: function(e) {
                  if (e.id) {
                      return e.id;
                  }
                  else if (e.layer) {
                      return e.layer._leaflet_id;
                  }
                  return e.target._leaflet_id;
              },
  
              _layerAdd: function(e) {
                  if (!e.layer || !e.layer.on) return
                  try {
                      e.layer.on({
                          loading: this._handleLoading,
                          load: this._handleLoad
                      }, this);
                  }
                  catch (exception) {
                      console.warn('L.Control.Loading: Tried and failed to add ' +
                                   ' event handlers to layer', e.layer);
                      console.warn('L.Control.Loading: Full details', exception);
                  }
              },
  
              _addLayerListeners: function(map) {
                  // Add listeners for begin and end of load to any layers already on the 
                  // map
                  map.eachLayer(function(layer) {
                      if (!layer.on) return;
                      layer.on({
                          loading: this._handleLoading,
                          load: this._handleLoad
                      }, this);
                  }, this);
  
                  // When a layer is added to the map, add listeners for begin and end
                  // of load
                  map.on('layeradd', this._layerAdd, this);
              },
  
              _removeLayerListeners: function(map) {
                  // Remove listeners for begin and end of load from all layers
                  map.eachLayer(function(layer) {
                      if (!layer.off) return;
                      layer.off({
                          loading: this._handleLoading,
                          load: this._handleLoad
                      }, this);
                  }, this);
  
                  // Remove layeradd listener from map
                  map.off('layeradd', this._layerAdd, this);
              },
  
              _addMapListeners: function(map) {
                  // Add listeners to the map for (custom) dataloading and dataload
                  // events, eg, for AJAX calls that affect the map but will not be
                  // reflected in the above layer events.
                  map.on({
                      dataloading: this._handleLoading,
                      dataload: this._handleLoad,
                      layerremove: this._handleLoad
                  }, this);
              },
  
              _removeMapListeners: function(map) {
                  map.off({
                      dataloading: this._handleLoading,
                      dataload: this._handleLoad,
                      layerremove: this._handleLoad
                  }, this);
              }
          });
  
          L.Map.addInitHook(function () {
              if (this.options.loadingControl) {
                  this.loadingControl = new L.Control.Loading();
                  this.addControl(this.loadingControl);
              }
          });
  
          L.Control.loading = function(options) {
              return new L.Control.Loading(options);
          };
      }
  
      if (typeof define === 'function' && define.amd) {
          // Try to add leaflet.loading to Leaflet using AMD
          define(['leaflet'], function (L) {
              defineLeafletLoading(L);
          });
      }
      else {
          // Else use the global L
          defineLeafletLoading(L);
      }
  
  })();
  
  /**
   * Copyright (c) 2011-2014 Felix Gnass
   * Licensed under the MIT license
   * http://spin.js.org/
   *
   * Example:
      var opts = {
        lines: 12             // The number of lines to draw
      , length: 7             // The length of each line
      , width: 5              // The line thickness
      , radius: 10            // The radius of the inner circle
      , scale: 1.0            // Scales overall size of the spinner
      , corners: 1            // Roundness (0..1)
      , color: '#000'         // #rgb or #rrggbb
      , opacity: 1/4          // Opacity of the lines
      , rotate: 0             // Rotation offset
      , direction: 1          // 1: clockwise, -1: counterclockwise
      , speed: 1              // Rounds per second
      , trail: 100            // Afterglow percentage
      , fps: 20               // Frames per second when using setTimeout()
      , zIndex: 2e9           // Use a high z-index by default
      , className: 'spinner'  // CSS class to assign to the element
      , top: '50%'            // center vertically
      , left: '50%'           // center horizontally
      , shadow: false         // Whether to render a shadow
      , hwaccel: false        // Whether to use hardware acceleration (might be buggy)
      , position: 'absolute'  // Element positioning
      }
      var target = document.getElementById('foo')
      var spinner = new Spinner(opts).spin(target)
   */
  ;(function (root, factory) {
  
    /* CommonJS */
    if (typeof module == 'object' && module.exports) module.exports = factory()
  
    /* AMD module */
    else if (typeof define == 'function' && define.amd) define(factory)
  
    /* Browser global */
    else root.Spinner = factory()
  }(this, function () {
    "use strict"
  
    var prefixes = ['webkit', 'Moz', 'ms', 'O'] /* Vendor prefixes */
      , animations = {} /* Animation rules keyed by their name */
      , useCssAnimations /* Whether to use CSS animations or setTimeout */
      , sheet /* A stylesheet to hold the @keyframe or VML rules. */
  
    /**
     * Utility function to create elements. If no tag name is given,
     * a DIV is created. Optionally properties can be passed.
     */
    function createEl (tag, prop) {
      var el = document.createElement(tag || 'div')
        , n
  
      for (n in prop) el[n] = prop[n]
      return el
    }
  
    /**
     * Appends children and returns the parent.
     */
    function ins (parent /* child1, child2, ...*/) {
      for (var i = 1, n = arguments.length; i < n; i++) {
        parent.appendChild(arguments[i])
      }
  
      return parent
    }
  
    /**
     * Creates an opacity keyframe animation rule and returns its name.
     * Since most mobile Webkits have timing issues with animation-delay,
     * we create separate rules for each line/segment.
     */
    function addAnimation (alpha, trail, i, lines) {
      var name = ['opacity', trail, ~~(alpha * 100), i, lines].join('-')
        , start = 0.01 + i/lines * 100
        , z = Math.max(1 - (1-alpha) / trail * (100-start), alpha)
        , prefix = useCssAnimations.substring(0, useCssAnimations.indexOf('Animation')).toLowerCase()
        , pre = prefix && '-' + prefix + '-' || ''
  
      if (!animations[name]) {
        sheet.insertRule(
          '@' + pre + 'keyframes ' + name + '{' +
          '0%{opacity:' + z + '}' +
          start + '%{opacity:' + alpha + '}' +
          (start+0.01) + '%{opacity:1}' +
          (start+trail) % 100 + '%{opacity:' + alpha + '}' +
          '100%{opacity:' + z + '}' +
          '}', sheet.cssRules.length)
  
        animations[name] = 1
      }
  
      return name
    }
  
    /**
     * Tries various vendor prefixes and returns the first supported property.
     */
    function vendor (el, prop) {
      var s = el.style
        , pp
        , i
  
      prop = prop.charAt(0).toUpperCase() + prop.slice(1)
      if (s[prop] !== undefined) return prop
      for (i = 0; i < prefixes.length; i++) {
        pp = prefixes[i]+prop
        if (s[pp] !== undefined) return pp
      }
    }
  
    /**
     * Sets multiple style properties at once.
     */
    function css (el, prop) {
      for (var n in prop) {
        el.style[vendor(el, n) || n] = prop[n]
      }
  
      return el
    }
  
    /**
     * Fills in default values.
     */
    function merge (obj) {
      for (var i = 1; i < arguments.length; i++) {
        var def = arguments[i]
        for (var n in def) {
          if (obj[n] === undefined) obj[n] = def[n]
        }
      }
      return obj
    }
  
    /**
     * Returns the line color from the given string or array.
     */
    function getColor (color, idx) {
      return typeof color == 'string' ? color : color[idx % color.length]
    }
  
    // Built-in defaults
  
    var defaults = {
      lines: 13             // The number of lines to draw
    , length: 30             // The length of each line
    , width: 2              // The line thickness
    , radius: 10            // The radius of the inner circle
    , scale: 1.0            // Scales overall size of the spinner
    , corners: 0.5            // Roundness (0..1)
    , color: '#436243'         // #rgb or #rrggbb
    , opacity: 1/4          // Opacity of the lines
    , rotate: 0             // Rotation offset
    , direction: 1          // 1: clockwise, -1: counterclockwise
    , speed: 0.9              // Rounds per second
    , trail: 60            // Afterglow percentage
    , fps: 20               // Frames per second when using setTimeout()
    , zIndex: 2e9           // Use a high z-index by default
    , className: 'spinner'  // CSS class to assign to the element
    , top: '50%'            // center vertically
    , left: '50%'           // center horizontally
    , shadow: false         // Whether to render a shadow
    , hwaccel: false        // Whether to use hardware acceleration (might be buggy)
    , position: 'absolute'  // Element positioning
    }
  
    /** The constructor */
    function Spinner (o) {
      this.opts = merge(o || {}, Spinner.defaults, defaults)
    }
  
    // Global defaults that override the built-ins:
    Spinner.defaults = {}
  
    merge(Spinner.prototype, {
      /**
       * Adds the spinner to the given target element. If this instance is already
       * spinning, it is automatically removed from its previous target b calling
       * stop() internally.
       */
      spin: function (target) {
        this.stop()
  
        var self = this
          , o = self.opts
          , el = self.el = createEl(null, {className: o.className})
  
        css(el, {
          position: o.position
        , width: 0
        , zIndex: o.zIndex
        , left: o.left
        , top: o.top
        })
  
        if (target) {
          target.insertBefore(el, target.firstChild || null)
        }
  
        el.setAttribute('role', 'progressbar')
        self.lines(el, self.opts)
  
        if (!useCssAnimations) {
          // No CSS animation support, use setTimeout() instead
          var i = 0
            , start = (o.lines - 1) * (1 - o.direction) / 2
            , alpha
            , fps = o.fps
            , f = fps / o.speed
            , ostep = (1 - o.opacity) / (f * o.trail / 100)
            , astep = f / o.lines
  
          ;(function anim () {
            i++
            for (var j = 0; j < o.lines; j++) {
              alpha = Math.max(1 - (i + (o.lines - j) * astep) % f * ostep, o.opacity)
  
              self.opacity(el, j * o.direction + start, alpha, o)
            }
            self.timeout = self.el && setTimeout(anim, ~~(1000 / fps))
          })()
        }
        return self
      }
  
      /**
       * Stops and removes the Spinner.
       */
    , stop: function () {
        var el = this.el
        if (el) {
          clearTimeout(this.timeout)
          if (el.parentNode) el.parentNode.removeChild(el)
          this.el = undefined
        }
        return this
      }
  
      /**
       * Internal method that draws the individual lines. Will be overwritten
       * in VML fallback mode below.
       */
    , lines: function (el, o) {
        var i = 0
          , start = (o.lines - 1) * (1 - o.direction) / 2
          , seg
  
        function fill (color, shadow) {
          return css(createEl(), {
            position: 'absolute'
          , width: o.scale * (o.length + o.width) + 'px'
          , height: o.scale * o.width + 'px'
          , background: color
          , boxShadow: shadow
          , transformOrigin: 'left'
          , transform: 'rotate(' + ~~(360/o.lines*i + o.rotate) + 'deg) translate(' + o.scale*o.radius + 'px' + ',0)'
          , borderRadius: (o.corners * o.scale * o.width >> 1) + 'px'
          })
        }
  
        for (; i < o.lines; i++) {
          seg = css(createEl(), {
            position: 'absolute'
          , top: 1 + ~(o.scale * o.width / 2) + 'px'
          , transform: o.hwaccel ? 'translate3d(0,0,0)' : ''
          , opacity: o.opacity
          , animation: useCssAnimations && addAnimation(o.opacity, o.trail, start + i * o.direction, o.lines) + ' ' + 1 / o.speed + 's linear infinite'
          })
  
          if (o.shadow) ins(seg, css(fill('#000', '0 0 4px #000'), {top: '2px'}))
          ins(el, ins(seg, fill(getColor(o.color, i), '0 0 1px rgba(0,0,0,.1)')))
        }
        return el
      }
  
      /**
       * Internal method that adjusts the opacity of a single line.
       * Will be overwritten in VML fallback mode below.
       */
    , opacity: function (el, i, val) {
        if (i < el.childNodes.length) el.childNodes[i].style.opacity = val
      }
  
    })
  
  
    function initVML () {
  
      /* Utility function to create a VML tag */
      function vml (tag, attr) {
        return createEl('<' + tag + ' xmlns="urn:schemas-microsoft.com:vml" class="spin-vml">', attr)
      }
  
      // No CSS transforms but VML support, add a CSS rule for VML elements:
      sheet.addRule('.spin-vml', 'behavior:url(#default#VML)')
  
      Spinner.prototype.lines = function (el, o) {
        var r = o.scale * (o.length + o.width)
          , s = o.scale * 2 * r
  
        function grp () {
          return css(
            vml('group', {
              coordsize: s + ' ' + s
            , coordorigin: -r + ' ' + -r
            })
          , { width: s, height: s }
          )
        }
  
        var margin = -(o.width + o.length) * o.scale * 2 + 'px'
          , g = css(grp(), {position: 'absolute', top: margin, left: margin})
          , i
  
        function seg (i, dx, filter) {
          ins(
            g
          , ins(
              css(grp(), {rotation: 360 / o.lines * i + 'deg', left: ~~dx})
            , ins(
                css(
                  vml('roundrect', {arcsize: o.corners})
                , { width: r
                  , height: o.scale * o.width
                  , left: o.scale * o.radius
                  , top: -o.scale * o.width >> 1
                  , filter: filter
                  }
                )
              , vml('fill', {color: getColor(o.color, i), opacity: o.opacity})
              , vml('stroke', {opacity: 0}) // transparent stroke to fix color bleeding upon opacity change
              )
            )
          )
        }
  
        if (o.shadow)
          for (i = 1; i <= o.lines; i++) {
            seg(i, -2, 'progid:DXImageTransform.Microsoft.Blur(pixelradius=2,makeshadow=1,shadowopacity=.3)')
          }
  
        for (i = 1; i <= o.lines; i++) seg(i)
        return ins(el, g)
      }
  
      Spinner.prototype.opacity = function (el, i, val, o) {
        var c = el.firstChild
        o = o.shadow && o.lines || 0
        if (c && i + o < c.childNodes.length) {
          c = c.childNodes[i + o]; c = c && c.firstChild; c = c && c.firstChild
          if (c) c.opacity = val
        }
      }
    }
  
    if (typeof document !== 'undefined') {
      sheet = (function () {
        var el = createEl('style', {type : 'text/css'})
        ins(document.getElementsByTagName('head')[0], el)
        return el.sheet || el.styleSheet
      }())
  
      var probe = css(createEl('group'), {behavior: 'url(#default#VML)'})
  
      if (!vendor(probe, 'transform') && probe.adj) initVML()
      else useCssAnimations = vendor(probe, 'animation')
    }
  
    return Spinner
  
  }));
  
  L.SpinMapMixin = {
      spin: function (state, options) {
          if (!!state) {
              // start spinning !
              if (!this._spinner) {
                  this._spinner = new Spinner(options).spin(this._container);
                  this._spinning = 0;
              }
              this._spinning++;
          }
          else {
              this._spinning--;
              if (this._spinning <= 0) {
                  // end spinning !
                  if (this._spinner) {
                      this._spinner.stop();
                      this._spinner = null;
                  }
              }
          }
      }
  };
  
  L.Map.include(L.SpinMapMixin);
  
  L.Map.addInitHook(function () {
      this.on('layeradd', function (e) {
          // If added layer is currently loading, spin !
          if (e.layer.loading) this.spin(true);
          if (typeof e.layer.on != 'function') return;
          e.layer.on('data:loading', function () { this.spin(true); }, this);
          e.layer.on('data:loaded',  function () { this.spin(false); }, this);
      }, this);
      this.on('layerremove', function (e) {
          // Clean-up
          if (e.layer.loading) this.spin(false);
          if (typeof e.layer.on != 'function') return;
          e.layer.off('data:loaded');
          e.layer.off('data:loading');
      }, this);
  });
  
  /*
   * Leaflet plugin to create map icons using Maki Icons from MapBox.
   *
   * References:
   *   Maki Icons: https://www.mapbox.com/maki/
   *   MapBox Marker API: https://www.mapbox.com/developers/api/static/#markers
   *
   * Usage:
   *   var icon = L.MakiMarkers.icon({icon: "rocket", color: "#b0b", size: "m"});
   *
   * License:
   *   MIT: http://jseppi.mit-license.org/
   */
   /*global L:false */
  (function () {
    "use strict";
    L.MakiMarkers = {
      // Available Maki Icons
      icons: ["airfield","airport","alcohol-shop","america-football","art-gallery","bakery","bank","bar",
        "baseball","basketball","beer","bicycle","building","bus","cafe","camera","campsite","car",
        "cemetery","chemist","cinema","circle-stroked","circle","city","clothing-store","college",
        "commercial","cricket","cross","dam","danger","disability","dog-park","embassy",
        "emergency-telephone","entrance","farm","fast-food","ferry","fire-station","fuel","garden",
        "golf","grocery","hairdresser","harbor","heart","heliport","hospital","industrial",
        "land-use","laundry","library","lighthouse","lodging","logging","london-underground",
        "marker-stroked","marker","minefield","mobilephone","monument","museum","music","oil-well",
        "park2","park","parking-garage","parking","pharmacy","pitch","place-of-worship",
        "playground","police","polling-place","post","prison","rail-above","rail-light",
        "rail-metro","rail-underground","rail","religious-christian","religious-jewish",
        "religious-muslim","restaurant","roadblock","rocket","school","scooter","shop","skiing",
        "slaughterhouse","soccer","square-stroked","square","star-stroked","star","suitcase",
        "swimming","telephone","tennis","theatre","toilets","town-hall","town","triangle-stroked",
        "triangle","village","warehouse","waste-basket","water","wetland","zoo"
      ],
      defaultColor: "#0a0",
      defaultIcon: "circle-stroked",
      defaultSize: "m",
      apiUrl: "https://api.tiles.mapbox.com/v3/marker/",
      smallOptions: {
        iconSize: [20, 50],
        popupAnchor: [0,-20]
      },
      mediumOptions: {
        iconSize: [30,70],
        popupAnchor: [0,-30]
      },
      largeOptions: {
        iconSize: [36,90],
        popupAnchor: [0,-40]
      }
    };
  
    L.MakiMarkers.Icon = L.Icon.extend({
      options: {
        //Maki icon: any from https://www.mapbox.com/maki/ (ref: L.MakiMarkers.icons)
        icon: L.MakiMarkers.defaultIcon,
        //Marker color: short or long form hex color code
        color: L.MakiMarkers.defaultColor,
        //Marker size: "s" (small), "m" (medium), or "l" (large)
        size: L.MakiMarkers.defaultSize,
        shadowAnchor: null,
        shadowSize: null,
        shadowUrl: null,
        className: "maki-marker"
      },
  
      initialize: function(options) {
        var pin;
  
        options = L.setOptions(this, options);
  
        switch (options.size) {
          case "s":
            L.extend(options, L.MakiMarkers.smallOptions);
            break;
          case "l":
            L.extend(options, L.MakiMarkers.largeOptions);
            break;
          default:
            options.size = "m";
            L.extend(options, L.MakiMarkers.mediumOptions);
            break;
        }
  
  
        pin = "pin-" + options.size;
  
        if (options.icon !== null) {
          pin += "-" + options.icon;
        }
  
        if (options.color !== null) {
          if (options.color.charAt(0) === "#") {
            options.color = options.color.substr(1);
          }
  
          pin += "+" + options.color;
        }
  
        options.iconUrl = "" + L.MakiMarkers.apiUrl + pin +  ".png";
        options.iconRetinaUrl = L.MakiMarkers.apiUrl + pin + "@2x.png";
      }
    });
  
    L.MakiMarkers.icon = function(options) {
      return new L.MakiMarkers.Icon(options);
    };
  })();
  
  /*! esri-leaflet - v1.0.0 - 2015-07-10
  *   Copyright (c) 2015 Environmental Systems Research Institute, Inc.
  *   Apache License*/
  (function (factory) {
    //define an AMD module that relies on 'leaflet'
    if (typeof define === 'function' && define.amd) {
      define(['leaflet'], function (L) {
        return factory(L);
      });
    //define a common js module that relies on 'leaflet'
    } else if (typeof module === 'object' && typeof module.exports === 'object') {
      module.exports = factory(require('leaflet'));
    }
  
    if(typeof window !== 'undefined' && window.L){
      factory(window.L);
    }
  }(function (L) {
  
  var EsriLeaflet={VERSION:"1.0.0",Layers:{},Services:{},Controls:{},Tasks:{},Util:{},Support:{CORS:!!(window.XMLHttpRequest&&"withCredentials"in new XMLHttpRequest),pointerEvents:""===document.documentElement.style.pointerEvents}};"undefined"!=typeof window&&window.L&&(window.L.esri=EsriLeaflet),function(a){function b(a){var b={};for(var c in a)a.hasOwnProperty(c)&&(b[c]=a[c]);return b}function c(a,b){for(var c=0;c<a.length;c++)if(a[c]!==b[c])return!1;return!0}function d(a){return c(a[0],a[a.length-1])||a.push(a[0]),a}function e(a){var b,c=0,d=0,e=a.length,f=a[d];for(d;e-1>d;d++)b=a[d+1],c+=(b[0]-f[0])*(b[1]+f[1]),f=b;return c>=0}function f(a,b,c,d){var e=(d[0]-c[0])*(a[1]-c[1])-(d[1]-c[1])*(a[0]-c[0]),f=(b[0]-a[0])*(a[1]-c[1])-(b[1]-a[1])*(a[0]-c[0]),g=(d[1]-c[1])*(b[0]-a[0])-(d[0]-c[0])*(b[1]-a[1]);if(0!==g){var h=e/g,i=f/g;if(h>=0&&1>=h&&i>=0&&1>=i)return!0}return!1}function g(a,b){for(var c=0;c<a.length-1;c++)for(var d=0;d<b.length-1;d++)if(f(a[c],a[c+1],b[d],b[d+1]))return!0;return!1}function h(a,b){for(var c=!1,d=-1,e=a.length,f=e-1;++d<e;f=d)(a[d][1]<=b[1]&&b[1]<a[f][1]||a[f][1]<=b[1]&&b[1]<a[d][1])&&b[0]<(a[f][0]-a[d][0])*(b[1]-a[d][1])/(a[f][1]-a[d][1])+a[d][0]&&(c=!c);return c}function i(a,b){var c=g(a,b),d=h(a,b[0]);return!c&&d?!0:!1}function j(a){for(var b,c,f,h=[],j=[],k=0;k<a.length;k++){var l=d(a[k].slice(0));if(!(l.length<4))if(e(l)){var m=[l];h.push(m)}else j.push(l)}for(var n=[];j.length;){f=j.pop();var o=!1;for(b=h.length-1;b>=0;b--)if(c=h[b][0],i(c,f)){h[b].push(f),o=!0;break}o||n.push(f)}for(;n.length;){f=n.pop();var p=!1;for(b=h.length-1;b>=0;b--)if(c=h[b][0],g(c,f)){h[b].push(f),p=!0;break}p||h.push([f.reverse()])}return 1===h.length?{type:"Polygon",coordinates:h[0]}:{type:"MultiPolygon",coordinates:h}}function k(a){var b=[],c=a.slice(0),f=d(c.shift().slice(0));if(f.length>=4){e(f)||f.reverse(),b.push(f);for(var g=0;g<c.length;g++){var h=d(c[g].slice(0));h.length>=4&&(e(h)&&h.reverse(),b.push(h))}}return b}function l(a){for(var b=[],c=0;c<a.length;c++)for(var d=k(a[c]),e=d.length-1;e>=0;e--){var f=d[e].slice(0);b.push(f)}return b}var m=window.requestAnimationFrame||window.webkitRequestAnimationFrame||window.mozRequestAnimationFrame||window.msRequestAnimationFrame||function(a){return window.setTimeout(a,1e3/60)};a.Util.extentToBounds=function(a){var b=new L.LatLng(a.ymin,a.xmin),c=new L.LatLng(a.ymax,a.xmax);return new L.LatLngBounds(b,c)},a.Util.boundsToExtent=function(a){return a=L.latLngBounds(a),{xmin:a.getSouthWest().lng,ymin:a.getSouthWest().lat,xmax:a.getNorthEast().lng,ymax:a.getNorthEast().lat,spatialReference:{wkid:4326}}},a.Util.arcgisToGeojson=function(c,d){var e={};return"number"==typeof c.x&&"number"==typeof c.y&&(e.type="Point",e.coordinates=[c.x,c.y]),c.points&&(e.type="MultiPoint",e.coordinates=c.points.slice(0)),c.paths&&(1===c.paths.length?(e.type="LineString",e.coordinates=c.paths[0].slice(0)):(e.type="MultiLineString",e.coordinates=c.paths.slice(0))),c.rings&&(e=j(c.rings.slice(0))),(c.geometry||c.attributes)&&(e.type="Feature",e.geometry=c.geometry?a.Util.arcgisToGeojson(c.geometry):null,e.properties=c.attributes?b(c.attributes):null,c.attributes&&(e.id=c.attributes[d]||c.attributes.OBJECTID||c.attributes.FID)),e},a.Util.geojsonToArcGIS=function(c,d){d=d||"OBJECTID";var e,f={wkid:4326},g={};switch(c.type){case"Point":g.x=c.coordinates[0],g.y=c.coordinates[1],g.spatialReference=f;break;case"MultiPoint":g.points=c.coordinates.slice(0),g.spatialReference=f;break;case"LineString":g.paths=[c.coordinates.slice(0)],g.spatialReference=f;break;case"MultiLineString":g.paths=c.coordinates.slice(0),g.spatialReference=f;break;case"Polygon":g.rings=k(c.coordinates.slice(0)),g.spatialReference=f;break;case"MultiPolygon":g.rings=l(c.coordinates.slice(0)),g.spatialReference=f;break;case"Feature":c.geometry&&(g.geometry=a.Util.geojsonToArcGIS(c.geometry,d)),g.attributes=c.properties?b(c.properties):{},c.id&&(g.attributes[d]=c.id);break;case"FeatureCollection":for(g=[],e=0;e<c.features.length;e++)g.push(a.Util.geojsonToArcGIS(c.features[e],d));break;case"GeometryCollection":for(g=[],e=0;e<c.geometries.length;e++)g.push(a.Util.geojsonToArcGIS(c.geometries[e],d))}return g},a.Util.responseToFeatureCollection=function(b,c){var d;if(c)d=c;else if(b.objectIdFieldName)d=b.objectIdFieldName;else if(b.fields){for(var e=0;e<=b.fields.length-1;e++)if("esriFieldTypeOID"===b.fields[e].type){d=b.fields[e].name;break}}else d="OBJECTID";var f={type:"FeatureCollection",features:[]},g=b.features||b.results;if(g.length)for(var h=g.length-1;h>=0;h--)f.features.push(a.Util.arcgisToGeojson(g[h],d));return f},a.Util.cleanUrl=function(a){return a=a.replace(/^\s+|\s+$|\A\s+|\s+\z/g,""),"/"!==a[a.length-1]&&(a+="/"),a},a.Util.isArcgisOnline=function(a){return/\.arcgis\.com.*?FeatureServer/g.test(a)},a.Util.geojsonTypeToArcGIS=function(a){var b;switch(a){case"Point":b="esriGeometryPoint";break;case"MultiPoint":b="esriGeometryMultipoint";break;case"LineString":b="esriGeometryPolyline";break;case"MultiLineString":b="esriGeometryPolyline";break;case"Polygon":b="esriGeometryPolygon";break;case"MultiPolygon":b="esriGeometryPolygon"}return b},a.Util.requestAnimationFrame=L.Util.bind(m,window),a.Util.warn=function(a){console&&console.warn&&console.warn(a)}}(EsriLeaflet),function(a){function b(a){var b="";a.f=a.f||"json";for(var c in a)if(a.hasOwnProperty(c)){var d,e=a[c],f=Object.prototype.toString.call(e);b.length&&(b+="&"),d="[object Array]"===f?"[object Object]"===Object.prototype.toString.call(e[0])?JSON.stringify(e):e.join(","):"[object Object]"===f?JSON.stringify(e):"[object Date]"===f?e.valueOf():e,b+=encodeURIComponent(c)+"="+encodeURIComponent(d)}return b}function c(a,b){var c=new XMLHttpRequest;return c.onerror=function(d){c.onreadystatechange=L.Util.falseFn,a.call(b,{error:{code:500,message:"XMLHttpRequest error"}},null)},c.onreadystatechange=function(){var d,e;if(4===c.readyState){try{d=JSON.parse(c.responseText)}catch(f){d=null,e={code:500,message:"Could not parse response as JSON. This could also be caused by a CORS or XMLHttpRequest error."}}!e&&d.error&&(e=d.error,d=null),c.onerror=L.Util.falseFn,a.call(b,e,d)}},c}var d=0;window._EsriLeafletCallbacks={},a.Request={request:function(d,e,f,g){var h=b(e),i=c(f,g),j=(d+"?"+h).length;if(2e3>=j&&L.esri.Support.CORS)i.open("GET",d+"?"+h),i.send(null);else{if(!(j>2e3&&L.esri.Support.CORS))return 2e3>=j&&!L.esri.Support.CORS?L.esri.Request.get.JSONP(d,e,f,g):void a.Util.warn("a request to "+d+" was longer then 2000 characters and this browser cannot make a cross-domain post request. Please use a proxy http://esri.github.io/esri-leaflet/api-reference/request.html");i.open("POST",d),i.setRequestHeader("Content-Type","application/x-www-form-urlencoded"),i.send(h)}return i},post:{XMLHTTP:function(a,d,e,f){var g=c(e,f);return g.open("POST",a),g.setRequestHeader("Content-Type","application/x-www-form-urlencoded"),g.send(b(d)),g}},get:{CORS:function(a,d,e,f){var g=c(e,f);return g.open("GET",a+"?"+b(d),!0),g.send(null),g},JSONP:function(a,c,e,f){var g="c"+d;c.callback="window._EsriLeafletCallbacks."+g;var h=L.DomUtil.create("script",null,document.body);return h.type="text/javascript",h.src=a+"?"+b(c),h.id=g,window._EsriLeafletCallbacks[g]=function(a){if(window._EsriLeafletCallbacks[g]!==!0){var b,c=Object.prototype.toString.call(a);"[object Object]"!==c&&"[object Array]"!==c&&(b={error:{code:500,message:"Expected array or object as JSONP response"}},a=null),!b&&a.error&&(b=a,a=null),e.call(f,b,a),window._EsriLeafletCallbacks[g]=!0}},d++,{id:g,url:h.src,abort:function(){window._EsriLeafletCallbacks._callback[g]({code:0,message:"Request aborted."})}}}}},a.get=a.Support.CORS?a.Request.get.CORS:a.Request.get.JSONP,a.post=a.Request.post.XMLHTTP,a.request=a.Request.request}(EsriLeaflet),EsriLeaflet.Services.Service=L.Class.extend({includes:L.Mixin.Events,options:{proxy:!1,useCors:EsriLeaflet.Support.CORS},initialize:function(a){a=a||{},this._requestQueue=[],this._authenticating=!1,L.Util.setOptions(this,a),this.options.url=EsriLeaflet.Util.cleanUrl(this.options.url)},get:function(a,b,c,d){return this._request("get",a,b,c,d)},post:function(a,b,c,d){return this._request("post",a,b,c,d)},request:function(a,b,c,d){return this._request("request",a,b,c,d)},metadata:function(a,b){return this._request("get","",{},a,b)},authenticate:function(a){return this._authenticating=!1,this.options.token=a,this._runQueue(),this},_request:function(a,b,c,d,e){this.fire("requeststart",{url:this.options.url+b,params:c,method:a});var f=this._createServiceCallback(a,b,c,d,e);if(this.options.token&&(c.token=this.options.token),this._authenticating)return void this._requestQueue.push([a,b,c,d,e]);var g=this.options.proxy?this.options.proxy+"?"+this.options.url+b:this.options.url+b;return"get"!==a&&"request"!==a||this.options.useCors?EsriLeaflet[a](g,c,f):EsriLeaflet.Request.get.JSONP(g,c,f)},_createServiceCallback:function(a,b,c,d,e){return L.Util.bind(function(f,g){!f||499!==f.code&&498!==f.code||(this._authenticating=!0,this._requestQueue.push([a,b,c,d,e]),this.fire("authenticationrequired",{authenticate:L.Util.bind(this.authenticate,this)}),f.authenticate=L.Util.bind(this.authenticate,this)),d.call(e,f,g),f?this.fire("requesterror",{url:this.options.url+b,params:c,message:f.message,code:f.code,method:a}):this.fire("requestsuccess",{url:this.options.url+b,params:c,response:g,method:a}),this.fire("requestend",{url:this.options.url+b,params:c,method:a})},this)},_runQueue:function(){for(var a=this._requestQueue.length-1;a>=0;a--){var b=this._requestQueue[a],c=b.shift();this[c].apply(this,b)}this._requestQueue=[]}}),EsriLeaflet.Services.service=function(a){return new EsriLeaflet.Services.Service(a)},EsriLeaflet.Services.FeatureLayerService=EsriLeaflet.Services.Service.extend({options:{idAttribute:"OBJECTID"},query:function(){return new EsriLeaflet.Tasks.Query(this)},addFeature:function(a,b,c){return delete a.id,a=EsriLeaflet.Util.geojsonToArcGIS(a),this.post("addFeatures",{features:[a]},function(a,d){var e=d&&d.addResults?d.addResults[0]:void 0;b&&b.call(c,a||d.addResults[0].error,e)},c)},updateFeature:function(a,b,c){return a=EsriLeaflet.Util.geojsonToArcGIS(a,this.options.idAttribute),this.post("updateFeatures",{features:[a]},function(a,d){var e=d&&d.updateResults?d.updateResults[0]:void 0;b&&b.call(c,a||d.updateResults[0].error,e)},c)},deleteFeature:function(a,b,c){return this.post("deleteFeatures",{objectIds:a},function(a,d){var e=d&&d.deleteResults?d.deleteResults[0]:void 0;b&&b.call(c,a||d.deleteResults[0].error,e)},c)},deleteFeatures:function(a,b,c){return this.post("deleteFeatures",{objectIds:a},function(a,d){var e=d&&d.deleteResults?d.deleteResults:void 0;b&&b.call(c,a||d.deleteResults[0].error,e)},c)}}),EsriLeaflet.Services.featureLayerService=function(a){return new EsriLeaflet.Services.FeatureLayerService(a)},EsriLeaflet.Services.MapService=EsriLeaflet.Services.Service.extend({identify:function(){return new EsriLeaflet.Tasks.identifyFeatures(this)},find:function(){return new EsriLeaflet.Tasks.Find(this)},query:function(){return new EsriLeaflet.Tasks.Query(this)}}),EsriLeaflet.Services.mapService=function(a){return new EsriLeaflet.Services.MapService(a)},EsriLeaflet.Services.ImageService=EsriLeaflet.Services.Service.extend({query:function(){return new EsriLeaflet.Tasks.Query(this)},identify:function(){return new EsriLeaflet.Tasks.IdentifyImage(this)}}),EsriLeaflet.Services.imageService=function(a){return new EsriLeaflet.Services.ImageService(a)},EsriLeaflet.Tasks.Task=L.Class.extend({options:{proxy:!1,useCors:EsriLeaflet.Support.CORS},generateSetter:function(a,b){return L.Util.bind(function(b){return this.params[a]=b,this},b)},initialize:function(a){if(a.request&&a.options?(this._service=a,L.Util.setOptions(this,a.options)):(L.Util.setOptions(this,a),this.options.url=L.esri.Util.cleanUrl(a.url)),this.params=L.Util.extend({},this.params||{}),this.setters)for(var b in this.setters){var c=this.setters[b];this[b]=this.generateSetter(c,this)}},token:function(a){return this._service?this._service.authenticate(a):this.params.token=a,this},request:function(a,b){return this._service?this._service.request(this.path,this.params,a,b):this._request("request",this.path,this.params,a,b)},_request:function(a,b,c,d,e){var f=this.options.proxy?this.options.proxy+"?"+this.options.url+b:this.options.url+b;return"get"!==a&&"request"!==a||this.options.useCors?EsriLeaflet[a](f,c,d,e):EsriLeaflet.Request.get.JSONP(f,c,d,e)}}),EsriLeaflet.Tasks.Query=EsriLeaflet.Tasks.Task.extend({setters:{offset:"offset",limit:"limit",fields:"outFields",precision:"geometryPrecision",featureIds:"objectIds",returnGeometry:"returnGeometry",token:"token"},path:"query",params:{returnGeometry:!0,where:"1=1",outSr:4326,outFields:"*"},within:function(a){return this._setGeometry(a),this.params.spatialRel="esriSpatialRelContains",this},intersects:function(a){return this._setGeometry(a),this.params.spatialRel="esriSpatialRelIntersects",this},contains:function(a){return this._setGeometry(a),this.params.spatialRel="esriSpatialRelWithin",this},overlaps:function(a){return this._setGeometry(a),this.params.spatialRel="esriSpatialRelOverlaps",this},nearby:function(a,b){return a=L.latLng(a),this.params.geometry=[a.lng,a.lat],this.params.geometryType="esriGeometryPoint",this.params.spatialRel="esriSpatialRelIntersects",this.params.units="esriSRUnit_Meter",this.params.distance=b,this.params.inSr=4326,this},where:function(a){return this.params.where=a,this},between:function(a,b){return this.params.time=[a.valueOf(),b.valueOf()],this},simplify:function(a,b){var c=Math.abs(a.getBounds().getWest()-a.getBounds().getEast());return this.params.maxAllowableOffset=c/a.getSize().y*b,this},orderBy:function(a,b){return b=b||"ASC",this.params.orderByFields=this.params.orderByFields?this.params.orderByFields+",":"",this.params.orderByFields+=[a,b].join(" "),this},run:function(a,b){return this._cleanParams(),EsriLeaflet.Util.isArcgisOnline(this.options.url)?(this.params.f="geojson",this.request(function(c,d){this._trapSQLerrors(c),a.call(b,c,d,d)},this)):this.request(function(c,d){this._trapSQLerrors(c),a.call(b,c,d&&EsriLeaflet.Util.responseToFeatureCollection(d),d)},this)},count:function(a,b){return this._cleanParams(),this.params.returnCountOnly=!0,this.request(function(b,c){a.call(this,b,c&&c.count,c)},b)},ids:function(a,b){return this._cleanParams(),this.params.returnIdsOnly=!0,this.request(function(b,c){a.call(this,b,c&&c.objectIds,c)},b)},bounds:function(a,b){return this._cleanParams(),this.params.returnExtentOnly=!0,this.request(function(c,d){a.call(b,c,d&&d.extent&&EsriLeaflet.Util.extentToBounds(d.extent),d)},b)},pixelSize:function(a){return a=L.point(a),this.params.pixelSize=[a.x,a.y],this},layer:function(a){return this.path=a+"/query",this},_trapSQLerrors:function(a){a&&"400"===a.code&&EsriLeaflet.Util.warn("one common syntax error in query requests is encasing string values in double quotes instead of single quotes")},_cleanParams:function(){delete this.params.returnIdsOnly,delete this.params.returnExtentOnly,delete this.params.returnCountOnly},_setGeometry:function(a){return this.params.inSr=4326,a instanceof L.LatLngBounds?(this.params.geometry=EsriLeaflet.Util.boundsToExtent(a),void(this.params.geometryType="esriGeometryEnvelope")):(a.getLatLng&&(a=a.getLatLng()),a instanceof L.LatLng&&(a={type:"Point",coordinates:[a.lng,a.lat]}),a instanceof L.GeoJSON&&(a=a.getLayers()[0].feature.geometry,this.params.geometry=EsriLeaflet.Util.geojsonToArcGIS(a),this.params.geometryType=EsriLeaflet.Util.geojsonTypeToArcGIS(a.type)),a.toGeoJSON&&(a=a.toGeoJSON()),"Feature"===a.type&&(a=a.geometry),"Point"===a.type||"LineString"===a.type||"Polygon"===a.type?(this.params.geometry=EsriLeaflet.Util.geojsonToArcGIS(a),void(this.params.geometryType=EsriLeaflet.Util.geojsonTypeToArcGIS(a.type))):void EsriLeaflet.Util.warn("invalid geometry passed to spatial query. Should be an L.LatLng, L.LatLngBounds or L.Marker or a GeoJSON Point Line or Polygon object"))}}),EsriLeaflet.Tasks.query=function(a){return new EsriLeaflet.Tasks.Query(a)},EsriLeaflet.Tasks.Find=EsriLeaflet.Tasks.Task.extend({setters:{contains:"contains",text:"searchText",fields:"searchFields",spatialReference:"sr",sr:"sr",layers:"layers",returnGeometry:"returnGeometry",maxAllowableOffset:"maxAllowableOffset",precision:"geometryPrecision",dynamicLayers:"dynamicLayers",returnZ:"returnZ",returnM:"returnM",gdbVersion:"gdbVersion",token:"token"},path:"find",params:{sr:4326,contains:!0,returnGeometry:!0,returnZ:!0,returnM:!1},layerDefs:function(a,b){return this.params.layerDefs=this.params.layerDefs?this.params.layerDefs+";":"",this.params.layerDefs+=[a,b].join(":"),this},simplify:function(a,b){var c=Math.abs(a.getBounds().getWest()-a.getBounds().getEast());return this.params.maxAllowableOffset=c/a.getSize().y*b,this},run:function(a,b){return this.request(function(c,d){a.call(b,c,d&&EsriLeaflet.Util.responseToFeatureCollection(d),d)},b)}}),EsriLeaflet.Tasks.find=function(a){return new EsriLeaflet.Tasks.Find(a)},EsriLeaflet.Tasks.Identify=EsriLeaflet.Tasks.Task.extend({path:"identify",between:function(a,b){return this.params.time=[a.valueOf(),b.valueOf()],this}}),EsriLeaflet.Tasks.IdentifyImage=EsriLeaflet.Tasks.Identify.extend({setters:{setMosaicRule:"mosaicRule",setRenderingRule:"renderingRule",setPixelSize:"pixelSize",returnCatalogItems:"returnCatalogItems",returnGeometry:"returnGeometry"},params:{returnGeometry:!1},at:function(a){return a=L.latLng(a),this.params.geometry=JSON.stringify({x:a.lng,y:a.lat,spatialReference:{wkid:4326}}),this.params.geometryType="esriGeometryPoint",this},getMosaicRule:function(){return this.params.mosaicRule},getRenderingRule:function(){return this.params.renderingRule},getPixelSize:function(){return this.params.pixelSize},run:function(a,b){return this.request(function(c,d){a.call(b,c,d&&this._responseToGeoJSON(d),d)},this)},_responseToGeoJSON:function(a){var b=a.location,c=a.catalogItems,d=a.catalogItemVisibilities,e={pixel:{type:"Feature",geometry:{type:"Point",coordinates:[b.x,b.y]},crs:{type:"EPSG",properties:{code:b.spatialReference.wkid}},properties:{OBJECTID:a.objectId,name:a.name,value:a.value},id:a.objectId}};if(a.properties&&a.properties.Values&&(e.pixel.properties.values=a.properties.Values),c&&c.features&&(e.catalogItems=EsriLeaflet.Util.responseToFeatureCollection(c),d&&d.length===e.catalogItems.features.length))for(var f=d.length-1;f>=0;f--)e.catalogItems.features[f].properties.catalogItemVisibility=d[f];return e}}),EsriLeaflet.Tasks.identifyImage=function(a){return new EsriLeaflet.Tasks.IdentifyImage(a)},EsriLeaflet.Tasks.IdentifyFeatures=EsriLeaflet.Tasks.Identify.extend({setters:{layers:"layers",precision:"geometryPrecision",tolerance:"tolerance",returnGeometry:"returnGeometry"},params:{sr:4326,layers:"all",tolerance:3,returnGeometry:!0},on:function(a){var b=EsriLeaflet.Util.boundsToExtent(a.getBounds()),c=a.getSize();return this.params.imageDisplay=[c.x,c.y,96],this.params.mapExtent=[b.xmin,b.ymin,b.xmax,b.ymax],this},at:function(a){return a=L.latLng(a),this.params.geometry=[a.lng,a.lat],this.params.geometryType="esriGeometryPoint",this},layerDef:function(a,b){return this.params.layerDefs=this.params.layerDefs?this.params.layerDefs+";":"",this.params.layerDefs+=[a,b].join(":"),this},simplify:function(a,b){var c=Math.abs(a.getBounds().getWest()-a.getBounds().getEast());return this.params.maxAllowableOffset=c/a.getSize().y*(1-b),this},run:function(a,b){return this.request(function(c,d){if(c)return void a.call(b,c,void 0,d);var e=EsriLeaflet.Util.responseToFeatureCollection(d);d.results=d.results.reverse();for(var f=0;f<e.features.length;f++){var g=e.features[f];g.layerId=d.results[f].layerId}a.call(b,void 0,e,d)})}}),EsriLeaflet.Tasks.identifyFeatures=function(a){return new EsriLeaflet.Tasks.IdentifyFeatures(a)},function(a){var b="https:"!==window.location.protocol?"http:":"https:";a.Layers.BasemapLayer=L.TileLayer.extend({statics:{TILES:{Streets:{urlTemplate:b+"//{s}.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}",attributionUrl:"https://static.arcgis.com/attribution/World_Street_Map",options:{hideLogo:!1,logoPosition:"bottomright",minZoom:1,maxZoom:19,subdomains:["server","services"],attribution:"Esri"}},Topographic:{urlTemplate:b+"//{s}.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}",attributionUrl:"https://static.arcgis.com/attribution/World_Topo_Map",options:{hideLogo:!1,logoPosition:"bottomright",minZoom:1,maxZoom:19,subdomains:["server","services"],attribution:"Esri"}},Oceans:{urlTemplate:b+"//{s}.arcgisonline.com/arcgis/rest/services/Ocean/World_Ocean_Base/MapServer/tile/{z}/{y}/{x}",attributionUrl:"https://static.arcgis.com/attribution/Ocean_Basemap",options:{hideLogo:!1,logoPosition:"bottomright",minZoom:1,maxZoom:16,subdomains:["server","services"],attribution:"Esri"}},OceansLabels:{urlTemplate:b+"//{s}.arcgisonline.com/arcgis/rest/services/Ocean/World_Ocean_Reference/MapServer/tile/{z}/{y}/{x}",options:{hideLogo:!0,logoPosition:"bottomright",minZoom:1,maxZoom:16,subdomains:["server","services"]}},NationalGeographic:{urlTemplate:b+"//{s}.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer/tile/{z}/{y}/{x}",options:{hideLogo:!1,logoPosition:"bottomright",minZoom:1,maxZoom:16,subdomains:["server","services"],attribution:"Esri"}},DarkGray:{urlTemplate:b+"//{s}.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}",options:{hideLogo:!1,logoPosition:"bottomright",minZoom:1,maxZoom:16,subdomains:["server","services"],attribution:"Esri, DeLorme, HERE"}},DarkGrayLabels:{urlTemplate:b+"//{s}.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}",options:{hideLogo:!0,logoPosition:"bottomright",minZoom:1,maxZoom:16,subdomains:["server","services"]}},Gray:{urlTemplate:b+"//{s}.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}",options:{hideLogo:!1,logoPosition:"bottomright",minZoom:1,maxZoom:16,subdomains:["server","services"],attribution:"Esri, NAVTEQ, DeLorme"}},GrayLabels:{urlTemplate:b+"//{s}.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Reference/MapServer/tile/{z}/{y}/{x}",options:{hideLogo:!0,logoPosition:"bottomright",minZoom:1,maxZoom:16,subdomains:["server","services"]}},Imagery:{urlTemplate:b+"//{s}.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",options:{hideLogo:!1,logoPosition:"bottomright",minZoom:1,maxZoom:19,subdomains:["server","services"],attribution:"Esri, DigitalGlobe, GeoEye, i-cubed, USDA, USGS, AEX, Getmapping, Aerogrid, IGN, IGP, swisstopo, and the GIS User Community"}},ImageryLabels:{urlTemplate:b+"//{s}.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",options:{hideLogo:!0,logoPosition:"bottomright",minZoom:1,maxZoom:19,subdomains:["server","services"]}},ImageryTransportation:{urlTemplate:b+"//{s}.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}",options:{hideLogo:!0,logoPosition:"bottomright",minZoom:1,maxZoom:19,subdomains:["server","services"]}},ShadedRelief:{urlTemplate:b+"//{s}.arcgisonline.com/ArcGIS/rest/services/World_Shaded_Relief/MapServer/tile/{z}/{y}/{x}",options:{hideLogo:!1,logoPosition:"bottomright",minZoom:1,maxZoom:13,subdomains:["server","services"],attribution:"Esri, NAVTEQ, DeLorme"}},ShadedReliefLabels:{urlTemplate:b+"//{s}.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places_Alternate/MapServer/tile/{z}/{y}/{x}",options:{hideLogo:!0,logoPosition:"bottomright",minZoom:1,maxZoom:12,subdomains:["server","services"]}},Terrain:{urlTemplate:b+"//{s}.arcgisonline.com/ArcGIS/rest/services/World_Terrain_Base/MapServer/tile/{z}/{y}/{x}",options:{hideLogo:!1,logoPosition:"bottomright",minZoom:1,maxZoom:13,subdomains:["server","services"],attribution:"Esri, USGS, NOAA"}},TerrainLabels:{urlTemplate:b+"//{s}.arcgisonline.com/ArcGIS/rest/services/Reference/World_Reference_Overlay/MapServer/tile/{z}/{y}/{x}",options:{hideLogo:!0,logoPosition:"bottomright",minZoom:1,maxZoom:13,subdomains:["server","services"]}}}},initialize:function(b,c){var d;if("object"==typeof b&&b.urlTemplate&&b.options)d=b;else{if("string"!=typeof b||!a.BasemapLayer.TILES[b])throw new Error('L.esri.BasemapLayer: Invalid parameter. Use one of "Streets", "Topographic", "Oceans", "OceansLabels", "NationalGeographic", "Gray", "GrayLabels", "DarkGray", "DarkGrayLabels", "Imagery", "ImageryLabels", "ImageryTransportation", "ShadedRelief", "ShadedReliefLabels", "Terrain" or "TerrainLabels"');d=a.BasemapLayer.TILES[b]}var e=L.Util.extend(d.options,c);L.TileLayer.prototype.initialize.call(this,d.urlTemplate,L.Util.setOptions(this,e)),d.attributionUrl&&this._getAttributionData(d.attributionUrl),this._logo=new a.Controls.Logo({position:this.options.logoPosition})},onAdd:function(a){this.options.hideLogo||a._hasEsriLogo||(this._logo.addTo(a),a._hasEsriLogo=!0),L.TileLayer.prototype.onAdd.call(this,a),a.on("moveend",this._updateMapAttribution,this)},onRemove:function(a){this._logo&&this._logo._container&&(a.removeControl(this._logo),a._hasEsriLogo=!1),L.TileLayer.prototype.onRemove.call(this,a),a.off("moveend",this._updateMapAttribution,this)},getAttribution:function(){var a='<span class="esri-attributions" style="line-height:14px; vertical-align: -3px; text-overflow:ellipsis; white-space:nowrap; overflow:hidden; display:inline-block;">'+this.options.attribution+"</span>";return a},_getAttributionData:function(a){L.esri.Request.get.JSONP(a,{},L.Util.bind(function(a,b){this._attributions=[];for(var c=0;c<b.contributors.length;c++)for(var d=b.contributors[c],e=0;e<d.coverageAreas.length;e++){var f=d.coverageAreas[e],g=new L.LatLng(f.bbox[0],f.bbox[1]),h=new L.LatLng(f.bbox[2],f.bbox[3]);this._attributions.push({attribution:d.attribution,score:f.score,bounds:new L.LatLngBounds(g,h),minZoom:f.zoomMin,maxZoom:f.zoomMax})}this._attributions.sort(function(a,b){return b.score-a.score}),this._updateMapAttribution()},this))},_updateMapAttribution:function(){if(this._map&&this._map.attributionControl&&this._attributions){for(var a="",b=this._map.getBounds(),c=this._map.getZoom(),d=0;d<this._attributions.length;d++){var e=this._attributions[d],f=e.attribution;!a.match(f)&&b.intersects(e.bounds)&&c>=e.minZoom&&c<=e.maxZoom&&(a+=", "+f)}a=a.substr(2);var g=this._map.attributionControl._container.querySelector(".esri-attributions");g.innerHTML=a,g.style.maxWidth=.65*this._map.getSize().x+"px",this.fire("attributionupdated",{attribution:a})}}}),a.BasemapLayer=a.Layers.BasemapLayer,a.Layers.basemapLayer=function(b,c){return new a.Layers.BasemapLayer(b,c)},a.basemapLayer=function(b,c){return new a.Layers.BasemapLayer(b,c)}}(EsriLeaflet),EsriLeaflet.Layers.RasterLayer=L.Class.extend({includes:L.Mixin.Events,options:{opacity:1,position:"front",f:"image"},onAdd:function(a){if(this._map=a,this._update=L.Util.limitExecByInterval(this._update,this.options.updateInterval,this),a.options.crs&&a.options.crs.code){var b=a.options.crs.code.split(":")[1];this.options.bboxSR=b,this.options.imageSR=b}a.on("moveend",this._update,this),this._currentImage&&this._currentImage._bounds.equals(this._map.getBounds())?a.addLayer(this._currentImage):this._currentImage&&(this._map.removeLayer(this._currentImage),this._currentImage=null),this._update(),this._popup&&(this._map.on("click",this._getPopupData,this),this._map.on("dblclick",this._resetPopupState,this))},bindPopup:function(a,b){return this._shouldRenderPopup=!1,this._lastClick=!1,this._popup=L.popup(b),this._popupFunction=a,this._map&&(this._map.on("click",this._getPopupData,this),this._map.on("dblclick",this._resetPopupState,this)),this},unbindPopup:function(){return this._map&&(this._map.closePopup(this._popup),this._map.off("click",this._getPopupData,this),this._map.off("dblclick",this._resetPopupState,this)),this._popup=!1,this},onRemove:function(a){this._currentImage&&this._map.removeLayer(this._currentImage),this._popup&&(this._map.off("click",this._getPopupData,this),this._map.off("dblclick",this._resetPopupState,this)),this._map.off("moveend",this._update,this),this._map=null},addTo:function(a){return a.addLayer(this),this},removeFrom:function(a){return a.removeLayer(this),this},bringToFront:function(){return this.options.position="front",this._currentImage&&this._currentImage.bringToFront(),this},bringToBack:function(){return this.options.position="back",this._currentImage&&this._currentImage.bringToBack(),this},getAttribution:function(){return this.options.attribution},getOpacity:function(){return this.options.opacity},setOpacity:function(a){return this.options.opacity=a,this._currentImage.setOpacity(a),this},getTimeRange:function(){return[this.options.from,this.options.to]},setTimeRange:function(a,b){return this.options.from=a,this.options.to=b,this._update(),this},metadata:function(a,b){return this._service.metadata(a,b),this},authenticate:function(a){return this._service.authenticate(a),this},_renderImage:function(a,b){if(this._map){var c=new L.ImageOverlay(a,b,{opacity:0}).addTo(this._map);c.once("load",function(a){var c=a.target,d=this._currentImage;c._bounds.equals(b)&&c._bounds.equals(this._map.getBounds())?(this._currentImage=c,"front"===this.options.position?this.bringToFront():this.bringToBack(),this._map&&this._currentImage._map?this._currentImage.setOpacity(this.options.opacity):this._currentImage._map.removeLayer(this._currentImage),d&&this._map&&this._map.removeLayer(d),d&&d._map&&d._map.removeLayer(d)):this._map.removeLayer(c),this.fire("load",{bounds:b})},this),this.fire("loading",{bounds:b})}},_update:function(){if(this._map){var a=this._map.getZoom(),b=this._map.getBounds();if(!this._animatingZoom&&!(this._map._panTransition&&this._map._panTransition._inProgress||a>this.options.maxZoom||a<this.options.minZoom)){var c=this._buildExportParams();this._requestExport(c,b)}}},_renderPopup:function(a,b,c,d){if(a=L.latLng(a),this._shouldRenderPopup&&this._lastClick.equals(a)){var e=this._popupFunction(b,c,d);e&&this._popup.setLatLng(a).setContent(e).openOn(this._map)}},_resetPopupState:function(a){this._shouldRenderPopup=!1,this._lastClick=a.latlng},_propagateEvent:function(a){a=L.extend({layer:a.target,target:this},a),this.fire(a.type,a)}}),EsriLeaflet.Layers.DynamicMapLayer=EsriLeaflet.Layers.RasterLayer.extend({options:{updateInterval:150,layers:!1,layerDefs:!1,timeOptions:!1,format:"png24",transparent:!0,f:"json"},initialize:function(a){a.url=EsriLeaflet.Util.cleanUrl(a.url),this._service=new EsriLeaflet.Services.MapService(a),this._service.on("authenticationrequired requeststart requestend requesterror requestsuccess",this._propagateEvent,this),(a.proxy||a.token)&&"json"!==a.f&&(a.f="json"),L.Util.setOptions(this,a)},getDynamicLayers:function(){return this.options.dynamicLayers},setDynamicLayers:function(a){return this.options.dynamicLayers=a,this._update(),this},getLayers:function(){return this.options.layers},setLayers:function(a){return this.options.layers=a,this._update(),this},getLayerDefs:function(){return this.options.layerDefs},setLayerDefs:function(a){return this.options.layerDefs=a,this._update(),this},getTimeOptions:function(){return this.options.timeOptions},setTimeOptions:function(a){return this.options.timeOptions=a,this._update(),this},query:function(){return this._service.query()},identify:function(){return this._service.identify()},find:function(){return this._service.find()},_getPopupData:function(a){var b=L.Util.bind(function(b,c,d){b||setTimeout(L.Util.bind(function(){this._renderPopup(a.latlng,b,c,d)},this),300)},this),c=this.identify().on(this._map).at(a.latlng);this.options.layers?c.layers("visible:"+this.options.layers.join(",")):c.layers("visible"),c.run(b),this._shouldRenderPopup=!0,this._lastClick=a.latlng},_buildExportParams:function(){var a=this._map.getBounds(),b=this._map.getSize(),c=this._map.options.crs.project(a._northEast),d=this._map.options.crs.project(a._southWest),e=this._map.latLngToLayerPoint(a._northEast),f=this._map.latLngToLayerPoint(a._southWest);
  (e.y>0||f.y<b.y)&&(b.y=f.y-e.y);var g={bbox:[d.x,d.y,c.x,c.y].join(","),size:b.x+","+b.y,dpi:96,format:this.options.format,transparent:this.options.transparent,bboxSR:this.options.bboxSR,imageSR:this.options.imageSR};return this.options.dynamicLayers&&(g.dynamicLayers=this.options.dynamicLayers),this.options.layers&&(g.layers="show:"+this.options.layers.join(",")),this.options.layerDefs&&(g.layerDefs=JSON.stringify(this.options.layerDefs)),this.options.timeOptions&&(g.timeOptions=JSON.stringify(this.options.timeOptions)),this.options.from&&this.options.to&&(g.time=this.options.from.valueOf()+","+this.options.to.valueOf()),this._service.options.token&&(g.token=this._service.options.token),g},_requestExport:function(a,b){"json"===this.options.f?this._service.request("export",a,function(a,c){a||this._renderImage(c.href,b)},this):(a.f="image",this._renderImage(this.options.url+"export"+L.Util.getParamString(a),b))}}),EsriLeaflet.DynamicMapLayer=EsriLeaflet.Layers.DynamicMapLayer,EsriLeaflet.Layers.dynamicMapLayer=function(a){return new EsriLeaflet.Layers.DynamicMapLayer(a)},EsriLeaflet.dynamicMapLayer=function(a){return new EsriLeaflet.Layers.DynamicMapLayer(a)},EsriLeaflet.Layers.ImageMapLayer=EsriLeaflet.Layers.RasterLayer.extend({options:{updateInterval:150,format:"jpgpng",transparent:!0,f:"json"},query:function(){return this._service.query()},identify:function(){return this._service.identify()},initialize:function(a){a.url=EsriLeaflet.Util.cleanUrl(a.url),this._service=new EsriLeaflet.Services.ImageService(a),this._service.on("authenticationrequired requeststart requestend requesterror requestsuccess",this._propagateEvent,this),L.Util.setOptions(this,a)},setPixelType:function(a){return this.options.pixelType=a,this._update(),this},getPixelType:function(){return this.options.pixelType},setBandIds:function(a){return L.Util.isArray(a)?this.options.bandIds=a.join(","):this.options.bandIds=a.toString(),this._update(),this},getBandIds:function(){return this.options.bandIds},setNoData:function(a,b){return L.Util.isArray(a)?this.options.noData=a.join(","):this.options.noData=a.toString(),b&&(this.options.noDataInterpretation=b),this._update(),this},getNoData:function(){return this.options.noData},getNoDataInterpretation:function(){return this.options.noDataInterpretation},setRenderingRule:function(a){this.options.renderingRule=a,this._update()},getRenderingRule:function(){return this.options.renderingRule},setMosaicRule:function(a){this.options.mosaicRule=a,this._update()},getMosaicRule:function(){return this.options.mosaicRule},_getPopupData:function(a){var b=L.Util.bind(function(b,c,d){b||setTimeout(L.Util.bind(function(){this._renderPopup(a.latlng,b,c,d)},this),300)},this),c=this.identify().at(a.latlng);this.options.mosaicRule&&c.setMosaicRule(this.options.mosaicRule),c.run(b),this._shouldRenderPopup=!0,this._lastClick=a.latlng},_buildExportParams:function(){var a=this._map.getBounds(),b=this._map.getSize(),c=this._map.options.crs.project(a._northEast),d=this._map.options.crs.project(a._southWest),e={bbox:[d.x,d.y,c.x,c.y].join(","),size:b.x+","+b.y,format:this.options.format,transparent:this.options.transparent,bboxSR:this.options.bboxSR,imageSR:this.options.imageSR};return this.options.from&&this.options.to&&(e.time=this.options.from.valueOf()+","+this.options.to.valueOf()),this.options.pixelType&&(e.pixelType=this.options.pixelType),this.options.interpolation&&(e.interpolation=this.options.interpolation),this.options.compressionQuality&&(e.compressionQuality=this.options.compressionQuality),this.options.bandIds&&(e.bandIds=this.options.bandIds),this.options.noData&&(e.noData=this.options.noData),this.options.noDataInterpretation&&(e.noDataInterpretation=this.options.noDataInterpretation),this._service.options.token&&(e.token=this._service.options.token),this.options.renderingRule&&(e.renderingRule=JSON.stringify(this.options.renderingRule)),this.options.mosaicRule&&(e.mosaicRule=JSON.stringify(this.options.mosaicRule)),e},_requestExport:function(a,b){"json"===this.options.f?this._service.request("exportImage",a,function(a,c){a||this._renderImage(c.href,b)},this):(a.f="image",this._renderImage(this.options.url+"exportImage"+L.Util.getParamString(a),b))}}),EsriLeaflet.ImageMapLayer=EsriLeaflet.Layers.ImageMapLayer,EsriLeaflet.Layers.imageMapLayer=function(a){return new EsriLeaflet.Layers.ImageMapLayer(a)},EsriLeaflet.imageMapLayer=function(a){return new EsriLeaflet.Layers.ImageMapLayer(a)},EsriLeaflet.Layers.TiledMapLayer=L.TileLayer.extend({options:{zoomOffsetAllowance:.1,correctZoomLevels:!0},statics:{MercatorZoomLevels:{0:156543.033928,1:78271.5169639999,2:39135.7584820001,3:19567.8792409999,4:9783.93962049996,5:4891.96981024998,6:2445.98490512499,7:1222.99245256249,8:611.49622628138,9:305.748113140558,10:152.874056570411,11:76.4370282850732,12:38.2185141425366,13:19.1092570712683,14:9.55462853563415,15:4.77731426794937,16:2.38865713397468,17:1.19432856685505,18:.597164283559817,19:.298582141647617,20:.14929107082381,21:.07464553541191,22:.0373227677059525,23:.0186613838529763}},initialize:function(a){a.url=EsriLeaflet.Util.cleanUrl(a.url),a=L.Util.setOptions(this,a),this.tileUrl=L.esri.Util.cleanUrl(a.url)+"tile/{z}/{y}/{x}",this._service=new L.esri.Services.MapService(a),this._service.on("authenticationrequired requeststart requestend requesterror requestsuccess",this._propagateEvent,this),this.tileUrl.match("://tiles.arcgisonline.com")&&(this.tileUrl=this.tileUrl.replace("://tiles.arcgisonline.com","://tiles{s}.arcgisonline.com"),a.subdomains=["1","2","3","4"]),this.options.token&&(this.tileUrl+="?token="+this.options.token),L.TileLayer.prototype.initialize.call(this,this.tileUrl,a)},getTileUrl:function(a){return L.Util.template(this.tileUrl,L.extend({s:this._getSubdomain(a),z:this._lodMap[a.z]||a.z,x:a.x,y:a.y},this.options))},onAdd:function(a){!this._lodMap&&this.options.correctZoomLevels?(this._lodMap={},this.metadata(function(b,c){if(!b){var d=c.spatialReference.latestWkid||c.spatialReference.wkid;if(102100===d||3857===d)for(var e=c.tileInfo.lods,f=EsriLeaflet.Layers.TiledMapLayer.MercatorZoomLevels,g=0;g<e.length;g++){var h=e[g];for(var i in f){var j=f[i];if(this._withinPercentage(h.resolution,j,this.options.zoomOffsetAllowance)){this._lodMap[i]=h.level;break}}}else EsriLeaflet.Util.warn("L.esri.TiledMapLayer is using a non-mercator spatial reference. Support may be available through Proj4Leaflet http://esri.github.io/esri-leaflet/examples/non-mercator-projection.html")}L.TileLayer.prototype.onAdd.call(this,a)},this)):L.TileLayer.prototype.onAdd.call(this,a)},metadata:function(a,b){return this._service.metadata(a,b),this},identify:function(){return this._service.identify()},authenticate:function(a){var b="?token="+a;return this.tileUrl=this.options.token?this.tileUrl.replace(/\?token=(.+)/g,b):this.tileUrl+b,this.options.token=a,this._service.authenticate(a),this},_propagateEvent:function(a){a=L.extend({layer:a.target,target:this},a),this.fire(a.type,a)},_withinPercentage:function(a,b,c){var d=Math.abs(a/b-1);return c>d}}),L.esri.TiledMapLayer=L.esri.Layers.tiledMapLayer,L.esri.Layers.tiledMapLayer=function(a){return new L.esri.Layers.TiledMapLayer(a)},L.esri.tiledMapLayer=function(a){return new L.esri.Layers.TiledMapLayer(a)},EsriLeaflet.Layers.FeatureGrid=L.Class.extend({includes:L.Mixin.Events,options:{cellSize:512,updateInterval:150},initialize:function(a){a=L.setOptions(this,a)},onAdd:function(a){this._map=a,this._update=L.Util.limitExecByInterval(this._update,this.options.updateInterval,this),this._map.addEventListener(this.getEvents(),this),this._reset(),this._update()},onRemove:function(){this._map.removeEventListener(this.getEvents(),this),this._removeCells()},getEvents:function(){var a={viewreset:this._reset,moveend:this._update,zoomend:this._onZoom};return a},addTo:function(a){return a.addLayer(this),this},removeFrom:function(a){return a.removeLayer(this),this},_onZoom:function(){var a=this._map.getZoom();a>this.options.maxZoom||a<this.options.minZoom?(this.removeFrom(this._map),this._map.addEventListener("zoomend",this.getEvents().zoomend,this)):this._map.hasLayer(this)||(this._map.removeEventListener("zoomend",this.getEvents().zoomend,this),this.addTo(this._map))},_reset:function(){this._removeCells(),this._cells={},this._activeCells={},this._cellsToLoad=0,this._cellsTotal=0,this._resetWrap()},_resetWrap:function(){var a=this._map,b=a.options.crs;if(!b.infinite){var c=this._getCellSize();b.wrapLng&&(this._wrapLng=[Math.floor(a.project([0,b.wrapLng[0]]).x/c),Math.ceil(a.project([0,b.wrapLng[1]]).x/c)]),b.wrapLat&&(this._wrapLat=[Math.floor(a.project([b.wrapLat[0],0]).y/c),Math.ceil(a.project([b.wrapLat[1],0]).y/c)])}},_getCellSize:function(){return this.options.cellSize},_update:function(){if(this._map){var a=this._map.getPixelBounds(),b=this._map.getZoom(),c=this._getCellSize(),d=[c/2,c/2];if(!(b>this.options.maxZoom||b<this.options.minZoom)){var e=a.min.subtract(d).divideBy(c).floor();e.x=Math.max(e.x,0),e.y=Math.max(e.y,0);var f=L.bounds(e,a.max.add(d).divideBy(c).floor());this._removeOtherCells(f),this._addCells(f)}}},_addCells:function(a){var b,c,d,e=[],f=a.getCenter(),g=this._map.getZoom();for(b=a.min.y;b<=a.max.y;b++)for(c=a.min.x;c<=a.max.x;c++)d=new L.Point(c,b),d.z=g,e.push(d);var h=e.length;if(0!==h)for(this._cellsToLoad+=h,this._cellsTotal+=h,e.sort(function(a,b){return a.distanceTo(f)-b.distanceTo(f)}),c=0;h>c;c++)this._addCell(e[c])},_cellCoordsToBounds:function(a){var b=this._map,c=this.options.cellSize,d=a.multiplyBy(c),e=d.add([c,c]),f=b.unproject(d,a.z).wrap(),g=b.unproject(e,a.z).wrap();return new L.LatLngBounds(f,g)},_cellCoordsToKey:function(a){return a.x+":"+a.y},_keyToCellCoords:function(a){var b=a.split(":"),c=parseInt(b[0],10),d=parseInt(b[1],10);return new L.Point(c,d)},_removeOtherCells:function(a){for(var b in this._cells)a.contains(this._keyToCellCoords(b))||this._removeCell(b)},_removeCell:function(a){var b=this._activeCells[a];b&&(delete this._activeCells[a],this.cellLeave&&this.cellLeave(b.bounds,b.coords),this.fire("cellleave",{bounds:b.bounds,coords:b.coords}))},_removeCells:function(){for(var a in this._cells){var b=this._cells[a].bounds,c=this._cells[a].coords;this.cellLeave&&this.cellLeave(b,c),this.fire("cellleave",{bounds:b,coords:c})}},_addCell:function(a){this._wrapCoords(a);var b=this._cellCoordsToKey(a),c=this._cells[b];c&&!this._activeCells[b]&&(this.cellEnter&&this.cellEnter(c.bounds,a),this.fire("cellenter",{bounds:c.bounds,coords:a}),this._activeCells[b]=c),c||(c={coords:a,bounds:this._cellCoordsToBounds(a)},this._cells[b]=c,this._activeCells[b]=c,this.createCell&&this.createCell(c.bounds,a),this.fire("cellcreate",{bounds:c.bounds,coords:a}))},_wrapCoords:function(a){a.x=this._wrapLng?L.Util.wrapNum(a.x,this._wrapLng):a.x,a.y=this._wrapLat?L.Util.wrapNum(a.y,this._wrapLat):a.y}}),function(a){function b(a){this.values=a||[]}a.Layers.FeatureManager=a.Layers.FeatureGrid.extend({options:{where:"1=1",fields:["*"],from:!1,to:!1,timeField:!1,timeFilterMode:"server",simplifyFactor:0,precision:6},initialize:function(c){if(a.Layers.FeatureGrid.prototype.initialize.call(this,c),c.url=a.Util.cleanUrl(c.url),c=L.setOptions(this,c),this._service=new a.Services.FeatureLayerService(c),"*"!==this.options.fields[0]){for(var d=!1,e=0;e<this.options.fields.length;e++)this.options.fields[e].match(/^(OBJECTID|FID|OID|ID)$/i)&&(d=!0);d===!1&&a.Util.warn("no known esriFieldTypeOID field detected in fields Array.  Please add an attribute field containing unique IDs to ensure the layer can be drawn correctly.")}this._service.on("authenticationrequired requeststart requestend requesterror requestsuccess",function(a){a=L.extend({target:this},a),this.fire(a.type,a)},this),this.options.timeField.start&&this.options.timeField.end?(this._startTimeIndex=new b,this._endTimeIndex=new b):this.options.timeField&&(this._timeIndex=new b),this._cache={},this._currentSnapshot=[],this._activeRequests=0,this._pendingRequests=[]},onAdd:function(b){return a.Layers.FeatureGrid.prototype.onAdd.call(this,b)},onRemove:function(b){return a.Layers.FeatureGrid.prototype.onRemove.call(this,b)},getAttribution:function(){return this.options.attribution},createCell:function(a,b){this._requestFeatures(a,b)},_requestFeatures:function(b,c,d){this._activeRequests++,1===this._activeRequests&&this.fire("loading",{bounds:b}),this._buildQuery(b).run(function(e,f,g){g&&g.exceededTransferLimit&&this.fire("drawlimitexceeded"),!e&&f&&f.features.length&&a.Util.requestAnimationFrame(L.Util.bind(function(){this._addFeatures(f.features,c),this._postProcessFeatures(b)},this)),e||!f||f.features.length||this._postProcessFeatures(b),d&&d.call(this,e,f)},this)},_postProcessFeatures:function(a){this._activeRequests--,this._activeRequests<=0&&this.fire("load",{bounds:a})},_cacheKey:function(a){return a.z+":"+a.x+":"+a.y},_addFeatures:function(a,b){var c=this._cacheKey(b);this._cache[c]=this._cache[c]||[];for(var d=a.length-1;d>=0;d--){var e=a[d].id;this._currentSnapshot.push(e),this._cache[c].push(e)}this.options.timeField&&this._buildTimeIndexes(a);var f=this._map.getZoom();f>this.options.maxZoom||f<this.options.minZoom||this.createLayers(a)},_buildQuery:function(a){var b=this._service.query().intersects(a).where(this.options.where).fields(this.options.fields).precision(this.options.precision);return this.options.simplifyFactor&&b.simplify(this._map,this.options.simplifyFactor),"server"===this.options.timeFilterMode&&this.options.from&&this.options.to&&b.between(this.options.from,this.options.to),b},setWhere:function(b,c,d){this.options.where=b&&b.length?b:"1=1";for(var e=[],f=[],g=0,h=null,i=L.Util.bind(function(b,i){if(g--,b&&(h=b),i)for(var j=i.features.length-1;j>=0;j--)f.push(i.features[j].id);0>=g&&(this._currentSnapshot=f,a.Util.requestAnimationFrame(L.Util.bind(function(){this.removeLayers(e),this.addLayers(f),c&&c.call(d,h)},this)))},this),j=this._currentSnapshot.length-1;j>=0;j--)e.push(this._currentSnapshot[j]);for(var k in this._activeCells){g++;var l=this._keyToCellCoords(k),m=this._cellCoordsToBounds(l);this._requestFeatures(m,k,i)}return this},getWhere:function(){return this.options.where},getTimeRange:function(){return[this.options.from,this.options.to]},setTimeRange:function(a,b,c,d){var e=this.options.from,f=this.options.to,g=0,h=null,i=L.Util.bind(function(i){i&&(h=i),this._filterExistingFeatures(e,f,a,b),g--,c&&0>=g&&c.call(d,h)},this);if(this.options.from=a,this.options.to=b,this._filterExistingFeatures(e,f,a,b),"server"===this.options.timeFilterMode)for(var j in this._activeCells){g++;var k=this._keyToCellCoords(j),l=this._cellCoordsToBounds(k);this._requestFeatures(l,j,i)}},refresh:function(){for(var a in this._activeCells){var b=this._keyToCellCoords(a),c=this._cellCoordsToBounds(b);this._requestFeatures(c,a)}this.redraw&&this.once("load",function(){this.eachFeature(function(a){this._redraw(a.feature.id)},this)},this)},_filterExistingFeatures:function(b,c,d,e){var f=b&&c?this._getFeaturesInTimeRange(b,c):this._currentSnapshot,g=this._getFeaturesInTimeRange(d,e);if(g.indexOf)for(var h=0;h<g.length;h++){var i=f.indexOf(g[h]);i>=0&&f.splice(i,1)}a.Util.requestAnimationFrame(L.Util.bind(function(){this.removeLayers(f),this.addLayers(g)},this))},_getFeaturesInTimeRange:function(a,b){var c,d=[];if(this.options.timeField.start&&this.options.timeField.end){var e=this._startTimeIndex.between(a,b),f=this._endTimeIndex.between(a,b);c=e.concat(f)}else c=this._timeIndex.between(a,b);for(var g=c.length-1;g>=0;g--)d.push(c[g].id);return d},_buildTimeIndexes:function(a){var b,c;if(this.options.timeField.start&&this.options.timeField.end){var d=[],e=[];for(b=a.length-1;b>=0;b--)c=a[b],d.push({id:c.id,value:new Date(c.properties[this.options.timeField.start])}),e.push({id:c.id,value:new Date(c.properties[this.options.timeField.end])});this._startTimeIndex.bulkAdd(d),this._endTimeIndex.bulkAdd(e)}else{var f=[];for(b=a.length-1;b>=0;b--)c=a[b],f.push({id:c.id,value:new Date(c.properties[this.options.timeField])});this._timeIndex.bulkAdd(f)}},_featureWithinTimeRange:function(a){if(!this.options.from||!this.options.to)return!0;var b=+this.options.from.valueOf(),c=+this.options.to.valueOf();if("string"==typeof this.options.timeField){var d=+a.properties[this.options.timeField];return d>=b&&c>=d}if(this.options.timeField.start&&this.options.timeField.end){var e=+a.properties[this.options.timeField.start],f=+a.properties[this.options.timeField.end];return e>=b&&c>=e||f>=b&&c>=f}},authenticate:function(a){return this._service.authenticate(a),this},metadata:function(a,b){return this._service.metadata(a,b),this},query:function(){return this._service.query()},_getMetadata:function(a){if(this._metadata){var b;a(b,this._metadata)}else this.metadata(L.Util.bind(function(b,c){this._metadata=c,a(b,this._metadata)},this))},addFeature:function(a,b,c){this._getMetadata(L.Util.bind(function(d,e){this._service.addFeature(a,L.Util.bind(function(d,f){d||(a.properties[e.objectIdField]=f.objectId,a.id=f.objectId,this.createLayers([a])),b&&b.call(c,d,f)},this))},this))},updateFeature:function(a,b,c){this._service.updateFeature(a,function(d,e){d||(this.removeLayers([a.id],!0),this.createLayers([a])),b&&b.call(c,d,e)},this)},deleteFeature:function(a,b,c){this._service.deleteFeature(a,function(a,d){!a&&d.objectId&&this.removeLayers([d.objectId],!0),b&&b.call(c,a,d)},this)},deleteFeatures:function(a,b,c){return this._service.deleteFeatures(a,function(a,d){if(!a&&d.length>0)for(var e=0;e<d.length;e++)this.removeLayers([d[e].objectId],!0);b&&b.call(c,a,d)},this)}}),b.prototype._query=function(a){for(var b,c,d,e=0,f=this.values.length-1;f>=e;)if(d=b=(e+f)/2|0,c=this.values[Math.round(b)],+c.value<+a)e=b+1;else{if(!(+c.value>+a))return b;f=b-1}return~f},b.prototype.sort=function(){this.values.sort(function(a,b){return+b.value-+a.value}).reverse(),this.dirty=!1},b.prototype.between=function(a,b){this.dirty&&this.sort();var c=this._query(a),d=this._query(b);return 0===c&&0===d?[]:(c=Math.abs(c),d=0>d?Math.abs(d):d+1,this.values.slice(c,d))},b.prototype.bulkAdd=function(a){this.dirty=!0,this.values=this.values.concat(a)}}(EsriLeaflet),EsriLeaflet.Layers.FeatureLayer=EsriLeaflet.Layers.FeatureManager.extend({statics:{EVENTS:"click dblclick mouseover mouseout mousemove contextmenu popupopen popupclose"},options:{cacheLayers:!0},initialize:function(a){EsriLeaflet.Layers.FeatureManager.prototype.initialize.call(this,a),a=L.setOptions(this,a),this._layers={},this._leafletIds={},this._key="c"+(1e9*Math.random()).toString(36).replace(".","_")},onAdd:function(a){return a.on("zoomstart zoomend",function(a){this._zooming="zoomstart"===a.type},this),EsriLeaflet.Layers.FeatureManager.prototype.onAdd.call(this,a)},onRemove:function(a){for(var b in this._layers)a.removeLayer(this._layers[b]);return EsriLeaflet.Layers.FeatureManager.prototype.onRemove.call(this,a)},createNewLayer:function(a){return L.GeoJSON.geometryToLayer(a,this.options.pointToLayer,L.GeoJSON.coordsToLatLng,this.options)},_updateLayer:function(a,b){var c=[],d=this.options.coordsToLatLng||L.GeoJSON.coordsToLatLng;switch(b.properties&&(a.feature.properties=b.properties),b.geometry.type){case"Point":c=L.GeoJSON.coordsToLatLng(b.geometry.coordinates),a.setLatLng(c);break;case"LineString":c=L.GeoJSON.coordsToLatLngs(b.geometry.coordinates,0,d),a.setLatLngs(c);break;case"MultiLineString":c=L.GeoJSON.coordsToLatLngs(b.geometry.coordinates,1,d),a.setLatLngs(c);break;case"Polygon":c=L.GeoJSON.coordsToLatLngs(b.geometry.coordinates,1,d),a.setLatLngs(c);break;case"MultiPolygon":c=L.GeoJSON.coordsToLatLngs(b.geometry.coordinates,2,d),a.setLatLngs(c)}},createLayers:function(a){for(var b=a.length-1;b>=0;b--){var c,d=a[b],e=this._layers[d.id];e&&!this._map.hasLayer(e)&&this._map.addLayer(e),e&&(e.setLatLngs||e.setLatLng)&&this._updateLayer(e,d),e||(c=this.createNewLayer(d),c.feature=d,this.options.style?c._originalStyle=this.options.style:c.setStyle&&(c._originalStyle=c.options),c._leaflet_id=this._key+"_"+d.id,this._leafletIds[c._leaflet_id]=d.id,c.on(EsriLeaflet.Layers.FeatureLayer.EVENTS,this._propagateEvent,this),this._popup&&c.bindPopup&&c.bindPopup(this._popup(c.feature,c),this._popupOptions),this.options.onEachFeature&&this.options.onEachFeature(c.feature,c),this._layers[c.feature.id]=c,this.resetStyle(c.feature.id),this.fire("createfeature",{feature:c.feature}),(!this.options.timeField||this.options.timeField&&this._featureWithinTimeRange(d))&&this._map.addLayer(c))}},addLayers:function(a){for(var b=a.length-1;b>=0;b--){var c=this._layers[a[b]];c&&(this.fire("addfeature",{feature:c.feature}),this._map.addLayer(c))}},removeLayers:function(a,b){for(var c=a.length-1;c>=0;c--){var d=a[c],e=this._layers[d];e&&(this.fire("removefeature",{feature:e.feature,permanent:b}),this._map.removeLayer(e)),e&&b&&delete this._layers[d]}},cellEnter:function(a,b){this._zooming||EsriLeaflet.Util.requestAnimationFrame(L.Util.bind(function(){var a=this._cacheKey(b),c=this._cellCoordsToKey(b),d=this._cache[a];this._activeCells[c]&&d&&this.addLayers(d)},this))},cellLeave:function(a,b){this._zooming||EsriLeaflet.Util.requestAnimationFrame(L.Util.bind(function(){var a=this._cacheKey(b),c=this._cellCoordsToKey(b),d=this._cache[a],e=this._map.getBounds();if(!this._activeCells[c]&&d){for(var f=!0,g=0;g<d.length;g++){var h=this._layers[d[g]];h&&h.getBounds&&e.intersects(h.getBounds())&&(f=!1)}f&&this.removeLayers(d,!this.options.cacheLayers),!this.options.cacheLayers&&f&&(delete this._cache[a],delete this._cells[c],delete this._activeCells[c])}},this))},resetStyle:function(a){var b=this._layers[a];return b&&this.setFeatureStyle(b.feature.id,b._originalStyle),this},setStyle:function(a){return this.options.style=a,this.eachFeature(function(b){this.setFeatureStyle(b.feature.id,a)},this),this},setFeatureStyle:function(a,b){var c=this._layers[a];return"function"==typeof b&&(b=b(c.feature)),b||c.defaultOptions||(b=L.Path.prototype.options,b.fill=!0),c&&c.setStyle&&c.setStyle(b),this},bindPopup:function(a,b){this._popup=a,this._popupOptions=b;for(var c in this._layers){var d=this._layers[c],e=this._popup(d.feature,d);d.bindPopup(e,b)}return this},unbindPopup:function(){this._popup=!1;for(var a in this._layers){var b=this._layers[a];if(b.unbindPopup)b.unbindPopup();else if(b.getLayers){var c=b.getLayers();for(var d in c){var e=c[d];e.unbindPopup()}}}return this},eachFeature:function(a,b){for(var c in this._layers)a.call(b,this._layers[c]);return this},getFeature:function(a){return this._layers[a]},bringToBack:function(){this.eachFeature(function(a){a.bringToBack&&a.bringToBack()})},bringToFront:function(){this.eachFeature(function(a){a.bringToFront&&a.bringToFront()})},redraw:function(a){return a&&this._redraw(a),this},_redraw:function(a){var b=this._layers[a],c=b.feature;if(b&&b.setIcon&&this.options.pointToLayer&&this.options.pointToLayer){var d=this.options.pointToLayer(c,L.latLng(c.geometry.coordinates[1],c.geometry.coordinates[0])),e=d.options.icon;b.setIcon(e)}if(b&&b.setStyle&&this.options.pointToLayer){var f=this.options.pointToLayer(c,L.latLng(c.geometry.coordinates[1],c.geometry.coordinates[0])),g=f.options;this.setFeatureStyle(c.id,g)}b&&b.setStyle&&this.options.style&&this.resetStyle(c.id)},_propagateEvent:function(a){a.layer=this._layers[this._leafletIds[a.target._leaflet_id]],a.target=this,this.fire(a.type,a)}}),EsriLeaflet.FeatureLayer=EsriLeaflet.Layers.FeatureLayer,EsriLeaflet.Layers.featureLayer=function(a){return new EsriLeaflet.Layers.FeatureLayer(a)},EsriLeaflet.featureLayer=function(a){return new EsriLeaflet.Layers.FeatureLayer(a)},EsriLeaflet.Controls.Logo=L.Control.extend({options:{position:"bottomright",marginTop:0,marginLeft:0,marginBottom:0,marginRight:0},onAdd:function(){var a=L.DomUtil.create("div","esri-leaflet-logo");return a.style.marginTop=this.options.marginTop,a.style.marginLeft=this.options.marginLeft,a.style.marginBottom=this.options.marginBottom,a.style.marginRight=this.options.marginRight,a.innerHTML=this._adjustLogo(this._map._size),this._map.on("resize",function(b){a.innerHTML=this._adjustLogo(b.newSize)},this),a},_adjustLogo:function(a){return a.x<=600||a.y<=600?'<a href="https://developers.arcgis.com" style="border: none;"><img src="https://js.arcgis.com/3.13/esri/images/map/logo-sm.png" alt="Powered by Esri" style="border: none;"></a>':'<a href="https://developers.arcgis.com" style="border: none;"><img src="https://js.arcgis.com/3.13/esri/images/map/logo-med.png" alt="Powered by Esri" style="border: none;"></a>'}}),EsriLeaflet.Controls.logo=function(a){return new L.esri.Controls.Logo(a)};
  //# sourceMappingURL=esri-leaflet.js.map
  
    return EsriLeaflet;
  }));
  /*! esri-leaflet-geocoder - v1.0.2 - 2015-07-14
  *   Copyright (c) 2015 Environmental Systems Research Institute, Inc.
  *   Apache 2.0 License */
  
  (function (factory) {
    // define an AMD module that relies on 'leaflet'
    if (typeof define === 'function' && define.amd) {
      define(['leaflet', 'esri-leaflet'], function (L, Esri) {
        return factory(L, Esri);
      });
  
    // define a common js module that relies on 'leaflet'
    } else if (typeof module === 'object' && typeof module.exports === 'object') {
      module.exports = factory(require('leaflet'), require('esri-leaflet'));
    }
  
    // define globals if we can find the proper place to attach them to.
    if(typeof window !== 'undefined' && window.L && window.L.esri) {
      factory(L, L.esri);
    }
  
  }(function (L, Esri) {
  
  var protocol="https:"===window.location.protocol?"https:":"http:",EsriLeafletGeocoding={WorldGeocodingService:protocol+"//geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/",Tasks:{},Services:{},Controls:{}};if("undefined"!=typeof window&&window.L&&window.L.esri&&(window.L.esri.Geocoding=EsriLeafletGeocoding),!Esri)var Esri=window.L.esri;EsriLeafletGeocoding.Tasks.Geocode=Esri.Tasks.Task.extend({path:"find",params:{outSr:4326,forStorage:!1,outFields:"*",maxLocations:20},setters:{address:"address",neighborhood:"neighborhood",city:"city",subregion:"subregion",region:"region",postal:"postal",country:"country",text:"text",category:"category[]",token:"token",key:"magicKey",fields:"outFields[]",forStorage:"forStorage",maxLocations:"maxLocations"},initialize:function(a){a=a||{},a.url=a.url||EsriLeafletGeocoding.WorldGeocodingService,Esri.Tasks.Task.prototype.initialize.call(this,a)},within:function(a){return a=L.latLngBounds(a),this.params.bbox=Esri.Util.boundsToExtent(a),this},nearby:function(a,b){return a=L.latLng(a),this.params.location=a.lng+","+a.lat,this.params.distance=Math.min(Math.max(b,2e3),5e4),this},run:function(a,b){return this.path=this.params.text?"find":"findAddressCandidates","findAddressCandidates"===this.path&&this.params.bbox&&(this.params.searchExtent=this.params.bbox,delete this.params.bbox),this.request(function(c,d){var e="find"===this.path?this._processFindResponse:this._processFindAddressCandidatesResponse,f=c?void 0:e(d);a.call(b,c,{results:f},d)},this)},_processFindResponse:function(a){for(var b=[],c=0;c<a.locations.length;c++){var d,e=a.locations[c];e.extent&&(d=Esri.Util.extentToBounds(e.extent)),b.push({text:e.name,bounds:d,score:e.feature.attributes.Score,latlng:new L.LatLng(e.feature.geometry.y,e.feature.geometry.x),properties:e.feature.attributes})}return b},_processFindAddressCandidatesResponse:function(a){for(var b=[],c=0;c<a.candidates.length;c++){var d=a.candidates[c],e=Esri.Util.extentToBounds(d.extent);b.push({text:d.address,bounds:e,score:d.score,latlng:new L.LatLng(d.location.y,d.location.x),properties:d.attributes})}return b}}),EsriLeafletGeocoding.Tasks.geocode=function(a){return new EsriLeafletGeocoding.Tasks.Geocode(a)},EsriLeafletGeocoding.Tasks.ReverseGeocode=Esri.Tasks.Task.extend({path:"reverseGeocode",params:{outSR:4326},setters:{distance:"distance",language:"language"},initialize:function(a){a=a||{},a.url=a.url||EsriLeafletGeocoding.WorldGeocodingService,Esri.Tasks.Task.prototype.initialize.call(this,a)},latlng:function(a){return a=L.latLng(a),this.params.location=a.lng+","+a.lat,this},run:function(a,b){return this.request(function(c,d){var e;e=c?void 0:{latlng:new L.LatLng(d.location.y,d.location.x),address:d.address},a.call(b,c,e,d)},this)}}),EsriLeafletGeocoding.Tasks.reverseGeocode=function(a){return new EsriLeafletGeocoding.Tasks.ReverseGeocode(a)},EsriLeafletGeocoding.Tasks.Suggest=Esri.Tasks.Task.extend({path:"suggest",params:{},setters:{text:"text",category:"category"},initialize:function(a){a=a||{},a.url=a.url||EsriLeafletGeocoding.WorldGeocodingService,Esri.Tasks.Task.prototype.initialize.call(this,a)},within:function(a){a=L.latLngBounds(a),a=a.pad(.5);var b=a.getCenter(),c=a.getNorthWest();return this.params.location=b.lng+","+b.lat,this.params.distance=Math.min(Math.max(b.distanceTo(c),2e3),5e4),this.params.searchExtent=L.esri.Util.boundsToExtent(a),this},nearby:function(a,b){return a=L.latLng(a),this.params.location=a.lng+","+a.lat,this.params.distance=Math.min(Math.max(b,2e3),5e4),this},run:function(a,b){return this.request(function(c,d){a.call(b,c,d,d)},this)}}),EsriLeafletGeocoding.Tasks.suggest=function(a){return new EsriLeafletGeocoding.Tasks.Suggest(a)},EsriLeafletGeocoding.Services.Geocoding=Esri.Services.Service.extend({includes:L.Mixin.Events,initialize:function(a){a=a||{},a.url=a.url||EsriLeafletGeocoding.WorldGeocodingService,Esri.Services.Service.prototype.initialize.call(this,a),this._confirmSuggestSupport()},geocode:function(){return new EsriLeafletGeocoding.Tasks.Geocode(this)},reverse:function(){return new EsriLeafletGeocoding.Tasks.ReverseGeocode(this)},suggest:function(){return new EsriLeafletGeocoding.Tasks.Suggest(this)},_confirmSuggestSupport:function(){this.metadata(function(a,b){b.capabilities&&b.capabilities.includes("Suggest")?this.options.supportsSuggest=!0:this.options.supportsSuggest=!1},this)}}),EsriLeafletGeocoding.Services.geocoding=function(a){return new EsriLeafletGeocoding.Services.Geocoding(a)},EsriLeafletGeocoding.Controls.Geosearch=L.Control.extend({includes:L.Mixin.Events,options:{position:"topleft",zoomToResult:!0,useMapBounds:12,collapseAfterResult:!0,expanded:!1,forStorage:!1,allowMultipleResults:!0,useArcgisWorldGeocoder:!0,providers:[],placeholder:"Search for places or addresses",title:"Location Search",mapAttribution:"Geocoding by Esri"},initialize:function(a){if(L.Util.setOptions(this,a),this.options.useArcgisWorldGeocoder){var b=new EsriLeafletGeocoding.Controls.Geosearch.Providers.ArcGISOnline;this.options.providers.push(b)}if(this.options.maxResults)for(var c=0;c<this.options.providers.length;c++)this.options.providers[c].options.maxResults=this.options.maxResults;this._pendingSuggestions=[]},_geocode:function(a,b,c){var d,e=0,f=[],g=L.Util.bind(function(b,c){e--,c&&(f=f.concat(c)),0>=e&&(d=this._boundsFromResults(f),this.fire("results",{results:f,bounds:d,latlng:d?d.getCenter():void 0,text:a}),this.options.zoomToResult&&d&&this._map.fitBounds(d),L.DomUtil.removeClass(this._input,"geocoder-control-loading"),this.fire("load"),this.clear(),this._input.blur())},this);if(b)e++,c.results(a,b,this._searchBounds(),g);else for(var h=0;h<this.options.providers.length;h++)e++,this.options.providers[h].results(a,b,this._searchBounds(),g)},_suggest:function(a){L.DomUtil.addClass(this._input,"geocoder-control-loading");var b=this.options.providers.length,c=L.Util.bind(function(a,c){return L.Util.bind(function(d,e){var f;if(b-=1,this._input.value<2)return this._suggestions.innerHTML="",void(this._suggestions.style.display="none");if(e)for(f=0;f<e.length;f++)e[f].provider=c;if(c._lastRender!==a&&c.nodes){for(f=0;f<c.nodes.length;f++)c.nodes[f].parentElement&&this._suggestions.removeChild(c.nodes[f]);c.nodes=[]}if(e.length&&this._input.value===a){if(c.nodes)for(var g=0;g<c.nodes.length;g++)c.nodes[g].parentElement&&this._suggestions.removeChild(c.nodes[g]);c._lastRender=a,c.nodes=this._renderSuggestions(e)}0===b&&L.DomUtil.removeClass(this._input,"geocoder-control-loading")},this)},this);this._pendingSuggestions=[];for(var d=0;d<this.options.providers.length;d++){var e=this.options.providers[d],f=e.suggestions(a,this._searchBounds(),c(a,e));this._pendingSuggestions.push(f)}},_searchBounds:function(){return this.options.useMapBounds===!1?null:this.options.useMapBounds===!0?this._map.getBounds():this.options.useMapBounds<=this._map.getZoom()?this._map.getBounds():null},_renderSuggestions:function(a){var b;this._suggestions.style.display="block",this._suggestions.style.maxHeight=this._map.getSize().y-this._suggestions.offsetTop-this._wrapper.offsetTop-10+"px";for(var c,d,e=[],f=0;f<a.length;f++){var g=a[f];!d&&this.options.providers.length>1&&b!==g.provider.options.label&&(d=L.DomUtil.create("span","geocoder-control-header",this._suggestions),d.textContent=g.provider.options.label,d.innerText=g.provider.options.label,b=g.provider.options.label,e.push(d)),c||(c=L.DomUtil.create("ul","geocoder-control-list",this._suggestions));var h=L.DomUtil.create("li","geocoder-control-suggestion",c);h.innerHTML=g.text,h.provider=g.provider,h["data-magic-key"]=g.magicKey}return e.push(c),e},_boundsFromResults:function(a){if(a.length){for(var b=new L.LatLngBounds([0,0],[0,0]),c=new L.LatLngBounds,d=a.length-1;d>=0;d--){var e=a[d];e.bounds&&e.bounds.isValid()&&!e.bounds.equals(b)&&c.extend(e.bounds),c.extend(e.latlng)}return c}},clear:function(){this._suggestions.innerHTML="",this._suggestions.style.display="none",this._input.value="",this.options.collapseAfterResult&&(this._input.placeholder="",L.DomUtil.removeClass(this._wrapper,"geocoder-control-expanded")),!this._map.scrollWheelZoom.enabled()&&this._map.options.scrollWheelZoom&&this._map.scrollWheelZoom.enable()},onAdd:function(a){return this._map=a,a.attributionControl&&(this.options.useArcgisWorldGeocoder?a.attributionControl.addAttribution("Geocoding by Esri"):a.attributionControl.addAttribution(this.options.mapAttribution)),this._wrapper=L.DomUtil.create("div","geocoder-control "+(this.options.expanded?" geocoder-control-expanded":"")),this._input=L.DomUtil.create("input","geocoder-control-input leaflet-bar",this._wrapper),this._input.title=this.options.title,this._suggestions=L.DomUtil.create("div","geocoder-control-suggestions leaflet-bar",this._wrapper),L.DomEvent.addListener(this._input,"focus",function(a){this._input.placeholder=this.options.placeholder,L.DomUtil.addClass(this._wrapper,"geocoder-control-expanded")},this),L.DomEvent.addListener(this._wrapper,"click",function(a){L.DomUtil.addClass(this._wrapper,"geocoder-control-expanded"),this._input.focus()},this),L.DomEvent.addListener(this._suggestions,"mousedown",function(a){var b=a.target||a.srcElement;this._geocode(b.innerHTML,b["data-magic-key"],b.provider),this.clear()},this),L.DomEvent.addListener(this._input,"blur",function(a){this.clear()},this),L.DomEvent.addListener(this._input,"keydown",function(a){L.DomUtil.addClass(this._wrapper,"geocoder-control-expanded");for(var b,c=this._suggestions.querySelectorAll(".geocoder-control-suggestion"),d=this._suggestions.querySelectorAll(".geocoder-control-selected")[0],e=0;e<c.length;e++)if(c[e]===d){b=e;break}switch(a.keyCode){case 13:d?(this._geocode(d.innerHTML,d["data-magic-key"],d.provider),this.clear()):this.options.allowMultipleResults?(this._geocode(this._input.value,void 0),this.clear()):L.DomUtil.addClass(c[0],"geocoder-control-selected"),L.DomEvent.preventDefault(a);break;case 38:d&&L.DomUtil.removeClass(d,"geocoder-control-selected");var f=c[b-1];d&&f?L.DomUtil.addClass(f,"geocoder-control-selected"):L.DomUtil.addClass(c[c.length-1],"geocoder-control-selected"),L.DomEvent.preventDefault(a);break;case 40:d&&L.DomUtil.removeClass(d,"geocoder-control-selected");var g=c[b+1];d&&g?L.DomUtil.addClass(g,"geocoder-control-selected"):L.DomUtil.addClass(c[0],"geocoder-control-selected"),L.DomEvent.preventDefault(a);break;default:for(var h=0;h<this._pendingSuggestions.length;h++){var i=this._pendingSuggestions[h];i&&i.abort&&!i.id?i.abort():i.id&&window._EsriLeafletCallbacks[i.id].abort&&window._EsriLeafletCallbacks[i.id].abort()}}},this),L.DomEvent.addListener(this._input,"keyup",L.Util.limitExecByInterval(function(a){var b=a.which||a.keyCode,c=(a.target||a.srcElement).value;return c.length<2?(this._suggestions.innerHTML="",this._suggestions.style.display="none",void L.DomUtil.removeClass(this._input,"geocoder-control-loading")):27===b?(this._suggestions.innerHTML="",void(this._suggestions.style.display="none")):void(13!==b&&38!==b&&40!==b&&this._input.value!==this._lastValue&&(this._lastValue=this._input.value,this._suggest(c)))},50,this),this),L.DomEvent.disableClickPropagation(this._wrapper),L.DomEvent.addListener(this._suggestions,"mouseover",function(b){a.scrollWheelZoom.enabled()&&a.options.scrollWheelZoom&&a.scrollWheelZoom.disable()}),L.DomEvent.addListener(this._suggestions,"mouseout",function(b){!a.scrollWheelZoom.enabled()&&a.options.scrollWheelZoom&&a.scrollWheelZoom.enable()}),this._wrapper},onRemove:function(a){a.attributionControl.removeAttribution("Geocoding by Esri")}}),EsriLeafletGeocoding.Controls.geosearch=function(a){return new EsriLeafletGeocoding.Controls.Geosearch(a)},EsriLeafletGeocoding.Controls.Geosearch.Providers={},EsriLeafletGeocoding.Controls.Geosearch.Providers.ArcGISOnline=EsriLeafletGeocoding.Services.Geocoding.extend({options:{label:"Places and Addresses",maxResults:5},suggestions:function(a,b,c){var d=this.suggest().text(a);return b&&d.within(b),d.run(function(a,b,d){var e=[];if(!a)for(;d.suggestions.length&&e.length<=this.options.maxResults-1;){var f=d.suggestions.shift();f.isCollection||e.push({text:f.text,magicKey:f.magicKey})}c(a,e)},this)},results:function(a,b,c,d){var e=this.geocode().text(a);return b?e.key(b):e.maxLocations(this.options.maxResults),c&&e.within(c),this.options.forStorage&&e.forStorage(!0),e.run(function(a,b){d(a,b.results)},this)}}),EsriLeafletGeocoding.Controls.Geosearch.Providers.FeatureLayer=L.esri.Services.FeatureLayerService.extend({options:{label:"Feature Layer",maxResults:5,bufferRadius:1e3,formatSuggestion:function(a){return a.properties[this.options.searchFields[0]]}},initialize:function(a){a.url=L.esri.Util.cleanUrl(a.url),L.esri.Services.FeatureLayerService.prototype.initialize.call(this,a),L.Util.setOptions(this,a),"string"==typeof this.options.searchFields&&(this.options.searchFields=[this.options.searchFields])},suggestions:function(a,b,c){var d=this.query().where(this._buildQuery(a)).returnGeometry(!1);b&&d.intersects(b),this.options.idField&&d.fields([this.options.idField].concat(this.options.searchFields));var e=d.run(function(a,b,d){if(a)c(a,[]);else{this.options.idField=d.objectIdFieldName;for(var e=[],f=Math.min(b.features.length,this.options.maxResults),g=0;f>g;g++){var h=b.features[g];e.push({text:this.options.formatSuggestion.call(this,h),magicKey:h.id})}c(a,e.slice(0,this.options.maxResults).reverse())}},this);return e},results:function(a,b,c,d){var e=this.query();return b?e.featureIds([b]):e.where(this._buildQuery(a)),c&&e.within(c),e.run(L.Util.bind(function(a,b){for(var c=[],e=0;e<b.features.length;e++){var f=b.features[e];if(f){var g=this._featureBounds(f),h={latlng:g.getCenter(),bounds:g,text:this.options.formatSuggestion.call(this,f),properties:f.properties};c.push(h)}}d(a,c)},this))},_buildQuery:function(a){for(var b=[],c=this.options.searchFields.length-1;c>=0;c--){var d=this.options.searchFields[c];b.push(d+" LIKE '%"+a+"%'")}return b.join(" OR ")},_featureBounds:function(a){var b=L.geoJson(a);if("Point"===a.geometry.type){var c=b.getBounds().getCenter();return new L.Circle(c,this.options.bufferRadius).getBounds()}return b.getBounds()}}),EsriLeafletGeocoding.Controls.Geosearch.Providers.GeocodeService=EsriLeafletGeocoding.Services.Geocoding.extend({options:{label:"Geocode Server",maxResults:5},suggestions:function(a,b,c){if(this.options.supportsSuggest){var d=this.suggest().text(a);return b&&d.within(b),d.run(function(a,b,d){var e=[];if(!a)for(;d.suggestions.length&&e.length<=this.options.maxResults-1;){var f=d.suggestions.shift();f.isCollection||e.push({text:f.text,magicKey:f.magicKey})}c(a,e)},this)}return c(void 0,[]),!1},results:function(a,b,c,d){var e=this.geocode().text(a);return e.maxLocations(this.options.maxResults),c&&e.within(c),e.run(function(a,b){d(a,b.results)},this)}}),EsriLeafletGeocoding.Controls.Geosearch.Providers.MapService=L.esri.Services.MapService.extend({options:{layers:[0],label:"Map Service",bufferRadius:1e3,maxResults:5,formatSuggestion:function(a){return a.properties[a.displayFieldName]+" <small>"+a.layerName+"</small>"}},initialize:function(a){L.esri.Services.MapService.prototype.initialize.call(this,a),this._getIdFields()},suggestions:function(a,b,c){var d=this.find().text(a).fields(this.options.searchFields).returnGeometry(!1).layers(this.options.layers);return d.run(function(a,b,d){var e=[];if(!a){var f=Math.min(this.options.maxResults,b.features.length);d.results=d.results.reverse();for(var g=0;f>g;g++){var h=b.features[g],i=d.results[g],j=i.layerId,k=this._idFields[j];h.layerId=j,h.layerName=this._layerNames[j],h.displayFieldName=this._displayFields[j],k&&e.push({text:this.options.formatSuggestion.call(this,h),magicKey:i.attributes[k]+":"+j})}}c(a,e.reverse())},this)},results:function(a,b,c,d){var e,f=[];if(b){var g=b.split(":")[0],h=b.split(":")[1];e=this.query().layer(h).featureIds(g)}else e=this.find().text(a).fields(this.options.searchFields).contains(!1).layers(this.options.layers);return e.run(function(a,b,c){if(!a){c.results&&(c.results=c.results.reverse());for(var e=0;e<b.features.length;e++){var g=b.features[e];if(h=h?h:c.results[e].layerId,g&&void 0!==h){var i=this._featureBounds(g);this._idFields[h];g.layerId=h,g.layerName=this._layerNames[h],g.displayFieldName=this._displayFields[h];var j={latlng:i.getCenter(),bounds:i,text:this.options.formatSuggestion.call(this,g),properties:g.properties};f.push(j)}}}d(a,f.reverse())},this)},_featureBounds:function(a){var b=L.geoJson(a);if("Point"===a.geometry.type){var c=b.getBounds().getCenter();return new L.Circle(c,this.options.bufferRadius).getBounds()}return b.getBounds()},_layerMetadataCallback:function(a){return L.Util.bind(function(b,c){this._displayFields[a]=c.displayField,this._layerNames[a]=c.name;for(var d=0;d<c.fields.length;d++){var e=c.fields[d];if("esriFieldTypeOID"===e.type){this._idFields[a]=e.name;break}}},this)},_getIdFields:function(){this._idFields={},this._displayFields={},this._layerNames={};for(var a=0;a<this.options.layers.length;a++){var b=this.options.layers[a];this.get(b,{},this._layerMetadataCallback(b))}}});
  //# sourceMappingURL=esri-leaflet-geocoder.js.map
  
    return EsriLeafletGeocoding;
  }));
  
  /*
   * Google layer using Google Maps API
   */
  
  /* global google: true */
  
  L.Google = L.Class.extend({
      includes: L.Mixin.Events,
  
      options: {
          minZoom: 0,
          maxZoom: 18,
          tileSize: 256,
          subdomains: 'abc',
          errorTileUrl: '',
          attribution: '',
          opacity: 1,
          continuousWorld: false,
          noWrap: false,
          mapOptions: {
              backgroundColor: '#dddddd'
          }
      },
  
      // Possible types: SATELLITE, ROADMAP, HYBRID, TERRAIN
      initialize: function(type, options) {
          L.Util.setOptions(this, options);
  
          this._ready = google.maps.Map !== undefined;
          if (!this._ready) L.Google.asyncWait.push(this);
  
          this._type = type || 'SATELLITE';
      },
  
      onAdd: function(map, insertAtTheBottom) {
          this._map = map;
          this._insertAtTheBottom = insertAtTheBottom;
  
          // create a container div for tiles
          this._initContainer();
          this._initMapObject();
  
          // set up events
          map.on('viewreset', this._resetCallback, this);
  
          this._limitedUpdate = L.Util.limitExecByInterval(this._update, 150, this);
          map.on('move', this._update, this);
  
          map.on('zoomanim', this._handleZoomAnim, this);
  
          //20px instead of 1em to avoid a slight overlap with google's attribution
          map._controlCorners.bottomright.style.marginBottom = '20px';
  
          this._reset();
          this._update();
      },
  
      onRemove: function(map) {
          map._container.removeChild(this._container);
  
          map.off('viewreset', this._resetCallback, this);
  
          map.off('move', this._update, this);
  
          map.off('zoomanim', this._handleZoomAnim, this);
  
          map._controlCorners.bottomright.style.marginBottom = '0em';
      },
  
      getAttribution: function() {
          return this.options.attribution;
      },
  
      setOpacity: function(opacity) {
          this.options.opacity = opacity;
          if (opacity < 1) {
              L.DomUtil.setOpacity(this._container, opacity);
          }
      },
  
      setElementSize: function(e, size) {
          e.style.width = size.x + 'px';
          e.style.height = size.y + 'px';
      },
  
      _initContainer: function() {
          var tilePane = this._map._container,
              first = tilePane.firstChild;
  
          if (!this._container) {
              this._container = L.DomUtil.create('div', 'leaflet-google-layer leaflet-top leaflet-left');
              this._container.id = '_GMapContainer_' + L.Util.stamp(this);
              this._container.style.zIndex = 'auto';
          }
  
          tilePane.insertBefore(this._container, first);
  
          this.setOpacity(this.options.opacity);
          this.setElementSize(this._container, this._map.getSize());
      },
  
      _initMapObject: function() {
          if (!this._ready) return;
          this._google_center = new google.maps.LatLng(0, 0);
          var map = new google.maps.Map(this._container, {
              center: this._google_center,
              zoom: 0,
              tilt: 0,
              mapTypeId: google.maps.MapTypeId[this._type],
              disableDefaultUI: true,
              keyboardShortcuts: false,
              draggable: false,
              disableDoubleClickZoom: true,
              scrollwheel: false,
              streetViewControl: false,
              styles: this.options.mapOptions.styles,
              backgroundColor: this.options.mapOptions.backgroundColor
          });
  
          var _this = this;
          this._reposition = google.maps.event.addListenerOnce(map, 'center_changed',
              function() { _this.onReposition(); });
          this._google = map;
  
          google.maps.event.addListenerOnce(map, 'idle',
              function() { _this._checkZoomLevels(); });
          //Reporting that map-object was initialized.
          this.fire('MapObjectInitialized', { mapObject: map });
      },
  
      _checkZoomLevels: function() {
          //setting the zoom level on the Google map may result in a different zoom level than the one requested
          //(it won't go beyond the level for which they have data).
          // verify and make sure the zoom levels on both Leaflet and Google maps are consistent
          if (this._google.getZoom() !== this._map.getZoom()) {
              //zoom levels are out of sync. Set the leaflet zoom level to match the google one
              this._map.setZoom( this._google.getZoom() );
          }
      },
  
      _resetCallback: function(e) {
          this._reset(e.hard);
      },
  
      _reset: function(clearOldContainer) {
          this._initContainer();
      },
  
      _update: function(e) {
          if (!this._google) return;
          this._resize();
  
          var center = this._map.getCenter();
          var _center = new google.maps.LatLng(center.lat, center.lng);
  
          this._google.setCenter(_center);
          this._google.setZoom(Math.round(this._map.getZoom()));
  
          this._checkZoomLevels();
      },
  
      _resize: function() {
          var size = this._map.getSize();
          if (this._container.style.width === size.x &&
                  this._container.style.height === size.y)
              return;
          this.setElementSize(this._container, size);
          this.onReposition();
      },
  
  
      _handleZoomAnim: function (e) {
          var center = e.center;
          var _center = new google.maps.LatLng(center.lat, center.lng);
  
          this._google.setCenter(_center);
          this._google.setZoom(Math.round(e.zoom));
      },
  
  
      onReposition: function() {
          if (!this._google) return;
          google.maps.event.trigger(this._google, 'resize');
      }
  });
  
  L.Google.asyncWait = [];
  L.Google.asyncInitialize = function() {
      var i;
      for (i = 0; i < L.Google.asyncWait.length; i++) {
          var o = L.Google.asyncWait[i];
          o._ready = true;
          if (o._container) {
              o._initMapObject();
              o._update();
          }
      }
      L.Google.asyncWait = [];
  };
  
  var style = [
          {
              "featureType": "all",
              "elementType": "all",
              "stylers": [
                  {
                      "lightness": "5"
                  }
              ]
          },
          {
              "featureType": "all",
              "elementType": "labels.text.fill",
              "stylers": [
                  {
                      "color": "#727272"
                  }
              ]
          },
          {
              "featureType": "all",
              "elementType": "labels.text.stroke",
              "stylers": [
                  {
                      "weight": "-5"
                  }
              ]
          },
          {
              "featureType": "administrative",
              "elementType": "labels.text.fill",
              "stylers": [
                  {
                      "color": "#9f9f9f"
                  }
              ]
          },
          {
              "featureType": "administrative.land_parcel",
              "elementType": "labels.text.stroke",
              "stylers": [
                  {
                      "weight": "1.5"
                  },
                  {
                      "lightness": "15"
                  }
              ]
          },
          {
              "featureType": "landscape",
              "elementType": "all",
              "stylers": [
                  {
                      "color": "#f2f2f2"
                  }
              ]
          },
          {
              "featureType": "landscape",
              "elementType": "geometry.fill",
              "stylers": [
                  {
                      "lightness": "50"
                  }
              ]
          },
          {
              "featureType": "poi",
              "elementType": "all",
              "stylers": [
                  {
                      "visibility": "off"
                  },
                  {
                      "saturation": "-30"
                  }
              ]
          },
          {
              "featureType": "poi",
              "elementType": "geometry",
              "stylers": [
                  {
                      "visibility": "on"
                  },
                  {
                      "saturation": "-20"
                  },
                  {
                      "lightness": "40"
                  }
              ]
          },
          {
              "featureType": "poi",
              "elementType": "labels",
              "stylers": [
                  {
                      "visibility": "on"
                  }
              ]
          },
          {
              "featureType": "poi",
              "elementType": "labels.text",
              "stylers": [
                  {
                      "visibility": "off"
                  }
              ]
          },
          {
              "featureType": "poi",
              "elementType": "labels.icon",
              "stylers": [
                  {
                      "lightness": "10"
                  },
                  {
                      "saturation": "-100"
                  }
              ]
          },
          {
              "featureType": "road",
              "elementType": "all",
              "stylers": [
                  {
                      "saturation": -100
                  },
                  {
                      "lightness": 45
                  }
              ]
          },
          {
              "featureType": "road.highway",
              "elementType": "all",
              "stylers": [
                  {
                      "visibility": "simplified"
                  }
              ]
          },
          {
              "featureType": "road.arterial",
              "elementType": "geometry.fill",
              "stylers": [
                  {
                      "lightness": "-24"
                  },
                  {
                      "gamma": "2.5"
                  },
                  {
                      "saturation": "0"
                  }
              ]
          },
          {
              "featureType": "road.arterial",
              "elementType": "geometry.stroke",
              "stylers": [
                  {
                      "visibility": "on"
                  },
                  {
                      "lightness": "100"
                  }
              ]
          },
          {
              "featureType": "road.arterial",
              "elementType": "labels.text.fill",
              "stylers": [
                  {
                      "lightness": "-22"
                  }
              ]
          },
          {
              "featureType": "road.arterial",
              "elementType": "labels.icon",
              "stylers": [
                  {
                      "visibility": "on"
                  }
              ]
          },
          {
              "featureType": "road.local",
              "elementType": "geometry",
              "stylers": [
                  {
                      "weight": "1.5"
                  },
                  {
                      "lightness": "100"
                  }
              ]
          },
          {
              "featureType": "road.local",
              "elementType": "geometry.fill",
              "stylers": [
                  {
                      "weight": "3"
                  }
              ]
          },
          {
              "featureType": "road.local",
              "elementType": "geometry.stroke",
              "stylers": [
                  {
                      "visibility": "off"
                  },
                  {
                      "weight": "1.5"
                  }
              ]
          },
          {
              "featureType": "road.local",
              "elementType": "labels.icon",
              "stylers": [
                  {
                      "visibility": "off"
                  }
              ]
          },
          {
              "featureType": "transit",
              "elementType": "all",
              "stylers": [
                  {
                      "visibility": "off"
                  }
              ]
          },
          {
              "featureType": "transit.line",
              "elementType": "geometry",
              "stylers": [
                  {
                      "visibility": "on"
                  },
                  {
                      "lightness": "30"
                  },
                  {
                      "saturation": "0"
                  }
              ]
          },
          {
              "featureType": "transit.line",
              "elementType": "geometry.stroke",
              "stylers": [
                  {
                      "weight": "1.5"
                  }
              ]
          },
          {
              "featureType": "water",
              "elementType": "all",
              "stylers": [
                  {
                      "color": "#b1d9e9"
                  },
                  {
                      "visibility": "on"
                  }
              ]
          },
          {
              "featureType": "water",
              "elementType": "geometry",
              "stylers": [
                  {
                      "saturation": "-50"
                  },
                  {
                      "lightness": "10"
                  }
              ]
          },
          {
              "featureType": "water",
              "elementType": "labels.text",
              "stylers": [
                  {
                      "lightness": "-20"
                  },
                  {
                      "visibility": "on"
                  },
                  {
                      "saturation": "0"
                  }
              ]
          },
             {
              "featureType": "poi.park",
              "elementType": "labels.text",
              "stylers": [
                  {
                      "visibility": "on"
                  },
                  {
                      "lightness": 25
                  }
              ]
          },
          {
              "featureType": "water",
              "elementType": "labels.text.stroke",
              "stylers": [
                  {
                      "color": "#f0f0f0"
                  },
                  {
                      "weight": "2"
                  },
                  {
                      "visibility": "on"
                  }
              ]
          }
      ];
  
  /*
   Leaflet.markercluster, Provides Beautiful Animated Marker Clustering functionality for Leaflet, a JS library for interactive maps.
   https://github.com/Leaflet/Leaflet.markercluster
   (c) 2012-2013, Dave Leaver, smartrak
  */
  !function(t,e){L.MarkerClusterGroup=L.FeatureGroup.extend({options:{maxClusterRadius:80,iconCreateFunction:null,spiderfyOnMaxZoom:!0,showCoverageOnHover:!0,zoomToBoundsOnClick:!0,singleMarkerMode:!1,disableClusteringAtZoom:null,removeOutsideVisibleBounds:!0,animateAddingMarkers:!1,spiderfyDistanceMultiplier:1,polygonOptions:{}},initialize:function(t){L.Util.setOptions(this,t),this.options.iconCreateFunction||(this.options.iconCreateFunction=this._defaultIconCreateFunction),this._featureGroup=L.featureGroup(),this._featureGroup.on(L.FeatureGroup.EVENTS,this._propagateEvent,this),this._nonPointGroup=L.featureGroup(),this._nonPointGroup.on(L.FeatureGroup.EVENTS,this._propagateEvent,this),this._inZoomAnimation=0,this._needsClustering=[],this._needsRemoving=[],this._currentShownBounds=null,this._queue=[]},addLayer:function(t){if(t instanceof L.LayerGroup){var e=[];for(var i in t._layers)e.push(t._layers[i]);return this.addLayers(e)}if(!t.getLatLng)return this._nonPointGroup.addLayer(t),this;if(!this._map)return this._needsClustering.push(t),this;if(this.hasLayer(t))return this;this._unspiderfy&&this._unspiderfy(),this._addLayer(t,this._maxZoom);var n=t,s=this._map.getZoom();if(t.__parent)for(;n.__parent._zoom>=s;)n=n.__parent;return this._currentShownBounds.contains(n.getLatLng())&&(this.options.animateAddingMarkers?this._animationAddLayer(t,n):this._animationAddLayerNonAnimated(t,n)),this},removeLayer:function(t){if(t instanceof L.LayerGroup){var e=[];for(var i in t._layers)e.push(t._layers[i]);return this.removeLayers(e)}return t.getLatLng?this._map?t.__parent?(this._unspiderfy&&(this._unspiderfy(),this._unspiderfyLayer(t)),this._removeLayer(t,!0),this._featureGroup.hasLayer(t)&&(this._featureGroup.removeLayer(t),t.setOpacity&&t.setOpacity(1)),this):this:(!this._arraySplice(this._needsClustering,t)&&this.hasLayer(t)&&this._needsRemoving.push(t),this):(this._nonPointGroup.removeLayer(t),this)},addLayers:function(t){var e,i,n,s=this._map,r=this._featureGroup,o=this._nonPointGroup;for(e=0,i=t.length;i>e;e++)if(n=t[e],n.getLatLng){if(!this.hasLayer(n))if(s){if(this._addLayer(n,this._maxZoom),n.__parent&&2===n.__parent.getChildCount()){var a=n.__parent.getAllChildMarkers(),h=a[0]===n?a[1]:a[0];r.removeLayer(h)}}else this._needsClustering.push(n)}else o.addLayer(n);return s&&(r.eachLayer(function(t){t instanceof L.MarkerCluster&&t._iconNeedsUpdate&&t._updateIcon()}),this._topClusterLevel._recursivelyAddChildrenToMap(null,this._zoom,this._currentShownBounds)),this},removeLayers:function(t){var e,i,n,s=this._featureGroup,r=this._nonPointGroup;if(!this._map){for(e=0,i=t.length;i>e;e++)n=t[e],this._arraySplice(this._needsClustering,n),r.removeLayer(n);return this}for(e=0,i=t.length;i>e;e++)n=t[e],n.__parent?(this._removeLayer(n,!0,!0),s.hasLayer(n)&&(s.removeLayer(n),n.setOpacity&&n.setOpacity(1))):r.removeLayer(n);return this._topClusterLevel._recursivelyAddChildrenToMap(null,this._zoom,this._currentShownBounds),s.eachLayer(function(t){t instanceof L.MarkerCluster&&t._updateIcon()}),this},clearLayers:function(){return this._map||(this._needsClustering=[],delete this._gridClusters,delete this._gridUnclustered),this._noanimationUnspiderfy&&this._noanimationUnspiderfy(),this._featureGroup.clearLayers(),this._nonPointGroup.clearLayers(),this.eachLayer(function(t){delete t.__parent}),this._map&&this._generateInitialClusters(),this},getBounds:function(){var t=new L.LatLngBounds;if(this._topClusterLevel)t.extend(this._topClusterLevel._bounds);else for(var e=this._needsClustering.length-1;e>=0;e--)t.extend(this._needsClustering[e].getLatLng());return t.extend(this._nonPointGroup.getBounds()),t},eachLayer:function(t,e){var i,n=this._needsClustering.slice();for(this._topClusterLevel&&this._topClusterLevel.getAllChildMarkers(n),i=n.length-1;i>=0;i--)t.call(e,n[i]);this._nonPointGroup.eachLayer(t,e)},getLayers:function(){var t=[];return this.eachLayer(function(e){t.push(e)}),t},getLayer:function(t){var e=null;return this.eachLayer(function(i){L.stamp(i)===t&&(e=i)}),e},hasLayer:function(t){if(!t)return!1;var e,i=this._needsClustering;for(e=i.length-1;e>=0;e--)if(i[e]===t)return!0;for(i=this._needsRemoving,e=i.length-1;e>=0;e--)if(i[e]===t)return!1;return!(!t.__parent||t.__parent._group!==this)||this._nonPointGroup.hasLayer(t)},zoomToShowLayer:function(t,e){var i=function(){if((t._icon||t.__parent._icon)&&!this._inZoomAnimation)if(this._map.off("moveend",i,this),this.off("animationend",i,this),t._icon)e();else if(t.__parent._icon){var n=function(){this.off("spiderfied",n,this),e()};this.on("spiderfied",n,this),t.__parent.spiderfy()}};t._icon&&this._map.getBounds().contains(t.getLatLng())?e():t.__parent._zoom<this._map.getZoom()?(this._map.on("moveend",i,this),this._map.panTo(t.getLatLng())):(this._map.on("moveend",i,this),this.on("animationend",i,this),this._map.setView(t.getLatLng(),t.__parent._zoom+1),t.__parent.zoomToBounds())},onAdd:function(t){this._map=t;var e,i,n;if(!isFinite(this._map.getMaxZoom()))throw"Map has no maxZoom specified";for(this._featureGroup.onAdd(t),this._nonPointGroup.onAdd(t),this._gridClusters||this._generateInitialClusters(),e=0,i=this._needsRemoving.length;i>e;e++)n=this._needsRemoving[e],this._removeLayer(n,!0);for(this._needsRemoving=[],e=0,i=this._needsClustering.length;i>e;e++)n=this._needsClustering[e],n.getLatLng?n.__parent||this._addLayer(n,this._maxZoom):this._featureGroup.addLayer(n);this._needsClustering=[],this._map.on("zoomend",this._zoomEnd,this),this._map.on("moveend",this._moveEnd,this),this._spiderfierOnAdd&&this._spiderfierOnAdd(),this._bindEvents(),this._zoom=this._map.getZoom(),this._currentShownBounds=this._getExpandedVisibleBounds(),this._topClusterLevel._recursivelyAddChildrenToMap(null,this._zoom,this._currentShownBounds)},onRemove:function(t){t.off("zoomend",this._zoomEnd,this),t.off("moveend",this._moveEnd,this),this._unbindEvents(),this._map._mapPane.className=this._map._mapPane.className.replace(" leaflet-cluster-anim",""),this._spiderfierOnRemove&&this._spiderfierOnRemove(),this._hideCoverage(),this._featureGroup.onRemove(t),this._nonPointGroup.onRemove(t),this._featureGroup.clearLayers(),this._map=null},getVisibleParent:function(t){for(var e=t;e&&!e._icon;)e=e.__parent;return e||null},_arraySplice:function(t,e){for(var i=t.length-1;i>=0;i--)if(t[i]===e)return t.splice(i,1),!0},_removeLayer:function(t,e,i){var n=this._gridClusters,s=this._gridUnclustered,r=this._featureGroup,o=this._map;if(e)for(var a=this._maxZoom;a>=0&&s[a].removeObject(t,o.project(t.getLatLng(),a));a--);var h,_=t.__parent,u=_._markers;for(this._arraySplice(u,t);_&&(_._childCount--,!(_._zoom<0));)e&&_._childCount<=1?(h=_._markers[0]===t?_._markers[1]:_._markers[0],n[_._zoom].removeObject(_,o.project(_._cLatLng,_._zoom)),s[_._zoom].addObject(h,o.project(h.getLatLng(),_._zoom)),this._arraySplice(_.__parent._childClusters,_),_.__parent._markers.push(h),h.__parent=_.__parent,_._icon&&(r.removeLayer(_),i||r.addLayer(h))):(_._recalculateBounds(),i&&_._icon||_._updateIcon()),_=_.__parent;delete t.__parent},_isOrIsParent:function(t,e){for(;e;){if(t===e)return!0;e=e.parentNode}return!1},_propagateEvent:function(t){if(t.layer instanceof L.MarkerCluster){if(t.originalEvent&&this._isOrIsParent(t.layer._icon,t.originalEvent.relatedTarget))return;t.type="cluster"+t.type}this.fire(t.type,t)},_defaultIconCreateFunction:function(t){var e=t.getChildCount(),i=" marker-cluster-";return i+=10>e?"small":100>e?"medium":"large",new L.DivIcon({html:"<div><span>"+e+"</span></div>",className:"marker-cluster"+i,iconSize:new L.Point(40,40)})},_bindEvents:function(){var t=this._map,e=this.options.spiderfyOnMaxZoom,i=this.options.showCoverageOnHover,n=this.options.zoomToBoundsOnClick;(e||n)&&this.on("clusterclick",this._zoomOrSpiderfy,this),i&&(this.on("clustermouseover",this._showCoverage,this),this.on("clustermouseout",this._hideCoverage,this),t.on("zoomend",this._hideCoverage,this))},_zoomOrSpiderfy:function(t){var e=this._map;e.getMaxZoom()===e.getZoom()?this.options.spiderfyOnMaxZoom&&t.layer.spiderfy():this.options.zoomToBoundsOnClick&&t.layer.zoomToBounds(),t.originalEvent&&13===t.originalEvent.keyCode&&e._container.focus()},_showCoverage:function(t){var e=this._map;this._inZoomAnimation||(this._shownPolygon&&e.removeLayer(this._shownPolygon),t.layer.getChildCount()>2&&t.layer!==this._spiderfied&&(this._shownPolygon=new L.Polygon(t.layer.getConvexHull(),this.options.polygonOptions),e.addLayer(this._shownPolygon)))},_hideCoverage:function(){this._shownPolygon&&(this._map.removeLayer(this._shownPolygon),this._shownPolygon=null)},_unbindEvents:function(){var t=this.options.spiderfyOnMaxZoom,e=this.options.showCoverageOnHover,i=this.options.zoomToBoundsOnClick,n=this._map;(t||i)&&this.off("clusterclick",this._zoomOrSpiderfy,this),e&&(this.off("clustermouseover",this._showCoverage,this),this.off("clustermouseout",this._hideCoverage,this),n.off("zoomend",this._hideCoverage,this))},_zoomEnd:function(){this._map&&(this._mergeSplitClusters(),this._zoom=this._map._zoom,this._currentShownBounds=this._getExpandedVisibleBounds())},_moveEnd:function(){if(!this._inZoomAnimation){var t=this._getExpandedVisibleBounds();this._topClusterLevel._recursivelyRemoveChildrenFromMap(this._currentShownBounds,this._zoom,t),this._topClusterLevel._recursivelyAddChildrenToMap(null,this._map._zoom,t),this._currentShownBounds=t}},_generateInitialClusters:function(){var t=this._map.getMaxZoom(),e=this.options.maxClusterRadius;this.options.disableClusteringAtZoom&&(t=this.options.disableClusteringAtZoom-1),this._maxZoom=t,this._gridClusters={},this._gridUnclustered={};for(var i=t;i>=0;i--)this._gridClusters[i]=new L.DistanceGrid(e),this._gridUnclustered[i]=new L.DistanceGrid(e);this._topClusterLevel=new L.MarkerCluster(this,-1)},_addLayer:function(t,e){var i,n,s=this._gridClusters,r=this._gridUnclustered;for(this.options.singleMarkerMode&&(t.options.icon=this.options.iconCreateFunction({getChildCount:function(){return 1},getAllChildMarkers:function(){return[t]}}));e>=0;e--){i=this._map.project(t.getLatLng(),e);var o=s[e].getNearObject(i);if(o)return o._addChild(t),t.__parent=o,void 0;if(o=r[e].getNearObject(i)){var a=o.__parent;a&&this._removeLayer(o,!1);var h=new L.MarkerCluster(this,e,o,t);s[e].addObject(h,this._map.project(h._cLatLng,e)),o.__parent=h,t.__parent=h;var _=h;for(n=e-1;n>a._zoom;n--)_=new L.MarkerCluster(this,n,_),s[n].addObject(_,this._map.project(o.getLatLng(),n));for(a._addChild(_),n=e;n>=0&&r[n].removeObject(o,this._map.project(o.getLatLng(),n));n--);return}r[e].addObject(t,i)}this._topClusterLevel._addChild(t),t.__parent=this._topClusterLevel},_enqueue:function(t){this._queue.push(t),this._queueTimeout||(this._queueTimeout=setTimeout(L.bind(this._processQueue,this),300))},_processQueue:function(){for(var t=0;t<this._queue.length;t++)this._queue[t].call(this);this._queue.length=0,clearTimeout(this._queueTimeout),this._queueTimeout=null},_mergeSplitClusters:function(){this._processQueue(),this._zoom<this._map._zoom&&this._currentShownBounds.contains(this._getExpandedVisibleBounds())?(this._animationStart(),this._topClusterLevel._recursivelyRemoveChildrenFromMap(this._currentShownBounds,this._zoom,this._getExpandedVisibleBounds()),this._animationZoomIn(this._zoom,this._map._zoom)):this._zoom>this._map._zoom?(this._animationStart(),this._animationZoomOut(this._zoom,this._map._zoom)):this._moveEnd()},_getExpandedVisibleBounds:function(){if(!this.options.removeOutsideVisibleBounds)return this.getBounds();var t=this._map,e=t.getBounds(),i=e._southWest,n=e._northEast,s=L.Browser.mobile?0:Math.abs(i.lat-n.lat),r=L.Browser.mobile?0:Math.abs(i.lng-n.lng);return new L.LatLngBounds(new L.LatLng(i.lat-s,i.lng-r,!0),new L.LatLng(n.lat+s,n.lng+r,!0))},_animationAddLayerNonAnimated:function(t,e){if(e===t)this._featureGroup.addLayer(t);else if(2===e._childCount){e._addToMap();var i=e.getAllChildMarkers();this._featureGroup.removeLayer(i[0]),this._featureGroup.removeLayer(i[1])}else e._updateIcon()}}),L.MarkerClusterGroup.include(L.DomUtil.TRANSITION?{_animationStart:function(){this._map._mapPane.className+=" leaflet-cluster-anim",this._inZoomAnimation++},_animationEnd:function(){this._map&&(this._map._mapPane.className=this._map._mapPane.className.replace(" leaflet-cluster-anim","")),this._inZoomAnimation--,this.fire("animationend")},_animationZoomIn:function(t,e){var i,n=this._getExpandedVisibleBounds(),s=this._featureGroup;this._topClusterLevel._recursively(n,t,0,function(r){var o,a=r._latlng,h=r._markers;for(n.contains(a)||(a=null),r._isSingleParent()&&t+1===e?(s.removeLayer(r),r._recursivelyAddChildrenToMap(null,e,n)):(r.setOpacity(0),r._recursivelyAddChildrenToMap(a,e,n)),i=h.length-1;i>=0;i--)o=h[i],n.contains(o._latlng)||s.removeLayer(o)}),this._forceLayout(),this._topClusterLevel._recursivelyBecomeVisible(n,e),s.eachLayer(function(t){t instanceof L.MarkerCluster||!t._icon||t.setOpacity(1)}),this._topClusterLevel._recursively(n,t,e,function(t){t._recursivelyRestoreChildPositions(e)}),this._enqueue(function(){this._topClusterLevel._recursively(n,t,0,function(t){s.removeLayer(t),t.setOpacity(1)}),this._animationEnd()})},_animationZoomOut:function(t,e){this._animationZoomOutSingle(this._topClusterLevel,t-1,e),this._topClusterLevel._recursivelyAddChildrenToMap(null,e,this._getExpandedVisibleBounds()),this._topClusterLevel._recursivelyRemoveChildrenFromMap(this._currentShownBounds,t,this._getExpandedVisibleBounds())},_animationZoomOutSingle:function(t,e,i){var n=this._getExpandedVisibleBounds();t._recursivelyAnimateChildrenInAndAddSelfToMap(n,e+1,i);var s=this;this._forceLayout(),t._recursivelyBecomeVisible(n,i),this._enqueue(function(){if(1===t._childCount){var r=t._markers[0];r.setLatLng(r.getLatLng()),r.setOpacity&&r.setOpacity(1)}else t._recursively(n,i,0,function(t){t._recursivelyRemoveChildrenFromMap(n,e+1)});s._animationEnd()})},_animationAddLayer:function(t,e){var i=this,n=this._featureGroup;n.addLayer(t),e!==t&&(e._childCount>2?(e._updateIcon(),this._forceLayout(),this._animationStart(),t._setPos(this._map.latLngToLayerPoint(e.getLatLng())),t.setOpacity(0),this._enqueue(function(){n.removeLayer(t),t.setOpacity(1),i._animationEnd()})):(this._forceLayout(),i._animationStart(),i._animationZoomOutSingle(e,this._map.getMaxZoom(),this._map.getZoom())))},_forceLayout:function(){L.Util.falseFn(e.body.offsetWidth)}}:{_animationStart:function(){},_animationZoomIn:function(t,e){this._topClusterLevel._recursivelyRemoveChildrenFromMap(this._currentShownBounds,t),this._topClusterLevel._recursivelyAddChildrenToMap(null,e,this._getExpandedVisibleBounds())},_animationZoomOut:function(t,e){this._topClusterLevel._recursivelyRemoveChildrenFromMap(this._currentShownBounds,t),this._topClusterLevel._recursivelyAddChildrenToMap(null,e,this._getExpandedVisibleBounds())},_animationAddLayer:function(t,e){this._animationAddLayerNonAnimated(t,e)}}),L.markerClusterGroup=function(t){return new L.MarkerClusterGroup(t)},L.MarkerCluster=L.Marker.extend({initialize:function(t,e,i,n){L.Marker.prototype.initialize.call(this,i?i._cLatLng||i.getLatLng():new L.LatLng(0,0),{icon:this}),this._group=t,this._zoom=e,this._markers=[],this._childClusters=[],this._childCount=0,this._iconNeedsUpdate=!0,this._bounds=new L.LatLngBounds,i&&this._addChild(i),n&&this._addChild(n)},getAllChildMarkers:function(t){t=t||[];for(var e=this._childClusters.length-1;e>=0;e--)this._childClusters[e].getAllChildMarkers(t);for(var i=this._markers.length-1;i>=0;i--)t.push(this._markers[i]);return t},getChildCount:function(){return this._childCount},zoomToBounds:function(){for(var t,e=this._childClusters.slice(),i=this._group._map,n=i.getBoundsZoom(this._bounds),s=this._zoom+1,r=i.getZoom();e.length>0&&n>s;){s++;var o=[];for(t=0;t<e.length;t++)o=o.concat(e[t]._childClusters);e=o}n>s?this._group._map.setView(this._latlng,s):r>=n?this._group._map.setView(this._latlng,r+1):this._group._map.fitBounds(this._bounds)},getBounds:function(){var t=new L.LatLngBounds;return t.extend(this._bounds),t},_updateIcon:function(){this._iconNeedsUpdate=!0,this._icon&&this.setIcon(this)},createIcon:function(){return this._iconNeedsUpdate&&(this._iconObj=this._group.options.iconCreateFunction(this),this._iconNeedsUpdate=!1),this._iconObj.createIcon()},createShadow:function(){return this._iconObj.createShadow()},_addChild:function(t,e){this._iconNeedsUpdate=!0,this._expandBounds(t),t instanceof L.MarkerCluster?(e||(this._childClusters.push(t),t.__parent=this),this._childCount+=t._childCount):(e||this._markers.push(t),this._childCount++),this.__parent&&this.__parent._addChild(t,!0)},_expandBounds:function(t){var e,i=t._wLatLng||t._latlng;t instanceof L.MarkerCluster?(this._bounds.extend(t._bounds),e=t._childCount):(this._bounds.extend(i),e=1),this._cLatLng||(this._cLatLng=t._cLatLng||i);var n=this._childCount+e;this._wLatLng?(this._wLatLng.lat=(i.lat*e+this._wLatLng.lat*this._childCount)/n,this._wLatLng.lng=(i.lng*e+this._wLatLng.lng*this._childCount)/n):this._latlng=this._wLatLng=new L.LatLng(i.lat,i.lng)},_addToMap:function(t){t&&(this._backupLatlng=this._latlng,this.setLatLng(t)),this._group._featureGroup.addLayer(this)},_recursivelyAnimateChildrenIn:function(t,e,i){this._recursively(t,0,i-1,function(t){var i,n,s=t._markers;for(i=s.length-1;i>=0;i--)n=s[i],n._icon&&(n._setPos(e),n.setOpacity(0))},function(t){var i,n,s=t._childClusters;for(i=s.length-1;i>=0;i--)n=s[i],n._icon&&(n._setPos(e),n.setOpacity(0))})},_recursivelyAnimateChildrenInAndAddSelfToMap:function(t,e,i){this._recursively(t,i,0,function(n){n._recursivelyAnimateChildrenIn(t,n._group._map.latLngToLayerPoint(n.getLatLng()).round(),e),n._isSingleParent()&&e-1===i?(n.setOpacity(1),n._recursivelyRemoveChildrenFromMap(t,e)):n.setOpacity(0),n._addToMap()})},_recursivelyBecomeVisible:function(t,e){this._recursively(t,0,e,null,function(t){t.setOpacity(1)})},_recursivelyAddChildrenToMap:function(t,e,i){this._recursively(i,-1,e,function(n){if(e!==n._zoom)for(var s=n._markers.length-1;s>=0;s--){var r=n._markers[s];i.contains(r._latlng)&&(t&&(r._backupLatlng=r.getLatLng(),r.setLatLng(t),r.setOpacity&&r.setOpacity(0)),n._group._featureGroup.addLayer(r))}},function(e){e._addToMap(t)})},_recursivelyRestoreChildPositions:function(t){for(var e=this._markers.length-1;e>=0;e--){var i=this._markers[e];i._backupLatlng&&(i.setLatLng(i._backupLatlng),delete i._backupLatlng)}if(t-1===this._zoom)for(var n=this._childClusters.length-1;n>=0;n--)this._childClusters[n]._restorePosition();else for(var s=this._childClusters.length-1;s>=0;s--)this._childClusters[s]._recursivelyRestoreChildPositions(t)},_restorePosition:function(){this._backupLatlng&&(this.setLatLng(this._backupLatlng),delete this._backupLatlng)},_recursivelyRemoveChildrenFromMap:function(t,e,i){var n,s;this._recursively(t,-1,e-1,function(t){for(s=t._markers.length-1;s>=0;s--)n=t._markers[s],i&&i.contains(n._latlng)||(t._group._featureGroup.removeLayer(n),n.setOpacity&&n.setOpacity(1))},function(t){for(s=t._childClusters.length-1;s>=0;s--)n=t._childClusters[s],i&&i.contains(n._latlng)||(t._group._featureGroup.removeLayer(n),n.setOpacity&&n.setOpacity(1))})},_recursively:function(t,e,i,n,s){var r,o,a=this._childClusters,h=this._zoom;if(e>h)for(r=a.length-1;r>=0;r--)o=a[r],t.intersects(o._bounds)&&o._recursively(t,e,i,n,s);else if(n&&n(this),s&&this._zoom===i&&s(this),i>h)for(r=a.length-1;r>=0;r--)o=a[r],t.intersects(o._bounds)&&o._recursively(t,e,i,n,s)},_recalculateBounds:function(){var t,e=this._markers,i=this._childClusters;for(this._bounds=new L.LatLngBounds,delete this._wLatLng,t=e.length-1;t>=0;t--)this._expandBounds(e[t]);for(t=i.length-1;t>=0;t--)this._expandBounds(i[t])},_isSingleParent:function(){return this._childClusters.length>0&&this._childClusters[0]._childCount===this._childCount}}),L.DistanceGrid=function(t){this._cellSize=t,this._sqCellSize=t*t,this._grid={},this._objectPoint={}},L.DistanceGrid.prototype={addObject:function(t,e){var i=this._getCoord(e.x),n=this._getCoord(e.y),s=this._grid,r=s[n]=s[n]||{},o=r[i]=r[i]||[],a=L.Util.stamp(t);this._objectPoint[a]=e,o.push(t)},updateObject:function(t,e){this.removeObject(t),this.addObject(t,e)},removeObject:function(t,e){var i,n,s=this._getCoord(e.x),r=this._getCoord(e.y),o=this._grid,a=o[r]=o[r]||{},h=a[s]=a[s]||[];for(delete this._objectPoint[L.Util.stamp(t)],i=0,n=h.length;n>i;i++)if(h[i]===t)return h.splice(i,1),1===n&&delete a[s],!0},eachObject:function(t,e){var i,n,s,r,o,a,h,_=this._grid;for(i in _){o=_[i];for(n in o)for(a=o[n],s=0,r=a.length;r>s;s++)h=t.call(e,a[s]),h&&(s--,r--)}},getNearObject:function(t){var e,i,n,s,r,o,a,h,_=this._getCoord(t.x),u=this._getCoord(t.y),l=this._objectPoint,d=this._sqCellSize,p=null;for(e=u-1;u+1>=e;e++)if(s=this._grid[e])for(i=_-1;_+1>=i;i++)if(r=s[i])for(n=0,o=r.length;o>n;n++)a=r[n],h=this._sqDist(l[L.Util.stamp(a)],t),d>h&&(d=h,p=a);return p},_getCoord:function(t){return Math.floor(t/this._cellSize)},_sqDist:function(t,e){var i=e.x-t.x,n=e.y-t.y;return i*i+n*n}},function(){L.QuickHull={getDistant:function(t,e){var i=e[1].lat-e[0].lat,n=e[0].lng-e[1].lng;return n*(t.lat-e[0].lat)+i*(t.lng-e[0].lng)},findMostDistantPointFromBaseLine:function(t,e){var i,n,s,r=0,o=null,a=[];for(i=e.length-1;i>=0;i--)n=e[i],s=this.getDistant(n,t),s>0&&(a.push(n),s>r&&(r=s,o=n));return{maxPoint:o,newPoints:a}},buildConvexHull:function(t,e){var i=[],n=this.findMostDistantPointFromBaseLine(t,e);return n.maxPoint?(i=i.concat(this.buildConvexHull([t[0],n.maxPoint],n.newPoints)),i=i.concat(this.buildConvexHull([n.maxPoint,t[1]],n.newPoints))):[t[0]]},getConvexHull:function(t){var e,i=!1,n=!1,s=null,r=null;for(e=t.length-1;e>=0;e--){var o=t[e];(i===!1||o.lat>i)&&(s=o,i=o.lat),(n===!1||o.lat<n)&&(r=o,n=o.lat)}var a=[].concat(this.buildConvexHull([r,s],t),this.buildConvexHull([s,r],t));return a}}}(),L.MarkerCluster.include({getConvexHull:function(){var t,e,i=this.getAllChildMarkers(),n=[];for(e=i.length-1;e>=0;e--)t=i[e].getLatLng(),n.push(t);return L.QuickHull.getConvexHull(n)}}),L.MarkerCluster.include({_2PI:2*Math.PI,_circleFootSeparation:25,_circleStartAngle:Math.PI/6,_spiralFootSeparation:28,_spiralLengthStart:11,_spiralLengthFactor:5,_circleSpiralSwitchover:9,spiderfy:function(){if(this._group._spiderfied!==this&&!this._group._inZoomAnimation){var t,e=this.getAllChildMarkers(),i=this._group,n=i._map,s=n.latLngToLayerPoint(this._latlng);this._group._unspiderfy(),this._group._spiderfied=this,e.length>=this._circleSpiralSwitchover?t=this._generatePointsSpiral(e.length,s):(s.y+=10,t=this._generatePointsCircle(e.length,s)),this._animationSpiderfy(e,t)}},unspiderfy:function(t){this._group._inZoomAnimation||(this._animationUnspiderfy(t),this._group._spiderfied=null)},_generatePointsCircle:function(t,e){var i,n,s=this._group.options.spiderfyDistanceMultiplier*this._circleFootSeparation*(2+t),r=s/this._2PI,o=this._2PI/t,a=[];for(a.length=t,i=t-1;i>=0;i--)n=this._circleStartAngle+i*o,a[i]=new L.Point(e.x+r*Math.cos(n),e.y+r*Math.sin(n))._round();return a},_generatePointsSpiral:function(t,e){var i,n=this._group.options.spiderfyDistanceMultiplier*this._spiralLengthStart,s=this._group.options.spiderfyDistanceMultiplier*this._spiralFootSeparation,r=this._group.options.spiderfyDistanceMultiplier*this._spiralLengthFactor,o=0,a=[];for(a.length=t,i=t-1;i>=0;i--)o+=s/n+5e-4*i,a[i]=new L.Point(e.x+n*Math.cos(o),e.y+n*Math.sin(o))._round(),n+=this._2PI*r/o;return a},_noanimationUnspiderfy:function(){var t,e,i=this._group,n=i._map,s=i._featureGroup,r=this.getAllChildMarkers();for(this.setOpacity(1),e=r.length-1;e>=0;e--)t=r[e],s.removeLayer(t),t._preSpiderfyLatlng&&(t.setLatLng(t._preSpiderfyLatlng),delete t._preSpiderfyLatlng),t.setZIndexOffset&&t.setZIndexOffset(0),t._spiderLeg&&(n.removeLayer(t._spiderLeg),delete t._spiderLeg);i._spiderfied=null}}),L.MarkerCluster.include(L.DomUtil.TRANSITION?{SVG_ANIMATION:function(){return e.createElementNS("http://www.w3.org/2000/svg","animate").toString().indexOf("SVGAnimate")>-1}(),_animationSpiderfy:function(t,i){var n,s,r,o,a=this,h=this._group,_=h._map,u=h._featureGroup,l=_.latLngToLayerPoint(this._latlng);for(n=t.length-1;n>=0;n--)s=t[n],s.setOpacity?(s.setZIndexOffset(1e6),s.setOpacity(0),u.addLayer(s),s._setPos(l)):u.addLayer(s);h._forceLayout(),h._animationStart();var d=L.Path.SVG?0:.3,p=L.Path.SVG_NS;for(n=t.length-1;n>=0;n--)if(o=_.layerPointToLatLng(i[n]),s=t[n],s._preSpiderfyLatlng=s._latlng,s.setLatLng(o),s.setOpacity&&s.setOpacity(1),r=new L.Polyline([a._latlng,o],{weight:1.5,color:"#222",opacity:d}),_.addLayer(r),s._spiderLeg=r,L.Path.SVG&&this.SVG_ANIMATION){var c=r._path.getTotalLength();r._path.setAttribute("stroke-dasharray",c+","+c);var m=e.createElementNS(p,"animate");m.setAttribute("attributeName","stroke-dashoffset"),m.setAttribute("begin","indefinite"),m.setAttribute("from",c),m.setAttribute("to",0),m.setAttribute("dur",.25),r._path.appendChild(m),m.beginElement(),m=e.createElementNS(p,"animate"),m.setAttribute("attributeName","stroke-opacity"),m.setAttribute("attributeName","stroke-opacity"),m.setAttribute("begin","indefinite"),m.setAttribute("from",0),m.setAttribute("to",.5),m.setAttribute("dur",.25),r._path.appendChild(m),m.beginElement()}if(a.setOpacity(.3),L.Path.SVG)for(this._group._forceLayout(),n=t.length-1;n>=0;n--)s=t[n]._spiderLeg,s.options.opacity=.5,s._path.setAttribute("stroke-opacity",.5);setTimeout(function(){h._animationEnd(),h.fire("spiderfied")},200)},_animationUnspiderfy:function(t){var e,i,n,s=this._group,r=s._map,o=s._featureGroup,a=t?r._latLngToNewLayerPoint(this._latlng,t.zoom,t.center):r.latLngToLayerPoint(this._latlng),h=this.getAllChildMarkers(),_=L.Path.SVG&&this.SVG_ANIMATION;for(s._animationStart(),this.setOpacity(1),i=h.length-1;i>=0;i--)e=h[i],e._preSpiderfyLatlng&&(e.setLatLng(e._preSpiderfyLatlng),delete e._preSpiderfyLatlng,e.setOpacity?(e._setPos(a),e.setOpacity(0)):o.removeLayer(e),_&&(n=e._spiderLeg._path.childNodes[0],n.setAttribute("to",n.getAttribute("from")),n.setAttribute("from",0),n.beginElement(),n=e._spiderLeg._path.childNodes[1],n.setAttribute("from",.5),n.setAttribute("to",0),n.setAttribute("stroke-opacity",0),n.beginElement(),e._spiderLeg._path.setAttribute("stroke-opacity",0)));setTimeout(function(){var t=0;for(i=h.length-1;i>=0;i--)e=h[i],e._spiderLeg&&t++;for(i=h.length-1;i>=0;i--)e=h[i],e._spiderLeg&&(e.setOpacity&&(e.setOpacity(1),e.setZIndexOffset(0)),t>1&&o.removeLayer(e),r.removeLayer(e._spiderLeg),delete e._spiderLeg);s._animationEnd()},200)}}:{_animationSpiderfy:function(t,e){var i,n,s,r,o=this._group,a=o._map,h=o._featureGroup;for(i=t.length-1;i>=0;i--)r=a.layerPointToLatLng(e[i]),n=t[i],n._preSpiderfyLatlng=n._latlng,n.setLatLng(r),n.setZIndexOffset&&n.setZIndexOffset(1e6),h.addLayer(n),s=new L.Polyline([this._latlng,r],{weight:1.5,color:"#222"}),a.addLayer(s),n._spiderLeg=s;this.setOpacity(.3),o.fire("spiderfied")},_animationUnspiderfy:function(){this._noanimationUnspiderfy()}}),L.MarkerClusterGroup.include({_spiderfied:null,_spiderfierOnAdd:function(){this._map.on("click",this._unspiderfyWrapper,this),this._map.options.zoomAnimation&&this._map.on("zoomstart",this._unspiderfyZoomStart,this),this._map.on("zoomend",this._noanimationUnspiderfy,this),L.Path.SVG&&!L.Browser.touch&&this._map._initPathRoot()},_spiderfierOnRemove:function(){this._map.off("click",this._unspiderfyWrapper,this),this._map.off("zoomstart",this._unspiderfyZoomStart,this),this._map.off("zoomanim",this._unspiderfyZoomAnim,this),this._unspiderfy()},_unspiderfyZoomStart:function(){this._map&&this._map.on("zoomanim",this._unspiderfyZoomAnim,this)},_unspiderfyZoomAnim:function(t){L.DomUtil.hasClass(this._map._mapPane,"leaflet-touching")||(this._map.off("zoomanim",this._unspiderfyZoomAnim,this),this._unspiderfy(t))},_unspiderfyWrapper:function(){this._unspiderfy()},_unspiderfy:function(t){this._spiderfied&&this._spiderfied.unspiderfy(t)},_noanimationUnspiderfy:function(){this._spiderfied&&this._spiderfied._noanimationUnspiderfy()},_unspiderfyLayer:function(t){t._spiderLeg&&(this._featureGroup.removeLayer(t),t.setOpacity(1),t.setZIndexOffset(0),this._map.removeLayer(t._spiderLeg),delete t._spiderLeg)}})}(window,document);
  L.Control.Fullscreen=L.Control.extend({options:{position:"topleft",title:{"false":"View Fullscreen","true":"Exit Fullscreen"}},onAdd:function(map){var container=L.DomUtil.create("div","leaflet-control-fullscreen leaflet-bar leaflet-control");this.link=L.DomUtil.create("a","leaflet-control-fullscreen-button leaflet-bar-part",container);this.link.href="#";this._map=map;this._map.on("fullscreenchange",this._toggleTitle,this);this._toggleTitle();L.DomEvent.on(this.link,"click",this._click,this);return container},_click:function(e){L.DomEvent.stopPropagation(e);L.DomEvent.preventDefault(e);this._map.toggleFullscreen(this.options)},_toggleTitle:function(){this.link.title=this.options.title[this._map.isFullscreen()]}});L.Map.include({isFullscreen:function(){return this._isFullscreen||false},toggleFullscreen:function(options){var container=this.getContainer();if(this.isFullscreen()){if(options&&options.pseudoFullscreen){this._disablePseudoFullscreen(container)}else if(document.exitFullscreen){document.exitFullscreen()}else if(document.mozCancelFullScreen){document.mozCancelFullScreen()}else if(document.webkitCancelFullScreen){document.webkitCancelFullScreen()}else if(document.msExitFullscreen){document.msExitFullscreen()}else{this._disablePseudoFullscreen(container)}}else{if(options&&options.pseudoFullscreen){this._enablePseudoFullscreen(container)}else if(container.requestFullscreen){container.requestFullscreen()}else if(container.mozRequestFullScreen){container.mozRequestFullScreen()}else if(container.webkitRequestFullscreen){container.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT)}else if(container.msRequestFullscreen){container.msRequestFullscreen()}else{this._enablePseudoFullscreen(container)}}},_enablePseudoFullscreen:function(container){L.DomUtil.addClass(container,"leaflet-pseudo-fullscreen");this._setFullscreen(true);this.invalidateSize();this.fire("fullscreenchange")},_disablePseudoFullscreen:function(container){L.DomUtil.removeClass(container,"leaflet-pseudo-fullscreen");this._setFullscreen(false);this.invalidateSize();this.fire("fullscreenchange")},_setFullscreen:function(fullscreen){this._isFullscreen=fullscreen;var container=this.getContainer();if(fullscreen){L.DomUtil.addClass(container,"leaflet-fullscreen-on")}else{L.DomUtil.removeClass(container,"leaflet-fullscreen-on")}},_onFullscreenChange:function(e){var fullscreenElement=document.fullscreenElement||document.mozFullScreenElement||document.webkitFullscreenElement||document.msFullscreenElement;if(fullscreenElement===this.getContainer()&&!this._isFullscreen){this._setFullscreen(true);this.fire("fullscreenchange")}else if(fullscreenElement!==this.getContainer()&&this._isFullscreen){this._setFullscreen(false);this.fire("fullscreenchange")}}});L.Map.mergeOptions({fullscreenControl:false});L.Map.addInitHook(function(){if(this.options.fullscreenControl){this.fullscreenControl=new L.Control.Fullscreen(this.options.fullscreenControl);this.addControl(this.fullscreenControl)}var fullscreenchange;if("onfullscreenchange"in document){fullscreenchange="fullscreenchange"}else if("onmozfullscreenchange"in document){fullscreenchange="mozfullscreenchange"}else if("onwebkitfullscreenchange"in document){fullscreenchange="webkitfullscreenchange"}else if("onmsfullscreenchange"in document){fullscreenchange="MSFullscreenChange"}if(fullscreenchange){var onFullscreenChange=L.bind(this._onFullscreenChange,this);this.whenReady(function(){L.DomEvent.on(document,fullscreenchange,onFullscreenChange)});this.on("unload",function(){L.DomEvent.off(document,fullscreenchange,onFullscreenChange)})}});L.control.fullscreen=function(options){return new L.Control.Fullscreen(options)};
  /*
  * L.VisualClick
  * Description: A plugin that adds visual feedback when user clicks/taps the map. Useful for when you have a delay on the clickEvents for async fetching of data, or implmentation of Leaflet.singleclick
  * Example: L.visualClick({map: leafletMap}); //Just works
  * Author: Dag Jomar Mersland (twitter: @dagjomar)
  */
  
  
  L.Map.VisualClick = L.Handler.extend({
  
      _makeVisualIcon: function(){
  
          var touchMode = this._map.options.visualClickMode === 'touch' ? true : false;
  
          return L.divIcon({
              className: "leaflet-visualclick-icon" + (touchMode ? '-touch' : ''),    // See L.VisualClick.css
              iconSize: [0, 0],
              clickable: false
          });
      },
  
      _visualIcon: null,
  
      _onClick: function(e) {
  
          var map = this._map;
  
          var latlng = e.latlng;
          var marker = L.marker(latlng, {
              pane: this._map.options.visualClickPane,
              icon: this._visualIcon,
              interactive: false
          }).addTo(map);
  
          window.setTimeout(function(){
              if(map){
                  map.removeLayer(marker);
              }
          }.bind(this), map.options.visualClick.removeTimeout || 450);    // Should somewhat match the css animation to prevent loops
  
          return true;
      },
  
      addHooks: function () {
          if(this._visualIcon === null){
              this._visualIcon = this._makeVisualIcon();
          }
  
          if (this._map.options.visualClickPane === 'ie10-visual-click-pane') {
              this._map.createPane('ie10-visual-click-pane');
          }
  
          this._map.on(this._map.options.visualClickEvents, this._onClick, this);
      },
  
      removeHooks: function () {
          this._map.off(this._map.options.visualClickEvents, this._onClick, this);
      },
  
  });
  
  
  L.Map.mergeOptions({
      visualClick: L.Browser.any3d ? true : false, //Can be true, desktop, touch, false. Not straight forward to use L.Browser.touch flag because true on IE10
      visualClickMode: L.Browser.touch && L.Browser.mobile ? 'touch' : 'desktop', //Not straight forward to use only L.Browser.touch flag because true on IE10 - so this is slightly better
      visualClickEvents: 'click contextmenu', //Standard leaflety way of defining which events to hook on to
      visualClickPane: (L.Browser.ie && document.documentMode === 10) ?
          'ie10-visual-click-pane' :
          'shadowPane'	// Map pane where the pulse markers will be showh
  });
  
  L.Map.addInitHook('addHandler', 'visualClick', L.Map.VisualClick);
  
  