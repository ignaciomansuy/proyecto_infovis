function vis_2(data) {
  const width = 600;
  const height = width;
  const innerRadius = 180;
  const outerRadius = Math.min(width, height) * 0.67;

  // Stack the data into series by contaminante
  const series = d3.stack()
      .keys(d3.union(data.map(d => d.contaminante))) // distinct series keys, in input order
      .value(([, D], key) => D.get(key) ? D.get(key).emision : 0) // get value for each series key and stack
    (d3.index(data, d => d.comuna, d => d.contaminante)); // group by stack then series key

  const arc = d3.arc()
      .innerRadius(d => y(d[0]))
      .outerRadius(d => y(d[1]))
      .startAngle(d => x(d.data[0]))
      .endAngle(d => x(d.data[0]) + x.bandwidth())
      .padAngle(1.5 / innerRadius)
      .padRadius(innerRadius);

  // An angular x-scale
  const x = d3.scaleBand()
      .domain(d3.groupSort(data, D => -d3.sum(D, d => d.emision), d => d.comuna))
      .range([0, 2 * Math.PI])
      .align(0);

  // A radial y-scale maintains area proportionality of radial bars
  const y = d3.scaleRadial()
      .domain([0, d3.max(series, d => d3.max(d, d => d[1]))])
      .range([innerRadius, outerRadius]);

  const color = d3.scaleOrdinal()
      .domain(series.map(d => d.key))
      .range(d3.schemeSpectral[series.length])
      .unknown("#ccc");

  // A function to format the value in the tooltip
  const formatValue = x => isNaN(x) ? "N/A" : x.toLocaleString("en")

  
  SVG2
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [ -600 , -height * 0.69 -20, width * 2, height * 2])
      .attr("style", "width: 100%; height: auto; font: 10px sans-serif;");

  // A group for each series, and a rect for each element in the series
  d3.select('.g-groups')
    .selectAll('.groups')
    .data(series, d=> (d[0].data[0], d[0].key))
    .join(
      enter => {
        const G = enter.append("g")
          .attr("fill", d => color(d.key))
          .attr("class", "groups")
          .selectAll("path")
          .data(D => D.map(d => (d.key = D.key, d)))
          .join("path")
            .attr("d", arc)
            .style("opacity", 0)
            .transition().duration(1000)
            .style("opacity", 1)
        return G;
      },
      update => update,
      exit => exit.remove()
    )
      
    
    
  // x axis
  d3.select("#g-x-axis")
    .selectAll('.x-axis')
    .data(x.domain(), d=> d)
    .join(
      enter => {
        const G = enter.append("g")
        .attr("class", "x-axis")
        .attr("transform", d => `
          rotate(${((x(d) + x.bandwidth() / 2) * 180 / Math.PI - 90)})
          translate(${innerRadius},0)
        `)
        .call(g => g.append("line")
            .attr("x2", -5)
            .attr("stroke", "#000"))
        .call(g => g.append("text")
            .attr("transform", d => (x(d) + x.bandwidth() / 2 + Math.PI / 2) % (2 * Math.PI) < Math.PI
                ? "rotate(90)translate(0,16)"
                : "rotate(-90)translate(0,-9)")
            .text(d => d))
            .attr('style', 'font-size: 10px;')
        return G;
      },
      update => {
        update
        .attr("transform", d => `
            rotate(${((x(d) + x.bandwidth() / 2) * 180 / Math.PI - 90)})
            translate(${innerRadius},0)`)
        .call(g => g.select("text")
          .attr("transform", d => (x(d) + x.bandwidth() / 2 + Math.PI / 2) % (2 * Math.PI) < Math.PI
                  ? "rotate(90)translate(0,16)"
                  : "rotate(-90)translate(0,-9)"))
            return update},
      exit => {
        exit.remove()
      }
    )

  // y axis
  const yAxis = d3.select('#y-axis-title')
  if (!yAxis.empty()) yAxis.remove();
    
  let tick = y.ticks(5).slice(1)

  let final_ticks = []
  tick.forEach((d, i) => {
    final_ticks.push([i, d])
  })
  d3.select("#g-y-axis")
    .call(
      g => g.append("text")
        .attr('id', 'y-axis-title')
        .attr("y", d => -y(y.ticks(5).pop()))
        .attr("dy", "-1.5em")
        .text("Emisiones por comuna (en toneladas)")
      )
    .attr('style', 'font-size: 15px;')
    .call(g => 
      g.selectAll(".ticks")
      .data(final_ticks, d => d)  
      .join(
        enter => {
          const G = enter.append("g")
          .attr("class", "ticks")
          .attr("fill", "none")
          .call(g => g.append("circle")
              .attr("stroke", "#000")
              .attr("stroke-opacity", 0.5)
              .transition()
              .duration(1000)
              .attr("r", (d) => y(d[1])))
          .call(g => g.append("text")
              .attr('id', 'y-axis-text')
              .attr("y", d => {console.log(d); return -y(d[1])})
              .attr("dy", "0.35em")
              .attr("stroke", "#fff")
              .attr("stroke-width", 5)
              .text(d => y.tickFormat(5, "s")(d[1]))
              .clone(true)
                .attr("fill", "#000")
                .attr("stroke", "none")
                .attr('class', 'y-axis-text-clone')
          )
          return G;
        },
        update => {
          update.select("circle").transition()
            .duration(1000).attr("r", (d) => y(d[1]))
          update.select('.y-axis-text')
            .attr("y", d => -y(d[1]))
            .text(d => y.tickFormat(5, "s")(d[1]))
            .clone(true)
              .attr("fill", "#000")
              .attr("stroke", "none")
          return update;
        },
        exit => {
          exit.remove()
        }
      )
      );

  // color legend
  d3.select("#g-color-legend")
    .selectAll('.color-legend')
    .data(color.domain())
    .join("g")
      .attr("class", "color-legend")
      .attr("transform", (d, i, nodes) => `translate(-60,${(nodes.length / 2 - i - 1) * 20})`)
      .call(g => g.append("rect")
          .attr("width", 18)
          .attr("height", 18)
          .attr("fill", color))
      .call(g => g.append("text")
          .attr("x", 24)
          .attr("y", 9)
          .attr("dy", "0.35em")
          .text(d => d));

}