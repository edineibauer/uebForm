<?php

namespace Form;

use Config\Config;
use Conn\Read;
use Conn\SqlCommand;
use Entity\Meta;
use Entity\Metadados;

class ExeReadEntity
{
    private $report;
    private $result = [];
    private $queryDeclaration = [];
    private $limit = 1000000;
    private $offset = 0;

    /**
     * Report constructor.
     * @param int|array $report
     * @param int|null $limit
     * @param int|null $offset
     */
    public function __construct($report, int $limit = null, int $offset = null)
    {
        if (is_array($report))
            $this->report = $report;

        if (!empty($limit))
            $this->limit = $limit;

        if (!empty($offset))
            $this->offset = $offset;

        if (is_array($this->report) && !empty($this->report))
            $this->start();
    }

    /**
     * @param int $limit
     */
    public function setLimit(int $limit): void
    {
        $this->limit = $limit;
    }

    /**
     * @param int $offset
     */
    public function setOffset(int $offset): void
    {
        $this->offset = $offset;
    }

    /**
     * @return array
     */
    public function getResult(): array
    {
        return $this->result;
    }

    /**
     * @return array
     */
    public function getReport(): array
    {
        return $this->report;
    }

    private function start()
    {
        $permission = Config::getPermission($_SESSION["userlogin"]["setor"]);

        if($_SESSION["userlogin"]["setor"] !== "admin" && (empty($permission[$this->report['entidade']]) || !$permission[$this->report['entidade']]["read"]))
            return;

        $info = Metadados::getInfo($this->report['entidade']);
        $dicionario = Metadados::getDicionario($this->report['entidade']);
        $querySelect = "";
        $queryDeclarationString = "FROM " .  $this->report['entidade'] . " as " . $this->report['entidade'];

        /**
         * Select the own entity fields
         */
        if (!empty($info['columns_readable'])) {
            foreach ($info['columns_readable'] as $column)
                $querySelect .= ($querySelect === "" ? "" : ", ") . "{$this->report['entidade']}.{$column}";
        }

        $queryLogic = "WHERE";

        if(!empty($this->report['search'])) {
            foreach ($dicionario as $meta) {
                if(!in_array($meta['key'], ["information", "identifier"]))
                    $queryLogic .= ($queryLogic === "WHERE" ? " (" : " || ") . "{$this->report['entidade']}.{$meta['column']} LIKE '%{$this->report['search']}%'";
            }
            $queryLogic .= ")";
        }

        if (!empty($this->report['regras'])) {
            $regras = json_decode($this->report['regras'], !0);
            if (is_array($regras)) {
                foreach ($regras as $regra) {
                    $query = "";
                    if (!empty($regra['grupos'])) {
                        foreach ($regra['grupos'] as $i => $grupo) {
                            if (!empty($grupo['filtros']))
                                $query .= ($i > 0 ? " " . strtoupper($grupo['filtros'][0]['logica']) : "") . " (" . $this->getFilterQuery($grupo['filtros']) . ")";
                        }
                    }

                    if ($regra['tipo'] === 'select') {
                        $queryLogic .= $query;
                    } elseif ($regra['tipo'] === "inner_join") {
                        $queryLogic .= " " . strtoupper($grupo['filtros'][0]['logica']) . " {$this->report['entidade']}.{$regra['tipoColumn']} IN ( SELECT {$this->report['entidade']}.{$regra['tipoColumn']} FROM " .  $this->report['entidade'] . " as {$this->report['entidade']} WHERE{$query})";
                    } elseif ($regra['tipo'] === "outer_join") {
                        $queryLogic .= " " . strtoupper($grupo['filtros'][0]['logica']) . " {$this->report['entidade']}.{$regra['tipoColumn']} NOT IN ( SELECT {$this->report['entidade']}.{$regra['tipoColumn']} FROM " .  $this->report['entidade'] . " as {$this->report['entidade']} WHERE{$query})";
                    }
                }
            }
        }

        foreach ($this->queryDeclaration as $entity => $logic)
            $queryDeclarationString .= " {$logic['tipo']} " .  $entity . " as {$entity}" . (!empty($logic['on']) ? " ON " . $logic['on'] : "");

        $queryGroup = "";
        if(!empty($this->report['agrupamento'])) {
            $queryGroup = "GROUP BY {$this->report['entidade']}." . $this->report['agrupamento'];
            $querySelect .= ", COUNT({$this->report['entidade']}.id) as contagem, COUNT({$this->report['entidade']}.id) as total";

            $soma = (!empty($this->report['soma'])) ? json_decode($this->report['soma'], !0) : [];
            $media = (!empty($this->report['media'])) ? json_decode($this->report['media'], !0) : [];
            $maior = (!empty($this->report['maior'])) ? json_decode($this->report['maior'], !0) : [];
            $menor = (!empty($this->report['menor'])) ? json_decode($this->report['menor'], !0) : [];

            if(!empty($soma)) {
                foreach ($soma as $item)
                    $querySelect .= ", SUM({$this->report['entidade']}.{$item}) as {$item}";
            }
            if(!empty($media)) {
                foreach ($media as $item)
                    $querySelect .= ", AVG({$this->report['entidade']}.{$item}) as {$item}";
            }
            if(!empty($maior)) {
                foreach ($maior as $item)
                    $querySelect .= ", MAX({$this->report['entidade']}.{$item}) as {$item}";
            }
            if(!empty($menor)) {
                foreach ($menor as $item)
                    $querySelect .= ", MIN({$this->report['entidade']}.{$item}) as {$item}";
            }
        } else {
            $querySelect .= ", 1 as contagem";
        }

        /**
         * restringe leitura a somente dados do system_id de acesso
         * Aplica regra recursiva sobre sistema pai
         */
        if ($_SESSION["userlogin"]["setor"] !== "admin") {

            /**
             * Verifica se o usuário que esta a editar essa entidade pertence a um sistema ou se é anônimo a sistema
             */
            if(!empty($_SESSION["userlogin"]["system_id"])) {

                //USUÁRIO PERTENCE A UM SISTEMA
                $mySystem = Metadados::getInfo($_SESSION["userlogin"]['setor']);
                $usuarioSistema = $mySystem['system'];

                /**
                 * Verifica se a entidade que estou editando pertence a um sistema ou se é de todos
                 */
                if (!empty($info['system'])) {

                    //ENTIDADE PERTENCE A UM SISTEMA

                    if($this->report['entidade'] === $usuarioSistema) {
                        //permite pois a entidade é igual ao sistema ao qual estou logado
                        $queryLogic .= ($queryLogic !== "WHERE" ? " AND " : " ") . "{$this->report['entidade']}.id = {$_SESSION["userlogin"]["system_id"]}";

                    } elseif($info['system'] === $usuarioSistema) {
                        //permite pois a entidade pertence ao mesmo sistema ao qual estou logado
                        $queryLogic .= ($queryLogic !== "WHERE" ? " AND " : " ") . "{$this->report['entidade']}.system_id = {$_SESSION["userlogin"]["system_id"]} AND {$this->report['entidade']}.system_entity = '{$usuarioSistema}'";

                    } else {

                        //permite registros que pertencem a sistemas abaixo do meu sistema logado
                        $listaEntitySystemBelow = $this->_getEntitySystemBelow($usuarioSistema, $info['system'], []);
                        if (!empty($listaEntitySystemBelow)) {
                            $logicaFilhos = "(";
                            foreach ($listaEntitySystemBelow as $systemBelow) {
                                $read = new Read();
                                $read->exeRead($systemBelow, "WHERE system_id = :s", ["s" => $_SESSION["userlogin"]["system_id"]]);
                                if ($read->getResult()) {
                                    $listaSistemasFilhos = [];
                                    foreach ($read->getResult() as $itemm)
                                        $listaSistemasFilhos[] = $itemm['id'];

                                    $logicaFilhos .= ($logicaFilhos === "(" ? "" : " OR ") . "({$this->report['entidade']}.system_id IN(" . implode(',', $listaSistemasFilhos) . ") AND {$this->report['entidade']}.system_entity = '" . $systemBelow . "')";
                                }
                            }
                            $queryLogic .= ($queryLogic !== "WHERE" ? " AND " : " ") . $logicaFilhos . ")";
                        }
                    }

                } else {

                    //ENTIDADE NÃO TEM SISTEMA, QUALQUER USUÁRIO PODE GERIR, MAS SOMENTES REGISTROS DO SISTEMA LOGADO

                    $queryLogic .= ($queryLogic !== "WHERE" ? " AND " : " ") . "{$this->report['entidade']}.system_id = {$_SESSION["userlogin"]["system_id"]} AND {$this->report['entidade']}.system_entity = '{$usuarioSistema}'";

                }
            } else {

                //USUÁRIO É ANÔNIMO A SISTEMA

                /**
                 * Verifica se a entidade que estou editando pertence a um sistema ou se é de todos
                 */
                if (!empty($info['system'])) {

                    //ENTIDADE PERTENCE A UM SISTEMA, LOGO ESTE USUÁRIO NÃO TEM ACESSO
                    $queryLogic .= ($queryLogic !== "WHERE" ? " AND " : " ") . "{$this->report['entidade']}.id = 0";

                } else {

                    //ENTIDADE NÃO TEM SISTEMA, QUALQUER USUÁRIO PODE GERIR, MAS SOMENTES REGISTROS DO SISTEMA LOGADO
                    $queryLogic .= ($queryLogic !== "WHERE" ? " AND " : " ") . "{$this->report['entidade']}.system_id = IS NULL AND {$this->report['entidade']}.system_entity = IS NULL";

                }
            }
        }

        $orderIncludePrefix = (!in_array($this->report['ordem'], ["total", "contagem"]) ? $this->report['entidade'] . "." : "");
        $queryOrder = "ORDER BY " . (!empty($info['status']) ? $orderIncludePrefix . $dicionario[$info['status']]['column'] . " DESC, " : "") . $orderIncludePrefix . (!empty($this->report['ordem']) ? $this->report['ordem'] : "id") . ($this->report['decrescente'] === null || $this->report['decrescente'] ? " DESC" : " ASC");

        $query = "SELECT " . $querySelect . " " . $queryDeclarationString . " " . ($queryLogic !== "WHERE" ? $queryLogic . " " : "") . $queryGroup . " " . $queryOrder . " LIMIT " . $this->limit . " OFFSET " . $this->offset;

        /**
         * Executa a leitura no banco de dados
         */
        $sql = new SqlCommand();
        $sql->exeCommand($query);
        if (!$sql->getErro() && $sql->getResult()) {
            foreach ($sql->getResult() as $i => $register) {

                /**
                 * Decode all json on base register
                 */
                foreach ($dicionario as $meta) {
                    $m = new \Entity\Meta($meta);
                    if($meta['format'] === "password") {
                        $m->setValue("");
                        $register[$meta['column']] = "";
                    } else {
                        $m->setValue($register[$meta['column']]);
                        $register[$meta['column']] = $m->getValue();
                    }
                }

                $this->result[] = $register;
            }
        }
    }

