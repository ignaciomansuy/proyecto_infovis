function vis_2(data) {
  console.log(data);
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

  const svg = d3.create("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [-width , -height * 0.69 -20, width * 2, height * 2])
      .attr("style", "width: 100%; height: auto; font: 10px sans-serif;")
      .attr('id', 'vis_2_svg');

  // A group for each series, and a rect for each element in the series
  svg.append("g")
    .selectAll()
    .data(series)
    .join("g")
      .attr("fill", d => color(d.key))
    .selectAll("path")
    .data(D => D.map(d => (d.key = D.key, d)))
    .join("path")
      .attr("d", arc)
    .append("title")
      .text(d => `${d.data[0]} ${d.key}\n${formatValue(d.data[1].get(d.key) ? d.data[1].get(d.key).emision : 0)}`);

  // x axis
  svg.append("g")
      .attr("text-anchor", "middle")
    .selectAll()
    .data(x.domain())
    .join("g")
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

  // y axis
  svg.append("g")
      .attr("text-anchor", "middle")
      .call(g => g.append("text")
          .attr("y", d => -y(y.ticks(5).pop()))
          .attr("dy", "-1.5em")
          .text("Emisiones (en toneladas)"))
          .attr('style', 'font-size: 15px;')
      .call(g => g.selectAll("g")
        .data(y.ticks(5).slice(1))
        .join("g")
          .attr("fill", "none")
          .call(g => g.append("circle")
              .attr("stroke", "#000")
              .attr("stroke-opacity", 0.5)
              .attr("r", y))
          .call(g => g.append("text")
              .attr("y", d => -y(d))
              .attr("dy", "0.35em")
              .attr("stroke", "#fff")
              .attr("stroke-width", 5)
              .text(y.tickFormat(5, "s"))
            .clone(true)
              .attr("fill", "#000")
              .attr("stroke", "none")));

  // color legend
  svg.append("g")
    .selectAll()
    .data(color.domain())
    .join("g")
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

  return svg.node();
}