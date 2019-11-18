// D3 abbreviations
var $ = d3.select,
    $$ = d3.selectAll;

// If you change the default loads below. 
// Be sure to change check-status in index.html!!!
var map_showing = false,
    label_showing = false,
    ern1_showing = false,
    ern2_showing = false,
    ern3_showing = false,
    age1_showing = true,
    age2_showing = false,
    age3_showing = false,
    ind1_showing = false,
    ind2_showing = false,
    ind3_showing = false;
    short_showing = true;
//medium_showing = false,
//long_showing = false,
//commute_all_showing = false;

var stat_short, stat_medium, stat_long;
var stat_short=12313;


var maxBounds = [
    [23.06, -123.80], //Southwest
    [47.95, -62.5] //Northeast
];

var map = L.map('map', {
    renderer: L.canvas(),
    color: '#e0e0e0'
}).setMaxZoom(8).setMinZoom(4);

map.setMaxBounds(maxBounds);
map.fitBounds(maxBounds);

/* This section of code is for the leaflet.locate control https://github.com/domoritz/leaflet-locatecontrol
var lc = L.control.locate({
    position: 'bottomright', 
    locateOptions: {
        maxZoom: 10
    },
    drawMarker: 'true',
    strings: {
        title: "Show my location"
    }
}).addTo(map);
*/

map.setView([37.3, -96.6], 5)
// add labels & tiles to the map
map.createPane('labels');
map.getPane('labels').style.zIndex = 650;
map.getPane('labels').style.pointerEvents = 'none';

//attribution: '©OpenStreetMap Labels, ©Carto',
var mapLayerGroup = L.layerGroup();
label_layer = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}.png', {
    attribution:'&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy; <a href="https://carto.com/attributions">CARTO</a>',
    pane: 'labels'
}).addTo(mapLayerGroup);

tile_layer = L.tileLayer('https://cartocdn_{s}.global.ssl.fastly.net/base-midnight/{z}/{x}/{y}.png', {
    attribution:'<a href="https://carto.com/attributions">Midnight_cartodb, CARTO</a>',
}).addTo(mapLayerGroup);


initControls();

var age1LayerGroup = L.layerGroup().addTo(map);
var age2LayerGroup = L.layerGroup();
var age3LayerGroup = L.layerGroup();
var earn1LayerGroup = L.layerGroup();
var earn2LayerGroup = L.layerGroup();
var earn3LayerGroup = L.layerGroup();
var ind1LayerGroup = L.layerGroup();
var ind2LayerGroup = L.layerGroup();
var ind3LayerGroup = L.layerGroup();
//var shortLayerGroup = L.layerGroup();
stat_short = $("#stat-short");
stat_medium = $("#stat-medium");
stat_long = $("#stat-long");


