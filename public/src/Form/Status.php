<?php

namespace Form;

use \Config\Config;
use Helpers\Helper;

class Status
{
    /**
     * @param string $entity
     * @param string $mensagem
     * @param int|null $user
     * @return void
     */
    public static function setMensagem(string $entity, string $mensagem, int $user = null)
    {
        if(is_writable(PATH_HOME)) {
            Helper::createFolderIfNoExist(PATH_HOME . "_cdn");
            if(is_writable(PATH_HOME . "_cdn")) {
                Helper::createFolderIfNoExist(PATH_HOME . "_cdn/formSaveStatus");
                if(is_writable(PATH_HOME . "_cdn/formSaveStatus")) {

                    $userlogin = "";
                    if ($user > 0) {
                        $userlogin = $user;
                    } elseif (isset($_SESSION) && !empty($_SESSION["userlogin"]["id"])) {
                        $userlogin = $_SESSION["userlogin"]["id"];
                    }

                    if (!empty($userlogin)) {
                        Helper::createFolderIfNoExist(PATH_HOME . "_cdn/formSaveStatus/" . $userlogin);
                        Config::createFile(PATH_HOME . "_cdn/formSaveStatus/" . $userlogin . "/" . $entity . ".txt", $mensagem);
                    }
                }
            }
        }
    }
}