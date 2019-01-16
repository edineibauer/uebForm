if(typeof loadFormulario === "undefined") {
    function loadFormulario() {
        let entityFormulario = app.route.replace("formulario/", "");
        let idFormulario = 0;
        if (entityFormulario.indexOf('/') > -1) {
            let t = entityFormulario.split('/');
            entityFormulario = t[0];
            if (!isEmpty(t[1]) && !isNaN(t[1]) && t[1] > 0)
                idFormulario = parseInt(t[1]);
        }

        //entity title
        let p = new RegExp(/s$/i);
        let title = ucFirst((p.test(entityFormulario) ? entityFormulario.substr(0, (entityFormulario.length - 1)) : entityFormulario).replaceAll('_', ' ').replaceAll('-', ' '));
        $("#formulario-header").find("h4").html(title + " <small class='opacity'> >> " + (idFormulario > 0 ? "edição" : "novo") + "</small>");
        $("#formulario-header").find("a").attr("href", HOME + "listagem/" + entityFormulario);

        //form
        $("#formulario").form(entityFormulario, idFormulario);
    }
}

$(function () {
    loadFormulario();
});
