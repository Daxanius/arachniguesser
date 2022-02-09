<?php
// Checks if a string contains a word
function containsWord($str, $word) {
    return !!preg_match('#\\b' . preg_quote($word, '#') . '\\b#i', $str);
}

// Gets the return header
function getHeader() {
    $index = 'Location: index.php';
    session_start();

    if (!$_SESSION || !$_SESSION['spider'] || !$_SERVER['REQUEST_METHOD'] == 'POST') {
        return $index;
    }

    $name = strtolower(trim($_POST['spider_name']));
    
    if (empty($name) || $name == '') {
        return $index;
    }

    $spider = strtolower(trim($_SESSION['spider']->taxon->name));
    $rank = strtolower(trim($_SESSION['spider']->taxon->rank));

    if (containsWord($name, $spider)) {
        return ($index . "?success=true&message=Correct, the {$rank} was {$spider}! You wrote: \"{$name}\"");
    } else {
        return ($index . "?fail=true&message=Incorrect, the {$rank} was {$spider}! You wrote: \"{$name}\"");
    }
}

header(getHeader());
?>