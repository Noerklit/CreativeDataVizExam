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

var indianOcean = [];
var northPacificOcean = [];
var southPacificOcean = []; // Just called Pacific Ocean in data
var northAtlanticOcean = [];
var southAtlanticOcean = []; //Just called Atlantic Ocean in data
var southernOcean = [];
var arcticOcean = [];


// Define a color scale
// const colorScale = d3.scaleOrdinal(d3.schemeCategory10);
const colorScale = d3.scaleSequential(d3.interpolateBlues);

    // Load GeoJSON data
d3.json("oceans-topo-simple.json").then(function(data) {
    console.log(data)
    var subunits = topojson.feature(data, data.objects.oceans)
    d3.csv("data.csv").then(function(csvData) {

        const colorMapping = {};
        csvData.forEach(function(d) {
            const oceanName = d.Measure;
            const dateOfMeasurement = d.Date;
            const value = +d.Value;
            switch (oceanName) {
                case "Indian Ocean" :
                    indianOcean.push([oceanName, dateOfMeasurement, value]);
                break;
                case "North Pacific Ocean":
                    northPacificOcean.push([oceanName, dateOfMeasurement, value]);
                    break;
                case "Pacific Ocean":
                    southPacificOcean.push([oceanName, dateOfMeasurement, value]);
                    break;
                case "North Atlantic Ocean":
                    northAtlanticOcean.push([oceanName, dateOfMeasurement, value]);
                    break;
                case "Atlantic Ocean":
                    southAtlanticOcean.push([oceanName, dateOfMeasurement, value]);
                    break;
                case "Southern Ocean":
                    southernOcean.push([oceanName, dateOfMeasurement, value]);
                    break;
                case "Arctic Ocean":
                    arcticOcean.push([oceanName, dateOfMeasurement, value]);
                    break;
                default:
                    // console.warn(`Unknown ocean: ${oceanName}`); 
            colorMapping[d.id] = d.color;
            };
            // Bind the data and create one path per feature
            svg.selectAll("path")
                .data(subunits.features)
                .enter().append("path")
                .attr("class", function(d) { return "subunit " + d.id; })
                .attr("d", path)
                .attr("fill", function(d) { return colorMapping[d.id] || colorScale(Math.random()); }) // Fill each polygon with a different color
                .attr("fill-opacity", 0.2) // Set the opacity
                .attr("stroke", "black")
                .attr("stroke-width", 0.9)
                .attr("id", (d, i) => "polygon-" + i) // Assign a unique ID
                .attr("class", (d, i) => "polygon-class-" + i); // Optionally assign a unique class

            svg.selectAll("path").each(function(d, i) {
                // console.log(d.id, this.id, this.getAttribute('class'));
            });
        });
    })
    console.log(indianOcean);
});

  //   // Optionally, add rotation to the globe
  //   d3.timer(function(elapsed) {
  //     projection.rotate([elapsed * 0.02, -15]); // Rotate the globe
  //     svg.selectAll("path").attr("d", path); // Update the paths
  // });