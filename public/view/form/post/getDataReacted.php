<?php

/**
 * Executa a reação
 */

use Entity\React;

$table = strip_tags(trim(filter_input(INPUT_POST, "entity")));
$data['data'] = filter_input(INPUT_POST, "dados", FILTER_DEFAULT, FILTER_REQUIRE_ARRAY);

if(is_string($table) && is_array($data['data'])) {

    $react = new React("create", $table, $data['data'], []);
    $react = $react->getResponse();

    if (!empty($react["error"]))
        $data['error'] = $react["error"];
    elseif(!empty($react["data"]))
        $data['data'] = $react["data"];
}