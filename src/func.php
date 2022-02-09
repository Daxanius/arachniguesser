<?php
function GetSpider($page, $id) {
    $api_url = "https://www.inaturalist.org/observations.json?&iconic_taxa[]=Arachnida&has[]=photos&per_page=200page={$page}";

    $json_data = trim(file_get_contents($api_url));

    if (!$json_data || $json_data == '' || $json_data == "[]") {
        return null;
    }

    $spider = json_decode($json_data)[$id];

    if(empty($spider)){
        return null;
    }

    return $spider;
}

function GetRandomSpider() {
    do {
        $spider = GetSpider(rand(0, 13000),rand(1, 200));
    } while (!isset($spider) || $spider == null || $spider == false);

    return $spider;
}
?>