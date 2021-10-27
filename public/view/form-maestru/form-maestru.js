$(function () {
    const entity = PARAM.shift();
    const id = !isEmpty(PARAM[0]) && isNumberPositive(PARAM[0]) ? PARAM.shift() : null;
    $("#form-maestru").form(entity, id, !isEmpty(PARAM[0]) ? PARAM : null);
})