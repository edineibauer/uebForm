function sanitizeCSS(css) {
    // Remover tags <script>, <iframe>, ou quaisquer tags HTML indesejadas
    css = css.replace(/<\/?[^>]+(>|$)/g, ""); // Remove qualquer tag HTML

    // Verificar por tentativas de injeção de JavaScript
    const invalidPatterns = [
        /javascript:/gi, // Remover "javascript:" em qualquer lugar
        /expression\(/gi, // Remover expressões CSS que executam código
        /url\(["']?javascript:/gi // Remover URLs baseadas em "javascript:"
    ];

    invalidPatterns.forEach(pattern => {
        css = css.replace(pattern, "");
    });

    return css;
}

$(async function () {

    let $target = $("#form-maestru");

    /**
     * Por algum motivo, o id do parent não é encontrado no momento da execução
     * mas após 250ms, ele encontra
     * */
    while($target.parent().attr("id") === undefined)
        await sleep(50);

    if(app.param.css)
        $target.closest(".core-class-container").prepend("<style>" + sanitizeCSS(app.param.css) + "</style>");

    if(!isEmpty(app.param.form)) {
        $target.form(app.param.form.entity, app.param.form.data, app.param.form.fields, !isEmpty(app.param.form.funcaoString) ? eval(app.param.form.funcaoString) : null, app.param.form.modified);
    } else {

        let entity = app.param.entity || app.param.url[0];
        let id = isNumberPositive(app.param.id) ? app.param.id : (isNumberPositive(app.param.url[1]) ? app.param.url[1] : null);
        if (!id) {
            if (!isEmpty(app.param.id) && app.param.id.constructor === Object)
                id = app.param.id;
            else if (!isEmpty(app.param.data) && app.param.data.constructor === Object)
                id = app.param.data;
        }

        let fields = [];
        let hideHeader = false
        if (!isEmpty(app.param.fields) && app.param.fields.constructor === Array) {
            fields = app.param.fields;
        } else if (!isEmpty(app.param.url[2])) {
            app.param.url.shift();
            app.param.url.shift();
            fields = app.param.url;

            if (fields.includes('form-no-header')) {
                fields = fields.filter(field => field !== 'form-no-header');
                hideHeader = true;
            }
        }

        $target.form(entity, id, fields, (app.param.functionCallBack || null), false, hideHeader);
    }
})