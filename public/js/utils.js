'use strict';

// percentage_float = [0.0,100.0]
// returns a valid hex color
function get_heatmap_color(percentage_float) {
    if (percentage_float != undefined) {
        let colors = ["#f9e0e9", "#ffb5d1", "#f97cac", "#f44789", "#db1360", "#c7044f", "#a70241", "#810434", "#560223", "#42011b"];
        let index = Math.max(0, Math.round(percentage_float / 10) - 1);
        return colors[index];
    } else {
       return "#848484";
    }
}
    


// 
function update_voter_map(year, voter_data) {
    console.log(voter_data)
    var districts = document.getElementsByClassName("district");
    Object.keys(districts).forEach(function(key) {
        update_district(districts[key], year, voter_data);
    });
}

// district ~ DOM element
// year
// voter_data ~ object with yearly information on voter data
function update_district(district, year, voter_data) {
    if (district != undefined) {
        let name = district.getAttribute("data-name");
        if (name.includes("-")) {
            console.log(name)
            let names = name.split("-");
            console.log(names);
            var value = 0;
            for(var ix in names) {
                // console.log(voter_data[year][sub_name]);
                value = value + voter_data[year][names[ix].trim()];
            }
            district.style.fill = get_heatmap_color(value / names.length);
        } else if (name.includes(",")) {
            let names = name.split(",");
            var value = 0;
            for(var ix in names) {
                // console.log(voter_data[year][sub_name]);
                value = value + voter_data[year][names[ix].trim()];
            }
            district.style.fill = get_heatmap_color(value / names.length);
        } else {
            district.style.fill = get_heatmap_color(voter_data[year][name]);
        }
    }
}
