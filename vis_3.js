const margin_3 = {top: 50, right: 30, bottom: 40, left: 200},
    width_3 = 600 - margin_3.left - margin_3.right,
    height_3 = 700 - margin_3.top - margin_3.bottom;

// append the svg object to the body of the page
const SVG3 = d3.select("#vis_3")
  .append("svg")
    .attr("width", width_3 + margin_3.left + margin_3.right)
    .attr("height", height_3 + margin_3.top + margin_3.bottom)
  .append("g")
    .attr("transform",
          "translate(" + margin_3.left + "," + margin_3.top + ")");

// Parse the Data
function vis3(data) {
  
  var x = d3.scaleLinear()
    .domain([0, d3.max(data, (d) => d.valor) * 1.1])
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
    .domain(data.map(function(d) { return d.causa; }))
    .padding(.5);
  SVG3.append("g")
    .call(d3.axisLeft(y))

  //Bars
  SVG3.selectAll("myRect")
    .data(data)
    .enter()
    .append("rect")
    .attr("x", x(0) )
    .attr("y", function(d) { return y(d.causa); })
    .attr("width", function(d) { return x(d.valor); })
    .attr("height", y.bandwidth() )
    .attr("fill", "#69b3a2")


    // .attr("x", function(d) { return x(d.causa); })
    // .attr("y", function(d) { return y(d.valor); })
    // .attr("width", x.bandwidth())
    // .attr("height", function(d) { return height - y(d.valor); })
    // .attr("fill", "#69b3a2")

}