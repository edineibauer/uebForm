<?php

namespace Form;


use Conn\SqlCommand;
use Entity\Dicionario;
use Entity\Metadados;

class FormSearch
{
    private $entity;
    private $column;
    private $parent;
    private $search;
    private $selecao;
    private $result = "";

    /**
     * @param string $entity
     * @param string $parent
     * @param string $search
     * @return string
     */
    public function __construct(string $entity, string $parent, string $search, string $column, int $selecao = 0)
    {
        $this->entity = $entity;
        $this->parent = $parent;
        $this->search = $search;
        $this->column = $column;
        $this->selecao = $selecao;

        $this->search();
    }

    /**
     * @return string
     */
    public function getResult(): string
    {
        return $this->result;
    }

    private function search()
    {
        $d = new Dicionario($this->entity);
        $column = $d->getRelevant()->getColumn();
        $data = ($this->selecao === 0 ? $this->filter() : $this->filterSelecao());
        $fieldShow = [];

        $where = "";
        foreach (['identifier', 'title', 'link', 'email', 'tel', 'cpf', 'cnpj', 'cep'] as $item) {
            if (!empty($d->getInfo()[$item]) && !empty($c = $d->search($d->getInfo()[$item]))) {
                $where .= (!empty($where) ? " OR " : "") . PRE . $this->entity . ".{$c->getColumn()} LIKE '%{$this->search}%'";
                $fieldShow[] = [$c->getColumn(), $c->getNome()];
            }
        }

        $comando = "SELECT " . PRE . $this->entity . ".* FROM " . PRE . $this->entity . (!empty($data['join']) ? " {$data['join']}" : "") . " WHERE " . (!empty($where) ? "({$where})" : "") . (!empty($data['where']) ? " AND {$data['where']}" : "") . " ORDER BY " . PRE . $this->entity . ".{$column} LIMIT 7";

        $sql = new SqlCommand();
        $sql->exeCommand($comando);
        if ($sql->getResult()) {
            $template = new \Helpers\Template("form");
            $dataResult = $sql->getResult();
            if(!empty($this->search) && is_string($this->search)) {
                foreach ($dataResult as $i => $r) {
                    foreach ($fieldShow as $item) {
                        $dataResult[$i][$item[0]] = ucwords(str_replace(strtolower($this->search), "<b>" . strtolower($this->search) . "</b>", strtolower($r[$item[0]])));
                    }
                }
            }
            $this->result = $template->getShow("list-result", ["data" => $dataResult, "fields" => $fieldShow]);
        }
    }

    private function filterSelecao(): array
    {
        $rel = PRE . $this->parent . "_" . $this->entity . "_" . explode("__", $this->column)[0];

        return [
            "join" => "INNER JOIN " . $rel . " ON " . $rel . "." . $this->entity . "_id = " . PRE . $this->entity . ".id",
            "where" => $rel . "." . $this->parent . "_id = {$this->selecao}"
        ];
    }

    private function filter(): array
    {
        $dicionario = Metadados::getDicionario($this->parent);
        $filter = [
            "join" => "",
            "where" => ""
        ];
        foreach ($dicionario as $item) {
            if ($item['column'] === $this->column && isset($item['filter']) && !empty($item['filter']) && is_array($item['filter'])) {
                $relationDicionario = Metadados::getDicionario($item['relation']);
                foreach ($item['filter'] as $f) {
                    $dados = explode(",", $f);

                    foreach ($relationDicionario as $column) {
                        if ($column['column'] === $dados[0]) {
                            $relationColumnDic = $column;
                            break;
                        }
                    }

                    if (in_array($relationColumnDic['key'], ['list', 'selecao', 'extend', 'extend_add'])) {
                        $filter = $this->filterFieldList($filter, $relationColumnDic['relation'], $relationDicionario, $relationColumnDic, $dados);

                    } elseif (in_array($relationColumnDic['key'], ['selecao_mult', 'list_mult', 'extend_mult'])) {
                        $filter = $this->filterFieldMult($filter, $relationColumnDic['relation'], $relationDicionario, $relationColumnDic, $dados);

                    } else {
                        $filter["where"] = $this->filterField(PRE . $this->entity, $filter['where'], $dados);
                    }
                }
            }
        }

        return $filter;
    }

    /**
     * @param array $filter
     * @param string $relEntity
     * @param array $relDicionario
     * @param array $relColumnDic
     * @param array $dados
     * @return string
     */
    private function filterFieldList(array $filter, string $relEntity, array $relDicionario, array $relColumnDic, array $dados)
    {
        $filter['join'] = "INNER JOIN " . PRE . $relEntity . " ON " . PRE . $this->entity . "." . $relColumnDic['column'] . " = " . PRE . $relEntity . ".id";
        $filter['where'] = $this->filterField(PRE . $relEntity, $filter['where'], $dados);

        return $filter;
    }

    /**
     * @param array $filter
     * @param string $relEntity
     * @param array $relDicionario
     * @param array $relColumnDic
     * @param array $dados
     * @return string
     */
    private function filterFieldMult(array $filter, string $relEntity, array $relDicionario, array $relColumnDic, array $dados)
    {
        $entity1 = PRE . $this->entity;
        $entityRelational = $entity1 . "_" . $relEntity . "_" . $relColumnDic['column'];
        $entity2 = PRE . $relEntity;

        $filter['join'] .= " INNER JOIN " . $entityRelational . " ON {$entity1}.id = {$entityRelational}.{$this->entity}_id";
        $filter['join'] .= " INNER JOIN " . $entity2 . " ON {$entity2}.id = {$entityRelational}.{$relEntity}_id";

        $filter['where'] = $this->filterField($entity2, $filter['where'], $dados);

        return $filter;
    }

    /**
     * @param string $entity
     * @param string $where
     * @param array $dados
     * @return string
     */
    private function filterField(string $entity, string $where, array $dados): string
    {
        if (!empty($where))
            $where .= " AND ";

        $column = (isset($dados[3]) && !empty($dados[3]) && $dados[3] !== "null" ? $dados[3] : $dados[0]);

        if (in_array($dados[1], ["%%", "%=", "=%", "!%%", "!%=", "!=%"])) {
            $num = in_array($dados[1], ["!%%", "!%=", "!=%"]) ? 1 : 0;
            $where .= "{$entity}.{$column} " . ($num === 1 ? "NOT " : "") . "LIKE '" . ($dados[1][$num] === "%" ? "%" : "") . $dados[2] . ($dados[1][$num + 1] === "%" ? "%" : "") . "'";

        } elseif (in_array($dados[1], ["in", "!in"])) {
            $dados[2] = implode(',', array_map(function ($v)
            {
                $v = strip_tags($v);
                $v = str_replace(["'", '"'], "", $v);
                return trim($v);
            }, explode(',', $dados[2])));
            $where .= ($dados[1] === "!in" ? "NOT " : "") . "FIND_IN_SET({$entity}.{$column}, '{$dados[2]}')";

        } else {

            $where .= "{$entity}.{$column} {$dados[1]} '{$dados[2]}'";
        }

        return $where;
    }
}