function initControls() {

    $$("#options .option > .option-name").on("touchstart", function () {
        var option_element = this.parentNode,
            option_id = option_element.id,
            $option = $(option_element),
            is_visible = $option.classed("visible");

        if ($option.classed("disabled")) return;

        $("#options").classed("hoverable", false);
        $$("#options .option").classed("visible",
            is_visible ? false : function () {
                return this.id == option_id;
            }
        );
        d3.event.preventDefault();
    });

    $("#map-toggler").on("click", toggleMap);
    $("#label-toggler").on("click", toggleLabel);
       //$("#short-toggler").on("click", toggleShort);
       //$("#medium-toggler").on("click", toggleMedium);
       //$("#long-toggler").on("click", toggleLong);
       //$("#commute-all-toggler").on("click", toggleCommuteAll);

    $("#earn1-toggler").on("click", toggleEarn1);
    $("#earn2-toggler").on("click", toggleEarn2);
    $("#earn3-toggler").on("click", toggleEarn3);

    $("#age1-toggler").on("click", toggleAge1);
    $("#age2-toggler").on("click", toggleAge2);
    $("#age3-toggler").on("click", toggleAge3);

    $("#goods-toggler").on("click", toggleInd1);
    $("#trade-toggler").on("click", toggleInd2);
    $("#other-toggler").on("click", toggleInd3);

	$("#info-open").on("click", toggleInfoPanel);
    $$(".info-close").on("click", hideInfoPanel);
    
    var info_panel_showing = false;
    function toggleInfoPanel() {
        if (info_panel_showing) hideInfoPanel();
        else showInfoPanel();
    }
    
    function showInfoPanel() {
        $("#info-panel")
            .classed("open", true)
            .style("overflow-y", "scroll")
            .transition().duration(750)
            .style("width", window.innerWidth + "px")
            .style("height", window.innerHeight + "px")
            .transition().duration(0)
            .style("width", "100%")
            .style("height", "100%");
        info_panel_showing = true;
    }
    
    function hideInfoPanel() {
        var info = document.getElementById("info-panel");
        info.scrollTop = 0;
        $(info).classed("open", false)
            .style("overflow-y", "hidden")
            .style("width", window.innerWidth + "px")
            .style("height", window.innerHeight + "px")
            .transition().duration(750)
            .style("width", "40px") // Do not change here without also changing the initial CSS
            .style("height", document.getElementById("nav").getBoundingClientRect().height + "px");
        info_panel_showing = false;
    }
    
    //************ Show / Hide background map layer  *********

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

    //************ Show / Hide  map label layer  *********

    function toggleLabel() {
        if (label_showing) hideLabel();
        else showLabel();
    }

    function showLabel() {
        if (label_showing) return;
        label_layer.addTo(map).bringToBack();

        $("#label-toggler").classed("checked", true);
        label_showing = true;
    }

    function hideLabel() {
        if (!label_showing) return;
        map.removeLayer(label_layer);
        $("#label-toggler").classed("checked", false);
        label_showing = false;
    }

    
    //************ Show / Hide short commute layers  *********

    function toggleShort() {
    	if (short_showing) hideShort();
    	else showShort();
    }

    function showShort() {
        if (short_showing) return;
        //map.addLayer(shortLayerGroup);
    	$("#short-toggler").classed("checked", true);
    	short_showing = true;
    }

    function hideShort() {
    	if (!short_showing) return;
        //map.removeLayer(shortLayerGroup);
        var longCommuteOptions = {
            color: 'orange',
            weight: 0,
            opacity: .4
        }
        
        showEarn1();
        showEarn2();
        showEarn3();
        showInd1();
        showInd2();
        showInd3();
        showAge1();
        showAge2();
        showAge3();
    	$("#short-toggler").classed("checked", false);
        short_showing = false;
    }
    

    function toggleEarn1() {
        if (ern1_showing) {
            hideEarn1();
        } else {
            showEarn1();
        }
    }

    function showEarn1() {
        if (ern1_showing) return;
        map.addLayer(earn1LayerGroup);
        hideEarn2();
        hideEarn3();
        hideAge1();
        hideAge2();
        hideAge3();
        hideInd1();
        hideInd2();
        hideInd3();
        $("#earn1-toggler").classed("checked", true);
        ern1_showing = true;
    }

    function hideEarn1() {
        if (!ern1_showing) return;
        map.removeLayer(earn1LayerGroup);
        $("#earn1-toggler").classed("checked", false);
        ern1_showing = false;
    }
    //******  Medium Earners ******
    function toggleEarn2() {
        if (ern2_showing) {
            hideEarn2();
        } else {
            showEarn2();
        }
    }

    function showEarn2() {
        if (ern2_showing) return;
        map.addLayer(earn2LayerGroup);
        hideEarn1();
        hideEarn3();
        hideAge1();
        hideAge2();
        hideAge3();
        hideInd1();
        hideInd2();
        hideInd3();
        $("#earn2-toggler").classed("checked", true);
        ern2_showing = true;
    }

    function hideEarn2() {
        if (!ern2_showing) return;
        map.removeLayer(earn2LayerGroup);
        $("#earn2-toggler").classed("checked", false);
        ern2_showing = false;
    }
    //******  High Earners ******
    function toggleEarn3() {
        if (ern3_showing) {
            hideEarn3();
        } else {
            showEarn3();
        }
    }

    function showEarn3() {
        if (ern3_showing) return;
        $("#earn3-toggler").classed("checked", true);
        hideEarn1();
        hideEarn2();
        hideAge1();
        hideAge2();
        hideAge3();
        hideInd1();
        hideInd2();
        hideInd3();
        map.addLayer(earn3LayerGroup);
        ern3_showing = true;
    }

    function hideEarn3() {
        if (!ern3_showing) return;
        map.removeLayer(earn3LayerGroup);
        $("#earn3-toggler").classed("checked", false);
        ern3_showing = false;
    }


    // ***************** Show Hide Age Groups   *******************

    function toggleAge1() {
        if (age1_showing) {
            hideAge1();
        } else {
            showAge1();
        }
    }

    function showAge1() {
        if (age1_showing) return;
        $("#age1-toggler").classed("checked", true);
        hideAge2();
        hideAge3();
        hideEarn1();
        hideEarn2();
        hideEarn3();
        hideInd1();
        hideInd2();
        hideInd3();
        map.addLayer(age1LayerGroup);
        age1_showing = true;
    }

    function hideAge1() {
        if (!age1_showing) return;
        map.removeLayer(age1LayerGroup);
        $("#age1-toggler").classed("checked", false);
        age1_showing = false;
    }
    //******  Mid Age Group ******
    function toggleAge2() {
        if (age2_showing) {
            hideAge2();
        } else {
            showAge2();
        }
    }

    function showAge2() {
        if (age2_showing) return;
        $("#age2-toggler").classed("checked", true);
        hideAge1();
        hideAge3();
        hideEarn1();
        hideEarn2();
        hideEarn3();
        hideInd1();
        hideInd2();
        hideInd3();
        map.addLayer(age2LayerGroup);
        age2_showing = true;
    }

    function hideAge2() {
        if (!age2_showing) return;
        map.removeLayer(age2LayerGroup);
        $("#age2-toggler").classed("checked", false);
        age2_showing = false;
    }
    //******  Oldest Age Group ******
    function toggleAge3() {
        if (age3_showing) {
            hideAge3();
        } else {
            showAge3();
        }
    }

    function showAge3() {
        if (age3_showing) return;
        $("#age3-toggler").classed("checked", true);
        hideAge1();
        hideAge2();
        hideEarn1();
        hideEarn2();
        hideEarn3();
        hideInd1();
        hideInd2();
        hideInd3();
        map.addLayer(age3LayerGroup);
        age3_showing = true;
    }

    function hideAge3() {
        if (!age3_showing) return;
        map.removeLayer(age3LayerGroup);
        $("#age3-toggler").classed("checked", false);
        age3_showing = false;
    }


    // ************************ Show Hide Industry Groups   **********************

    function toggleInd1() {
        if (ind1_showing) {
            hideInd1();
        } else {
            showInd1();
        }
    }

    function showInd1() {
        if (ind1_showing) return;
        $("#goods-toggler").classed("checked", true);
        hideInd2();
        hideInd3();
        hideEarn1();
        hideEarn2();
        hideEarn3();
        hideAge1();
        hideAge2();
        hideAge3();
        map.addLayer(ind1LayerGroup);
        ind1_showing = true;
    }

    function hideInd1() {
        if (!ind1_showing) return;
        map.removeLayer(ind1LayerGroup);
        $("#goods-toggler").classed("checked", false);
        ind1_showing = false;
    }
    //******  Industry Trade Group ******
    function toggleInd2() {
        if (ind2_showing) {
            hideInd2();
        } else {
            showInd2();
        }
    }

    function showInd2() {
        if (ind2_showing) return;
        $("#trade-toggler").classed("checked", true);
        hideInd1();
        hideInd3();
        hideEarn1();
        hideEarn2();
        hideEarn3();
        hideAge1();
        hideAge2();
        hideAge3();
        map.addLayer(ind2LayerGroup);
        ind2_showing = true;
    }

    function hideInd2() {
        if (!ind2_showing) return;
        map.removeLayer(ind2LayerGroup);
        $("#trade-toggler").classed("checked", false);
        ind2_showing = false;
    }
    //******  Industry Other Group ******
    function toggleInd3() {
        if (ind3_showing) {
            hideInd3();
        } else {
            showInd3();
        }
    }

    function showInd3() {
        if (ind3_showing) return;
        $("#other-toggler").classed("checked", true);
        hideInd1();
        hideInd2();
        hideEarn1();
        hideEarn2();
        hideEarn3();
        hideAge1();
        hideAge2();
        hideAge3();
        map.addLayer(ind3LayerGroup);
        ind3_showing = true;
    }

    function hideInd3() {
        if (!ind3_showing) return;
        map.removeLayer(ind3LayerGroup);
        $("#other-toggler").classed("checked", false);
        ind3_showing = false;
    }

} // end  initControls


