<?php

if(!empty($variaveis[0]) && file_exists(PATH_HOME . "_cdn/formSaveStatus/" . $_SESSION["userlogin"]["id"] . "/" . $variaveis[0] . ".txt"))
    echo file_get_contents(PATH_HOME . "_cdn/formSaveStatus/" . $_SESSION["userlogin"]["id"] . "/" . $variaveis[0] . ".txt");
