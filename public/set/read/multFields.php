<?php
$entity = trim(strip_tags(filter_input(INPUT_POST, 'entity', FILTER_DEFAULT)));
$entityRelation = trim(strip_tags(filter_input(INPUT_POST, 'entityRelation', FILTER_DEFAULT)));
$column = trim(strip_tags(filter_input(INPUT_POST, 'column', FILTER_DEFAULT)));

$dicionario = \Entity\Metadados::getDicionario($entity);

$field = null;
foreach ($dicionario as $dados) {
    if($dados['column'] === $column) {
       if(!empty($dados['select'])) {
           $field = $dados;
       }

       break;
    }
}

if($field) {

    $dicionario = \Entity\Metadados::getDicionario($entityRelation);
    foreach ($field['select'] as $select) {
        foreach ($dicionario as $item) {
            if($item['column'] === $select) {

                $item['title'] = "";
                $item['id'] = "";
                $item['ngmodel'] = "dados." . $item['column'];
                $item['entity'] = $entityRelation;
                $tpl = new \Helpers\Template("form-crud");
                $data['data'] .= $tpl->getShow("selecao", $item);

                break;
            }
        }
    }
}