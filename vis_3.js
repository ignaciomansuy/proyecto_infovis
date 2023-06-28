const margin_3 = {top: 20, right: 30, bottom: 40, left: 90},
    width_3 = 600 - margin_3.left - margin_3.right,
    height_3 = 500 - margin_3.top - margin_3.bottom;

// append the svg object to the body of the page
const SVG3 = d3.select("#vis_3")
  .append("svg")
    .attr("width", width_3 + margin_3.left + margin_3.right)
    .attr("height", height_3 + margin_3.top + margin_3.bottom)
  .append("g")
    .attr("transform",
          "translate(" + margin_3.left + "," + margin_3.top + ")");

// Parse the Data
function updateData() {
  d3.csv("https://raw.githubusercontent.com/holtzy/data_to_viz/master/Example_dataset/7_OneCatOneNum_header.csv").then(data => {

  // Add X axis
  var x = d3.scaleLinear()
    .domain([0, 13000])
    .range([ 0, width_3]);
  SVG3.append("g")
    .attr("transform", "translate(0," + height_3 + ")")
    .call(d3.axisBottom(x))
    .selectAll("text")
      .attr("transform", "translate(-10,0)rotate(-45)")
      .style("text-anchor", "end");

  // Y axis
  var y = d3.scaleBand()
    .range([ 0, height_3 ])
    .domain(data.map(function(d) { return d.Country; }))
    .padding(.1);
  SVG3.append("g")
    .call(d3.axisLeft(y))

  //Bars
  SVG3.selectAll("myRect")
    .data(data)
    .enter()
    .append("rect")
    .attr("x", x(0) )
    .attr("y", function(d) { return y(d.Country); })
    .attr("width", function(d) { return x(d.Value); })
    .attr("height", y.bandwidth() )
    .attr("fill", "#69b3a2")


    // .attr("x", function(d) { return x(d.Country); })
    // .attr("y", function(d) { return y(d.Value); })
    // .attr("width", x.bandwidth())
    // .attr("height", function(d) { return height - y(d.Value); })
    // .attr("fill", "#69b3a2")

})
}