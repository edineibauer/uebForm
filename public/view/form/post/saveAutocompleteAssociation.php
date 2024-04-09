<?php

$entity = trim(strip_tags(filter_input(INPUT_POST, 'entity', FILTER_SANITIZE_SPECIAL_CHARS)));
$column = trim(strip_tags(filter_input(INPUT_POST, 'column', FILTER_SANITIZE_SPECIAL_CHARS)));
$value = trim(strip_tags(filter_input(INPUT_POST, 'value')));
$id = filter_input(INPUT_POST, 'id', FILTER_VALIDATE_INT);

$up = new \Conn\Update();
$up->exeUpdate($entity, [$column => $value], "WHERE id = :id", ["id" => $id]);