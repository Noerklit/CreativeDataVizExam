var width = 1480;
var height = 700;

// Append SVG to the canvas
var svg = d3.select("#canvas").append("svg")
  .attr("width", width)
  .attr("height", height);

// Load GeoJSON data
d3.json("oceans.json").then(function (data) {
  console.log("Original data", data);

  // Extract the specific feature
  const feature = {
    type: "Feature",
    id: 1, // Adjust this id to target the desired feature
    properties: { name: `Feature 1` },
    geometry: {} // Adjust this index to target the desired geometry
  };

  console.log("Feature:", feature);

  // Define a projection and path generator
  const projection = d3.geoEquirectangular()
    .scale(200)                  // Adjust scale
    .translate([width / 2, height / 2]); // Center the projection

  const path = d3.geoPath()
    .projection(projection);

  // Bind the data and create one path per feature
  svg.selectAll("path")
    .data(feature) // Pass an array with the specific feature
    .enter().append("path")
    .attr("d", path)
    .attr("fill", "blue") // Fill the polygon
    .attr("fill-opacity", 0.5) // Set opacity
    .attr("stroke", "black")
    .attr("stroke-width", 0.9);

  // Debug: Check if the shapes are being rendered correctly
  svg.selectAll("path").each(function(d) {
    console.log("path", d);
  });

}).catch(function (error) {
  console.error("Error loading the GeoJSON file:", error);
});
