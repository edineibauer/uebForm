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
        if(file_exists(PATH_PRIVATE . "_cdn") && is_writable(PATH_PRIVATE . "_cdn")) {
            Helper::createFolderIfNoExist(PATH_PRIVATE . "_cdn/formSaveStatus");
            if(is_writable(PATH_PRIVATE . "_cdn/formSaveStatus")) {

                $userlogin = "";
                if ($user > 0) {
                    $userlogin = $user;
                } elseif (isset($_SESSION) && !empty($_SESSION["userlogin"]["id"])) {
                    $userlogin = $_SESSION["userlogin"]["id"];
                }

                if (!empty($userlogin)) {
                    Helper::createFolderIfNoExist(PATH_PRIVATE . "_cdn/formSaveStatus/" . $userlogin);
                    Config::createFile(PATH_PRIVATE . "_cdn/formSaveStatus/" . $userlogin . "/" . $entity . ".txt", $mensagem);
                }
            }
        }
    }
}