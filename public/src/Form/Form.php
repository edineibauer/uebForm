<?php

namespace Form;

use Conn\Read;
use Conn\SqlCommand;
use Entity\Entity;
use Entity\Dicionario;
use Entity\Meta;
use Helpers\Helper;
use Helpers\Template;
use EntityUi\EntityImport;

class Form
{
    private $entity;
    private $autoSave = true;
    private $callback;
    private $fields;
    private $defaults;
    private $saveButton;
    private $reload = false;
    private $error;

    /**
     *
     * @param string $entity
     */
    public function __construct(string $entity)
    {
        $this->setEntity($entity);
        $this->saveButton = [
            "class" => "",
            "icon" => "save",
            "text" => "Salvar"
        ];
    }

    /**
     * @param mixed $entity
     */
    public function setEntity($entity)
    {
        $this->entity = $entity;
        $this->checkEntityExist();
        $this->checkIfTableExist();
    }

    /**
     * @param mixed $autoSave
     */
    public function setAutoSave($autoSave = null)
    {
        $this->autoSave = $autoSave === null ? !$this->autoSave : $autoSave;
    }

    /**
     * @param mixed $callback
     */
    public function setCallback($callback)
    {
        $this->callback = $callback;
    }

    /**
     * @param array $defaults
     */
    public function setDefaults(array $defaults)
    {
        $this->defaults = $defaults;
    }

    /**
     * @param bool $reload
     */
    public function setReload(bool $reload = true)
    {
        $this->reload = $reload;
    }

    /**
     * @param array $fields
     */
    public function setFields(array $fields)
    {
        $this->fields = $fields;
    }

    /**
     * @return mixed
     */
    public function getError()
    {
        return $this->error;
    }

    /**
     * @param string $icon
     */
    public function setSaveButtonIcon(string $icon)
    {
        $this->saveButton['icon'] = $icon;
    }

    /**
     * @param string $text
     */
    public function setSaveButtonText(string $text)
    {
        $this->saveButton['text'] = $text;
    }

    /**
     * @param string $class
     */
    public function setSaveButtonClass(string $class)
    {
        $this->saveButton['class'] = $class;
    }

    /**
     * @param mixed $id
     * @param mixed $fields
     * @return string
     */
    public function getFormReload($id = null, $fields = null): string
    {
        $this->setReload(true);
        return $this->getForm($id, $fields);
    }

    /**
     * @param mixed $id
     * @param mixed $fields
     */
    public function showFormReload($id = null, $fields = null)
    {
        echo $this->getFormReload($id, $fields);
    }

    /**
     * @param mixed $id
     * @param mixed $fields
     */
    public function showForm($id = null, $fields = null)
    {
        echo $this->getForm($id, $fields);
    }

    /**
     * @param mixed $id
     * @param mixed $fields
     * @return string
     */
    public function getForm($id = null, $fields = null): string
    {
        if ($id && is_array($id) && !$fields)
            return $this->getForm(null, $fields);

        if ($fields && is_array($fields))
            $this->setFields($fields);

        $d = new Dicionario($this->entity);
        if ($id && is_numeric($id))
            $d->setData($id);
        else
            $id = null;

        if (Entity::checkPermission($d->getEntity(), $id)) {
            $this->turnDicionarioIntoFormFormat($d);

            $form['inputs'] = $this->prepareInputs($d, $this->fields);
            $form['relevant'] = $d->getRelevant()->getColumn();
            $form['id'] = $id;
            $form['entity'] = $d->getEntity();
            $form['autoSave'] = $this->autoSave;
            $form['callback'] = $this->callback;
            $form['home'] = defined("HOME") ? HOME : "";
            $form['reload'] = $this->reload;
            $form['fields'] = $this->fields;
            $form['saveButton'] = $this->saveButton;

            $template = new Template("form");
            return $template->getShow("form", $form);
        }

        return "Permissão Negada";
    }

    /**
     * Verifica se a entidade json existe
     * se não existir, cria ela
     */
    private function checkEntityExist()
    {
        if (!file_exists(PATH_HOME . "entity/cache/{$this->entity}.json")) {
            foreach (Helper::listFolder(PATH_HOME . VENDOR) as $lib)
                new \LinkControl\EntityImport($lib);
        }
    }

