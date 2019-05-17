// D3 abbreviations
var $ = d3.select, $$ = d3.selectAll;

var map_showing = true,
    ern1_showing = true,
    ern2_showing = false,
    ern3_showing = false;
    age1_showing = true,
    age2_showing = false,
    age3_showing = false,
    ern = 1,
    age = 1;

var map = L.map('map', {
    renderer: L.canvas()
}).setView([37.6, -85.5], 7).setMaxZoom(12).setMinZoom(4);

// add labels & tiles to the map
map.createPane('labels');
map.getPane('labels').style.zIndex = 650;
map.getPane('labels').style.pointerEvents = 'none';

tile_layer = L.tileLayer('http://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}.png', {
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
var mapLayerGroup = L.geoJson().addTo(dataLayerGroup);

function convertToNumber(d) {
    return {
    distance: +d.distance,
    S000: +d.S000,
    SA01: +d.SA01,
    SA02: +d.SA02,
    SA03: +d.SA03,
    SE01: +d.SE01,
    SE02: +d.SE02,
    SE03: +d.SE03,
    SI01: +d.SI01,
    SI02: +d.SI02,
    SI03: +d.SI03,
    h_lat: +d.h_lat,
    h_lon: +d.h_lon,
    w_lat: +d.w_lat,
    w_lon: +d.w_lon
    };
}

var allData = d3.csv("data/21_od_distance_1000_plus.csv", convertToNumber);

Promise.all([allData]).then(function (data) {
    initialArray = [];
    initialArray = buildINTArray(data[0]);
    console.log(initialArray.length);
    console.log(ern);

    var earnings_filter = ern;
    var ages_filter = age;
    process_arrays(initialArray, earnings_filter, ages_filter);

});


function process_arrays(ArrayData, earnings_filter, ages_filter) {
        var seArray = buildSEArray(ArrayData, earnings_filter);
        console.log(seArray.length);
        var saArray = buildSAArray(seArray, ages_filter);
        console.log(saArray.length);
        drawMap(saArray);
}
// ---------------------------------------------------------------
function drawMap(LineArray) {
    //load the data to the map rendering the color and styles for each in the particular order below

    var distance, style

    LineArray.forEach(function (element) {
    distance = element.distance;
    style = distance < 17500 ? shortCommuteOptions :
        distance < 50000 ? mediumCommuteOptions : longCommuteOptions;

    // create new Leaflet polyline and add to kentucky L.geoJson
    L.polyline([element.w_point, element.h_point], style).addTo(mapLayerGroup);
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
    $("#age1-toggler").on("click", toggleAge1);
    $("#age2-toggler").on("click", toggleAge2);
    $("#age3-toggler").on("click", toggleAge3);

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
    if (ern1_showing) {
        hideLow();
        ern = ern - 1;
    } else {
        showLow();
        ern = ern + 1;
    }
    console.log(ern);
    mapLayerGroup.clearLayers();
    process_arrays(initialArray, ern, age)
}

function showLow() {
    if (ern1_showing) return;
    //mapLayerGroup.addTo(map);
    $("#low-toggler").classed("checked", true);
    ern1_showing = true;
}

function hideLow() {
    if (!ern1_showing) return;
    //map.removeLayer(mapLayerGroup);
    $("#low-toggler").classed("checked", false);
    ern1_showing = false;
}
//******  Medium Earners ******
function toggleMed() {
    if (ern2_showing) {
        hideMed();
        ern = ern - 4;
    } else {
        showMed();
        ern = ern + 4;
    }
    console.log(ern);
    mapLayerGroup.clearLayers();
    process_arrays(initialArray, ern, age);
}

function showMed() {
    if (ern2_showing) return;
    //mediumLayerGroup.addTo(map);
    $("#med-toggler").classed("checked", true);
    ern2_showing = true;
}

function hideMed() {
    if (!ern2_showing) return;
    //map.removeLayer(mediumLayerGroup);
    $("#med-toggler").classed("checked", false);
    ern2_showing = false;
}
//******  High Earners ******
function toggleHigh() {
    if (ern3_showing) {
        ern = ern - 7;
        hideHigh();
    } else {
        showHigh();
        ern = ern + 7;
    }
    console.log(ern);
    mapLayerGroup.clearLayers();
    process_arrays(initialArray, ern, age);
}

function showHigh() {
    if (ern3_showing) return;
    $("#high-toggler").classed("checked", true);
    ern3_showing = true;
}

function hideHigh() {
    if (!ern3_showing) return;
    $("#high-toggler").classed("checked", false);
    ern3_showing = false;
}
// ***************** Show Hide Age Groups   *******************

function toggleAge1() {
    if (age1_showing) {
        hideAge1();
        age = age - 1;
    } else {
        showAge1();
        age = age + 1;
    }
    console.log(age);
    mapLayerGroup.clearLayers();
    process_arrays(initialArray, ern, age)
}

function showAge1() {
    if (age1_showing) return;
    $("#age1-toggler").classed("checked", true);
    age1_showing = true;
}

function hideAge1() {
    if (!age1_showing) return;
    $("#age1-toggler").classed("checked", false);
    age1_showing = false;
}
//******  Mid Age Group ******
function toggleAge2() {
    if (age2_showing) {
        hideAge2();
        age = age - 4;
    } else {
        showAge2();
        age = age + 4;
    }
    console.log(age);
    mapLayerGroup.clearLayers();
    process_arrays(initialArray, ern, age);
}

function showAge2() {
    if (age2_showing) return;
    $("#age2-toggler").classed("checked", true);
    age2_showing = true;
}

function hideAge2() {
    if (!age2_showing) return;
    $("#age2-toggler").classed("checked", false);
    age2_showing = false;
}
//******  Oldest Age Group ******
function toggleAge3() {
    if (age3_showing) {
        age = age - 7;
        hideAge3();
    } else {
        showAge3();
        age = age + 7;
    }
    console.log(age);
    mapLayerGroup.clearLayers();
    process_arrays(initialArray, ern, age);
}

function showAge3() {
    if (age3_showing) return;
    $("#age3-toggler").classed("checked", true);
    age3_showing = true;
}

function hideAge3() {
    if (!age3_showing) return;
    $("#age3-toggler").classed("checked", false);
    age3_showing = false;
}


//function build initial array (lineData)
function buildINTArray(linedata) {
    var w_point = [];
    var h_point = [];
    var lines = [];

    var obj = {};

    linedata.forEach(function (element) {
        var obj = {};
        obj['w_point'] = [element.w_lat, element.w_lon];
        obj['h_point'] = [element.h_lat, element.h_lon];
        obj['distance'] = element.distance;
        obj['SA01'] = element.SA01;
        obj['SA02'] = element.SA02,
        obj['SA03'] = element.SA03,
        
        obj['SE01'] = element.SE01;
        obj['SE02'] = element.SE02,
        obj['SE03'] = element.SE03,
        
        obj['SI01'] = element.SI01;
        obj['SI02'] = element.SI02,
        obj['SI03'] = element.SI03,
        lines.push(obj)
    
    });
    return lines;
}
//function checkEarnings(lineData)
function buildSEArray(linedata, earnings_filter) {
    var w_point = [];
    var h_point = [];
    var lines = [];

    var obj = {};

    linedata.forEach(function (element) {
        if (earnings_filter == 12) {
            if (element.SE01 >0 || element.SE02 >0 || element.SE03 > 0) {
                var obj = {};
                obj['w_point'] = element.w_point;
                obj['h_point'] = element.h_point;
                obj['distance'] = element.distance;
                obj['SA01'] = element.SA01;
                obj['SA02'] = element.SA02,
                obj['SA03'] = element.SA03,
                
                obj['SE01'] = element.SE01;
                obj['SE02'] = element.SE02,
                obj['SE03'] = element.SE03,
                
                obj['SI01'] = element.SI01;
                obj['SI02'] = element.SI02,
                obj['SI03'] = element.SI03,
                lines.push(obj);
            }
        }
        if (earnings_filter == 11) {
            if (element.SE02 >0 || element.SE03 > 0) {
                var obj = {};
                obj['w_point'] = element.w_point;
                obj['h_point'] = element.h_point;
                obj['distance'] = element.distance;
                obj['SA01'] = element.SA01;
                obj['SA02'] = element.SA02,
                obj['SA03'] = element.SA03,
                
                obj['SE01'] = element.SE01;
                obj['SE02'] = element.SE02,
                obj['SE03'] = element.SE03,
                
                obj['SI01'] = element.SI01;
                obj['SI02'] = element.SI02,
                obj['SI03'] = element.SI03,
                lines.push(obj);
            }
        }
        if (earnings_filter == 8) {
            if (element.SE01 >0 || element.SE03 > 0) {
                var obj = {};
                obj['w_point'] = element.w_point;
                obj['h_point'] = element.h_point;
                obj['distance'] = element.distance;
                obj['SA01'] = element.SA01;
                obj['SA02'] = element.SA02,
                obj['SA03'] = element.SA03,
                
                obj['SE01'] = element.SE01;
                obj['SE02'] = element.SE02,
                obj['SE03'] = element.SE03,
                
                obj['SI01'] = element.SI01;
                obj['SI02'] = element.SI02,
                obj['SI03'] = element.SI03,
                lines.push(obj);
            }
        }
        if (earnings_filter == 7) {
            if (element.SE03 > 0) {
                var obj = {};
                obj['w_point'] = element.w_point;
                obj['h_point'] = element.h_point;
                obj['distance'] = element.distance;
                obj['SA01'] = element.SA01;
                obj['SA02'] = element.SA02,
                obj['SA03'] = element.SA03,
                
                obj['SE01'] = element.SE01;
                obj['SE02'] = element.SE02,
                obj['SE03'] = element.SE03,
                
                obj['SI01'] = element.SI01;
                obj['SI02'] = element.SI02,
                obj['SI03'] = element.SI03,
                lines.push(obj);
            }
        }
        if (earnings_filter == 5) {
            if (element.SE01 > 0 || element.SE02 > 0) {
                var obj = {};
                obj['w_point'] = element.w_point;
                obj['h_point'] = element.h_point;
                obj['distance'] = element.distance;
                obj['SA01'] = element.SA01;
                obj['SA02'] = element.SA02,
                obj['SA03'] = element.SA03,
                
                obj['SE01'] = element.SE01;
                obj['SE02'] = element.SE02,
                obj['SE03'] = element.SE03,
                
                obj['SI01'] = element.SI01;
                obj['SI02'] = element.SI02,
                obj['SI03'] = element.SI03,
                lines.push(obj);
            }
        }
    if (earnings_filter == 4) {
        if (element.SE02 > 0) {
            var obj = {};
            obj['w_point'] = element.w_point;
            obj['h_point'] = element.h_point;
            obj['distance'] = element.distance;
            obj['SA01'] = element.SA01;
            obj['SA02'] = element.SA02,
            obj['SA03'] = element.SA03,
            
            obj['SE01'] = element.SE01;
            obj['SE02'] = element.SE02,
            obj['SE03'] = element.SE03,
            
            obj['SI01'] = element.SI01;
            obj['SI02'] = element.SI02,
            obj['SI03'] = element.SI03,
            lines.push(obj);
        }
    }
    if (earnings_filter == 1) {
        if (element.SE01 > 0) {
            var obj = {};
            obj['w_point'] = element.w_point;
            obj['h_point'] = element.h_point;
            obj['distance'] = element.distance;
            obj['SA01'] = element.SA01;
            obj['SA02'] = element.SA02,
            obj['SA03'] = element.SA03,
            
            obj['SE01'] = element.SE01;
            obj['SE02'] = element.SE02,
            obj['SE03'] = element.SE03,
            
            obj['SI01'] = element.SI01;
            obj['SI02'] = element.SI02,
            obj['SI03'] = element.SI03,
            lines.push(obj);
        }
    }
    });
    return lines;

}

//function checkAges(lineData)
function buildSAArray(linedata, ages_filter) {
    var w_point = [];
    var h_point = [];
    var lines = [];

    var obj = {};

    linedata.forEach(function (element) {
        if (ages_filter == 12) {
            if (element.SA01 >0 || element.SA02 >0 || element.SA03 > 0) {
                var obj = {};
                obj['w_point'] = element.w_point;
                obj['h_point'] = element.h_point;
                obj['distance'] = element.distance;
                obj['SA01'] = element.SA01;
                obj['SA02'] = element.SA02,
                obj['SA03'] = element.SA03,
                
                obj['SE01'] = element.SE01;
                obj['SE02'] = element.SE02,
                obj['SE03'] = element.SE03,
                
                obj['SI01'] = element.SI01;
                obj['SI02'] = element.SI02,
                obj['SI03'] = element.SI03,
                lines.push(obj);
            }
        }
        if (ages_filter == 11) {
            if (element.SA01 == 0 && (element.SA02 >0 || element.SA03 > 0)) {
                var obj = {};
                obj['w_point'] = element.w_point;
                obj['h_point'] = element.h_point;
                obj['distance'] = element.distance;
                obj['SA01'] = element.SA01;
                obj['SA02'] = element.SA02,
                obj['SA03'] = element.SA03,
                
                obj['SE01'] = element.SE01;
                obj['SE02'] = element.SE02,
                obj['SE03'] = element.SE03,
                
                obj['SI01'] = element.SI01;
                obj['SI02'] = element.SI02,
                obj['SI03'] = element.SI03,
                lines.push(obj);
            }
        }
        if (ages_filter == 8) {
            if (element.SA02 == 0 && (element.SA01 >0 || element.SA03 > 0)) {
                var obj = {};
                obj['w_point'] = element.w_point;
                obj['h_point'] = element.h_point;
                obj['distance'] = element.distance;
                obj['SA01'] = element.SA01;
                obj['SA02'] = element.SA02,
                obj['SA03'] = element.SA03,
                
                obj['SE01'] = element.SE01;
                obj['SE02'] = element.SE02,
                obj['SE03'] = element.SE03,
                
                obj['SI01'] = element.SI01;
                obj['SI02'] = element.SI02,
                obj['SI03'] = element.SI03,
                lines.push(obj);
            }
        }
        if (ages_filter == 7) {
            if (element.SA01 == 0 && element.SA02 == 0 && element.SA03 > 0) {
                var obj = {};
                obj['w_point'] = element.w_point;
                obj['h_point'] = element.h_point;
                obj['distance'] = element.distance;
                obj['SA01'] = element.SA01;
                obj['SA02'] = element.SA02,
                obj['SA03'] = element.SA03,
                
                obj['SE01'] = element.SE01;
                obj['SE02'] = element.SE02,
                obj['SE03'] = element.SE03,
                
                obj['SI01'] = element.SI01;
                obj['SI02'] = element.SI02,
                obj['SI03'] = element.SI03,
                lines.push(obj);
            }
        }
        if (ages_filter == 5) {
            if ((element.SA01 > 0 || element.SA02 > 0) && element.SA03 == 0) {
                var obj = {};
                obj['w_point'] = element.w_point;
                obj['h_point'] = element.h_point;
                obj['distance'] = element.distance;
                obj['SA01'] = element.SA01;
                obj['SA02'] = element.SA02,
                obj['SA03'] = element.SA03,
                
                obj['SE01'] = element.SE01;
                obj['SE02'] = element.SE02,
                obj['SE03'] = element.SE03,
                
                obj['SI01'] = element.SI01;
                obj['SI02'] = element.SI02,
                obj['SI03'] = element.SI03,
                lines.push(obj);
            }
        }
    if (ages_filter == 4) {
        if ((element.SA01 == 0 || element.SA03 == 0) && element.SA02 > 0) {
            var obj = {};
            obj['w_point'] = element.w_point;
            obj['h_point'] = element.h_point;
            obj['distance'] = element.distance;
            obj['SA01'] = element.SA01;
            obj['SA02'] = element.SA02,
            obj['SA03'] = element.SA03,
            
            obj['SE01'] = element.SE01;
            obj['SE02'] = element.SE02,
            obj['SE03'] = element.SE03,
            
            obj['SI01'] = element.SI01;
            obj['SI02'] = element.SI02,
            obj['SI03'] = element.SI03,
            lines.push(obj);
        }
    }
    if (ages_filter == 1) {
        if ((element.SA02 == 0 || element.SA03 == 0) && element.SA01 > 0) {
            var obj = {};
            obj['w_point'] = element.w_point;
            obj['h_point'] = element.h_point;
            obj['distance'] = element.distance;
            obj['SA01'] = element.SA01;
            obj['SA02'] = element.SA02,
            obj['SA03'] = element.SA03,
            
            obj['SE01'] = element.SE01;
            obj['SE02'] = element.SE02,
            obj['SE03'] = element.SE03,
            
            obj['SI01'] = element.SI01;
            obj['SI02'] = element.SI02,
            obj['SI03'] = element.SI03,
            lines.push(obj);
        }
    }
    });
    return lines;

}
