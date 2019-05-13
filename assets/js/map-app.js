    // D3 abbreviations
    var $ = d3.select, $$ = d3.selectAll;

    var map_showing = true,
      low_showing = true,
      med_showing = false,
      high_showing = false;

    var map = L.map('map', {
      renderer: L.canvas()
    }).setView([37.6, -85.5], 7).setMaxZoom(12).setMinZoom(4);

    // add labels & tiles to the map
    map.createPane('labels');
    map.getPane('labels').style.zIndex = 650;
    map.getPane('labels').style.pointerEvents = 'none';

    tile_layer = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}.png', {
        attribution: '©OpenStreetMap, ©Carto',
        pane: 'labels'
    }).addTo(map);


	  initControls();

    // **** Options for various layers 
    // If displaying all lines with not highlight for distance
    var lineOptions = {
      fillOpacity: 0,
      color: '#c7dffc', //lt blue
      opacity: .4,
      weight: 0.4
    };

    // Short commute distance
    var shortCommuteOptions = {
      color: 'white',
      weight: .5,
      opacity: 2
    }

    var mediumCommuteOptions = {
      color: 'yellow',
      weight: .2,
      opacity: 0.4
    }

    var longCommuteOptions = {
      color: 'red',
      weight: .2,
      opacity: 0.2
    }

    var dataLayerGroup = L.layerGroup().addTo(map);

    // create an empty L.geoJson to hold features and reference with variable
    var allLayerGroup = L.geoJson();
    var lowLayerGroup = L.geoJson().addTo(dataLayerGroup);
    var mediumLayerGroup = L.geoJson();
    var highLayerGroup = L.geoJson();

    function convertToNumber(d) {
      return {
        distance: +d.distance,
        SE01: +d.SE01,
        SE02: +d.SE02,
        SE03: +d.SE03,
        h_lat: +d.h_lat,
        h_lon: +d.h_lon,
        w_lat: +d.w_lat,
        w_lon: +d.w_lon
      };
    }

    var allData = d3.csv("data/21_od_distance_1000_plus.csv", convertToNumber);
      /*  Probably will remove this as only 1 file needs to load
      lowData = d3.csv("data/21_latlng_low_income.csv", convertToNumber),
      mediumData = d3.csv("data/21_latlng_medium_income.csv", convertToNumber),
      highData = d3.csv("data/21_latlng_high_income.csv", convertToNumber);
      */
    
    

    Promise.all([allData]).then(function (data) {
      var earnings_filter = 'all';
      var allLineArray = buildLineArray(data[0], earnings_filter);
      var earnings_filter = 'low';
      var lowLineArray = buildLineArray(data[0], earnings_filter);
      var earnings_filter = 'medium';
      var mediumLineArray = buildLineArray(data[0], earnings_filter);
      var earnings_filter = 'high';
      var highLineArray = buildLineArray(data[0], earnings_filter);
      
      drawMap(lowLineArray, allLineArray, mediumLineArray, highLineArray);

      //drawMap(lowLineArray);
    });

    function buildLineArray(linedata, earnings_filter) {
      var w_point = [];
      var h_point = [];
      var lines = [];

      var obj = {};

      linedata.forEach(function (element) {
        if (earnings_filter == 'low') {
          if (element.SE01 >=1) {
            var obj = {};
            obj['w_point'] = [element.w_lat, element.w_lon];
            obj['h_point'] = [element.h_lat, element.h_lon];
            obj['distance'] = element.distance;
            lines.push(obj);
          }
        }

        if (earnings_filter == 'medium') {
          if (element.SE02 >=1) {
            var obj = {};
            obj['w_point'] = [element.w_lat, element.w_lon];
            obj['h_point'] = [element.h_lat, element.h_lon];
            obj['distance'] = element.distance;
            lines.push(obj);
          }
        }

        if (earnings_filter == 'high') {
          if (element.SE03 >=1) {
            var obj = {};
            obj['w_point'] = [element.w_lat, element.w_lon];
            obj['h_point'] = [element.h_lat, element.h_lon];
            obj['distance'] = element.distance;
            lines.push(obj);
          }
        }
        if (earnings_filter == 'all') {
          var obj = {};
          obj['w_point'] = [element.w_lat, element.w_lon];
          obj['h_point'] = [element.h_lat, element.h_lon];
          obj['distance'] = element.distance;
          lines.push(obj);
        }
      });
      return lines;

    }
    // ---------------------------------------------------------------
    function drawMap(lowLineArray, allLineArray, mediumLineArray, highLineArray) {
      //load the data to the map rendering the color and styles for each in the particular order below

      var distance, style
      
      allLineArray.forEach(function (element) {
        distance = element.distance;
        style = distance < 17500 ? shortCommuteOptions :
          distance < 50000 ? mediumCommuteOptions : longCommuteOptions;

        // create new Leaflet polyline and add to kentucky L.geoJson
        L.polyline([element.w_point, element.h_point], style).addTo(allLayerGroup);
      });

      lowLineArray.forEach(function (element) {
        distance = element.distance;
        style = distance < 17500 ? shortCommuteOptions :
          distance < 50000 ? mediumCommuteOptions : longCommuteOptions;

        // create new Leaflet polyline and add to kentucky L.geoJson
        L.polyline([element.w_point, element.h_point], style).addTo(lowLayerGroup);
      });

      mediumLineArray.forEach(function (element) {
        distance = element.distance;
        style = distance < 17500 ? shortCommuteOptions :
          distance < 50000 ? mediumCommuteOptions : longCommuteOptions;

        // create new Leaflet polyline and add to kentucky L.geoJson
        L.polyline([element.w_point, element.h_point], style).addTo(mediumLayerGroup);
      });

      highLineArray.forEach(function (element) {
        distance = element.distance;
        style = distance < 17500 ? shortCommuteOptions :
          distance < 50000 ? mediumCommuteOptions : longCommuteOptions;

        // create new Leaflet polyline and add to kentucky L.geoJson
        L.polyline([element.w_point, element.h_point], style).addTo(highLayerGroup);
      });

    }


