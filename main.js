
async function loadJson(file_path) {
  return await d3.json(file_path);
}
let datos; 


const selectFile = d3
  .select("#selectMap")
  .append("select")
  .attr("id", "selectFile")

const selectType = d3
  .select("#selectMap")
  .append("select")
  .attr("id", "selectType")



optionsFile = []
Object.keys(FILES_INFO).forEach(element => {
  optionsFile.push({value: element, text: FILES_INFO[element][0]})
});

// Function to append select with options
function appendSelectWithOptions(data, containerId) {
  var selectElement = document.getElementById(containerId);

  // Iterate over data to create options
  for (var i = 0; i < data.length; i++) {
    var option = document.createElement('option');
    option.value = data[i].value;
    option.text = data[i].text;
    selectElement.appendChild(option);
  }
}

// Call the function to append select with options
appendSelectWithOptions(optionsFile, 'selectFile');

optionsType = []
FILES_INFO[optionsFile[0].value][1].forEach(element => {
  optionsType.push({value: element, text: element})
});

appendSelectWithOptions(optionsType, 'selectType');


const WIDTH = 1400 ;
const HEIGHT = 600 ;
const margin = {
  top: 20,
  right: 10,
  bottom: 20,
  left: 100
}

const width = WIDTH - margin.left - margin.right;
const height = HEIGHT - margin.top - margin.bottom;



async function clickRegionHandler(selectedRegion) {
  const data_vis_2 = await loadJson('data/eAirePorComuna.json');
  if (document.getElementById('vis_2_svg')) {
    document.getElementById('vis_2_svg').remove();
  }
  if (!data_vis_2[selectedRegion]) {
    console.log('no data');
    return
  }
  d3.select('#vis_2').node()
    .appendChild(vis_2(data_vis_2[selectedRegion]))
  document.getElementById('segunda-visualizacion').scrollIntoView({ behavior: "smooth"})
}

const svg = d3
  .select("#vis")
  .append("svg")
  .attr("width", WIDTH)
  .attr("height", HEIGHT)
  .attr("viewBox", [240 , -250, WIDTH / 2, HEIGHT / 2])
  .style('border', '1px solid grey')
  .style('border-radius', '15px');

const contenedorZoom = svg
  .append("g")
  .attr("id", "contenedorZoom")
  .style('border', 'none')

const contenedorMapa = contenedorZoom
  .append("g")
  .attr("id", "contenedorMapa")


async function crearMapa(map_file) {
  let datosMapa = await loadJson(map_file);
  datos = await loadJson("data/eAireRegion.json");
  

  const proyeccion = d3.geoWinkel3()
    .fitSize([width, height], datosMapa);

  const caminosGeo = d3.geoPath().projection(proyeccion);


  // Recurso: https://d3-graph-gallery.com/graph/interactivity_tooltip.html
  // Recurso: https://d3-graph-gallery.com/graph/choropleth_hover_effect.html

  // create a tooltip
  var Tooltip = d3.select(".horizontal-scroll-wrapper")
    .append("div")
    .attr("class", "tooltip");
    

  // Three function that change the tooltip when user hover / move / leave a cell
  var mouseover = function(event,d) {
    d3.selectAll(".regionSVG")
      .transition()
      .duration(100)
      .style("opacity", 0.6)
    d3.select(this)
      .style("stroke", "black")
      .style("opacity", 1)
    Tooltip
      .style("opacity", 1)
    
  };

  var mousemove = function(event, d) {
    d3.select(this)
      .style("stroke", "black")
      .style("opacity", 1)
    Tooltip
      .html(d.properties.Region)
      .style('top', `${event.pageY - 50}px`)
      .style('left', `${event.pageX - 30}px`)

  };

  var mouseleave = function(event,) {
    d3.selectAll(".regionSVG")
      .transition()
      .duration(200)
      .style("opacity", 1)
      .style("stroke", "none")
    Tooltip
      .style("opacity", 0)
    
  };
  

  contenedorMapa
    .selectAll("path")
    .data(datosMapa.features)
    .join("path")
    .attr("d", caminosGeo)
    .attr('class', 'regionSVG')
    .on('click', (e) => clickRegionHandler(e.target.__data__.properties.Region))
    .on("mouseover", mouseover)
    .on("mousemove", mousemove)
    .on("mouseleave", mouseleave);


  let element = document.getElementById('selectType');
  element.dispatchEvent(new Event('change', { bubbles: true }));
}

map_file = "data/regiones.geojson";
crearMapa(map_file);



selectType.on('change', function() {
  const type = this.value; 
  const filteredDict = {};

  for (var region in datos) {
    filteredDict[region] = datos[region][type];
  }
  const values = Object.values(filteredDict);
  const min = d3.min(values, (d) => d);
  const max = d3.max(values, (d) => d);
  const scale = d3.scaleLinear().domain([max, min]).range([0, 1]);
  contenedorMapa  
    .selectAll(".regionSVG")
    .attr("fill", (d, i, _) => {
      let default_ = "rgb(150, 150, 150)";
      const region = d.properties.Region;
      Object.keys(filteredDict).forEach(reg => {
        if (region.includes(reg)) {
          default_ = d3.interpolateRdYlGn(scale(filteredDict[reg]))
        }
      });
      return default_;
    })
  if (document.getElementById('leyend-svg')) {
    document.getElementById('leyend-svg').remove();
  }
  document.getElementById('leyend').appendChild( 
    Legend(d3.scaleSequential([min, max], d3.interpolateRdYlGn), 
      {
        title: "Emisiones (en Toneladas)",
      }
    )
  )
});





////////// zoom ////////////////

let zoom = d3.zoom()
	.on('zoom', handleZoom);

function handleZoom(e) {
	d3.select('#contenedorZoom')
		.attr('transform', e.transform);
}

function initZoom() {
	svg
		.call(zoom);
}

initZoom();
