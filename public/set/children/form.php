<?php

if (!empty($_SESSION['userlogin'])) {
    $entity = trim(strip_tags(filter_input(INPUT_POST, 'entity', FILTER_DEFAULT)));
    $id = filter_input(INPUT_POST, 'id', FILTER_VALIDATE_INT);
    $fields = trim(strip_tags(filter_input(INPUT_POST, 'fields', FILTER_DEFAULT)));
    $btnClass = trim(str_replace('btn theme-d2 hover-shadow opacity hover-opacity-off', '', trim(strip_tags(filter_input(INPUT_POST, 'btnClass', FILTER_DEFAULT)))));
    $btnText = trim(strip_tags(filter_input(INPUT_POST, 'btnText', FILTER_DEFAULT)));
    $btnIcon = trim(strip_tags(filter_input(INPUT_POST, 'btnIcon', FILTER_DEFAULT)));
    $callback = trim(strip_tags(filter_input(INPUT_POST, 'callback', FILTER_DEFAULT)));
    $fields = !empty($fields) ? json_decode($fields, true) : null;

    $form = new \FormCrud\Form($entity);
    if ($btnClass !== "notHaveButton") {
        $form->setAutoSave(false);
        $form->setSaveButtonClass($btnClass);
        $form->setSaveButtonText($btnText);
        $form->setSaveButtonIcon($btnIcon);
    }
    $form->setCallback($callback);

    $data['data'] = $form->getFormReload($id ?? null, $fields ?? null);
} else {
    $data['data'] = 'anonimo';
}