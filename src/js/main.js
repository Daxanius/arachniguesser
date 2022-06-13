// Constants
const WEB_REQUEST = "https://www.inaturalist.org/observations.json?iconic_taxa%5B%5D=Arachnida&has%5B%5D=photos&has%5B%5D=geo&per_page=1&quality_grade=research&page={page}";

// Storage management
const SCORE_DEFAULT = 0;
const KEY_SCORE = "ag_score";
const KEY_SCORE_HIGH = "ag_score_high";

// Map settings
const DEFAULT_ZOOM = 10;

// Globals
let arachnid;
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

  const ctx = document.getElementById('myChart').getContext('2d');
  const myChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
      datasets: [{
        label: '# of observations',
        data: [12, 19, 3, 5, 2, 3, 20, 10],
        backgroundColor: [
          'rgba(255, 99, 132, 0.2)',
          'rgba(54, 162, 235, 0.2)',
          'rgba(255, 206, 86, 0.2)',
          'rgba(75, 192, 192, 0.2)',
          'rgba(153, 102, 255, 0.2)',
          'rgba(255, 159, 64, 0.2)'
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)'
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
  let response = await fetch(WEB_REQUEST.replace("{page}", page));
  let responseJson = await response.json();
  return responseJson[0];
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