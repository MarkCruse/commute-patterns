    //** zoom options
    var options = {
        center: [37.645556, -84.769722],
        zoom: 7,
        minZoom: 5,
        maxZoom: 16,
        maxBounds: [
            [36.3678, -89.6569],
            [39.4965, -81.1776]
        ]
    };
    // create Leaflet map and apply options
    var map = L.map('map', options);

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

    // AJAX calls to load data
    $.when(
        $.getJSON('data/21_low_income.json'),
    ).done


    (function (commuteLines) {
        drawMap(commuteLines);
    })
    /*
    var data_filter = commuteLines.filter( element => element.SI01 != 0)
    console.log(data_filter)
    */
    ;

    // ---------------------------------------------------------------
    function drawMap(commuteLineData) {
        //load the data to the map rendering the color and styles for each in the particular order below

        //display commute lines and the corresponding color basd on distance
        L.geoJson(commuteLineData, {
            // style each feature
            style: function (feature) {
                // shortcut to variable
                var distance = feature.properties.distance;

                // assign options
                return distance < 17500 ? shortCommuteOptions :
                    distance < 50000 ? mediumCommuteOptions : longCommuteOptions;

            }
        }).addTo(map);

    } 