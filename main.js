
async function loadJson(file_path) {
  return await d3.json(file_path);
}


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

  svg.attr('transform', 'rotate(15)');

}

map_file = "data/regiones.geojson";
crearMapa(map_file);


selectType.on('change', function() {
  const type = this.value; 
  var filteredDict = {};

  for (var region in FILES_INFO) {
    filteredDict[region] = FILES_INFO[region][type];
  }
  contenedorMapa
    .selectAll("path")
    .attr("fill", function(d) {4
      console.log(d);
    })
});
