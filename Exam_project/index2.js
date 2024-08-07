var width = 1480;
var height = 700;

var svg = d3.select("#canvas").append("svg")
    .attr("width", width)
    .attr("height", height);

// Define a projection and a path generator
const projection = d3.geoEquirectangular()
    .scale(200)
    .translate([width / 2, height / 2]);

const path = d3.geoPath()
    .projection(projection);

// Arrays to store ocean data
var indianOcean = []; //Polygon 
var northPacificOcean = []; // Called North Pacific in the CSV file
var southPacificOcean = [];
var northAtlanticOcean = []; // Called North Atlantic in the CSV file - Polygon 8 nr 9 on drawing
var southAtlanticOcean = []; // Polygon 1 - nr 2 on drawing
var southernOcean = []; // Polygon 0 - nr 1 on drawing
var arcticOcean = [];

// Date parser for the format DMM/DD/YYYY
const parseDate = d3.timeParse("D%m/%d/%Y");

// Load GeoJSON data
d3.json("oceans-topo-simple.json").then(function(data) {
    var subunits = topojson.feature(data, data.objects.oceans);

    // Load CSV data
    d3.csv("data.csv").then(function(csvData) {
        // Group and sum the data by ocean and year
        const aggregatedData = d3.rollup(csvData, v => d3.sum(v, d => d.Value), d => d.Measure, d => parseDate(d.Date).getFullYear());

        // Flatten the aggregated data for easier processing
        const flattenedData = [];
        aggregatedData.forEach((yearMap, oceanName) => {
            yearMap.forEach((value, year) => {
                flattenedData.push({
                    Measure: oceanName,
                    Year: year,
                    Value: value
                });
            });
        });

        const values = flattenedData.map(d => +d.Value);
        const minValue = d3.min(values);
        const maxValue = d3.max(values);

        var colorScale = d3.scaleSequential(d3.interpolateBlues)
            .domain([minValue, maxValue]);

        // Populate ocean arrays
        flattenedData.forEach(function(d) {
            const oceanName = d.Measure;
            const year = d.Year;
            const value = +d.Value;
            const color = colorScale(value);

            switch (oceanName) {
                case "Indian Ocean":
                    indianOcean.push([oceanName, year, value, color]);
                    break;
                case "North Pacific":
                    northPacificOcean.push([oceanName, year, value, color]);
                    break;
                case "Pacific Ocean":
                    southPacificOcean.push([oceanName, year, value, color]);
                    break;
                case "North Atlantic":
                    northAtlanticOcean.push([oceanName, year, value, color]);
                    break;
                case "Atlantic Ocean":
                    southAtlanticOcean.push([oceanName, year, value, color]);
                    break;
                case "Southern Ocean":
                    southernOcean.push([oceanName, year, value, color]);
                    break;
                case "Arctic Ocean":
                    arcticOcean.push([oceanName, year, value, color]);
                    break;
            }
        });

        // Bind the data and create one path per feature
        svg.selectAll("path")
            .data(subunits.features)
            .enter().append("path")
            .attr("class", function(d) { return "subunit " + d.id; })
            .attr("d", path)
            .attr("fill", "#ccc") // Default fill color
            .attr("fill-opacity", 0.2) // Set the opacity
            .attr("stroke", "black")
            .attr("stroke-width", 0.9)
            .attr("id", (d, i) => "polygon-" + i) // Assign a unique ID
            .attr("class", (d, i) => "polygon-class-" + i); // Optionally assign a unique class

        // Add text elements inside each path
        svg.selectAll("text")
        .data(subunits.features)
        .enter().append("text")
        .attr("x", function(d) { return path.centroid(d)[0]; })
        .attr("y", function(d) { return path.centroid(d)[1]; })
        .attr("text-anchor", "middle")
        .attr("dy", ".35em")
        .text((d, i) => i + 1) // Display the index number
        .attr("class", (d, i) => "text-class-" + i); // Optionally assign a unique class

        // Log the min and max values for each ocean array
        function getMinMax(oceanArray) {
            const values = oceanArray.map(d => d[2]); // Extract the value (3rd element in each sub-array)
            const minValue = d3.min(values);
            const maxValue = d3.max(values);
            return { minValue, maxValue };
        }

        const indianOceanMinMax = getMinMax(indianOcean);
        const northPacificOceanMinMax = getMinMax(northPacificOcean);
        const southPacificOceanMinMax = getMinMax(southPacificOcean);
        const northAtlanticOceanMinMax = getMinMax(northAtlanticOcean);
        const southAtlanticOceanMinMax = getMinMax(southAtlanticOcean);
        const southernOceanMinMax = getMinMax(southernOcean);
        const arcticOceanMinMax = getMinMax(arcticOcean);

        console.log("Indian Ocean Min/Max:", indianOceanMinMax);
        console.log("North Pacific Ocean Min/Max:", northPacificOceanMinMax);
        console.log("South Pacific Ocean Min/Max:", southPacificOceanMinMax);
        console.log("North Atlantic Ocean Min/Max:", northAtlanticOceanMinMax);
        console.log("South Atlantic Ocean Min/Max:", southAtlanticOceanMinMax);
        console.log("Southern Ocean Min/Max:", southernOceanMinMax);
        console.log("Arctic Ocean Min/Max:", arcticOceanMinMax);

        // Update the slider value
        d3.select("#slider").on("input", function() {
            const year = this.value;
            d3.select("#year").text(year);
            // Update the color of the paths based on the selected year
            svg.selectAll("path")
                .attr("fill", function(d) {
                    const oceanName = d.properties.name;
                    // console.log("Ocean:", oceanName);
                    let color;
                    switch (oceanName) {
                        case "Indian Ocean":
                            color = "pink"
                            // data = indianOcean.find(o => o[1] == year);
                            break;
                        case "North Pacific Ocean":
                            color = "green"
                            break;
                        case "South Pacific Ocean":
                            color = "blue"
                            break;
                        case "North Atlantic Ocean":
                            color = "red"
                            break;
                        case "South Atlantic Ocean":
                            color = "yellow"
                            break;
                        case "Southern Ocean":
                            color = "purple"
                            break;
                        case "Arctic Ocean":
                            color = "orange"
                            break;
                        default:
                            return "black"; // Default color if no data is found
                    }
                    return color
                });
        });
    }).catch(function(error) {
        console.error("Error loading the CSV file:", error);
    });
}).catch(function(error) {
    console.error("Error loading the GeoJSON file:", error);
});
