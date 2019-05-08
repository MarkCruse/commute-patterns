    //var map = L.map('map', options);
    var map = L.map('map', {
        renderer: L.canvas()
    }).setView([37.6, -85.5], 7).setMaxZoom(10).setMinZoom(4);

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

    // D3 calls to load data

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

    function buildLineArray(linedata) {
        var w_point = new Array();
        var h_point = new Array();
        var lines = new Array();

        var obj = {};

        linedata.forEach(function (element) {
            var obj = {};
            obj['w_point'] = new Array(element.w_lat, element.w_lon);
            obj['h_point'] = new Array(element.h_lat, element.h_lon);
            obj['distance'] = element.distance;
            lines.push(obj);
        });
        return lines;

    }
    // ---------------------------------------------------------------
    function drawMap(commuteLineData) {
        //load the data to the map rendering the color and styles for each in the particular order below
        commuteLineData.forEach(function (element) {
            var distance = element.distance;
            var polyline = L.polyline(new Array(element.w_point, element.h_point), {
                style: function (distance) {
                    
                    return distance < 17500 ? shortCommuteOptions :
                        distance < 50000 ? mediumCommuteOptions : longCommuteOptions;

                }
            }).addTo(map);
        });

        /* The next few commented lines are the old way of rendering the map
        var latlngLine = new Array();
        var mapLines = new Array();        
        commuteLineData.forEach(function (element) {
            latlngLine[0] = new Array(element.w_point, element.h_point);
            mapLines.push(latlngLine[0])
        })
        
        var polyline = L.polyline(mapLines, {
            color: 'white',
            weight: .5,
            opacity: 2
        }).addTo(map); 
        */

    }