    /**
     * Verifica se a tabela da entity existe
     * se não existir, cria ela
     */
    private function checkIfTableExist()
    {
        $sql = new SqlCommand();
        $sql->exeCommand("SHOW TABLES LIKE '" . PRE . $this->entity . "'");
        if (!$sql->getResult())
            new \EntityForm\EntityCreateEntityDatabase($this->entity, []);
    }

    private function turnDicionarioIntoFormFormat(Dicionario $d)
    {
        foreach ($d->getDicionario() as $meta) {
            if (!empty($meta->getSelect())) {
                $metaSelects = [];
                foreach ($meta->getSelect() as $select) {
                    $select = $d->search($select . "__" . $meta->getColumn());
                    if ($select) {
                        $metaSelects[] = $select;
                        $d->removeMeta($select->getColumn());
                    }
                }
                $meta->setSelect($metaSelects);
            }
        }
    }

    /**
     * Processa todas as inputs do form uma a uma
     *
     * @param Dicionario $d
     * @param mixed $fields
     * @param string $ngmodel
     * @return array
     */
    private function prepareInputs(Dicionario $d, $fields = null, string $ngmodel = "dados."): array
    {
        $listaInput = [];
        $template = new Template("form");

        $max = 0;
        foreach ($d->getDicionario() as $m) {
            if ($max < $m->getIndice())
                $max = $m->getIndice();
        }
        $max++;

        for ($c = 1; $c < $max; $c++) {
            if ($meta = $d->search("indice", $c)) {
                //pula algumas colunas pré-definidas
                if (!empty($d->search(0)) && !($d->getEntity() !== "usuarios" || (!empty($d->search(0)) && !empty($_SESSION['userlogin']) && $_SESSION['userlogin']['id'] != $d->search(0))) && in_array($meta->getColumn(), ["status", "setor"]))
                    continue;

                //esconde input
                if($meta->getForm() === false || ($fields && !in_array($meta->getColumn(), $fields) && !in_array($meta->getId(), $fields))) {
                    $meta->setForm(['input' => 'hiddenField', 'cols' => '12', 'atributos' => '', 'template' => '', 'coll' => '', 'colm' => '', 'class' => '', 'style' => '', 'defaults' => '', 'fields' => '']);
                    if(empty($d->search(0)->getValue()) && isset($this->defaults[$meta->getId()]) && $this->defaults[$meta->getId()] !== "")
                        $meta->setValue($this->defaults[$meta->getId()], false);
                }

                $input = $this->getBaseInput($d, $meta, $ngmodel);

                if ($meta->getKey() === "extend") {
                    $listaInput[] = $this->getExtentContent($meta, $input);
                } else {
                    if ($allow = $this->checkCheckBoxData($meta, $d))
                        $input['allow'] = $allow;

                    if ($list = $this->checkListData($meta, $d))
                        $input = array_merge($input, $list);

                    $listaInput[] = (!in_array($input['form']['input'], ["hidden", "hiddenField"]) ? "<div class='col margin-bottom relative {$input['s']} {$input['m']} {$input['l']}'>" : "") .
                        $template->getShow($input['form']['input'], $input) .
                        (!in_array($input['form']['input'], ["hidden", "hiddenField"]) ? '</div>' : '');
                }
            }
        }

        //id
        $meta = $d->search(0);
        $input = $this->getBaseInput($d, $meta, $ngmodel);
        $listaInput[] = $template->getShow($input['form']['input'], $input);

        return $listaInput;
    }

    /**
     * @param Dicionario $d
     * @param Meta $meta
     * @param string $ngmodel
     * @return array
     */
    private function getBaseInput(Dicionario $d, Meta $meta, string $ngmodel): array
    {
        $icon = "";
        $dr = "";
        if (in_array($meta->getFormat(), ["extend_mult", "list_mult", "selecao_mult", "checkbox_mult"])) {
            $dr = new Dicionario($meta->getRelation());
            $icon = $this->getIcons($dr->getRelevant()->getFormat());
        }

        return array_merge($meta->getDados(), [
            'path' => PATH_HOME,
            'home' => HOME,
            'icon' => $icon,
            'disabled' => preg_match('/disabled/i', $meta->getForm()['class']),
            'entity' => $d->getEntity(),
            'value' => $this->getValue($meta, $dr),
            'ngmodel' => $ngmodel . $meta->getColumn(),
            'autosave' => $this->autoSave,
            'form' => $meta->getForm() === false ? $this->getFormDefault($meta->getFormat()) : $meta->getForm(),
            's' => (!empty($meta->getForm()['cols']) ? 's' . $meta->getForm()['cols'] : ""),
            'm' => (!empty($meta->getForm()['colm']) ? 'm' . $meta->getForm()['colm'] : ""),
            'l' => (!empty($meta->getForm()['coll']) ? 'l' . $meta->getForm()['coll'] : "")
        ]);
    }

