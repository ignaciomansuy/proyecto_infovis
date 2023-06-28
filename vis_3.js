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

const xAxisG = SVG3.append("g")
  .attr("transform", "translate(0," + height_3 + ")")
  .attr("id", "xAxisG");

const yAxisG = SVG3.append("g")
  .attr("id", "yAxisG");

// Parse the Data
function vis3(data) {
  
  var x = d3.scaleLinear()
    .domain([0, d3.max(data, (d) => d.valor) * 1.1])
    .range([ 0, width_3]);

  d3.select('#xAxisG')
    .call(d3.axisBottom(x))
    .selectAll("text")
      .attr("transform", "translate(-10,0)rotate(-45)")
      .style("text-anchor", "end");

  // Y axis
  var y = d3.scaleBand()
    .range([ 0, height_3 ])
    .domain(data.map(function(d) { return d.causa; }))
    .padding(.5);
  d3.select('#yAxisG')
    .call(d3.axisLeft(y))

  //Bars
  SVG3.selectAll(".bar")
    .data(data, d => d.causa)
    .join( enter => {
      enter
      .append("rect")
      .attr("x", x(0) )
      .attr("y", function(d) { return y(d.causa); })
      .attr("height", y.bandwidth() )
      .attr("fill", "#69b3a2")
      .transition().duration(2000)
      .attr("width", function(d) { return x(d.valor); })
    },
    update => update.transition().duration(2000).attr("width", function(d) { return x(d.valor); }),
    exit => exit.remove()
    )


    // .attr("x", function(d) { return x(d.causa); })
    // .attr("y", function(d) { return y(d.valor); })
    // .attr("width", x.bandwidth())
    // .attr("height", function(d) { return height - y(d.valor); })
    // .attr("fill", "#69b3a2")

}