// *****************************************************
//                   Color options
//******************************************************
// **** Options for various layers 
// If displaying all lines with not highlight for distance
var lineOptions = {
    fillOpacity: 0,
    color: '#c7dffc', //lt blue
    opacity: .4,
    weight: 0.8
};

// Short commute distance
var shortCommuteOptions = {
    color: '#ffffcc',
    weight: .6,
    opacity: .2
}

var mediumCommuteOptions = {
    color: '#084594',
    weight: .6,
    opacity: .6
}
//color: '#fed976',
    //weight: .6,
var longCommuteOptions = {
    color: 'orange',
    weight: .6,
    opacity: .4
}
var mapboxToken = "pk.eyJ1IjoibWRjcnVzZSIsImEiOiJjanZvN25kaHQxdzAxNDhwZjM4NDNvMXV4In0.s4GSawMNB7Jo4Vf7LXKEew";

//******************************************************
//
//                  Age 1                               
//
//******************************************************
var tiles_age1_long =
    "https://b.tiles.mapbox.com/v4/mdcruse.4xlpiged/{z}/{x}/{y}.vector.pbf?access_token={token}";
var options_age1_long = {
    vectorTileLayerStyles: {
        'age1_long': longCommuteOptions
    },
    rendererFactory: L.canvas.tile,
    token: mapboxToken
}
var age1_long = L.vectorGrid.protobuf(tiles_age1_long, options_age1_long).addTo(age1LayerGroup);

