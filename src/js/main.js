// Constants
const GET_REQUEST_ARACHNID = "https://www.inaturalist.org/observations.json?iconic_taxa%5B%5D=Arachnida&has%5B%5D=photos&has%5B%5D=geo&per_page=1&quality_grade=research&page={page}";
const GET_REQUEST_HISTOGRAM = "https://api.inaturalist.org/v1/observations/histogram?identifications=most_agree&quality_grade=research&date_field=observed&interval=month_of_year&taxon_id={id}";

// Map settings
const DEFAULT_ZOOM = 10;

// Globals
let arachnid;
let chart;
let map;

// sets up all values
const setup = async () => {
  let btnGuessElement = document.getElementById("btnGuess");
  btnGuessElement.setAttribute("disabled", true);
  btnGuessElement.addEventListener("click", handleGuess);

  let arachnidNameElement = document.getElementById("arachnidName");
  arachnidNameElement.addEventListener("input", checkEmptyName)
  arachnidNameElement.addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
      event.preventDefault();
      btnGuessElement.click();
    }
  });

  const chartElement = document.getElementById('observationsChart').getContext('2d');
  chart = new Chart(chartElement, {
    type: 'bar',
    data: {
      labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
      datasets: [{
        label: 'Number of observations',
        backgroundColor: [
          'rgba(255, 99, 132, 0.2)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
        ],
        borderWidth: 1
      }]
    },
    options: {
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });

  let resultModalElement = document.getElementById('resultModal');
  resultModalElement.addEventListener("hidden.bs.modal", loadArachnid);

  await loadArachnid();
}

const checkEmptyName = () => {
  let arachnidNameElement = document.getElementById("arachnidName");
  let btnGuessElement = document.getElementById("btnGuess");

  if (arachnidNameElement.value.trim() === "" || arachnidNameElement.value === null) {
    btnGuessElement.setAttribute("disabled", true);
    return;
  }

  btnGuessElement.removeAttribute("disabled");
}

// Load an arachnid
const loadArachnid = async () => {
  await setLoading(true);

  let arachnidNameElement = document.getElementById("arachnidName");
  let arachnidElement = document.getElementById("imgArachnid");
  let parRankElement = document.getElementById("parRank");
  let mapElement = document.getElementById("map");
  let parMapElement = document.getElementById("parMap");
  let imgElement = document.getElementById("imgElement");
  let btnGuessElement = document.getElementById("btnGuess");
  arachnid = await getRandomArachnid();

  arachnidElement.onload = async () => {
    await setLoading(false);
    mapElement.innerHTML = "";

    // Loading in the map trough openlayers
    const iconFeature = new ol.Feature({
      geometry: new ol.geom.Point(ol.proj.fromLonLat([arachnid.longitude, arachnid.latitude])),
      name: 'Estimated picture location',
    });

    map = new ol.Map({
      target: 'map',
      layers: [
        new ol.layer.Tile({
          source: new ol.source.OSM()
        }),
        new ol.layer.Vector({
          source: new ol.source.Vector({
            features: [iconFeature]
          }),
          style: new ol.style.Style({
            image: new ol.style.Icon({
              anchor: [0.5, 46],
              anchorXUnits: 'fraction',
              anchorYUnits: 'pixels',
              src: './images/marker.png'
            })
          })
        })
      ],
      view: new ol.View({
        center: ol.proj.fromLonLat([arachnid.longitude, arachnid.latitude]),
        zoom: DEFAULT_ZOOM
      })
    });
  };

  let data = await getObservations(arachnid.taxon.id);
  chart.data.datasets.forEach((dataset) => {
    dataset.data =  data;
    dataset.label = "Number of observations";
  });


  // chart.data.datasets.data = await getObservations(arachnid.taxon.id);
  chart.update();

  let rank = arachnid.taxon.rank;
  arachnidNameElement.value = "";
  btnGuessElement.setAttribute("disabled", true);
  arachnidNameElement.setAttribute("placeholder", rank.charAt(0).toUpperCase() + rank.slice(1));
  parRankElement.innerHTML = `Guess the arachnid <b>${rank}</b>! Case-insensitive.`;
  parMapElement.innerHTML = `${arachnid.place_guess} | ${arachnid.time_zone}`;
  imgElement.innerHTML = `<img src=${arachnid.photos[0].medium_url}>`;
  arachnidElement.src = arachnid.photos[0].medium_url;
}

// Handles a user guess
const handleGuess = async () => {
  let nameGuessUnfiltered = document.getElementById("arachnidName").value;
  let nameGuess = nameGuessUnfiltered.trim().toLowerCase();
  let nameArachnid = arachnid.taxon.name.trim().toLowerCase();
  let resultElement = document.getElementById("resultElement");

  // Remove any previous notifications
  let i, elements = document.getElementsByClassName('alert');
  for (i = elements.length; i--;) {         
    elements[i].parentNode.removeChild(elements[i]);             
  }

  const resultModal = new bootstrap.Modal('#resultModal', {

  })

  if (nameGuess === nameArachnid) {
    resultElement.innerHTML = `<div class="badge bg-success">Correct</div><br><p>The ${arachnid.taxon.rank} was ${arachnid.taxon.name}, you wrote: "${nameGuessUnfiltered}".</p>`;
  } else {
    resultElement.innerHTML = `<div class="badge bg-danger">Incorrect</div><br><p>The ${arachnid.taxon.rank} was ${arachnid.taxon.name}, you wrote: "${nameGuessUnfiltered}".</p>`;
  }

  await resultModal.show();
}

// Gets a random Arachnid
const getRandomArachnid = async () => {
  let page = Math.floor(Math.random() * 100);
  return await getArachnid(page);
}

// Gets an Arachnid
const getArachnid = async (page) => {
  let responseJson = await fetch(GET_REQUEST_ARACHNID.replace("{page}", page));
  let response = await responseJson.json();
  return response[0];
}

const getObservations = async (taxon_id) => {
  let responseJson = await fetch(GET_REQUEST_HISTOGRAM.replace("{id}", taxon_id));
  let response = await responseJson.json();

  let array = [
    response.results.month_of_year[1],
    response.results.month_of_year[2],
    response.results.month_of_year[3],
    response.results.month_of_year[4],
    response.results.month_of_year[5],
    response.results.month_of_year[6],
    response.results.month_of_year[7],
    response.results.month_of_year[8],
    response.results.month_of_year[9],
    response.results.month_of_year[10],
    response.results.month_of_year[11],
    response.results.month_of_year[12]
  ]

  return array;
}

// Shows a loading spinner
const setLoading = async (value) => {
  let spinnerElement = document.getElementById("spinner");
  let messageElement = document.getElementById("spinnderMessage");
  let interfaceElements = document.querySelectorAll(".interface");

  if (value === true) {
    for (let i = 0; i < interfaceElements.length; i++) {
      interfaceElements[i].setAttribute("hidden", true);
    }

    messageElement.innerHTML = getRandomLoadingMessage();
    spinnerElement.removeAttribute("hidden");
  } else {
    spinnerElement.setAttribute("hidden", true);

    for (let i = 0; i < interfaceElements.length; i++) {
      interfaceElements[i].removeAttribute("hidden");
    }
  }
}

window.addEventListener("load", setup);