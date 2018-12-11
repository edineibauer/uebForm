<?php

$cep = str_replace('-', '', trim(strip_tags(filter_input(INPUT_POST, 'cep', FILTER_DEFAULT))));

$data['data'] = \Helpers\Helper::cepAberto($cep);