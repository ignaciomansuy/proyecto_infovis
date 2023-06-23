
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






const WIDTH = 4000 ;
const HEIGHT = 2500 ;
const margin = {
  top: 20,
  right: 50,
  bottom: 20,
  left: 1400
}

const width = WIDTH - margin.left - margin.right;
const height = HEIGHT - margin.top - margin.bottom;

const svg = d3
  .select("#vis")
  .append("svg")
  .attr("width", WIDTH)
  .attr("height", HEIGHT);

const contenedorMapa = svg
  .append("g")
  .attr("id", "contenedorMapa")



async function crearMapa(map_file) {
  let datosMapa = await loadJson(map_file);

  const proyeccion = d3.geoWinkel3()
    .fitSize([width, height], datosMapa);

  const caminosGeo = d3.geoPath().projection(proyeccion);

  contenedorMapa
    .selectAll("path")
    .data(datosMapa.features)
    .join("path")
    .attr("d", caminosGeo)
    .attr('class', 'regionSVG')

  svg.attr('transform', 'rotate(15)');
  datos = await loadJson("data/eAireDifusas.json");

}

map_file = "data/regiones.geojson";
crearMapa(map_file);



selectType.on('change', function() {
  const type = this.value; 
  var filteredDict = {};

  for (var region in datos) {
    filteredDict[region] = datos[region][type];
  }
  const values = Object.values(filteredDict);
  const min = d3.min(values, (d) => d);
  const max = d3.max(values, (d) => d);
  const scale = d3.scaleLinear().domain([0, max]).range([1, 0]);
  contenedorMapa  
    .selectAll(".regionSVG")
    .attr("fill", (d, i, _) => {
      let default_ = "rgb(150, 150, 150)";
      const region = d.properties.Region;
      Object.keys(filteredDict).forEach(reg => {
        if (region.includes(reg)) {
          console.log(d3.interpolateRdYlGn(scale(filteredDict[reg])))
          default_ = d3.interpolateRdYlGn(scale(filteredDict[reg]))
        }
      });
      return default_;
    })
});
