// Checks the input value
function validateForm() {
    var name = document.forms["guessForm"]["spider_name"].value;

    if (name == "") {
      alert("Name must be filled out");
      return false;
    }
}

// Gets URL parameters
getParameter = (key) => {
    address = window.location.search;
    parameterList = new URLSearchParams(address);

    return parameterList.get(key);
}