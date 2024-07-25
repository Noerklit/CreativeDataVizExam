var width = 1480;
var height = 700;


var svg = d3.select("#canvas").append("svg")
			.attr("width",width)
			.attr("height",height)


// Define a projection (e.g., Mercator) and a path generator
const projection = d3.geoEquirectangular()

const path = d3.geoPath()
    .projection(projection);

// Load GeoJSON data
d3.json("oceans.json").then(function(data) {
    console.log(data)
    svg.selectAll("path")
    .data(data) // Pass an array with the specific feature
    .enter().append("path")
    .attr("d", path)
    .attr("fill", "blue") // Fill the polygon
    .attr("fill-opacity", 0.5) // Set opacity
    .attr("stroke", "black")
    .attr("stroke-width", 0.9);
});