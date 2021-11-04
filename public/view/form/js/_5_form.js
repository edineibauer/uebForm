$(async function () {

    let $target = $("#form-maestru");

    /**
     * Por algum motivo, o id do parent não é encontrado no momento da execução
     * mas após 250ms, ele encontra
     * */
    while($target.parent().attr("id") === undefined)
        await sleep(50);

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
        if (!isEmpty(app.param.fields) && app.param.fields.constructor === Array) {
            fields = app.param.fields;
        } else if (!isEmpty(app.param.url[2])) {
            app.param.url.shift();
            app.param.url.shift();
            fields = app.param.url;
        }

        $target.form(entity, id, fields, app.param.functionCallBack || null);
    }
})