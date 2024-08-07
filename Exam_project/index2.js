var width = 1480;
var height = 700;
var legendWidth = 300;
var legendHeight = 20;

var svg = d3.select("#canvas").append("svg")
    .attr("viewBox", `0 0 ${width} ${height}`)
    .attr("width", "100%")
    .attr("height", "100%")
    .style("background-color", "white");

// Add a title to the SVG
svg.append("text")
    .attr("x", width / 2)
    .attr("y", 20)
    .attr("text-anchor", "middle")
    .style("font-size", "24px")
    .style("font-weight", "bold")
    .text("Ocean Depth Measurements (in meters) Over Time from 1992-2023");

// Define a projection and a path generator
const projection = d3.geoEquirectangular()
    .scale(200)
    .translate([width / 2, height / 2]);

const path = d3.geoPath()
    .projection(projection);

// Arrays to store ocean data
var indianOcean = [];
var northPacificOcean = [];
var southPacificOcean = [];
var northAtlanticOcean = [];
var southAtlanticOcean = [];
var southernOcean = [];
var arcticOcean = [];

// Date parser for the format DMM/DD/YYYY
const parseDate = d3.timeParse("D%m/%d/%Y");

// Create a tooltip div and style it
var tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("position", "absolute")
    .style("background-color", "white")
    .style("border", "1px solid #ccc")
    .style("padding", "10px")
    .style("display", "none");

