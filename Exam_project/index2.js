var width = 1480;
var height = 700;


var svg = d3.select("#canvas").append("svg")
			.attr("width",width)
			.attr("height",height)


// // Define a projection (e.g., Mercator) and a path generator



// const projection = d3.geoOrthographic()
//     .scale(300) // Adjust the scale for the globe
//     .translate([width / 2, height / 2])
//     .clipAngle(90); // Clip the projection to a circle
const projection = d3.geoEquirectangular()
    .scale(200)
    .translate([width / 2, height / 2]);

const path = d3.geoPath()
    .projection(projection);


// Define a color scale
const colorScale = d3.scaleOrdinal(d3.schemeCategory10);


    // Load GeoJSON data
d3.json("oceans-topo-simple.json").then(function(data) {
    console.log(data)
    var subunits = topojson.feature(data, data.objects.oceans)

    // Bind the data and create one path per feature
    svg.selectAll("path")
        .data(subunits.features)
        .enter().append("path")
        .attr("class", function(d) { return "subunit " + d.id; })
        .attr("d", path)
        .attr("fill", (d, i) => colorScale(i)) // Fill each polygon with a different color
        .attr("fill-opacity", 0.2) // Set the opacity
        .attr("stroke", "black")
        .attr("stroke-width", 0.9)
        .attr("id", (d, i) => "polygon-" + i) // Assign a unique ID
        .attr("class", (d, i) => "polygon-class-" + i); // Optionally assign a unique class

    svg.selectAll("path").each(function(d, i) {
      console.log(d.id, this.id, this.getAttribute('class'));
    });

  //   // Optionally, add rotation to the globe
  //   d3.timer(function(elapsed) {
  //     projection.rotate([elapsed * 0.02, -15]); // Rotate the globe
  //     svg.selectAll("path").attr("d", path); // Update the paths
  // });
});