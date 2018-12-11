function loadForm(){
    $(".form-crud").off("click", "#saveFormButton").on("click", "#saveFormButton", function () {
        formSave($(this).closest(".form-crud"), true);
    });
    loadMask();
    formAutoSubmit(".form-control");
}