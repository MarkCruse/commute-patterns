

        var id = "";

        var highlightLayer = {};

        var x = 0;


        function highlight(e) {
            //console.log(e);
            if (e.feature) {
                var aline = e.feature.properties;
                var index = aline.index.split(" | ");
                var distance = index[0];
                var w_group_count = index[1];
            }else{
                var aline = e.properties;
                var distance = aline.distance;
                var w_group_count  = aline.w_group_count;
            }
            //console.log(aline);
            var popup = 'Line: ' + distance;
            map.on('popupopen', function() {
                map.spin(false);
            });
            map.on('popupclose', function() {
                mapboxPbfLayer.setFeatureStyle(distance, {
                color: 'orange',
                weight: 1
                });
            });
            setTimeout(function() {distance, {
                color: 'red'
                };
                map.openPopup(popup, distance);
                x = 0
            }, 50);
        }




        mapboxPbfLayer.on('click', function(e) {
        if (x == 0) {
            highlight(e)
        }
        x = 1
        });