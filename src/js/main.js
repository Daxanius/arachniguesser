var arachnid;

// sets up all values
const setup = async () => {
  let guessForm = document.getElementById("btnGuess");
  guessForm.addEventListener("click", handleGuess);

  const arachnidElement = document.getElementById("imgArachnid");
  const parRankElement = document.getElementById("parRank");
  const lblRankElement = document.getElementById("lblRank");
  arachnid = await getRandomArachnid();

  arachnidElement.src = arachnid.photos[0].medium_url;
  parRankElement.innerHTML = `Guess the arachnid <b>${arachnid.taxon.rank}</b>! Case-insensitive.`;
  lblRankElement.innerHTML = `Write down the <b>${arachnid.taxon.rank}</b> of the arachnid`;
}

// Handles a user guess
const handleGuess = () => {
  let nameGuessUnfiltered = document.getElementById("arachnidName").value;
  let nameGuess = nameGuessUnfiltered.trim().toLowerCase();
  let nameArachnid = arachnid.taxon.name.trim().toLowerCase();
  let body = document.getElementById("body");

  if (nameGuess === "") {
    alert("Name must be filled out");
    return;
  }

  // Remove any previous notifications
  let i, elements = document.getElementsByClassName('alert');
  for (i = elements.length; i--;) {         
    elements[i].parentNode.removeChild(elements[i]);             
  }

  if (nameGuess === nameArachnid) {
    body.innerHTML = `<div class="alert alert-success alert-dismissible fade show" role="alert">Correct, the ${arachnid.taxon.rank} was ${arachnid.taxon.name}! You wrote: \"${nameGuessUnfiltered}\"<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button></div>` + body.innerHTML;
  } else {
    body.innerHTML = `<div class="alert alert-danger alert-dismissible fade show" role="alert">Incorrect, the ${arachnid.taxon.rank} was ${arachnid.taxon.name}! You wrote: \"${nameGuessUnfiltered}\"<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button></div>` + body.innerHTML;
  }
  
  setup();
}

// Gets a random Arachnid
const getRandomArachnid = async () => {
  const random = Math.round(Math.random() * 100);
  return await getArachnid(random);
}

// Gets an Arachnid
const getArachnid = async (page) => {
  const URL = `https://www.inaturalist.org/observations.json?&iconic_taxa[]=Arachnida&has[]=photos&per_page=1&page=${page}`;
  let response = await fetch(URL);
  let responseJson = await response.json();
  return responseJson[0];
}

window.addEventListener("load", setup);