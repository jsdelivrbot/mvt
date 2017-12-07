(function() {
    'use strict';

    var init = function() {
        // params
        let width = 700;
        let height = 600;

var path = d3.geoPath().projection(projection);


        var projection = d3.geoMercator()
            .scale(140000)
            .center([11.53, 48.180]);

        var path = d3.geoPath().projection(projection);

        var svg = d3.select("#map-container")
            .append("svg")
            .attr("height", "700")
            .attr("width", "1000")
            .attr("id", "svg-map")
            .append("g");

        function show_tooltip() {
            var district_name = $(this).data("name");
            console.log(district_name);
        }

        function change_color() {
            var new_color = "",
                current_color = $(this).attr("fill");

            if (current_color === "#AABBCC") {
                new_color = "#459FA1";
                add_district_name(this, "");
            } else {
                new_color = "#AABBCC";
                add_district_name(this, $(this).data("name"));
            }

            $(this).attr("fill", new_color);
        }

        function add_district_name(element_clicked, new_text) {
            $("#district").text(new_text);
        }

        d3.json("/public/data/munich.geojson", function (error, mapData) {
            console.table(mapData);

            var features = mapData.features;

            svg.selectAll("path")
                .data(features).enter()
                .append("path")
                .attr("class", "district")
                .attr("data-name", function (munich_district) {
                    return munich_district.properties.name;
                })
                .on("mouseover", show_tooltip)
                .attr("data-munich_r_1", function (munich_district) {
                    return munich_district.properties.munich_r_1;
                })
                .attr("data-munich_r_2", function (munich_district) {
                    return munich_district.properties.munich_r_2;
                })
                .attr("id", function (munich_district) {
                    return munich_district.properties.cartodb_id;
                })
                .attr("title", function (munich_district) {
                    return munich_district.properties.name;
                })
                .attr("d", path)
        });


        //init slider
        var slider2 = new rSlider({
            target: '#slider',
            values: [2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015],
            range: false,
            set: [5],
            tooltip: false,
            onChange: function(vals) {
                console.log(vals);
            },
            width: "600"
        });
    };
    window.onload = init;
})();