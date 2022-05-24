<?php

namespace Form;

use \Config\Config;
use Helpers\Helper;

class Status
{
    /**
     * @param string $entity
     * @param string $mensagem
     * @return void
     */
    public static function setMensagem(string $entity, string $mensagem) {
        Helper::createFolderIfNoExist(PATH_HOME . "_cdn");
        Helper::createFolderIfNoExist(PATH_HOME . "_cdn/formSaveStatus");
        if(isset($_SESSION) && !empty($_SESSION["userlogin"]["id"])) {
            Helper::createFolderIfNoExist(PATH_HOME . "_cdn/formSaveStatus/" . $_SESSION["userlogin"]["id"]);
            Config::createFile(PATH_HOME . "_cdn/formSaveStatus/" . $_SESSION["userlogin"]["id"] . "/" . $entity . ".txt", $mensagem);
        }
    }
}