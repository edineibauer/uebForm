<?php
$entity = trim(strip_tags(filter_input(INPUT_POST, 'entity', FILTER_DEFAULT)));
$field = trim(strip_tags(filter_input(INPUT_POST, 'field', FILTER_DEFAULT)));
$id = filter_input(INPUT_POST, 'id', FILTER_VALIDATE_INT);

$result = Entity\Entity::read($entity, $id);
$d = new \Entity\Dicionario($entity);

foreach ($d->getAssociationMult() as $meta) {
    $dado = $result[$meta->getColumn()];
    if(!empty($dado) && is_array($dado)) {
        $dado = $dado[0];
        $dr = new \Entity\Dicionario($meta->getRelation());
        $data['data'][$meta->getColumn() . "__" . $field]['text'] = $dado[$dr->getRelevant()->getColumn()];
        $data['data'][$meta->getColumn() . "__" . $field]['id'] = $dado['id'];
    }
}