// Load GeoJSON data
d3.json("oceans-topo-simple.json").then(function(data) {
    var subunits = topojson.feature(data, data.objects.oceans);

    // Load CSV data
    d3.csv("data.csv").then(function(csvData) {

        csvData = csvData.filter(d => parseDate(d.Date).getFullYear() !== 2024);
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

        // var colorScale = d3.scaleSequential(d3.interpolateBlues)
        //     .domain([-732.45, 6992.61]);

        // var colorScale = d3.scaleSequential(d3.interpolateRgb("#34dbeb", "#000080"))
        //     .domain([-732.45, 6992.61])
        var colorScale = d3.scaleSequential(d3.interpolateRgb("#46eefa", "#ed020e"))
            .domain([-0.7324599999999999, 6.992619999999997]); //Values gathered from function later on
        
        var legend = d3.select("#legend").append("svg")
            .attr("width", legendWidth + 40)
            .attr("height", legendHeight + 30);

        var legendScale = d3.scaleLinear()
            .domain(colorScale.domain())
            .range([0, legendWidth]);

        var legendAxis = d3.axisBottom(legendScale)
            .ticks(5)
            .tickFormat(d3.format(".2s"));

        legend.append("g")
            .attr("class", "axis")
            .attr("transform", `translate(20, ${legendHeight})`)
            .call(legendAxis);

        var gradient = svg.append("defs")
            .append("linearGradient")
            .attr("id", "gradient")
            .attr("x1", "0%")
            .attr("y1", "0%")
            .attr("x2", "100%")
            .attr("y2", "0%");

        gradient.append("stop")
            .attr("offset", "0%")
            .attr("stop-color", "#46eefa");

        gradient.append("stop")
            .attr("offset", "100%")
            .attr("stop-color", "#ed020e");

        legend.append("rect")
            .attr("width", legendWidth)
            .attr("height", legendHeight)
            .attr("transform", "translate(20, 0)")
            .style("fill", "url(#gradient)");

        // Populate ocean arrays
        flattenedData.forEach(function(d) {
            const oceanName = d.Measure;
            const year = d.Year;
            const value = +d.Value / 1000 ;
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
                case "World":
                    arcticOcean.push([oceanName, year, value, color]);
                    break;
            }
        });

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

        // Bind the data and create one path per feature
        svg.selectAll("path")
            .data(subunits.features)
            .enter().append("path")
            .attr("class", function(d) { return "subunit " + d.id; })
            .attr("d", path)
            .attr("fill", function(d) {
                const oceanName = d.properties.name;
                let oceanArray;
                switch (oceanName) {
                    case "Indian Ocean":
                        oceanArray = indianOcean;
                        break;
                    case "North Pacific Ocean":
                        oceanArray = northPacificOcean;
                        break;
                    case "South Pacific Ocean":
                        oceanArray = southPacificOcean;
                        break;
                    case "North Atlantic Ocean":
                        oceanArray = northAtlanticOcean;
                        break;
                    case "South Atlantic Ocean":
                        oceanArray = southAtlanticOcean;
                        break;
                    case "Southern Ocean":
                        oceanArray = southernOcean;
                        break;
                    case "Arctic Ocean":
                        oceanArray = arcticOcean;
                        break;
                    default:
                        return "black"; // Default color if no data is found
                }
                const data = oceanArray.find(d => d[1] == 1992);
                return data ? data[3] : "#ccc";
            })
            .attr("fill-opacity", 0.2) // Set the opacity
            .attr("stroke", "black")
            .attr("stroke-width", 0.9)
            .attr("id", (d, i) => "polygon-" + i) // Assign a unique ID
            .attr("class", (d, i) => "polygon-class-" + i); // Optionally assign a unique class

        // Animate through the years
        let yearIndex = 0;
        const years = Array.from(new Set(flattenedData.map(d => d.Year))).sort();
        const animationInterval = setInterval(() => {
            if (yearIndex >= years.length) {
                clearInterval(animationInterval);
                enableSlider();
                return;
            }
            const year = years[yearIndex];
            updateMap(year);
            d3.select("#slider").property("value", year);
            d3.select("#slider-value").text(year);
            yearIndex++;
        }, 700);

        // Update the map colors based on the selected year
        function updateMap(year) {
            svg.selectAll("path")
                .attr("fill", function(d) {
                    const oceanName = d.properties.name;
                    let oceanArray;
                    switch (oceanName) {
                        case "Indian Ocean":
                            oceanArray = indianOcean;
                            break;
                        case "North Pacific Ocean":
                            oceanArray = northPacificOcean;
                            break;
                        case "South Pacific Ocean":
                            oceanArray = southPacificOcean;
                            break;
                        case "North Atlantic Ocean":
                            oceanArray = northAtlanticOcean;
                            break;
                        case "South Atlantic Ocean":
                            oceanArray = southAtlanticOcean;
                            break;
                        case "Southern Ocean":
                            oceanArray = southernOcean;
                            break;
                        case "Arctic Ocean":
                            oceanArray = arcticOcean;
                            break;
                        default:
                            return "black"; // Default color if no data is found
                    }
                    const data = oceanArray.find(d => d[1] == year);
                    return data ? data[3] : "#ccc";
                })
                .on("mouseover", function(event, d) {
                    const oceanName = d.properties.name;
                    let oceanArray;
                    switch (oceanName) {
                        case "Indian Ocean":
                            oceanArray = indianOcean;
                            break;
                        case "North Pacific Ocean":
                            oceanArray = northPacificOcean;
                            break;
                        case "South Pacific Ocean":
                            oceanArray = southPacificOcean;
                            break;
                        case "North Atlantic Ocean":
                            oceanArray = northAtlanticOcean;
                            break;
                        case "South Atlantic Ocean":
                            oceanArray = southAtlanticOcean;
                            break;
                        case "Southern Ocean":
                            oceanArray = southernOcean;
                            break;
                        case "Arctic Ocean":
                            oceanArray = arcticOcean;
                            break;
                        default:
                            return;
                    }
                    const data = oceanArray.find(d => d[1] == year);
                    if (data) {
                        tooltip.style("display", "block")
                            .html(`<strong>${oceanName}</strong><br>Year: ${year}<br>Value: ${data[2]}`)
                            .style("left", (event.pageX + 10) + "px")
                            .style("top", (event.pageY - 20) + "px");
                    }
                })
                .on("mousemove", function(event) {
                    tooltip.style("left", (event.pageX + 10) + "px")
                        .style("top", (event.pageY - 20) + "px");
                })
                .on("mouseout", function() {
                    tooltip.style("display", "none");
                });
        }

        // Enable the slider for user interaction
        function enableSlider() {
            d3.select("#slider").on("input", function() {
                const year = this.value;
                d3.select("#slider-value").text(year);
                updateMap(year);
            });
        }
        
    }).catch(function(error) {
        console.error("Error loading the CSV file:", error);
    });
}).catch(function(error) {
    console.error("Error loading the GeoJSON file:", error);
});