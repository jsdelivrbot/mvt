'use strict';

// percentage_float = [0.0,100.0]
// returns a valid hex color
function get_heatmap_color(percentage_float) {
    if (percentage_float != undefined) {
        // let colors = ["#f9e0e9", "#ffb5d1", "#f97cac", "#f44789", "#db1360", "#c7044f", "#a70241", "#810434", "#560223", "#42011b"];
        let colors = ["#ffffcc", "#ffeda0", "#fed976", "#feb24c", "#fd8d3c", "#fc4e2a", "#e31a1c", "#bd0026", "#800026", "#4f0018"];
        let index = Math.max(0, Math.round(percentage_float / 10) - 1);
        return colors[index];
    } else {
       return "#eeeeee";
    }
}

// 
function update_voter_map(year, voter_data) {
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
            let names = name.split("-");
            var value = 0;
            for(var ix in names) {
                value = value + voter_data[year][names[ix].trim()];
            }
            district.style.fill = get_heatmap_color(value / names.length);
        } else if (name.includes(",")) {
            let names = name.split(",");
            var value = 0;
            for(var ix in names) {
                value = value + voter_data[year][names[ix].trim()];
            }
            district.style.fill = get_heatmap_color(value / names.length);
        } else {
            district.style.fill = get_heatmap_color(voter_data[year][name]);
        }
    }
}

// possible district names:
//    * Hadern
//    * Au-Haidhausen
//    * Forstenried - Fürstenried
//
// because of previous data normalization, the district have the same values, thus we return
// the first valid district name#
//
// input: svg-path with attribute title
// return: string with district name
function get_district_name(path)
{   let name = $(path).attr("title");
    return name.split('-').map( e => e.trim() )[0];
}

// copied zip function for ES6
// https://gist.github.com/renaudtertrais/25fc5a2e64fe5d0e86894094c6989e10
const zip = (arr, ...arrs) => {
  return arr.map((val, i) => arrs.reduce((a, arr) => [...a, arr[i]], [val]));
}

// input: both districts and the desired information of the current year
// output: a dict with the three differences, either positive or negative
function create_district_summary(district_A, district_B, mean_age, residents, unemployed)
{
    let mean_age_key           = "Durchschnittliches Alter"
    let mean_residents_key     = "Durchschnittliche Hauptwohnsitze"
    let mean_unemployment_key  = "Arbeitslosenquote"
    let keys  = [mean_age_key, mean_residents_key, mean_unemployment_key]
    let dicts = [mean_age,     residents,          unemployed]
    let iterable_dicts = zip(keys, dicts)

    let factor_A = -1; // negative values are shown to the left  in the bar-plot (district_A)
    let factor_B =  1; // positive values are shown to the right in the bar-plot (district_B)
    var return_array = []

    let _ = iterable_dicts.forEach( element => {
        let key            = element[0]
        let knowledge_dict = element[1]

        let value_A = knowledge_dict[district_A]
        let value_B = knowledge_dict[district_B]

        var value_rate = 0;
        if (value_A > value_B) 
        {
            value_rate = value_A / value_B; 
            value_rate = (value_rate - 1) * factor_A;
        } else {
            value_rate = value_B / value_A;
            value_rate = (value_rate - 1) * factor_B;
        }
        var return_dict = {}
        return_dict["name"] = key;
        return_dict["value"] = value_rate;
        return_array.push(return_dict)
    });

    return return_array;
}

// this is triggered on mouseover in the modal boxplot
function show_feature_percentage()
{
    let factor_str = $(this).attr("value");
    let percentage_float = Math.abs(100 * parseFloat(factor_str.slice(0,5))).toFixed(2)
    let tooltip = `${percentage_float}%`
    $(".tooltip")
        .html(tooltip)
        .css("left", d3.event.pageX + "px")
        .css("top", (d3.event.pageY - 28) + "px")
        .show();
}