    /**
     * @param string $format
     * @return mixed
     */
    private function getFormDefault(string $format)
    {
        $inputs = \EntityUi\InputType::getInputTypes();
        $default = \EntityUi\InputType::getInputDefault();

        return !empty($inputs[$format]['form']) ? array_replace_recursive($default['form'], (!empty($inputs[$format]) ? $inputs[$format]['form'] : [])) : $default['form'];
    }

    /**
     * @param Meta $meta
     * @param mixed $dr
     * @return mixed
     */
    private function getValue(Meta $meta, $dr)
    {

        if ($meta->getValue() == "0")
            $v = 0;
        elseif (!empty($meta->getValue()))
            $v = $meta->getValue();
        elseif (!empty($this->defaults) && (!empty($this->defaults[$meta->getColumn()]) || !empty($this->defaults[$meta->getId()])))
            $v = (!empty($this->defaults[$meta->getColumn()]) ? $this->defaults[$meta->getColumn()] : $this->defaults[$meta->getId()]);
        else
            $v = $meta->getDefault();

        if (in_array($meta->getFormat(), ["extend_mult", "list_mult", "selecao_mult"])) {
            if (!empty($v)) {
                $d = new Dicionario($meta->getRelation());
                $read = new Read();
                $data = [];
                $i = 0;
                foreach (json_decode($v, true) as $item) {
                    $read->exeRead($meta->getRelation(), "WHERE id = :id", "id={$item}");
                    if ($read->getResult()){
                        $i ++;
                        $data[$i] = ["id" => $read->getResult()[0]['id'], "valores" => []];
                        foreach (['title', 'link', 'email', 'tel', 'cpf', 'cnpj', 'cep'] as $item) {
                            if (!empty($d->getInfo()[$item]) && !empty($c = $d->search($d->getInfo()[$item])))
                                $data[$i]["valores"][ucwords(str_replace(['_', '-'], ' ', strtolower($c->getColumn())))] = $read->getResult()[0][$c->getColumn()];
                        }
                    }
                }
                $v = $data;
            }
        } elseif ($meta->getFormat() === "checkbox_mult") {
            if (!empty($v)) {
                $data = [];
                $read = new Read();
                foreach (json_decode($v, true) as $item) {
                    $read->exeRead($meta->getRelation(), "WHERE id = :id", "id={$item}");
                    if ($read->getResult())
                        $data[] = $read->getResult()[0]['id'];
                }
                $v = $data;
            }
        } elseif ($meta->getType() === "json") {
            $v = json_decode($v, true);
        } elseif ($meta->getFormat() === "datetime" && !empty($v)) {
            $v = str_replace(' ', 'T', $v);
        } elseif ($meta->getType() === "float" && is_numeric($v)) {
            $v = (float)$v;
        } elseif ($meta->getType() === "int" && is_numeric($v)) {
            $v = (int)$v;
        } elseif (preg_match('/{\$/i', $v)) {
            $v = "";
        }

        if(!empty($meta->getForm()['template'])) {
            $tpl = new Template();
            $v = $tpl->getShow($meta->getForm()['template'], ['value' => $v]);
        }

        return $v;
    }

    /**
     * @param Meta $meta
     * @param string $ngmodel
     * @return string
     */
    private function getExtentContent(Meta $meta, array $input): string
    {
        $dic = new Dicionario($meta->getRelation());
        if (!empty($meta->getValue()))
            $dic->setData($meta->getValue());

        if (!empty($meta->getForm()['fields'])) {
            foreach ($dic->getDicionario() as $m) {
                if (!in_array($m->getId(), $meta->getForm()['fields'])) {
                    $m->setForm(['input' => "hidden", 'cols' => "", 'coll' => "", 'colm' => "", 'class' => "", 'style' => "", 'defaults' => "", 'fields' => ""]);
                    if ((empty($meta->getValue()) || empty($m->getValue())) && !empty($meta->getForm()['defaults'][$m->getId()]))
                        $m->setValue($meta->getForm()['defaults'][$m->getId()]);
                }
            }
        }

        $input["inputs"] = $this->prepareInputs($dic, $meta->getForm()['fields'], $input['ngmodel'] . ".");

        $template = new Template("form");
        return $template->getShow("extend", $input);
    }

