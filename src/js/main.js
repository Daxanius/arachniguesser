// Constants
const GET_REQUEST_ARACHNID = "https://www.inaturalist.org/observations.json?iconic_taxa%5B%5D=Arachnida&has%5B%5D=photos&has%5B%5D=geo&per_page=1&quality_grade=research&page={page}";
const GET_REQUEST_HISTOGRAM = "https://api.inaturalist.org/v1/observations/histogram?identifications=most_agree&quality_grade=research&date_field=observed&interval=month_of_year&taxon_id={id}";

const DEFAULT_ZOOM = 10;

// Globals
let arachnid;
let chart;
let map;

// sets up all values
const setup = async () => {
  // Setting up the button
  let btnGuessElement = document.getElementById("btnGuess");
  btnGuessElement.setAttribute("disabled", true);
  btnGuessElement.addEventListener("click", handleGuess);

  // Setting up the input element
  let arachnidNameElement = document.getElementById("arachnidName");
  arachnidNameElement.addEventListener("input", checkEmptyName)
  arachnidNameElement.addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
      event.preventDefault();
      btnGuessElement.click();
    }
  });

  // Initialising the map & managing the loading screen
  let arachnidElement = document.getElementById("imgArachnid");
  let mapElement = document.getElementById("map");
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

  // Setting up the chart
  const chartElement = document.getElementById('observationsChart').getContext('2d');
  chart = new Chart(chartElement, {
    type: 'bar',
    data: {
      labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
      datasets: [{
        label: 'Number of observations',
        backgroundColor: [
          'rgba(255, 193, 7, 1)',
        ],
        borderColor: [
          'rgba(0, 0, 0, 1)',
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

  // Setting up the result modal
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
  let parMapElement = document.getElementById("parMap");
  let imgElement = document.getElementById("imgElement");
  let btnGuessElement = document.getElementById("btnGuess");

  arachnid = await getRandomArachnid();

  // Updating the chart
  let data = await getObservations(arachnid.taxon.id);
  chart.data.datasets.forEach((dataset) => {
    dataset.data =  data;
    dataset.label = "Number of observations";
  });
  chart.update();

  // Updating the other data
  arachnidNameElement.value = "";
  btnGuessElement.setAttribute("disabled", true);
  arachnidNameElement.setAttribute("placeholder", arachnid.taxon.rank.charAt(0).toUpperCase() + arachnid.taxon.rank.slice(1));
  parRankElement.innerHTML = `Guess the arachnid <b>${arachnid.taxon.rank}</b>! Case-insensitive.`;
  parMapElement.innerHTML = `${arachnid.place_guess} | ${arachnid.time_zone}`;

  // Adding photos to the modal
  imgElement.innerHTML = "";
  for (let i = 0; i < arachnid.photos.length; i++) {
    imgElement.insertAdjacentHTML("beforeend", `<div class="pb-3"><img src=${arachnid.photos[i].medium_url}></div>`);
  }

  // Finally, adding the arachnid photo
  arachnidElement.src = arachnid.photos[0].medium_url;
}

// Handles a user guess
const handleGuess = async () => {
  let nameGuessUnfiltered = document.getElementById("arachnidName").value;
  let resultElement = document.getElementById("resultElement");

  let nameGuess = nameGuessUnfiltered.trim().toLowerCase();
  let nameArachnid = arachnid.taxon.name.trim().toLowerCase();

  // Remove any previous notifications
  let i, elements = document.getElementsByClassName('alert');
  for (i = elements.length; i--;) {         
    elements[i].parentNode.removeChild(elements[i]);             
  }

  const resultModal = new bootstrap.Modal('#resultModal', undefined)

  if (nameGuess === nameArachnid) {
    resultElement.innerHTML = `<div class="badge bg-success">Correct</div><br><p>The ${arachnid.taxon.rank} was ${arachnid.taxon.name}, you wrote: "${nameGuessUnfiltered}".</p>`;
  } else {
    resultElement.innerHTML = `<div class="badge bg-danger">Incorrect</div><br><p>The ${arachnid.taxon.rank} was ${arachnid.taxon.name}, you wrote: "${nameGuessUnfiltered}".</p>`;
  }

  await resultModal.show();
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

// Gets the amount of observations for each month
const getObservations = async (taxon_id) => {
  let responseJson = await fetch(GET_REQUEST_HISTOGRAM.replace("{id}", taxon_id));
  let response = await responseJson.json();

  let array = [];
  for (let i = 1; i < 12; i++) {
    array.push(response.results.month_of_year[i]);
  }

  return array;
}

window.addEventListener("load", setup);