var tiles_age1_medium =
    "https://b.tiles.mapbox.com/v4/mdcruse.3z476pn3/{z}/{x}/{y}.vector.pbf?access_token={token}";
var options_age1_medium = {
    vectorTileLayerStyles: {
        'age1_medium': mediumCommuteOptions
    },
    rendererFactory: L.canvas.tile,
    token: mapboxToken
}
var age1_medium = L.vectorGrid.protobuf(tiles_age1_medium, options_age1_medium).addTo(age1LayerGroup);

var tiles_age1_short =
    "https://b.tiles.mapbox.com/v4/mdcruse.26h0q8qr/{z}/{x}/{y}.vector.pbf?access_token={token}";
var options_age1_short = {
    vectorTileLayerStyles: {
        'age1_short': shortCommuteOptions
    },
    rendererFactory: L.canvas.tile,
    token: mapboxToken
}
var age1_short = L.vectorGrid.protobuf(tiles_age1_short, options_age1_short).addTo(age1LayerGroup);
//var age1_short2 = L.vectorGrid.protobuf(tiles_age1_short, options_age1_short).addTo(shortLayerGroup);

//******************************************************
//
//                  Age 2                               
//
//******************************************************
var tiles_age2_long = "https://b.tiles.mapbox.com/v4/mdcruse.1td34meg/{z}/{x}/{y}.vector.pbf?access_token={token}";
var options_age2_long = {
    vectorTileLayerStyles: {
        'age2_long': longCommuteOptions
    },
    rendererFactory: L.canvas.tile,
    token: "pk.eyJ1IjoibWRjcnVzZSIsImEiOiJjanZvN25kaHQxdzAxNDhwZjM4NDNvMXV4In0.s4GSawMNB7Jo4Vf7LXKEew"
}

var age2_long = L.vectorGrid.protobuf(tiles_age2_long, options_age2_long).addTo(age2LayerGroup);

var tiles_age2_medium =
    "https://b.tiles.mapbox.com/v4/mdcruse.du8lu9ta/{z}/{x}/{y}.vector.pbf?access_token={token}";
var options_age2_medium = {
    vectorTileLayerStyles: {
        'age2_medium': mediumCommuteOptions
    },
    rendererFactory: L.canvas.tile,
    token: "pk.eyJ1IjoibWRjcnVzZSIsImEiOiJjanZvN25kaHQxdzAxNDhwZjM4NDNvMXV4In0.s4GSawMNB7Jo4Vf7LXKEew"
}
var age2_medium = L.vectorGrid.protobuf(tiles_age2_medium, options_age2_medium).addTo(age2LayerGroup);

