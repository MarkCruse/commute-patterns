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
        data.forEach(function (element) {
            element.h_lat = element.h_lat.toFixed(2),
                element.h_lon = element.h_lon.toFixed(2),
                element.w_lat = element.w_lat.toFixed(2),
                element.w_lon = element.w_lon.toFixed(2)
        });
        //console.log(data[0]);  //this is the data from csv
        // Call function to build array of lines
        lineArray = buildLineArray(data);
        //console.log(lineArray)
        drawMap(lineArray);
    });

    // Build an array of arrays start latlng and end latlng of each line
    function buildLineArray(linedata) {
        var w_point = new Array();
        var h_point = new Array();
        var line = new Array();
        var lines = new Array();
        linedata.forEach(function (element) {
            dist = element.distance;
            w_point[0] = new Array(element.w_lat, element.w_lon);
            h_point[0] = new Array(element.h_lat, element.h_lon);
            line[0] = new Array(w_point[0], h_point[0], element.distance)
            lines.push(line[0]);
        })
        return lines;

    }

    // ---------------------------------------------------------------
    function drawMap(commuteLineData) {
        //load the data to the map rendering the color and styles for each in the particular order below
        //console.log(commuteLineData[0]);
        var latlngLine = new Array();
        var mapLines = new Array();
        commuteLineData.forEach(function (element) {
            latlngLine[0] = new Array(element[0], element[1]);
            mapLines.push(latlngLine[0])
        })
        console.log(mapLines);
        var polyline = L.polyline(mapLines, {
            color: 'white',
            weight: .5,
            opacity: 2
        }).addTo(map); 
    }

    /*            // style each feature
            style: function (feature) {
                // shortcut to variable
                var distance = feature.properties.distance;

                // assign options
                return distance < 17500 ? shortCommuteOptions :
                    distance < 50000 ? mediumCommuteOptions : longCommuteOptions;

            }
    */