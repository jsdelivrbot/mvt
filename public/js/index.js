var selected_districts = [];

(function() {
    'use strict';

    var init = function() {
        // params
        let width = 700;
        let height = 600;

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

            $(".tooltip")
                .html(district_name)
                .css("left", d3.event.pageX + "px")
                .css("top", (d3.event.pageY - 28) + "px")
                .show();
        }

        function add_district() {
            selected_districts.push(this);

            //mark borders of selected district
            $(this).css("stroke", "green");

            if (selected_districts.length == 2) window.setTimeout(open_delayed_modal, 200);
        }

        function open_delayed_modal() {
            $('#exampleModal').foundation('open');
        }

        function add_district_name(element_clicked, new_text) {
            $("#district").text(new_text);
        }

        d3.json("/public/data/munich.geojson", function(error, mapData) {
            var features = mapData.features;

            svg.selectAll("path")
                .data(features).enter()
                .append("path")
                .attr("class", "district")
                .on("click", add_district)
                .on("mouseover", show_tooltip)
                .on("mouseout", () => { $(".tooltip").hide() }) //ES6 — arrow functions ʕ•ᴥ•ʔ
                .attr("d", path)
                .attr("id", md => { return md.properties.cartodb_id })
                .attr("title", md => { return md.properties.name })
                .attr("data-name", md => { return md.properties.name })
                .attr("data-munich_r_1", md => { return md.properties.munich_r_1 })
                .attr("data-munich_r_2", md => { return md.properties.munich_r_2 })
        });

        //init slider
        var slider = new rSlider({
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

        //clear selected districts from list
        $('#exampleModal').bind('closed.zf.reveal', clear_state);
        //open new diagramm in modal
        $('#exampleModal').bind('open.zf.reveal', show_chart_in_modal);

        function clear_state() {
            //mark borders of selected district
            selected_districts.forEach(function(district) {
                $(district).css("stroke", "black");
            });
            selected_districts = [];

            //remove unused chart in modal
            d3.select(".modalChart").remove("svg");
        }

        function show_chart_in_modal() {
            var margin = { top: 20, right: 30, bottom: 40, left: 30 },
                width = 960 - margin.left - margin.right,
                height = 500 - margin.top - margin.bottom;

            var x = d3.scale.linear()
                .range([0, width]);

            var y = d3.scale.ordinal()
                .rangeRoundBands([0, height], 0.1);

            var xAxis = d3.svg.axis()
                .scale(x)
                .orient("bottom");

            var yAxis = d3.svg.axis()
                .scale(y)
                .orient("left")
                .tickSize(0)
                .tickPadding(6);

            var svg = d3.select("#exampleModal").append("svg")
                .attr("class", "modalChart")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            d3.tsv("/public/data/data.tsv", type, function(error, data) {
                if (error) {
                    console.log("could not load data.tsv");
                    return;
                }

                x.domain(d3.extent(data, function(d) { return d.value; })).nice();
                y.domain(data.map(function(d) { return d.name; }));

                svg.selectAll(".bar")
                    .data(data)
                    .enter().append("rect")
                    .attr("class", function(d) { return "bar bar--" + (d.value < 0 ? "negative" : "positive"); })
                    .attr("x", function(d) { return x(Math.min(0, d.value)); })
                    .attr("y", function(d) { return y(d.name); })
                    .attr("width", function(d) { return Math.abs(x(d.value) - x(0)); })
                    .attr("height", y.rangeBand());

                svg.append("g")
                    .attr("class", "y axis")
                    .attr("transform", "translate(" + x(0) + ",0)")
                    .call(yAxis);
            });

            function type(d) {
                d.value = +d.value;
                return d;
            }
        }
    };
    window.onload = init;
})();