var tiles_age2_short =
    "https://b.tiles.mapbox.com/v4/mdcruse.35vysjjz/{z}/{x}/{y}.vector.pbf?access_token={token}";
var options_age2_short = {
    vectorTileLayerStyles: {
        'age2_short': shortCommuteOptions
    },
    rendererFactory: L.canvas.tile,
    token: "pk.eyJ1IjoibWRjcnVzZSIsImEiOiJjanZvN25kaHQxdzAxNDhwZjM4NDNvMXV4In0.s4GSawMNB7Jo4Vf7LXKEew"
}
var age2_short = L.vectorGrid.protobuf(tiles_age2_short, options_age2_short).addTo(age2LayerGroup);
//var age2_short2 = L.vectorGrid.protobuf(tiles_age2_short, options_age2_short).addTo(shortLayerGroup)


//******************************************************
//
//                  Age 3                               
//
//******************************************************
var tiles_age3_long =
    "https://b.tiles.mapbox.com/v4/mdcruse.18nt7xnq/{z}/{x}/{y}.vector.pbf?access_token={token}";
var options_age3_long = {
    vectorTileLayerStyles: {
        'age3_long': longCommuteOptions
    },
    rendererFactory: L.canvas.tile,
    token: "pk.eyJ1IjoibWRjcnVzZSIsImEiOiJjanZvN25kaHQxdzAxNDhwZjM4NDNvMXV4In0.s4GSawMNB7Jo4Vf7LXKEew",
    interactive: true
}

var age3_long = L.vectorGrid.protobuf(tiles_age3_long, options_age3_long).addTo(age3LayerGroup);

var tiles_age3_medium =
    "https://b.tiles.mapbox.com/v4/mdcruse.4vile4ah/{z}/{x}/{y}.vector.pbf?access_token={token}";
var options_age3_medium = {
    vectorTileLayerStyles: {
        'age3_medium': mediumCommuteOptions
    },
    rendererFactory: L.canvas.tile,
    token: "pk.eyJ1IjoibWRjcnVzZSIsImEiOiJjanZvN25kaHQxdzAxNDhwZjM4NDNvMXV4In0.s4GSawMNB7Jo4Vf7LXKEew"
}
var age3_medium = L.vectorGrid.protobuf(tiles_age3_medium, options_age3_medium).addTo(age3LayerGroup);

var tiles_age3_short =
    "https://b.tiles.mapbox.com/v4/mdcruse.5a0ch397/{z}/{x}/{y}.vector.pbf?access_token={token}";
var options_age3_short = {
    vectorTileLayerStyles: {
        'age3_short': shortCommuteOptions
    },
    rendererFactory: L.canvas.tile,
    token: "pk.eyJ1IjoibWRjcnVzZSIsImEiOiJjanZvN25kaHQxdzAxNDhwZjM4NDNvMXV4In0.s4GSawMNB7Jo4Vf7LXKEew"
}
var age3_short = L.vectorGrid.protobuf(tiles_age3_short, options_age3_short).addTo(age3LayerGroup);
//var age3_short2 = L.vectorGrid.protobuf(tiles_age3_short, options_age3_short).addTo(shortLayerGroup);


//******************************************************
//
//                  Earn 1                               
//
//******************************************************

var tiles_earn1_long =
    "https://b.tiles.mapbox.com/v4/mdcruse.4ysem3y1/{z}/{x}/{y}.vector.pbf?access_token={token}";
var options_earn1_long = {
    vectorTileLayerStyles: {
        'earn1_long': longCommuteOptions
    },
    rendererFactory: L.canvas.tile,
    token: "pk.eyJ1IjoibWRjcnVzZSIsImEiOiJjanZvN25kaHQxdzAxNDhwZjM4NDNvMXV4In0.s4GSawMNB7Jo4Vf7LXKEew"
}
var earn1_long = L.vectorGrid.protobuf(tiles_earn1_long, options_earn1_long).addTo(earn1LayerGroup);

var tiles_earn1_medium =
    "https://b.tiles.mapbox.com/v4/mdcruse.aovtynrz/{z}/{x}/{y}.vector.pbf?access_token={token}";
