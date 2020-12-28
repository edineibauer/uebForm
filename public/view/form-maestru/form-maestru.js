$(function () {
    $("#form-maestru").form(PARAM[0], isNumberPositive(PARAM[1]) ? PARAM[1] : null);
})