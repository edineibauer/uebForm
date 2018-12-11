<?php
$nome = trim(strip_tags(filter_input(INPUT_POST, 'entity', FILTER_DEFAULT)));
$dados = filter_input(INPUT_POST, 'dados', FILTER_DEFAULT, FILTER_REQUIRE_ARRAY);
$cont = [];

if($dados && is_array($dados)) {
    foreach ($dados as $c => $v) {
        $c = explode(".", $c);
        if (count($c) === 2)
            $cont[$c[1]] = $v;
        elseif (count($c) === 3)
            $cont[$c[1]][$c[2]] = $v;
        elseif (count($c) === 4)
            $cont[$c[1]][$c[2]][$c[3]] = $v;
        elseif (count($c) === 5)
            $cont[$c[1]][$c[2]][$c[3]][$c[4]] = $v;
        elseif (count($c) === 6)
            $cont[$c[1]][$c[2]][$c[3]][$c[4]][$c[5]] = $v;
        elseif (count($c) === 7)
            $cont[$c[1]][$c[2]][$c[3]][$c[4]][$c[5]][$c[6]] = $v;
        elseif (count($c) === 8)
            $cont[$c[1]][$c[2]][$c[3]][$c[4]][$c[5]][$c[6]][$c[7]] = $v;
        elseif (count($c) === 9)
            $cont[$c[1]][$c[2]][$c[3]][$c[4]][$c[5]][$c[6]][$c[7]][$c[8]] = $v;
        else
            $cont = $v;
    }

    $d = new \Entity\Dicionario($nome);
    $d->setData($cont);

    $d->save();
    $data['data'] = [
        "id" => !empty($d->search(0)->getValue()) ? (int)$d->search(0)->getValue() : "",
        "error" => $d->getError(),
        "data" => $d->getDataForm()
    ];
} else {
    $data['data'] = [
        "id" => "",
        "error" => ["id" => "Lista Vazia de Dados Recebida"],
        "data" => ""
    ];
}