var options_earn1_medium = {
    vectorTileLayerStyles: {
        'earn1_medium': mediumCommuteOptions
    },
    rendererFactory: L.canvas.tile,
    token: "pk.eyJ1IjoibWRjcnVzZSIsImEiOiJjanZvN25kaHQxdzAxNDhwZjM4NDNvMXV4In0.s4GSawMNB7Jo4Vf7LXKEew"
}
var earn1_medium = L.vectorGrid.protobuf(tiles_earn1_medium, options_earn1_medium).addTo(earn1LayerGroup);

var tiles_earn1_short =
    "https://b.tiles.mapbox.com/v4/mdcruse.5rheg45w/{z}/{x}/{y}.vector.pbf?access_token={token}";
var options_earn1_short = {
    vectorTileLayerStyles: {
        'earn1_short': shortCommuteOptions
    },
    rendererFactory: L.canvas.tile,
    token: "pk.eyJ1IjoibWRjcnVzZSIsImEiOiJjanZvN25kaHQxdzAxNDhwZjM4NDNvMXV4In0.s4GSawMNB7Jo4Vf7LXKEew"
}
var earn1_short = L.vectorGrid.protobuf(tiles_earn1_short, options_earn1_short).addTo(earn1LayerGroup);

//L.vectorGrid.protobuf(tiles_earn1_short, options_earn1_short).addTo(shortLayerGroup);

//******************************************************
//
//                  Earn 2                              
//
//******************************************************
var tiles_earn2_long = "https://b.tiles.mapbox.com/v4/mdcruse.aws066t9o/{z}/{x}/{y}.vector.pbf?access_token={token}";
var options_earn2_long = {
    vectorTileLayerStyles: {
        'earn2_long': longCommuteOptions
    },
    rendererFactory: L.canvas.tile,
    token: "pk.eyJ1IjoibWRjcnVzZSIsImEiOiJjanZvN25kaHQxdzAxNDhwZjM4NDNvMXV4In0.s4GSawMNB7Jo4Vf7LXKEew",
    interactive: true
}

var earn2_long = L.vectorGrid.protobuf(tiles_earn2_long, options_earn2_long).addTo(earn2LayerGroup);

var tiles_earn2_medium =
    "https://b.tiles.mapbox.com/v4/mdcruse.5wcp9pbt/{z}/{x}/{y}.vector.pbf?access_token={token}";
var options_earn2_medium = {
    vectorTileLayerStyles: {
        'earn2_medium': mediumCommuteOptions
    },
    rendererFactory: L.canvas.tile,
    token: "pk.eyJ1IjoibWRjcnVzZSIsImEiOiJjanZvN25kaHQxdzAxNDhwZjM4NDNvMXV4In0.s4GSawMNB7Jo4Vf7LXKEew"
}
var earn2_medium = L.vectorGrid.protobuf(tiles_earn2_medium, options_earn2_medium).addTo(earn2LayerGroup);

var tiles_earn2_short =
    "https://b.tiles.mapbox.com/v4/mdcruse.1wjjjlo5/{z}/{x}/{y}.vector.pbf?access_token={token}";
var options_earn2_short = {
    vectorTileLayerStyles: {
        'earn2_short': shortCommuteOptions
    },
    rendererFactory: L.canvas.tile,
    token: "pk.eyJ1IjoibWRjcnVzZSIsImEiOiJjanZvN25kaHQxdzAxNDhwZjM4NDNvMXV4In0.s4GSawMNB7Jo4Vf7LXKEew"
}
var earn2_short = L.vectorGrid.protobuf(tiles_earn2_short, options_earn2_short).addTo(earn2LayerGroup);


//******************************************************
//
//                  Earn 3                               
//
//******************************************************
var tiles_earn3_long =
    "https://b.tiles.mapbox.com/v4/mdcruse.7pai139h/{z}/{x}/{y}.vector.pbf?access_token={token}";
var options_earn3_long = {
    vectorTileLayerStyles: {
        'earn3_long': longCommuteOptions
    },
    rendererFactory: L.canvas.tile,
    token: "pk.eyJ1IjoibWRjcnVzZSIsImEiOiJjanZvN25kaHQxdzAxNDhwZjM4NDNvMXV4In0.s4GSawMNB7Jo4Vf7LXKEew",
    interactive: true
}

