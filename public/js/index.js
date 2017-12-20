var selected_districts = [];
var voter_data = {};
var mean_age   = {};
var residents  = {};
var unemployed = {};
var year       = 2002;
//
var slider_modal = {};
var slider_main  = {};
var slider_main_active = false;
var slider_modal_active = false;
var slider_modal_ranges = [2002, 2003, 2005, 2008, 2009];

(function() {
    "use strict";
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

            // $(".tooltip")
            //     .html(district_name)
            //     .css("left", d3.event.pageX + "px")
            //     .css("top", (d3.event.pageY - 28) + "px")
            //     .show();
            $("#district-name-box").html(district_name)
        }

        function add_district() {
            //disallow to select the same district twice
            if ($(this).attr("title") !== "Giesing" &&
                selected_districts.indexOf(this) === -1) {
                selected_districts.push(this);

                //mark borders of selected district
                $(this).css("stroke", "green");

                if (selected_districts.length >= 2) window.setTimeout(open_delayed_modal, 200);
            } else {
                return;
            }
        }

        function open_delayed_modal() {
            $("#exampleModal").foundation("open");
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
                // .on("mouseout", () => { $(".tooltip").hide() }) //ES6 — arrow functions ʕ•ᴥ•ʔ
                .attr("d", path)
                .attr("id", md => { return md.properties.cartodb_id })
                .attr("title", md => { return md.properties.name })
                .attr("data-name", md => { return md.properties.name })
                .attr("data-munich_r_1", md => { return md.properties.munich_r_1 })
                .attr("data-munich_r_2", md => { return md.properties.munich_r_2 })
        });

        //init slider
        slider_main = new rSlider({
            target: "#slider-main",
            values: [2002, 2003, 2005, 2008, 2009],
            range: false,
            set: [2002],
            tooltip: false,
            onChange: value => {
                year = value;
                update_voter_map(year, voter_data);
            },
            width: "600"
        });

        //clear selected districts from list
        $("#exampleModal").bind("closed.zf.reveal", clear_state);
        //open new diagramm in modal
        $("#exampleModal").bind("open.zf.reveal", show_chart_in_modal);
        //start the main time slider
        $("#footer-main > #play-button-main")
            .bind("click", change_slider.bind(null, slider_main, slider_main_active));

        //changes the position of the slider, and stops after reached end_position
        function change_slider(slider, slider_active) {
            var current_value = parseInt(slider.getValue()),
                current_position = slider.conf.values.indexOf(current_value),
                end_position = slider.conf.values.length - 1;

            if (!slider_active) {
                //slider is not active, reset year an start auto play
                var start = parseInt(slider.getValue());
                if (slider.conf.values[end_position] === start) {
                    start = slider.conf.values[0];
                }

                slider.setValues(start);
                slider_active = true;
                setTimeout(change_slider.bind(null, slider, slider_active), 1000);
            } else if (slider_active && current_position < end_position) {
                //slider is active and not at end position, go on

                var first_value = 0,
                    new_position = current_position + 1,
                    start = slider.conf.values[first_value],
                    end = slider.conf.values[new_position];
                slider.setValues(start, end);
                setTimeout(change_slider.bind(null, slider, slider_active), 1000);
            } else if (slider_active && current_position === end_position) {
                //slider reached end position disable autoplay
                slider_active = false;
            }
        }

        function clear_state() {
            //reset borders of selected districts
            selected_districts.forEach(district => { $(district).css("stroke", "black") });
            selected_districts = [];

            //remove unused chart in modal
            d3.select(".modalChart").remove("svg");

            //unbound click event, otherwise change_slider would be called multiple times
            $("#footer-modal > #play-button-modal").bind("click", change_slider);

            //remove slider
            slider_modal.destroy();
        }

        function create_bar_chart() {
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

            //remove old svg bar chart
            d3.select("#content-main-modal").selectAll("svg").remove();

            var svg = d3.select("#content-main-modal").append("svg")
                .attr("class", "modalChart")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            let district_A = get_district_name(selected_districts[0]);
            let district_B = get_district_name(selected_districts[1]);
            var districts_data = create_district_summary(district_A, district_B, mean_age[year], residents[year], unemployed[year])

            x.domain([-2, +2]);
            y.domain(districts_data.map(d => { return d.name; }));

            svg.selectAll(".bar")
                .data(districts_data)
                .enter().append("rect")
                .on("mouseover", show_feature_percentage)
                .on("mouseout", () => { $(".tooltip").hide() }) //ES6 — arrow functions ʕ•ᴥ•ʔ
                .attr("class", d => { return "bar bar--" + (d.value < 0 ? "negative" : "positive") })
                .attr("x", d => { return x(Math.min(0, d.value)) })
                .attr("y", d => { return y(d.name) })
                .attr("width", d => { return Math.abs(x(d.value) - x(0)) })
                .attr("height", y.rangeBand())
                .attr("value", d => { return d.value });

            svg.append("g")
                .attr("class", "y axis")
                .attr("transform", "translate(" + x(0) + ",0)")
              //  .attr("transform", "translate(150,0)")
                .call(yAxis);

            function type(d) {
                d.value = +d.value;
                return d;
            }
        }

        function show_chart_in_modal() {
            set_modal_title();
            //javascript deep copy, because references won't stay alive
            var my_modal = new rSlider({
                target: "#slider-modal",
                values: [2002, 2003, 2005, 2008, 2009],
                range: false,
                set: [2002],
                tooltip: false,
                onChange: function(value) {
                    year = value;
                    create_bar_chart();
                },
                width: "600"
            });

            jQuery.extend(
                slider_modal,
                my_modal
            );
            $("#footer-modal > #play-button-modal")
                .bind("click", change_slider.bind(null, slider_modal, slider_modal_active));
        }

        function set_modal_title() {
            var district_one = $(selected_districts[0]).attr("title"),
                district_two = $(selected_districts[1]).attr("title");

            $("#title-modal").text(`${district_one} vs ${district_two}`);
        }

        d3.json("/public/data/voter_turnout.json", function(error, data) {
            jQuery.extend(voter_data, data);
            update_voter_map(year, voter_data)
        });
        d3.json("/public/data/mean_age.json", function(error, data) {
            jQuery.extend(mean_age, data);
            console.log('[+] Load mean_age.json')
        });
        d3.json("/public/data/unemployed.json", function(error, data) {
            jQuery.extend(unemployed, data);
            console.log('[+] Load unemployed.json')
        });
        d3.json("/public/data/residents.json", function(error, data) {
            jQuery.extend(residents, data);
            console.log('[+] Load residents.json')
        });
    };
    window.onload = init;
})();