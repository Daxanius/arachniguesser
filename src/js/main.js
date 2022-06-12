// Constants
const WEB_REQUEST = "https://www.inaturalist.org/observations.json?&iconic_taxa%5B%5D=Arachnida&has%5B%5D=photos&has%5B%5D=geo&per_page=1&quality_grade=research&page={page}";

// Storage management
const SCORE_DEFAULT = 0;
const KEY_SCORE = "ag_score";
const KEY_SCORE_HIGH = "ag_score_high";

// Map settings
const DEFAULT_ZOOM = 10;

// Globals
let arachnid;
let map;

function fixContentHeight(){
  var viewHeight = $(window).height();
  var header = $("div[data-role='header']:visible:visible");
  var navbar = $("div[data-role='navbar']:visible:visible");
  var content = $("div[data-role='content']:visible:visible");
  var contentHeight = viewHeight - header.outerHeight() - navbar.outerHeight();
  content.height(contentHeight);
  map.updateSize();
}

// sets up all values
const setup = async () => {
  let guessForm = document.getElementById("btnGuess");
  guessForm.addEventListener("click", handleGuess);

  updateScore();
  await loadArachnid();
}

// Load an arachnid
const loadArachnid = async () => {
  await setLoading(true);

  let arachnidNameElement = document.getElementById("arachnidName");
  let arachnidElement = document.getElementById("imgArachnid");
  let parRankElement = document.getElementById("parRank");
  let mapElement = document.getElementById("map");
  let parMapElement = document.getElementById("parMap");
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
  arachnidNameElement.setAttribute("placeholder", rank.charAt(0).toUpperCase() + rank.slice(1));
  parRankElement.innerHTML = `Guess the arachnid <b>${rank}</b>! Case-insensitive.`;
  parMapElement.innerHTML = `${arachnid.place_guess} | ${arachnid.zic_time_zone} | ${arachnid.time_zone}`;
  arachnidElement.src = arachnid.photos[0].medium_url;
}

// Handles a user guess
const handleGuess = async () => {
  let nameGuessUnfiltered = document.getElementById("arachnidName").value;
  let nameGuess = nameGuessUnfiltered.trim().toLowerCase();
  let nameArachnid = arachnid.taxon.name.trim().toLowerCase();
  let body = document.getElementById("body");

  if (nameGuess === "") {
    alert(`${arachnid.taxon.rank} must be filled out`);
    return;
  }

  // Remove any previous notifications
  let i, elements = document.getElementsByClassName('alert');
  for (i = elements.length; i--;) {         
    elements[i].parentNode.removeChild(elements[i]);             
  }


  if (nameGuess === nameArachnid) {
    addScore(1);
    body.insertAdjacentHTML("beforebegin", `<div class="alert alert-success alert-dismissible fade show" role="alert">Correct, the ${arachnid.taxon.rank} was ${arachnid.taxon.name}! You wrote: \"${nameGuessUnfiltered}\"<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button></div>`);
  } else {
    resetScore();
    body.insertAdjacentHTML("beforebegin",`<div class="alert alert-danger alert-dismissible fade show" role="alert">Incorrect, the ${arachnid.taxon.rank} was ${arachnid.taxon.name}! You wrote: \"${nameGuessUnfiltered}\"<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button></div>`);
  }
  
  await loadArachnid();
}

// Gets a random Arachnid
const getRandomArachnid = async () => {
  let page = Math.floor(Math.random() * 100);
  return await getArachnid(page);
}

// Gets an Arachnid
const getArachnid = async (page, month) => {
  let response = await fetch(WEB_REQUEST.replace("{page}", page));
  let responseJson = await response.json();
  return responseJson[0];
}

const updateScore = () => {
  let highScoreElement = document.getElementById("highScore");
  let scoreElement = document.getElementById("score");

  let scoreStg = Number.parseInt(localStorage.getItem(KEY_SCORE));
  let scoreHighStg = Number.parseInt(localStorage.getItem(KEY_SCORE_HIGH));

  if (scoreStg === null || isNaN(scoreStg)) {
    scoreStg = 0;
  }

  if (scoreHighStg === null || isNaN(scoreHighStg)) {
    scoreHighStg = 0;
  }

  highScoreElement.innerHTML = `Highscore: ${scoreHighStg}`;
  scoreElement.innerHTML = `Score: ${scoreStg}`;
}

// Ads a set amount of points to the score
const addScore = (score) => {
  let highScoreElement = document.getElementById("highScore");
  let scoreElement = document.getElementById("score");

  let scoreStg = Number.parseInt(localStorage.getItem(KEY_SCORE));
  let scoreHighStg = Number.parseInt(localStorage.getItem(KEY_SCORE_HIGH));

  if (scoreStg === null || isNaN(scoreStg)) {
    scoreStg = 0;
  }

  if (scoreHighStg === null || isNaN(scoreHighStg)) {
    scoreHighStg = 0;
  }

  scoreStg += Math.max(score, 0);

  localStorage.setItem(KEY_SCORE, scoreStg);
  if (scoreStg > scoreHighStg) {
    localStorage.setItem(KEY_SCORE_HIGH, scoreStg);
  }

  updateScore();
}

// Resets the score
const resetScore = () => {
  localStorage.setItem(KEY_SCORE, SCORE_DEFAULT);
  updateScore();
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