var earn3_long = L.vectorGrid.protobuf(tiles_earn3_long, options_earn3_long).addTo(earn3LayerGroup);

var tiles_earn3_medium =
    "https://b.tiles.mapbox.com/v4/mdcruse.5iwqgigw/{z}/{x}/{y}.vector.pbf?access_token={token}";
var options_earn3_medium = {
    vectorTileLayerStyles: {
        'earn3_medium': mediumCommuteOptions
    },
    rendererFactory: L.canvas.tile,
    token: "pk.eyJ1IjoibWRjcnVzZSIsImEiOiJjanZvN25kaHQxdzAxNDhwZjM4NDNvMXV4In0.s4GSawMNB7Jo4Vf7LXKEew"
}
var earn3_medium = L.vectorGrid.protobuf(tiles_earn3_medium, options_earn3_medium).addTo(earn3LayerGroup);

var tiles_earn3_short =
    "https://b.tiles.mapbox.com/v4/mdcruse.74w656sg/{z}/{x}/{y}.vector.pbf?access_token={token}";
var options_earn3_short = {
    vectorTileLayerStyles: {
        'earn3_short': shortCommuteOptions
    },
    rendererFactory: L.canvas.tile,
    token: "pk.eyJ1IjoibWRjcnVzZSIsImEiOiJjanZvN25kaHQxdzAxNDhwZjM4NDNvMXV4In0.s4GSawMNB7Jo4Vf7LXKEew"
}
var earn3_short = L.vectorGrid.protobuf(tiles_earn3_short, options_earn3_short).addTo(earn3LayerGroup);

//******************************************************
//
//                  Industry 1                               
//
//******************************************************

var tiles_ind1_long =
    "https://b.tiles.mapbox.com/v4/mdcruse.ahblm7ao/{z}/{x}/{y}.vector.pbf?access_token={token}";
var options_ind1_long = {
    vectorTileLayerStyles: {
        'ind1_long': longCommuteOptions
    },
    rendererFactory: L.canvas.tile,
    token: "pk.eyJ1IjoibWRjcnVzZSIsImEiOiJjanZvN25kaHQxdzAxNDhwZjM4NDNvMXV4In0.s4GSawMNB7Jo4Vf7LXKEew"
}
var ind1_long = L.vectorGrid.protobuf(tiles_ind1_long, options_ind1_long).addTo(ind1LayerGroup);

var tiles_ind1_medium =
    "https://b.tiles.mapbox.com/v4/mdcruse.a7l7dl4b/{z}/{x}/{y}.vector.pbf?access_token={token}";
var options_ind1_medium = {
    vectorTileLayerStyles: {
        'ind1_medium': mediumCommuteOptions
    },
    rendererFactory: L.canvas.tile,
    token: "pk.eyJ1IjoibWRjcnVzZSIsImEiOiJjanZvN25kaHQxdzAxNDhwZjM4NDNvMXV4In0.s4GSawMNB7Jo4Vf7LXKEew"
}
var ind1_medium = L.vectorGrid.protobuf(tiles_ind1_medium, options_ind1_medium).addTo(ind1LayerGroup);

var tiles_ind1_short =
    "https://b.tiles.mapbox.com/v4/mdcruse.9j24bc7f/{z}/{x}/{y}.vector.pbf?access_token={token}";
var options_ind1_short = {
    vectorTileLayerStyles: {
        'ind1_short': shortCommuteOptions
    },
    rendererFactory: L.canvas.tile,
    token: "pk.eyJ1IjoibWRjcnVzZSIsImEiOiJjanZvN25kaHQxdzAxNDhwZjM4NDNvMXV4In0.s4GSawMNB7Jo4Vf7LXKEew"
}
var ind1_short = L.vectorGrid.protobuf(tiles_ind1_short, options_ind1_short).addTo(ind1LayerGroup);