function initControls() {

	$$("#options .option > .option-name").on("touchstart", function() {
		var option_element = this.parentNode,
		    option_id = option_element.id,
		    $option = $(option_element),
		    is_visible = $option.classed("visible");

		if ($option.classed("disabled")) return;

		$("#options").classed("hoverable", false);
		$$("#options .option").classed("visible",
			is_visible ? false : function() { return this.id == option_id; }
		);
		d3.event.preventDefault();
	});

	$("#map-toggler").on("click", toggleMap);
	$("#low-toggler").on("click", toggleLow);
	$("#med-toggler").on("click", toggleMed);
	$("#high-toggler").on("click", toggleHigh);


	//$("#info-open").on("click", toggleInfoPanel);
	//$$(".info-close").on("click", hideInfoPanel);


	//$(".fa-twitter").on("click", clickTwitter);
	//$(".fa-facebook").on("click", clickFacebook);
	//$(".fa-code").on("click", showInfoPanel);
}

function toggleMap() {
	if (map_showing) hideMap();
	else showMap();
}

function showMap() {
	if (map_showing) return;
	//map.removeLayer(blank_layer);
	tile_layer.addTo(map).bringToBack();
  
	$("#map-toggler").classed("checked", true);
	map_showing = true;
}

function hideMap() {
	if (!map_showing) return;
	//if (!routes_showing) map.addLayer(blank_layer);
	map.removeLayer(tile_layer);
	$("#map-toggler").classed("checked", false);
	map_showing = false;
}

//************ Show / Hide earnings layers  *********
function toggleLow() {
	if (low_showing) hideLow();
	else showLow();
}
function showLow() {
	if (low_showing) return;
	lowLayerGroup.addTo(map);
	$("#low-toggler").classed("checked", true);
	low_showing = true;
}
function hideLow() {
	if (!low_showing) return;
	map.removeLayer(lowLayerGroup);
	$("#low-toggler").classed("checked", false);
	low_showing = false;
}
//******  Medium Earners ******
function toggleMed() {
	if (med_showing) hideMed();
	else showMed();
}
function showMed() {
	if (med_showing) return;
	mediumLayerGroup.addTo(map);
	$("#med-toggler").classed("checked", true);
	med_showing = true;
}
function hideMed() {
	if (!med_showing) return;
	map.removeLayer(mediumLayerGroup);
	$("#med-toggler").classed("checked", false);
	med_showing = false;
}
//******  High Earners ******
function toggleHigh() {
	if (high_showing) hideHigh();
	else showHigh();
}
function showHigh() {
	if (high_showing) return;
	highLayerGroup.addTo(map);
	$("#high-toggler").classed("checked", true);
	high_showing = true;
}
function hideHigh() {
	if (!high_showing) return;
	map.removeLayer(highLayerGroup);
	$("#high-toggler").classed("checked", false);
	high_showing = false;
}