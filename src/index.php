<?php
  // Code for getting a spooder
  require 'func.php';
  session_start();

  $app_name = 'Arachniguesser';

  $_SESSION['spider'] = GetRandomSpider();
  $image = $_SESSION['spider']->photos[0]->medium_url;
  $rank = $_SESSION['spider']->taxon->rank;
?>

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title><?php echo $app_name;?></title>
  <link rel="icon" type="image/x-icon" href="images/favicon.ico">
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-1BmE4kWBq78iYhFldvKuhfTAU6auU8tT94WrHftjDbrCEXSU1oBoqyl2QvZ6jIW3" crossorigin="anonymous">
  <link rel="stylesheet" href="styles/stylesheet.css">
</head>

<body class="d-flex flex-column min-vh-100">
  <script src="js/main.js"></script>
  <script>
    // Makes a popup appear based on URL parameters
    if (getParameter('success') == 'true') {
      document.write(`<div class=\"alert alert-success alert-dismissible fade show\" role=\"alert\">${getParameter('message')}<button type=\"button\" class=\"btn-close\" data-bs-dismiss=\"alert\" aria-label=\"Close\"></button></div>`)
    } else if (getParameter('fail')  == 'true') {
      document.write(`<div class=\"alert alert-danger alert-dismissible fade show\" role=\"alert\">${getParameter('message')}<button type=\"button\" class=\"btn-close\" data-bs-dismiss=\"alert\" aria-label=\"Close\"></button></div>`);
    }
    
    // Removes URL parameters after use
    window.history.pushState({}, document.title, window.location.pathname);
  </script>

  <main>
    <div class="px-4 py-5 text-center">
      <h1 class="display-5 fw-bold"><?php echo $app_name;?></h1>

      <div class="col-lg-3 mx-auto">
        <div>
          <img class="img-fluid" src="<?php echo $image;?>">
          <p class="lead mb-4">Guess the arachnid <b><?php echo $rank;?></b>! Case-insensitive.</p>
        </div>

        <form name="guessForm" action="guess.php" method="POST" onsubmit="return validateForm()">
          <div class="form-floating">
            <input type="text" class="form-control text-light bg-dark" id="floatingInput" name="spider_name" autocomplete="off">
            <label for="floatingInput">Write down the <b><?php echo $rank;?></b> of the arachnid</label>
          </div>
          <button class="w-100 btn btn-lg btn-warning" type="submit" required>Make a guess!</button>
        </form>
      </div>
    </div>
  </main>

  <footer class="container py-3 my-4 mt-auto">
    <ul class="nav justify-content-center border-bottom pb-3 mb-3">
      <li class="nav-item">Spider Database: <a href="https://wsc.nmbe.ch/" target="_blank">World spider Catalog</a></li>
      <li class="nav-item">Information Source: <a href="https://www.inaturalist.org/" target="_blank">iNaturalist</a></li>
    </ul>
    <p class="text-center text-muted">Made by Daxanius, please note that these may not be 100% accurate.</p>
  </footer>

  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js" integrity="sha384-ka7Sk0Gln4gmtz2MlQnikT1wXgYsOg+OMhuP+IlRH9sENBO0LRn5q+8nbTov4+1p" crossorigin="anonymous"></script>
</body>
</html>