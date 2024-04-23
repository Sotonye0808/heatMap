// Define the dimensions and margins for the graph
const margin = { top: 50, right: 50, bottom: 50, left: 100 };
const width = 800 - margin.left - margin.right;
const height = 500 - margin.top - margin.bottom;

// Append the SVG element to the container
const svg = d3.select("#heatmap")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// Fetch the data
d3.json("https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json").then(data => {
    // Data preprocessing
    const baseTemperature = data.baseTemperature;
    const monthlyVariance = data.monthlyVariance;
    const years = Array.from(new Set(monthlyVariance.map(d => d.year)));
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    // Define scales
    const xScale = d3.scaleBand()
        .domain(years)
        .range([0, width]);

    const yScale = d3.scaleBand()
        .domain(months)
        .range([height, 0]);

    const colorScale = d3.scaleSequential(d3.interpolateRdBu)
        .domain(d3.extent(monthlyVariance, d => baseTemperature + d.variance));

    // Create axes
    const xAxis = d3.axisBottom(xScale).tickValues(years.filter(year => year % 10 === 0));
    const yAxis = d3.axisLeft(yScale);

    // Append axes to SVG
    svg.append("g")
        .attr("id", "x-axis")
        .attr("transform", `translate(0,${height})`)
        .call(xAxis);

    svg.append("g")
        .attr("id", "y-axis")
        .call(yAxis);

    // Add cells to represent the data points
    svg.selectAll(".cell")
        .data(monthlyVariance)
        .enter().append("rect")
        .attr("class", "cell")
        .attr("x", d => xScale(d.year))
        .attr("y", d => yScale(months[d.month - 1]))
        .attr("width", xScale.bandwidth())
        .attr("height", yScale.bandwidth())
        .attr("data-year", d => d.year)
        .attr("data-month", d => d.month - 1)
        .attr("data-temp", d => baseTemperature + d.variance)
        .attr("fill", d => colorScale(baseTemperature + d.variance))
        .on("mouseover", (event, d) => {
            const tooltip = d3.select("#tooltip");
            tooltip.transition().duration(200).style("opacity", 0.9);
            tooltip.html(`${months[d.month - 1]} ${d.year}<br>${(baseTemperature + d.variance).toFixed(2)}℃<br>${d.variance.toFixed(2)}℃`)
                .attr("data-year", d.year)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", () => {
            d3.select("#tooltip").transition().duration(200).style("opacity", 0);
        });

    // Create legend
    const legendData = colorScale.ticks(6).map(d => colorScale.invertExtent(d));
    const legend = svg.append("g")
        .attr("id", "legend")
        .attr("transform", `translate(${width - 150},20)`);

    legend.selectAll("rect")
        .data(legendData)
        .enter().append("rect")
        .attr("x", 0)
        .attr("y", (d, i) => i * 20)
        .attr("width", 20)
        .attr("height", 20)
        .attr("fill", d => colorScale(d[0]));

    legend.selectAll("text")
        .data(legendData)
        .enter().append("text")
        .attr("x", 30)
        .attr("y", (d, i) => i * 20 + 14)
        .text(d => `${d[0].toFixed(1)} - ${d[1].toFixed(1)}`);
});
