<?php
$search = trim(strip_tags(filter_input(INPUT_POST, 'search', FILTER_DEFAULT)));
$entity = trim(strip_tags(filter_input(INPUT_POST, 'entity', FILTER_DEFAULT)));
$parent = trim(strip_tags(filter_input(INPUT_POST, 'parent', FILTER_DEFAULT)));
$column = trim(strip_tags(filter_input(INPUT_POST, 'column', FILTER_DEFAULT)));
$selecao = filter_input(INPUT_POST, 'selecao', FILTER_VALIDATE_INT);

$formSearch = new \FormCrud\FormSearch($entity, $parent, $search, $column, $selecao ?? 0);
$data['data'] = $formSearch->getResult();