    /**
     * @param Meta $meta
     * @param Dicionario $d
     * @return mixed
     */
    private function checkCheckBoxData(Meta $meta, Dicionario $d)
    {
        if ($meta->getFormat() === "checkbox_mult" || $meta->getFormat() === "checkbox_rel") {
            $filter = "WHERE id > 0";
            if(!empty($meta->getFilter())) {
                foreach ($meta->getFilter() as $item) {
                    $item = explode(',', $item);
                    if(preg_match('/\$_SESSION/i', $item[2])) {
                        $ss = explode("[", $item[2]);
                        $item[2] = $_SESSION[str_replace(["'", '"'], '', explode(']', $ss[1])[0])][str_replace(["'", '"'], '', explode(']', $ss[2])[0])];

                    }
                    $filter .= " && {$item[0]} {$item[1]} {$item[2]}";
                }
            }
            $read = new Read();
            $tpl = new Template(DOMINIO);
            $read->exeRead(PRE . $meta->getRelation(), $filter);
            if($read->getResult()) {
                if(empty($meta->getForm()['template']))
                    $dd = new Dicionario($meta->getRelation());
                foreach ($read->getResult() as $item) {
                    $allow['names'][] = !empty($meta->getForm()['template']) ? $tpl->getShow($meta->getForm()['template'], $item) : $item[$dd->getRelevant()->getColumn()];
                    $allow['values'][] = $item['id'];
                }
                return $allow;
            }
        }

        return null;
    }

    /**
     * @param Meta $meta
     * @param Dicionario $d
     * @return mixed
     */
    private function checkListData(Meta $meta, Dicionario $d)
    {

        if ($meta->getKey() === "list" || $meta->getKey() === "selecao" || $meta->getKey() === "extend_add") {
            if (!empty($meta->getValue())) {
                $dr = new Dicionario($meta->getRelation());
                $dr->setData($meta->getValue());

                return [
                    "title" => $dr->getRelevant()->getValue(),
                    "id" => $meta->getValue(),
                    "mult" => (!empty($meta->getSelect()) ? $this->checkSelecaoUnique($meta) : "")
                ];
            } else {
                return [
                    "title" => "",
                    "id" => "",
                    "mult" => (!empty($meta->getSelect()) ? $this->checkSelecaoUnique($meta) : "")
                ];
            }
        }

        return null;
    }

    /**
     * Busca por campos mult relacionais que precisam ser selecionados
     *
     * @param Meta $meta
     * @param Dicionario $dicionario
     * @return string
     */
    private function checkSelecaoUnique(Meta $meta): string
    {
        $mult = "";

        $tpl = new \Helpers\Template("form");
        foreach ($meta->getSelect() as $select) {

            if (!empty($select->getValue())) {
                $dr = new Dicionario($select->getRelation());
                $dr->setData($select->getValue());
                $tplData = array_merge($select->getDados(), ["title" => $dr->getRelevant()->getValue(), "id" => $select->getValue()]);
            } else {
                $tplData = array_merge($select->getDados(), ["title" => "", "id" => ""]);
            }

            $tplData['nome'] = preg_match('/s$/i', $select->getNome()) ? substr($select->getNome(), 0, strlen($select->getNome()) - 1) : $select->getNome();
            $tplData['genero'] = preg_match('/a$/i', $select->getNome()) ? "a" : "o";
            $tplData['parentColumn'] = $meta->getColumn();
            $tplData['parentValue'] = $meta->getValue() ? 1 : "";
            $tplData['column'] = $select->getColumn();
            $tplData['ngmodel'] = "dados." . $select->getColumn();
            $tplData['entity'] = $meta->getRelation();

            $mult .= $tpl->getShow("selecaoUnique", $tplData);
        }

        return $mult;
    }

    private function getIcons($type)
    {
        switch ($type) {
            case 'email':
                return "email";
                break;
            case 'tel':
                return "settings_phone";
                break;
            case 'cep':
                return "location_on";
                break;
            case 'valor':
                return "attach_money";
                break;
            default:
                return "folder";
        }
    }
}