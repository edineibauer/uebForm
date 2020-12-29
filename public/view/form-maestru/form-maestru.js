$(function () {
    let entity = PARAM.shift();
    let id = !isEmpty(PARAM[0]) && isNumberPositive(PARAM[0]) ? PARAM.shift() : null;
    $("#form-maestru").form(entity, id, !isEmpty(PARAM[0]) ? PARAM : null);

    history.replaceState(
        {
            id: id,
            identificador: Math.floor((Math.random() * 1000)) + "" + Date.now(),
            route: entity,
            type: "form",
            target: "#form-maestru",
            param: {},
            scroll: null
        },
        null,
        HOME + (HOME === "" && HOME !== SERVER ? "index.html?url=" : "") + history.state.route
    );
})