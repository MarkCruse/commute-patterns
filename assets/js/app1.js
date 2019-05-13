    //var map = L.map('map', options);
    var map = L.map('map', {
        renderer: L.canvas()
    }).setView([37.9, -85.5], 8).setMaxZoom(10).setMinZoom(4);

    // add labels & tiles to the map
    map.createPane('labels');
    map.getPane('labels').style.zIndex = 650;
    map.getPane('labels').style.pointerEvents = 'none';

    L.tileLayer('http://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}.png', {
        attribution: '©OpenStreetMap, ©Carto',
        pane: 'labels'
    }).addTo(map);

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
      var allLayerGroup = L.geoJson().addTo(dataLayerGroup);
      var lowLayerGroup = L.geoJson();
      var mediumLayerGroup = L.geoJson();
      var highLayerGroup = L.geoJson();
  
      function convertToNumber(d) {
        return {
          distance: +d.distance,
          h_lat: +d.h_lat,
          h_lon: +d.h_lon,
          w_lat: +d.w_lat,
          w_lon: +d.w_lon
        };
      }
  
      var allData = d3.csv("data/21_od_distance_1000_plus.csv", convertToNumber);
        lowData = d3.csv("data/21_latlng_low_income.csv", convertToNumber),
        mediumData = d3.csv("data/21_latlng_medium_income.csv", convertToNumber),
        highData = d3.csv("data/21_latlng_high_income.csv", convertToNumber);
  
  
      Promise.all([allData, lowData, mediumData, highData]).then(function (data) {
  
        var allLineArray = buildLineArray(data[0]);
        var lowLineArray = buildLineArray(data[1]);
        var mediumLineArray = buildLineArray(data[2]);
        var highLineArray = buildLineArray(data[3]);
  
        drawMap(allLineArray, lowLineArray, mediumLineArray, highLineArray);
      });
  
      function buildLineArray(linedata) {
        var w_point = [];
        var h_point = [];
        var lines = [];
  
        var obj = {};
  
        linedata.forEach(function (element) {
          var obj = {};
          obj['w_point'] = [element.w_lat, element.w_lon];
          obj['h_point'] = [element.h_lat, element.h_lon];
          obj['distance'] = element.distance;
          lines.push(obj);
        });
        return lines;
  
      }
      // ---------------------------------------------------------------
      function drawMap(allLineArray, lowLineArray, mediumLineArray, highLineArray) {
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
  
      // select the button and wait for a click event
      d3.select('#btn-all').on('click', function () {
  
        dataLayerGroup.clearLayers();
        dataLayerGroup.addLayer(allLayerGroup);
  
      });
  
      // select the button and wait for a click event
      d3.select('#btn-low').on('click', function () {
  
        dataLayerGroup.clearLayers();
        dataLayerGroup.addLayer(lowLayerGroup);
  
      });
  
      // select the button and wait for a click event
      d3.select('#btn-medium').on('click', function () {
  
        dataLayerGroup.clearLayers();
        dataLayerGroup.addLayer(mediumLayerGroup);
      });
  
      // select the button and wait for a click event
      d3.select('#btn-high').on('click', function () {
  
        dataLayerGroup.clearLayers();
        dataLayerGroup.addLayer(highLayerGroup);
  
      });