//******************************************************
//
//                  Industry 2                              
//
//******************************************************
var tiles_ind2_long = "https://b.tiles.mapbox.com/v4/mdcruse.5hpe3s64/{z}/{x}/{y}.vector.pbf?access_token={token}";
var options_ind2_long = {
    vectorTileLayerStyles: {
        'ind2_long': longCommuteOptions
    },
    rendererFactory: L.canvas.tile,
    token: "pk.eyJ1IjoibWRjcnVzZSIsImEiOiJjanZvN25kaHQxdzAxNDhwZjM4NDNvMXV4In0.s4GSawMNB7Jo4Vf7LXKEew",
    interactive: true
}

var ind2_long = L.vectorGrid.protobuf(tiles_ind2_long, options_ind2_long).addTo(ind2LayerGroup);

var tiles_ind2_medium =
    "https://b.tiles.mapbox.com/v4/mdcruse.3nz912z4/{z}/{x}/{y}.vector.pbf?access_token={token}";
var options_ind2_medium = {
    vectorTileLayerStyles: {
        'ind2_medium': mediumCommuteOptions
    },
    rendererFactory: L.canvas.tile,
    token: "pk.eyJ1IjoibWRjcnVzZSIsImEiOiJjanZvN25kaHQxdzAxNDhwZjM4NDNvMXV4In0.s4GSawMNB7Jo4Vf7LXKEew"
}
var ind2_medium = L.vectorGrid.protobuf(tiles_ind2_medium, options_ind2_medium).addTo(ind2LayerGroup);

var tiles_ind2_short =
    "https://b.tiles.mapbox.com/v4/mdcruse.6wky7b5g/{z}/{x}/{y}.vector.pbf?access_token={token}";
var options_ind2_short = {
    vectorTileLayerStyles: {
        'ind2_short': shortCommuteOptions
    },
    rendererFactory: L.canvas.tile,
    token: "pk.eyJ1IjoibWRjcnVzZSIsImEiOiJjanZvN25kaHQxdzAxNDhwZjM4NDNvMXV4In0.s4GSawMNB7Jo4Vf7LXKEew"
}
var ind2_short = L.vectorGrid.protobuf(tiles_ind2_short, options_ind2_short).addTo(ind2LayerGroup);


//******************************************************
//
//                  Industry 3                               
//
//******************************************************
var tiles_ind3_long =
    "https://b.tiles.mapbox.com/v4/mdcruse.b09brrb9/{z}/{x}/{y}.vector.pbf?access_token={token}";
var options_ind3_long = {
    vectorTileLayerStyles: {
        'ind3_long': longCommuteOptions
    },
    rendererFactory: L.canvas.tile,
    token: "pk.eyJ1IjoibWRjcnVzZSIsImEiOiJjanZvN25kaHQxdzAxNDhwZjM4NDNvMXV4In0.s4GSawMNB7Jo4Vf7LXKEew",
    interactive: true
}

var ind3_long = L.vectorGrid.protobuf(tiles_ind3_long, options_ind3_long).addTo(ind3LayerGroup);

var tiles_ind3_medium =
    "https://b.tiles.mapbox.com/v4/mdcruse.7swq7ywy/{z}/{x}/{y}.vector.pbf?access_token={token}";
var options_ind3_medium = {
    vectorTileLayerStyles: {
        'ind3_medium': mediumCommuteOptions
    },
    rendererFactory: L.canvas.tile,
    token: "pk.eyJ1IjoibWRjcnVzZSIsImEiOiJjanZvN25kaHQxdzAxNDhwZjM4NDNvMXV4In0.s4GSawMNB7Jo4Vf7LXKEew"
}
var ind3_medium = L.vectorGrid.protobuf(tiles_ind3_medium, options_ind3_medium).addTo(ind3LayerGroup);

var tiles_ind3_short =
    "https://b.tiles.mapbox.com/v4/mdcruse.9wdhhzvy/{z}/{x}/{y}.vector.pbf?access_token={token}";
var options_ind3_short = {
    vectorTileLayerStyles: {
        'ind3_short': shortCommuteOptions
    },
    rendererFactory: L.canvas.tile,
    token: "pk.eyJ1IjoibWRjcnVzZSIsImEiOiJjanZvN25kaHQxdzAxNDhwZjM4NDNvMXV4In0.s4GSawMNB7Jo4Vf7LXKEew"
}
var ind3_short = L.vectorGrid.protobuf(tiles_ind3_short, options_ind3_short).addTo(ind3LayerGroup);