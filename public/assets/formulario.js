$(function () {
    let entityFormulario = app.route.replace("formulario/", "");
    let idFormulario = 0;
    if (entityFormulario.indexOf('/') > -1) {
        let t = entityFormulario.split('/');
        entityFormulario = t[0];
        if (!isEmpty(t[1]) && !isNaN(t[1]) && t[1] > 0)
            idFormulario = parseInt(t[1]);
    }

    $("#formulario").form(entityFormulario, idFormulario);
});
