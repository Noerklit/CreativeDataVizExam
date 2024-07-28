var width = 1480;
var height = 700;


var svg = d3.select("#canvas").append("svg")
			.attr("width",width)
			.attr("height",height)


// // Define a projection (e.g., Mercator) and a path generator
const projection = d3.geoEquirectangular()
    .scale(200)
    .translate([width / 2, height / 2]);

const path = d3.geoPath()
    .projection(projection);


    // Load GeoJSON data
d3.json("data.json").then(function(data) {
    console.log(data)
    var subunits = topojson.feature(data, data.objects.subunits)

    // Debug: Log the number of features and their data
    console.log("Number of features:", subunits.features.length);
    subunits.features.forEach((feature, index) => {
        console.log(`Feature ${index}:`, feature);
    });
    // console.log("subunits", subunits)
    svg.selectAll(".subunit")
        .data(subunits.features)
        .enter().append("path")
        .attr("class", function(d) { return "subunit " + d.id})
        .attr("d", path)
        .attr("fill", "blue")
        .attr("fill-opacity", 0.2)
        .attr("stroke", "black")
        .attr("stroke-width", 0.9)
        .attr("id", (d, i) => "polygon-" + i) // Assign a unique ID
        .attr("class", (d, i) => "polygon-class-" + i); // Optionally assign a unique class
    
    svg.selectAll("path").each(function(d, i) {
        console.log(d.id, this.id, this.getAttribute('class'));
    });
});