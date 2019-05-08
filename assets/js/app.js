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
    // style for short commute distance
    var shortCommuteOptions = {
        color: 'white',
        weight: .5,
        opacity: 2
    }
    // style for medium commute distance
    var mediumCommuteOptions = {
        color: 'yellow',
        weight: .2,
        opacity: 0.4
    }
    // style for long commute distance
    var longCommuteOptions = {
        color: 'red',
        weight: .2,
        opacity: 0.2
    }

    // D3.csv to load data
    d3.csv("data/21_latlng_low_income.csv", function (d) {
        return {
            distance: +d.distance,
            h_lat: +d.h_lat,
            h_lon: +d.h_lon,
            w_lat: +d.w_lat,
            w_lon: +d.w_lon
        };
    }).then(function (data) {
        // Call function to build array of lines
        var lineArray = buildLineArray(data);
        drawMap(lineArray);
    });

    // ---------------------------------------------------------------
    function buildLineArray(linedata) {
        var w_point = [];
        var h_point = [];
        var lines = [];

        linedata.forEach(function (element) {
            // create a blank object and fill it
            var obj = {};
            obj['w_point'] = [element.w_lat, element.w_lon];
            obj['h_point'] = [element.h_lat, element.h_lon];
            obj['distance'] = element.distance;
            // append the object to an array
            lines.push(obj);
        });
        return lines;

    }
    // ---------------------------------------------------------------
    function drawMap(commuteLineData) {
        //load the data to the map rendering the color and styles for each in the particular order below
        commuteLineData.forEach(function (element) {
            var distance = element.distance;
            var style = distance < 17500 ? shortCommuteOptions :
                distance < 50000 ? mediumCommuteOptions : longCommuteOptions;
            var polyline = L.polyline([element.w_point, element.h_point], style).addTo(map);
        });
    }