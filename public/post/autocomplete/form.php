<?php
$entity = strip_tags(trim(filter_input(INPUT_POST, 'entity')));
$column = str_replace('dados.', '', strip_tags(trim(filter_input(INPUT_POST, 'column'))));
$value = strip_tags(trim(filter_input(INPUT_POST, 'val')));
$id = filter_input(INPUT_POST, 'id', FILTER_VALIDATE_INT);

$sqlC = "";
$place =  ["m" => $value];
if($id > 0) {
    $sqlC = " && id != :id";
    $place["id"] = $id;
}

$read = new \ConnCrud\Read();
$read->exeRead($entity, "WHERE {$column} = :m" . $sqlC, $place);
if ($read->getResult())
    $data['data'] = $read->getResult()[0];
