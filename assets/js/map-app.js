
var allData = d3.csv("data/21_od_distance_1k-15k_15-60_miles.csv", convertToNumber);

// D3 abbreviations
var $ = d3.select, $$ = d3.selectAll;

// If you change the default loads below. 
// Be sure to change check-status in index.html!!!
var map_showing = true,
    ern1_showing = true,
    ern2_showing = false,
    ern3_showing = false,
    age1_showing = true,
    age2_showing = false,
    age3_showing = false,
    ind1_showing = true,
    ind2_showing = false,
    ind3_showing = false,
    ern = 1,
    age = 1,
    ind = 1,
    firstDrawMap = 0;

var map = L.map('map', {
    renderer: L.canvas()
});
//.setView([37.6, -85.5], 7).setMaxZoom(12).setMinZoom(3);
//[37.6, -85.5] ky
//[36.8, -119.4] ca
//[40.1, -82.4] oh

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


Promise.all([allData]).then(function (data) {
    initialArray = [];
    initialArray = buildINTArray(data[0]);
    console.log('Inital #records: ',initialArray.length);

    var earnings_filter = ern;
    var ages_filter = age;
    var industry_filter = ind;

    process_arrays(initialArray, earnings_filter, ages_filter, industry_filter);

    // Zoom to the bounds of the data
    map.fitBounds(mapLayerGroup.getBounds());
    map.setView(mapLayerGroup.getBounds().getCenter());
});

function process_arrays(ArrayData, earnings_filter, ages_filter, industry_filter) {
        //console.log('process_array earning filter:', earnings_filter);
        //console.log('process_array age filter:', ages_filter);
        //console.log('process_array industry filter:', industry_filter);
        var seArray = [];
        seArray = buildSEArray(ArrayData, earnings_filter);
        console.log('Applied earning filter. # records: ', seArray.length);
        var saArray = [];
        var saArray = buildSAArray(seArray, ages_filter);
        console.log('Applied age filter. # records: ', saArray.length);
        var siArray = [];
        var siArray = buildSIArray(saArray, industry_filter);
        console.log('Applied industry filter. # records: ', siArray.length);
        drawMap(siArray);
        
}
// ---------------------------------------------------------------
function drawMap(LineArray) {
    //load the data to the map rendering the color and styles for each in the particular order below

    var distance, style

    LineArray.forEach(function (element) {
    distance = element.distance;
    style = distance < 32000? shortCommuteOptions :
        distance < 46000 ? mediumCommuteOptions : longCommuteOptions;
 
    // create new Leaflet polyline and add to kentucky L.geoJson
    L.polyline([element.w_point, element.h_point], style).addTo(mapLayerGroup);

    /*
    if (firstDrawMap == 0) {
        // Zoom to the bounds of the data
        map.fitBounds(mapLayerGroup.getBounds());
        map.setView(mapLayerGroup.getBounds().getCenter(),7);
        firstDrawMap = 1;
    }
    */

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

    $("#goods-toggler").on("click", toggleInd1);
    $("#trade-toggler").on("click", toggleInd2);
    $("#other-toggler").on("click", toggleInd3);

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
	tile_layer.addTo(map).bringToBack();
  
	$("#map-toggler").classed("checked", true);
	map_showing = true;
}

function hideMap() {
	if (!map_showing) return;
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
    console.log(ern, age, ind);
    console.log(ern1_showing, ern2_showing, ern3_showing);
    mapLayerGroup.clearLayers();
    process_arrays(initialArray, ern, age, ind)
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
    console.log(ern, age, ind);
    console.log(ern1_showing, ern2_showing, ern3_showing);
    mapLayerGroup.clearLayers();
    process_arrays(initialArray, ern, age, ind);
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
    console.log(ern, age, ind);
    console.log(ern1_showing, ern2_showing, ern3_showing);
    mapLayerGroup.clearLayers();
    process_arrays(initialArray, ern, age, ind);
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
    console.log(ern, age, ind);
    console.log(age1_showing, age2_showing, age3_showing);
    mapLayerGroup.clearLayers();
    process_arrays(initialArray, ern, age, ind)
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
    console.log(ern, age, ind);
    console.log(age1_showing, age2_showing, age3_showing);
    mapLayerGroup.clearLayers();
    process_arrays(initialArray, ern, age, ind);
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
    console.log(ern, age, ind);
    console.log(age1_showing, age2_showing, age3_showing);
    mapLayerGroup.clearLayers();
    process_arrays(initialArray, ern, age, ind);
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


// ************************ Show Hide Industry Groups   **********************

function toggleInd1() {
    if (ind1_showing) {
        hideInd1();
        ind = ind - 1 ;
    } else {
        showInd1();
        ind = ind + 1;
    }
    console.log(ind);
    mapLayerGroup.clearLayers();
    process_arrays(initialArray, ern, age, ind)
}

function showInd1() {
    if (ind1_showing) return;
    $("#goods-toggler").classed("checked", true);
    ind1_showing = true;
}

function hideInd1() {
    if (!ind1_showing) return;
    $("#goods-toggler").classed("checked", false);
    ind1_showing = false;
}
//******  Industry Trade Group ******
function toggleInd2() {
    if (ind2_showing) {
        hideInd2();
        ind = ind - 4;
    } else {
        showInd2();
        ind = ind + 4;
    }
    console.log(ind);
    mapLayerGroup.clearLayers();
    process_arrays(initialArray, ern, age, ind);
}

function showInd2() {
    if (ind2_showing) return;
    $("#trade-toggler").classed("checked", true);
    ind2_showing = true;
}

function hideInd2() {
    if (!ind2_showing) return;
    $("#trade-toggler").classed("checked", false);
    ind2_showing = false;
}
//******  Industry Other Group ******
function toggleInd3() {
    if (ind3_showing) {
        ind = ind - 7;
        hideInd3();
    } else {
        showInd3();
        ind = ind + 7;
    }
    console.log(ind);
    mapLayerGroup.clearLayers();
    process_arrays(initialArray, ern, age, ind);
}

function showInd3() {
    if (ind3_showing) return;
    $("#other-toggler").classed("checked", true);
    ind3_showing = true;
}

function hideInd3() {
    if (!ind3_showing) return;
    $("#other-toggler").classed("checked", false);
    ind3_showing = false;
}


//function build initial array (lineData)
function buildINTArray(linedata) {
    var lines = [];

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
    var lines = [];

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
    var lines = [];
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
            if (element.SA02 >0 || element.SA03 > 0) {
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
            if (element.SA01 >0 || element.SA03 > 0) {
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
            if (element.SA03 > 0) {
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
            if (element.SA01 > 0 || element.SA02 > 0) {
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
        if (element.SA02 > 0) {
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
        if (element.SA01 > 0) {
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

//function checkIndustry(lineData)
function buildSIArray(linedata, industry_filter) {
    var lines = [];

    linedata.forEach(function (element) {
        if (industry_filter == 12) {
            if (element.SI01 >0 || element.SI02 >0 || element.SI03 > 0) {
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
        if (industry_filter == 11) {
            if (element.SI02 >0 || element.industry_filter03 > 0) {
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
        if (industry_filter == 8) {
            if (element.SI01 >0 || element.SI03 > 0) {
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
        if (industry_filter == 7) {
            if (element.SI03 > 0) {
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
        if (industry_filter == 5) {
            if (element.SI01 > 0 || element.SI02 > 0) {
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
    if (industry_filter == 4) {
        if (element.SI02 > 0) {
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
    if (industry_filter == 1) {
        if (element.SI01 > 0) {
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