    /**
     * Obtém lista de entidades que estão em um sistema inferior ao do usuário
     * @param string $mySystem
     * @param string $entitySystem
     * @param array $lista
     * @return array
     */
    private function _getEntitySystemBelow(string $mySystem, string $entitySystem, array $lista) {
        if($mySystem === $entitySystem) {
            /**
             * Meu usuário esta no mesmo nível de sistema que a entidade em questão
             */
            return $lista;

        } else {
            /**
             * Verifica se a entidade possui um sistema pai
             */
            $infoparent = Metadados::getInfo($entitySystem);
            if(!empty($infoparent['system'])) {
                /**
                 * Entidade possui um sistema pai, verifica se é o mesmo que o meu
                 */
                $lista[] = $entitySystem;
                return $this->_getEntitySystemBelow($mySystem, $infoparent['system'], $lista);
            }

            return [];
        }
    }

    /**
     * @param array $filter
     * @return string
     */
    private function getFilterQuery(array $filter)
    {
        $query = "";
        foreach ($filter as $i => $filterOption) {

            if($filterOption['coluna'] === "ownerpub" OR $filterOption['coluna'] === "system_id")
                continue;

            if ($i > 0)
                $query .= " " . strtoupper($filterOption['logica']);

            $colunas = json_decode($filterOption['colunas'], !0);
            $entidades = json_decode($filterOption['entidades'], !0);

            if (count($colunas) > 1) {
                /**
                 * Adiciona entidades externas para concatenação JOIN
                 */
                $entityParent = "";
                foreach ($entidades as $ii => $entidade) {
                    if ($ii > 0 && !isset($this->queryDeclaration[$entidade]))
                        $this->queryDeclaration[$entidade] = ["tipo" => "INNER JOIN", "on" => "{$entityParent} = {$entidade}.id"];

                    $entityParent = $entidade . "." . $colunas[$ii];
                }
                $column = $entidades[count($entidades) - 1] . "." . $filterOption['coluna'];
                $dicionario = Metadados::getDicionario($entidades[count($entidades) - 1]);
            } else {
                $column = $entidades[0] . "." . $filterOption['coluna'];
                $dicionario = Metadados::getDicionario($entidades[0]);
            }

            /**
             * Convert uso de variável do front USER como valor
             */
            if(preg_match("/^USER./i", $filterOption['valor'])) {
                $fields = explode(".", str_replace("USER.", "", $filterOption['valor']));
                if(count($fields) > 0 && count($fields) < 5)
                    $filterOption['valor'] = (!empty($fields[4]) ? $_SESSION['userlogin'][$fields[0]][$fields[1]][$fields[2]][$fields[3]][$fields[4]] : (!empty($fields[3]) ? $_SESSION['userlogin'][$fields[0]][$fields[1]][$fields[2]][$fields[3]] : (!empty($fields[2]) ? $_SESSION['userlogin'][$fields[0]][$fields[1]][$fields[2]] : (!empty($fields[1]) ? $_SESSION['userlogin'][$fields[0]][$fields[1]] : $_SESSION['userlogin'][$fields[0]]))));
            }

            /**
             * Transforma valor do campo no padrão para o campo
             */
            $valor = $filterOption['valor'];
            $valorTipado = $valor;
            $tipo = "varchar";
            foreach ($dicionario as $item) {
                if ($item['column'] === $filterOption['coluna']) {
                    $meta = new Meta($item);
                    $tipo = $meta->getType();

                    if($meta->get('format') === "password") {
                        $meta->setValue("");
                        $valorTipado = "";
                    } else {
                        $meta->setValue($valor);
                        $valorTipado = $meta->getValue();
                    }
                    break;
                }
            }

            if(!in_array($tipo, ["int", "tinyint", "double", "decimal", "float", "smallint"]))
                $valorTipado = '"' . str_replace('"', "'", $valor) . '"';

            switch ($filterOption['operador']) {
                case 'contém':
                    $query .= " {$column} LIKE '%{$valor}%'";
                    break;
                case 'igual a':
                    $query .= " {$column} = {$valorTipado}";
                    break;
                case 'diferente de':
                    $query .= " {$column} != {$valorTipado}";
                    break;
                case 'começa com':
                    $query .= " {$column} LIKE '{$valor}%'";
                    break;
                case 'termina com':
                    $query .= " {$column} LIKE '%{$valor}'";
                    break;
                case 'maior que':
                    $query .= " {$column} > {$valorTipado}";
                    break;
                case 'menor que':
                    $query .= " {$column} < {$valorTipado}";
                    break;
                case 'maior igual a':
                    $query .= " {$column} >= {$valorTipado}";
                    break;
                case 'menor igual a':
                    $query .= " {$column} <= {$valorTipado}";
                    break;
                case 'menor que hoje - X dias':
                    $actualDate = "CURDATE()";
                    $query .= " {$column} < {$actualDate} - INTERVAL {$valor} DAY";
                    break;
                case 'menor igual a hoje - X dias':
                    $actualDate = "CURDATE()";
                    $query .= " {$column} <= {$actualDate} - INTERVAL {$valor} DAY";
                    break;
                case 'maior que hoje - X dias':
                    $actualDate = "CURDATE()";
                    $query .= " {$column} > {$actualDate} - INTERVAL {$valor} DAY";
                    break;
                case 'maior igual a hoje - X dias':
                    $actualDate = "CURDATE()";
                    $query .= " {$column} >= {$actualDate} - INTERVAL {$valor} DAY";
                    break;
                case 'no dia de hoje':
                    $actualDate = "CURDATE()";
                    $query .= " DATE({$column}) = {$actualDate}";
                    break;
                case 'nesta semana':
                    $actualDate = "CURRENT_DATE()";
                    $query .= " YEARWEEK({$column}) = YEARWEEK({$actualDate})";
                    break;
                case 'neste mês':
                    $actualDate = "CURRENT_DATE()";
                    $query .= " MONTH({$column}) = MONTH({$actualDate}) AND YEAR({$column}) = YEAR({$actualDate})";
                    break;
                case 'neste ano':
                    $actualDate = "CURRENT_DATE()";
                    $query .= " YEAR({$column}) = YEAR({$actualDate})";
            }
        }

        return $query;
    }
}