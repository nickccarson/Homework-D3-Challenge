var svgWidth = 975;
var svgHeight = 600;
var margin = {
    top: 20,
    right: 40,
    bottom: 80,
    left: 100
};
var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;


var svg = d3
    .select("#scatter")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);
// Append svg group element 
var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

var chosenXAxis = "age";
// function used for updating x-scale var upon click on axis label
function xScale(csvData, chosenXAxis) {
    // create scales
    var xLinearScale = d3.scaleLinear()
        .domain([d3.min(csvData, d => d[chosenXAxis]) * 0.8,
        d3.max(csvData, d => d[chosenXAxis]) * 1.2
        ])
        .range([0, width]);
    return xLinearScale;
}
// function used for updating xAxis var upon click on axis label
function renderAxes(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);
    xAxis.transition()
        .duration(1000)
        .call(bottomAxis);
    return xAxis;
}
// function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, newXScale, chosenXaxis) {
    circlesGroup.transition()
        .duration(1000)
        .attr("cx", d => newXScale(d[chosenXAxis]));
    return circlesGroup;
}
// function used for updating text group with a transition to
// new circles
function renderText(textlabels, newXScale, chosenXaxis) {
    textlabels.transition()
        .duration(1000)
        .attr("x", d => newXScale(d[chosenXAxis]) - 6);
    return textlabels;
}
// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, circlesGroup) {
    if (chosenXAxis === "age") {
        var label = "Age";
    }
    else {
        var label = "Household Income";
    }
    var toolTip = d3.tip()
        .attr("class", "tooltip")
        .offset([80, -60])
        .html(function (d) {
            return (`${d.abbr}<br>${label} ${d[chosenXAxis]}`);
        });
    circlesGroup.call(toolTip);
    circlesGroup.on("mouseover", function (data) {
        toolTip.show(data);
    })
        // onmouseout event
        .on("mouseout", function (data, index) {
            toolTip.hide(data);
        });
    return circlesGroup;
}
// Retrieve data from the CSV file and execute everything below
d3.csv("assets/data/data.csv").then(function (csvData) {

    console.log(csvData);

    // parse data
    csvData.forEach(function (data) {
        data.age = +data.age;
        data.income = +data.income;
        data.smokes = +data.smokes;
        data.obesity = +data.obesity;
    });


    // xLinearScale function above csv import
    var xLinearScale = xScale(csvData, chosenXAxis);
    // Create y scale function
    var yLinearScale = d3.scaleLinear()
        .domain([d3.min(csvData, d => d.smokes), d3.max(csvData, d => d.smokes)])
        .range([height, 0]);
    // Create initial axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // append initial circles
    var circlesGroup = chartGroup.selectAll("circle")
    .data(csvData)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    // change to chosenYaxis if i want to have multiple ys
    .attr("cy", d => yLinearScale(d.smokes))
    .attr("r", 15)
    .attr("stroke", "blue")
    .attr("stroke-width", "2")
    .attr("fill", "skyblue")
    .attr("opacity", ".5");
    //append text labels  
    var textlabels = chartGroup.selectAll("text")
    .data(csvData)
    .enter()
    .append("text")
    .attr("x", d => xLinearScale(d[chosenXAxis]) - 6)
    .attr("y", d => yLinearScale(d.smokes) + 3)
    .attr("font-family", "arial") 
    .attr("font-size", "10px")
    .attr("fill", "Black")
    .text(d => d.abbr);
    
    // append x axis
    var xAxis = chartGroup.append("g")
        .classed("x-axis", true)
        .attr("transform", `translate(0, ${height})`)
        .call(bottomAxis);


    // append y axis
    chartGroup.append("g")
        .call(leftAxis);


    // Create group for  2 x- axis labels
    var labelsGroup = chartGroup.append("g")
        .attr("transform", `translate(${width / 2}, ${height + 20})`);
    var ageLabel = labelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 20)
        .attr("value", "age") // value to grab for event listener
        .classed("active", true)
        .text("Age");
    var incomeLabel = labelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 40)
        .attr("value", "income") // value to grab for event listener
        .classed("inactive", true)
        .text("Household Income");


    // append y axis
    chartGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)

        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .classed("axis-text", true)
        .text("Smokes");



    // updateToolTip function above csv import
    var circlesGroup = updateToolTip(chosenXAxis, circlesGroup);
    
    
    // x axis labels event listener
    labelsGroup.selectAll("text")
        .on("click", function () {
            // get value of selection
            var value = d3.select(this).attr("value");
            if (value !== chosenXAxis) {
                // replaces chosenXAxis with value
                chosenXAxis = value;
                // console.log(chosenXAxis)
                // functions here found above csv import
                // updates x scale for new data
                xLinearScale = xScale(csvData, chosenXAxis);
                // updates x axis with transition
                xAxis = renderAxes(xLinearScale, xAxis);
                // updates circles with new x values
                textlabels = renderText(textlabels, xLinearScale, chosenXAxis);
                circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis);

                // updates tooltips with new info
                circlesGroup = updateToolTip(chosenXAxis, circlesGroup);
                // changes classes to change bold text
                if (chosenXAxis === "age") {
                    ageLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    incomeLabel
                        .classed("active", false)
                        .classed("inactive", true);
                }
                else {
                    ageLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    incomeLabel
                        .classed("active", true)
                        .classed("inactive", false);
                }
            }
        });
}).catch(function (error) {
    console.log(error);
})