<?php
$entity = strip_tags(trim(filter_input(INPUT_POST, 'entity', FILTER_DEFAULT)));
$column = str_replace('dados.', '', strip_tags(trim(filter_input(INPUT_POST, 'column', FILTER_DEFAULT))));
$value = strip_tags(trim(filter_input(INPUT_POST, 'val', FILTER_DEFAULT)));
$id = filter_input(INPUT_POST, 'id', FILTER_VALIDATE_INT);

$read = new \ConnCrud\Read();
$read->exeRead($entity, "WHERE {$column} = :m" . ($id > 0 ? " && id != {$id}" : ""), "m={$value}");
if ($read->getResult())
    $data['data'] = $read->getResult()[0];
