var form = {};

$(function ($) {

    /**
     *
     * @param entity (string)* (entidade para montar o formulário)
     * @param id (inteiro) (se informado, abre o formulário com os dados deste ID
     * @param fields (array de strings) (se informado, limita o formulário aos campos informados)
     * @param callback (function) (se informado, os dados salvos serão passados para esta função em vez de salvar no banco)
     * @param pendenteSave (bool) (se informado e for true, o formulário fica como alterado pendente de salvar)
     * @returns {*}
     */
    $.fn.form = async function (entity, id, fields, callback, pendenteSave) {
        if (typeof entity === "string")
            form = await formCrud($(this).attr("id"), entity, id, fields, callback, pendenteSave);

        return this
    }

    clearMarginFormInput();
    $("#app").off("change click", ".formCrudInput, button").on("change click", ".formCrudInput, button", function () {
        clearMarginFormInput()
    })
}, jQuery);

function clearMarginFormInput() {
    $(".parent-input").parent().addClass("margin-bottom padding-tiny");
    $(".parent-input.hide").parent().removeClass("margin-bottom padding-tiny")
}

$("#app").off("keyup change", ".formCrudInput").on("keyup change", ".formCrudInput", async function (e) {
    let $input = $(this);
    if ($input.attr("rel") !== "undefined" && typeof form === "object" && form.identificador === $input.attr("rel")) {
        let column = $input.data("column");
        let format = $input.data("format");
        let value = null;
        let dicionario = dicionarios[form.entity];
        let data = form.data

        if (['checkbox', 'radio'].indexOf(format) > -1)
            $(".error-support[rel='" + column + "']").remove();
        else
            $input.css("border-bottom-color", "#999");

        $input.parent().parent().parent().find(".input-message").html("");
        if (format === "checkbox") {
            value = [];
            let max = ($input.data("max") === "false" ? 1000 : parseInt($input.data("max")));
            max = isNaN(max) ? 1000 : max;
            let v = $input.val().toString();
            if (max > 0) {
                if ($input.is(":checked"))
                    value.push(v.toString());
                form.$element.find("input[name='" + column + "']").each(function (i, e) {
                    if ($(this).is(":checked")) {
                        if (value.length < max && value.indexOf($(this).val().toString()) === -1) {
                            value.push($(this).val().toString())
                        } else if ($(this).val().toString() !== v) {
                            $(this).prop("checked", !1)
                        }
                    }
                })
            }
        } else if (format === "radio") {
            value = form.$element.find("input[name='" + column + "']:checked").val()
        } else if (format === "source" || format === "source_list") {
            value = !$.isArray(data[column]) ? [] : data[column];
            let max = parseInt($input.attr("max"));
            let now = value.length;

            for (let file of e.target.files) {
                if (now < max) {
                    now++;
                    let idMockLoading = Date.now() + Math.floor((Math.random() * 1000000) + 1);

                    /**
                     * DOM update info
                     */
                    $input.parent().siblings(".info-container").find(".input-info").html(now);
                    if (now < max)
                        $input.siblings(".file_gallery").find(".file-more").removeClass("hide");
                    else
                        $input.siblings(".file_gallery").find(".file-more").addClass("hide");

                    /**
                     * Create loading file
                     */
                    createSource({
                        name: idMockLoading,
                        nome: '',
                        sizeName: '',
                        size: 1,
                        url: HOME + "assetsPublic/img/loading.gif?v=" + VERSION,
                        format: {isImage: !0},
                        icon: ""
                    }, $input, 1);

                    /**
                     * Upload the file
                     */
                    AJAX.uploadFile(file).then(mock => {

                        /**
                         * Set the file on form
                         */
                        value.push(mock);

                        /**
                         * Remove loading and create DOM file
                         */
                        $input.siblings(".file_gallery").find("#mock-" + idMockLoading).remove();
                        createSource(mock, $input, 1);
                    });
                }
            }
        } else if (['tel', 'cpf', 'cnpj', 'ie', 'cep', 'card_number'].indexOf(format) > -1) {
            value = $input.cleanVal()
        } else if (dicionario[column].form.input === "switch") {
            value = $input.prop("checked")
        } else if (dicionario[column].format === "list") {
            searchList($input)
        } else {
            value = $input.val()
        }
        if (dicionario[column].format !== "list") {
            data[column] = await _getDefaultValue(dicionario[column], value);
            if (typeof data[column] !== "number") {
                let size = (typeof data[column] === "string" || $.isArray(data[column]) ? data[column].length : 0);
                $input.siblings(".info-container").find(".input-info").html(size)
            }
        }
        if (!form.loading)
            form.modified = true;

        form.setColumnValue(column, value);
        checkRules(form.entity, column, value);
    }

}).off("click", ".remove-file-gallery").on("click", ".remove-file-gallery", function () {
    if (confirm("Remover arquivo?"))
        removeFileForm($(this))
}).off("click", ".btn-form-list").on("click", ".btn-form-list", function () {
    form.save(0).then(() => {
        animateBack(".maestru-form-control").grid(form.entity)
    })
}).off("click", ".btn-form-save").on("click", ".btn-form-save", function () {
    form.save()
}).off("dblclick", ".list").on("dblclick", ".list", function () {
    searchList($(this))
}).off("click", ".switch-status-extend").on("click", ".switch-status-extend", function () {
    let column = $(this).data("column");
    let id = $(this).data("id");
    let valor = $(this).prop("checked");
    $(this).data("status", valor);
    $.each(form.data[column], function (i, e) {
        if (e.id == id) {
            e.columnStatus.value = valor;
            e[e.columnStatus.column] = valor ? 1 : 0;
            return !1
        }
    })
});

function removeFileForm($btn, tempo) {
    let $input = $btn.closest(".file_gallery").siblings("input[type='file']");
    let column = $input.data("column");
    let max = $input.attr("max");
    let name = $btn.attr("rel");
    let data = form.data;

    if ($.isArray(data[column]) && data[column].length > 0) {
        $.each(data[column], function (id, e) {
            if (e.name === name) {
                data[column].splice(id, 1);
                $input.val("");
                $input.parent().siblings(".info-container").find(".input-info").html(data[column].length);
                form.modified = true;

                if (typeof tempo === "number") {
                    setTimeout(function () {
                        $input.siblings(".file_gallery").find("#mock-" + name).remove()
                    }, tempo)
                } else {
                    $input.siblings(".file_gallery").find("#mock-" + name).remove()
                }
                if (data[column].length < max)
                    $input.siblings(".file_gallery").find(".file-more").removeClass("hide");
                return !1
            }
        })
    }
}

function checkRules(entity, column, value) {
    $.each(dicionarios[entity], function (k, f) {
        if (!isEmpty(f.rules)) {
            $.each(f.rules, function (j, r) {
                $.each(dicionarios[entity], function (i, e) {
                    if (e.id == r.campo && column == e.column) {
                        if (typeof value !== "undefined" && value !== null && (value.constructor === Array ? value.length && value.indexOf(r.valor.toString()) > -1 : r.valor.toString().toLowerCase().trim() == value.toString().toLowerCase().trim())) {
                            applyRules(entity, r, f.column)
                        } else {
                            applyRules(entity, f, f.column)
                        }
                    }
                })
            })
        }
    })
}

function applyRules(entity, rule, column) {
    let $input = $("[data-column='" + column + "']");
    let $parent = $input.closest(".parent-input");
    if (typeof rule.form.display !== "undefined" && rule.form.display) {
        $parent.removeClass("hide");
        $parent.parent().removeClass("s12 s11 s10 s9 s8 s7 s6 s5 s4 s3 s2 s1 m12 m11 m10 m9 m8 m7 m6 m5 m4 m3 m2 m1 l12 l11 l10 l9 l8 l7 l6 l5 l4 l3 l2 l1").addClass("s" + (!isEmpty(rule.form.cols) ? rule.form.cols : "12") + (!isEmpty(rule.form.colm) ? " m" + rule.form.colm : "") + (!isEmpty(rule.form.coll) ? " l" + rule.form.coll : ""));
        if (!isEmpty(rule.form.class))
            $parent.addClass(rule.form.class);
        if (!isEmpty(rule.form.atributos))
            $parent.attr(rule.form.atributos)
    } else {
        $parent.addClass("hide");
        $input.val("")
    }
    if (rule.update) {
        $parent.removeClass("disabled")
    } else {
        $parent.addClass("disabled")
    }
    let $label = $parent.find(".formLabel");
    if (rule.unique) {
        let txt = $label.html().split("<");
        $label.html(txt[0].trim() + " <sup class='color-text-red'><b>*</b></sup>")
    } else {
        let txt = $label.html().split("<");
        $label.html(txt[0].trim())
    }
    if (isEmpty($input.val()) && rule.default !== !1 && !isEmpty(rule.default))
        $input.val(rule.default)
}

function createSource(mock, $input, tipo, prepend) {
    if (!isEmpty(mock)) {
        let tpl = (tipo === 1 ? 'file_list_source' : 'file_source');
        return getTemplates().then(templates => {
            if (typeof prepend !== "undefined")
                $input.siblings(".file_gallery").prepend(Mustache.render(templates[tpl], mock)); else $input.siblings(".file_gallery").append(Mustache.render(templates[tpl], mock))
        })
    }
}

async function searchList($input) {
    let search = $input.val();
    let column = $input.data("column");
    if ($input.is(":focus")) {
        let entity = $input.data("entity");
        let templates = await getTemplates();
        let relevants = await dbLocal.exeRead("__relevant", 1);
        let dataRead = await db.exeRead(entity, search, 10);
        let results = [];
        $.each(dataRead, function (i, datum) {

            let optionValues = [];
            $.each(datum, function (col, val) {
                let dc = dicionarios[entity][col];
                if (typeof dc !== "undefined" && dc.format !== "password" && dc.key !== "information" && dc.column !== "system_id" && dc.key !== "identifier" && dc.nome !== "" && relevants.indexOf(dc.format) > -1)
                    optionValues.push({content: val, column: col, peso: relevants.indexOf(dc.format)})
            });

            optionValues = orderBy(optionValues, 'peso').reverse();

            let content = "";
            for (let i = 0; i < 3; i++) {
                if (typeof optionValues[i] === "object" && optionValues[i] !== null)
                    content += "<div class='mode-text-colorText padding-tiny margin-right col'><small class='padding-tiny'>" + optionValues[i].column + ":</small> " + optionValues[i].content + (i === 2 || typeof optionValues[i + 1] === "undefined" ? "" : ", ") + "</div>";
            }
            results.push({
                id: datum.id,
                text: content
            })

            if (results.length > 14)
                return !1
        });
        $input.siblings("#list-result-" + column).off("mousedown", ".list-option").on("mousedown", ".list-option", function () {
            addListSetTitle(form, entity, column, $(this).attr("rel"), $input.parent())
        }).html(Mustache.render(templates.list_result, {data: results}))

        $input.off("blur").on("blur", function () {
            $input.val("");
            $input.siblings("#list-result-" + column).html("")
        }).off("keydown").on("keydown", function (e) {
            if (e.which === 13 && $input.siblings("#list-result-" + column).find(".list-option").length)
                addListSetTitle(form, entity, column, $input.siblings("#list-result-" + column).find(".list-option").first().attr("rel"), $input.parent())
        })
    } else {
        $input.siblings("#list-result-" + column).html("")
    }
}

/**
 * Altera a interface do formulário para mostrar que o mesmo esta salvando
 * */
function setFormSaveStatus(form, status) {
    form.saving = typeof status === "undefined";
    if (form.saving) {
        form.$element.find(".loadindTableSpace").find(".btn-form-list").addClass("disabled").prop("disabled", "disabled");
        form.$element.find(".parent-save-form-mini").find("button").html("<img src='" + HOME + "assetsPublic/img/loading.gif?v=" + VERSION + "' height='22' style='height: 22px;margin: 1px;' class='right'>");
        form.$element.find(".parent-save-form").find("button").html("<img src='" + HOME + "assetsPublic/img/loading.gif?v=" + VERSION + "' height='20' style='height: 20px;margin-bottom: -3px;margin-right: 12px;'>Salvando");
    } else {
        form.$element.find(".loadindTableSpace").find(".btn-form-list").removeClass("disabled").prop("disabled", "");
        form.$element.find(".parent-save-form-mini").find("button").html("<i class='material-icons left'>save</i>")
        form.$element.find(".parent-save-form").find("button").html(form.options.buttonText);
    }
}

function callback() {
    if (typeof form.funcao === "function")
        return form.funcao();

    return 0;
}

function saveForm(id) {
    form.save()
}

function privateFormSetError(form, error, showMessages, destroy) {
    if (showMessages) {
        if (typeof navigator.vibrate !== "undefined")
            navigator.vibrate(100);

        toast("Corrija o formulário", 1500, "toast-warning");
        showErrorField(form.$element, error, dicionarios[form.entity], form.entity, 1);
        setFormSaveStatus(form, 1)
    }
    if (typeof destroy !== "undefined") {
        form = Object.assign({}, form);
        form.destroy()
    }
}

async function formCrud(target, entity, id, fields, functionCallBack, pendenteSave) {
    let $target = $("#" + target);
    if (!$target.length)
        return {};

    target = $target.parent().attr("id");
    fields = typeof fields === "object" && fields !== null && fields.constructor === Array && fields.length ? fields : null;

    let formCrud = {
        identificador: Math.floor((Math.random() * 1000)) + "" + Date.now(),
        entity: entity,
        id: "",
        data: {},
        dataOld: {},
        dataRelation: [],
        error: {},
        inputs: [],
        funcao: "",
        store: true,
        columnRelation: null,
        header: true,
        modified: (typeof pendenteSave !== "undefined" && pendenteSave),
        saving: false,
        loading: true,
        target: target,
        $element: $target,
        options: {
            saveButton: !0,
            autoSave: !1,
            buttonText: "<i class='material-icons left padding-right'>save</i>Salvar"
        },
        goodName: function () {
            return function (text, render) {
                return ucFirst(replaceAll(replaceAll(render(text), "_", " "), "-", " "));
            }
        },
        setRelationColumn: function(column) {
            if(typeof column === "string") {
                this.columnRelation = column;
                let nav = JSON.parse(localStorage.getItem("navigation_" + this.target));
                nav[nav.length - 1].param.form.columnRelation = column;
                localStorage.setItem("navigation_" + this.target, JSON.stringify(nav));
            }
        },
        setColumnValue: async function(column, value) {
            this.data[column] = await _getDefaultValue(dicionarios[this.entity][column], value);
            form.modified = true;

            let nav = JSON.parse(localStorage.getItem("navigation_" + this.target));
            nav[nav.length - 1].param.form.data[column] = this.data[column];
            localStorage.setItem("navigation_" + this.target, JSON.stringify(nav));
        },
        setData: async function (dados) {
            if (isEmpty(dicionarios[this.entity])) {
                toast("Erro: '" + this.entity + "' não esta acessível", 5000, "toast-warning");
                return;
            }

            let $this = this;
            $this.id = "";
            $this.data = {};

            if (typeof dados === "undefined" || isEmpty(dados)) {
                $this.data = _getDefaultValues($this.entity);
            } else {
                for(let col in dados) {
                    if (col === "id")
                        $this.id = $this.data.id = (isNumberPositive(dados[col]) ? parseInt(dados[col]) : "");
                    else if (typeof dicionarios[$this.entity][col] === "object")
                        $this.data[col] = await _getDefaultValue(dicionarios[$this.entity][col], dados[col]);
                }
            }

            $this.dataOld = Object.assign({}, $this.data);
        },
        setId: async function (id) {
            if (isNumberPositive(id)) {
                let loadData = await loadEntityData(this.entity, parseInt(id));
                this.dataRelation = loadData[1];
                await this.setData(loadData[0]);
            }
        },
        setFuncao: function (funcao) {
            this.funcao = funcao;
            this.store = false;
        },
        show: async function (id, fields) {
            let $this = this;
            if (typeof fields === "object")
                $this.fields = fields;

            if (isNumberPositive(id))
                await $this.setId(id);
            else if (!isEmpty(id) && typeof id === "object" && id.constructor === Object)
                await $this.setData(id);
            else if (isEmpty($this.id) && isEmpty($this.data))
                await $this.setData();

            $this.inputs = await getInputsTemplates($this);
            if (this.$element !== "") {
                this.$element.find(".maestru-form-control").remove();
                this.$element.prepend(await $this.getShow());
                loadMask(this);
                this.loading = !1;
            }
        },
        getShow: function () {
            this.loading = !0
            let action = isNumberPositive(this.id) ? "update" : "create";
            return permissionToAction(this.entity, action).then(have => {
                if (have) {
                    return getTemplates().then(templates => {
                        return Mustache.render(templates.formCrud, this)
                    })
                } else {
                    return "<h2 class='form-control col align-center padding-32 color-text-gray-dark'>Sem Permissão para " + (action === "update" ? "Atualizar" : "Adicionar") + "</h2>"
                }
            })
        },
        save: async function (showMessages, destroy) {
            showMessages = typeof showMessages === "undefined" || ["false", "0", 0, false].indexOf(showMessages) === -1;
            let form = this;

            if (form.saving)
                return Promise.all([]);

            setFormSaveStatus(form);

            return validateForm(form.identificador).then(async validado => {
                if (validado) {
                    /**
                     * Obtém dados do formulário
                     * */
                    let dados = Object.assign({}, form.data);
                    dados.id = (isNumberPositive(form.id) ? form.id : dados.id);

                    form.modified = false;
                    if (form.store) {
                        let dbCreate = await db.exeCreate(form.entity, dados);

                        setFormSaveStatus(form, 1);

                        /**
                         * Show errors on form
                         */
                        if (!dbCreate.response) {
                            form.error = dbCreate.data[form.entity];
                            privateFormSetError(form, form.error, showMessages, destroy);

                        } else {
                            /**
                             * Show success
                             */
                            if (showMessages)
                                toast("Salvo", 2000, 'toast-success');

                            /**
                             * Verifica se é um formulário de autocomplete para preencher no formulário anterior
                             * */
                            let n = JSON.parse(localStorage.getItem("navigation_" + this.target));
                            if(localStorage.getItem("navigation_" + this.target) && n.length > 1) {
                                let routeBefore = n[n.length-2];
                                if(!isEmpty(routeBefore.param.form) && !isEmpty(routeBefore.param.form.columnRelation)) {
                                    if(dicionarios[routeBefore.param.form.entity][routeBefore.param.form.columnRelation].group === "many") {
                                        if(isEmpty(n[n.length - 2].param.form.data[routeBefore.param.form.columnRelation]))
                                            n[n.length - 2].param.form.data[routeBefore.param.form.columnRelation] = [];

                                        n[n.length - 2].param.form.data[routeBefore.param.form.columnRelation].push(parseInt(dbCreate.data.id));
                                    } else if(isEmpty(routeBefore.param.form.data[routeBefore.param.form.columnRelation])) {
                                        n[n.length - 2].param.form.data[routeBefore.param.form.columnRelation] = parseInt(dbCreate.data.id);
                                    }
                                    n[n.length - 2].param.form.modified = true;

                                    localStorage.setItem("navigation_" + target, JSON.stringify(n));
                                }
                            }

                            /**
                             * Se tiver navegação para trás, volta, senão, mantém o formulário aberto para edição
                             */
                            if(!localStorage.getItem("navigation_" + target) || n.length < 2) {
                                form.dataRelation = dbCreate.data.relationData;
                                await form.show(dbCreate.data);
                            } else {
                                goBackMaestruNavigation(this.target, "back");
                            }
                        }

                    } else {
                        form.funcao(form.data);
                    }

                } else {
                    privateFormSetError(form, form.error, showMessages, destroy);
                    return 1
                }
            }).catch(e => {
                toast("Erro ao salvar formulário.", 2000, 'toast-error');
                console.log(e);
            })
        },
        destroy: function () {
            this.$element.html("");
            delete (form)
        }
    };

    if (typeof functionCallBack === "function")
        formCrud.setFuncao(functionCallBack);

    await formCrud.show((isNumberPositive(id) || typeof id === "object" ? id : null), fields);

    let navigation = JSON.parse(localStorage.getItem( "navigation_" + formCrud.target));
    if (navigation) {
        if (!isEmpty(formCrud.funcao) && typeof formCrud.funcao === "function")
            formCrud.funcaoString = formCrud.funcao.toString();

        navigation[navigation.length - 1].param.form = formCrud;
        localStorage.setItem( "navigation_" + formCrud.target, JSON.stringify(navigation))
    }

    return formCrud;
}

async function getInputsTemplates(form, col) {
    let templates = await getTemplates();
    let inputs = [];
    let promessas = [];
    let position = 0;
    let dic = orderBy(dicionarios[form.entity], "indice").reverse();
    let info = (await dbLocal.exeRead('__info', 1))[form.entity];

    for (let meta of dic) {

        /**
         * Ignore system_id field if not have association or if not is admin
         * remove status field
         * Social login remove password fields
         */
        let isEditingMyPerfil = USER.setor === form.entity && form.id == USER.setorData.id;
        let myPerfilIsSocial = isEditingMyPerfil && (USER.login_social === "2" || USER.login_social === "1");

        /**
         * System_id field on form aditional verification
         */
        if (meta.column === "system_id" && USER.setor !== "admin" && (isEmpty(info['system']) || !!USER.system_id))
            continue;

        if (meta.nome === "" || (isEditingMyPerfil && meta.format === "status") || (myPerfilIsSocial && meta.format === "password"))
            continue;

        /**
         * Check if have to show this field
         */
        if ((isEmpty(form.fields) && isEmpty(col)) || (!isEmpty(form.fields) && form.fields.indexOf(meta.column) > -1) || (!isEmpty(col) && col === meta.column)) {
            let metaInput = Object.assign({}, meta);
            metaInput.value = form.data[meta.column] || "";
            metaInput.isNumeric = ["float", "decimal", "smallint", "int", "tinyint"].indexOf(metaInput.type) > -1;
            metaInput.valueLenght = (metaInput.isNumeric && isNumber(metaInput.minimo) ? metaInput.minimo : metaInput.value.length);
            metaInput.isFull = metaInput.valueLenght === metaInput.size;
            metaInput.disabled = isNumberPositive(form.id) && !metaInput.update;

            if (!isEmpty(metaInput.default) && metaInput.default.length > 7)
                metaInput.default = Mustache.render(metaInput.default, {
                    vendor: VENDOR,
                    home: HOME,
                    version: VERSION,
                    USER: USER,
                    URL: URL
                });

            metaInput = getExtraMeta(form.identificador, form.entity, metaInput);

            if (metaInput.format === "password") {
                metaInput.value = "";
                metaInput.nome = "Definir nova senha"
            }

            metaInput.form = (typeof metaInput.form !== "object" ? {} : metaInput.form);
            metaInput.form.class = (!isEmpty(metaInput.form.class) ? metaInput.form.class : "") + (typeof meta.form.display !== "undefined" && !meta.form.display ? " hide" : "");

            if (metaInput.format === "extend") {
                let p = position;
                promessas.push(getInputsTemplates({
                    entity: metaInput.relation,
                    dicionario: dicionarios[metaInput.relation],
                    identificador: form.identificador,
                    data: metaInput.value
                }).then(inp => {
                    metaInput.inputs = inp;
                    inputs.splice(p, 0, Mustache.render(templates[metaInput.form.input], metaInput))
                }));

            } else if (typeof templates[metaInput.form.input] === "string") {
                let file_source = "";
                switch (metaInput.format) {
                    case 'source_list':
                        file_source = "file_list_source";
                        break;
                    case 'source':
                        file_source = "file_source";
                        break;
                    case 'extend_mult':
                        file_source = "extend_register";
                        break;
                    case 'extend_folder':
                        file_source = "extend_register_folder";
                        break
                }

                if (!isEmpty(metaInput.value) && typeof metaInput.value === "object" && metaInput.value.constructor === Array && (metaInput.format === 'source_list' || metaInput.format === "file_list_source")) {
                    $.each(metaInput.value, function (i, e) {
                        metaInput.value[i].isImage = e.isImage === "true" || e.isImage === 1 || e.isImage === true;
                    })
                }

                /**
                 * Include JS and CSS defined on input type metadados
                 */
                let jsContent = (!isEmpty(metaInput.lib) && !isEmpty(metaInput.js) ? "<script src='" + HOME + VENDOR + metaInput.lib + "/public/assets/" + metaInput.js + ".js'></script>" : "");
                let cssContent = (!isEmpty(metaInput.lib) && !isEmpty(metaInput.css) ? "<link rel='stylesheet' href='" + HOME + VENDOR + metaInput.lib + "/public/assets/" + metaInput.css + ".css'>" : "");

                inputs.splice(position, 0, Mustache.render(templates[metaInput.form.input], metaInput, {file_source: templates[file_source]}) + jsContent + cssContent);
            }

            position++
        }
    }

    return Promise.all(promessas).then(d => {
        return inputs
    })
}

async function loadEntityData(entity, id) {
    let dados = {};
    let data = await db.exeRead(entity, id);

    if (!isEmpty(data)) {
        for (let col in data[0]) {
            if (typeof dicionarios[entity][col] === 'object' && dicionarios[entity][col] !== null && dicionarios[entity][col].format !== "information")
                dados[col] = await _getDefaultValue(dicionarios[entity][col], data[0][col])
        }
        return [dados, data[0].relationData];
    }

    return [{}, []];
}

function getExtraMeta(identificador, entity, meta) {
    meta.formIdentificador = identificador;
    meta.entity = entity;
    meta.home = HOME;
    meta.valueJson = typeof meta.value === "object" && meta.value !== null ? JSON.stringify(meta.value) : (isJson(meta.value) ? meta.value : null);
    meta.multiples = meta.size && meta.size > 1;
    meta.allow.empty = typeof meta.allow.options === "object" && $.isEmptyObject(meta.allow.options);
    meta.required = meta.default === !1;

    if (meta.group === "select") {
        $.each(meta.allow.options, function (i, e) {
            e.formIdentificador = identificador;
            if (meta.format === "checkbox")
                meta.allow.options[i].isChecked = (!isEmpty(meta.value) && (meta.value == e.valor || ($.isArray(meta.value) && (meta.value.indexOf(parseInt(e.valor)) > -1 || meta.value.indexOf(e.valor.toString()) > -1))));
            else
                meta.allow.options[i].isChecked = (meta.value && meta.value == e.valor)
        })

    } else if (meta.format === "extend_folder" || meta.format === "extend_mult" && !isEmpty(meta.value) && meta.value.constructor === Array && meta.value.length) {
        $.each(meta.value, function (i, e) {
            if (typeof e.columnStatus === "undefined") {
                e.columnStatus = {column: '', have: !1, value: !1}
            } else {
                e.formIdentificador = identificador;
                e.columnStatus.have = e.columnStatus.have === "true" || e.columnStatus.have === "1";
                e.columnStatus.value = e.columnStatus.value === "true" || e.columnStatus.value === "1"
            }
        })
    }

    return meta
}

function loadMask(form) {
    let $form = form.$element;
    let SPMaskBehavior = function (val) {
        return val.replace(/\D/g, '').length === 11 ? '(00) 00000-0000' : '(00) 0000-00009'
    }, spOptions = {
        onKeyPress: function (val, e, field, options) {
            field.mask(SPMaskBehavior.apply({}, arguments), options)
        }
    };

    if ($form.find("input[type='tel']").length)
        $form.find("input[type='tel']").mask(SPMaskBehavior, spOptions);

    if ($form.find(".ie").length)
        $form.find(".ie").find("input").mask('999.999.999.999', {reverse: !0});

    if ($form.find(".cpf").length)
        $form.find(".cpf").find("input").mask('999.999.999-99', {reverse: !0});

    if ($form.find(".cnpj").length)
        $form.find(".cnpj").find("input").mask('99.999.999/9999-99', {reverse: !0});

    if ($form.find(".cep").length)
        $form.find(".cep").find("input").mask('99999-999', {reverse: !0});

    if ($form.find(".percent").length)
        $form.find('.percent').find("input").mask('##0,00%', {reverse: !0});

    if ($form.find(".valor").length)
        $form.find(".valor").find("input").mask('#.##0,00', {reverse: !0});

    if ($form.find(".valor_decimal").length)
        $form.find(".valor_decimal").find("input").mask('#.##0,000', {reverse: !0});

    if ($form.find(".valor_decimal_plus").length)
        $form.find(".valor_decimal_plus").find("input").mask('#.##0,0000', {reverse: !0});

    if ($form.find(".valor_decimal_minus").length)
        $form.find(".valor_decimal_minus").find("input").mask('#.##0,0', {reverse: !0});

    if ($form.find(".valor_decimal_none").length)
        $form.find(".valor_decimal_none").find("input").mask('#.##0', {reverse: !0});

    if ($form.find(".date_time").length)
        $form.find('.date_time').find("input").mask('00/00/0000 00:00:00');

    if ($form.find(".card_number").length)
        $form.find('.card_number').find("input").mask('0000 0000 0000 0000 0000', {reverse: !0});

    if ($form.find("input[data-format='float']").length)
        $form.find("input[data-format='float']").mask("#0.00", {reverse: !0});

    $form.find("input[data-format='float'], input[data-format='number']").off("keypress").on("keypress", function (evt) {
        if (evt.which != 8 && evt.which != 0 && evt.which < 48 || evt.which > 57)
            evt.preventDefault()
    });

    $form.find("input").on("click focus", function () {
        $(this).removeAttr("readonly")
    });

    $.each($form.find(".list"), async function () {
        let value = (typeof form.dataRelation !== "undefined" && typeof form.dataRelation[$(this).attr("id")] !== "undefined" && !isEmpty(form.dataRelation[$(this).attr("id")]) ? form.dataRelation[$(this).attr("id")] : $(this).data("value"));

        if (isNumberPositive(value)) {
            let entity = $(this).data("entity");
            let data = await db.exeRead(entity, value);
            if (!isEmpty(data))
                await setInputFormatListValue(form, entity, $(this).data("column"), data[0], $(this).parent());
        }
    });

    checkUserOptions();
    clearMarginFormInput();
    loadFolderDrag();
    $form.find("input[type='text'].formCrudInput, input[type='tel'].formCrudInput, input[type='number'].formCrudInput").trigger("change");

    $(document).bind('keydown', function (e) {
        if (e.ctrlKey && (e.which === 83)) {
            e.preventDefault();
            form.save();
            return false;
        }
    });
}

function loadFolderDrag() {
    $(".extend_list_register").sortable({
        revert: !1, stop: function () {
            let $div = $(this).closest(".extend_list_register");
            let column = $div.data("column");
            let order = [];
            $div.children(".extend_register").each(function () {
                let id = parseInt($(this).attr('rel'));
                for (let i in form.data[column]) {
                    if (typeof form.data[column][i] === "object" && parseInt(form.data[column][i].id) === id) {
                        order.push(form.data[column][i]);
                        break
                    }
                }
            });
            form.setColumnValue(column, order);
        }
    })
}

async function addListSetTitle(form, entity, column, id, $input) {
    if (isNumberPositive(id)) {
        form.setColumnValue(column, id);
        let data = await db.exeRead(entity, id);
        if (!isEmpty(data))
            await setInputFormatListValue(form, entity, column, data[0], $input);

    }
}

async function setInputFormatListValue(form, entity, column, data, $input) {
    let point = ".";
    $input.find("input[type='text']").prop("disabled", !0).val("carregando valor");
    let intt = setInterval(function () {
        $input.find("input[type='text']").val("carregando valor " + point);
        point = (point === "." ? ".." : (point === ".." ? "..." : "."))
    }, 300);

    let title = await getRelevantTitle(entity, data);

    clearInterval(intt);
    $input.siblings(".btn").find(".list-btn-icon").html("edit");
    $input.siblings(".btn").find("div").html("editar");
    $input.prop("disabled", !1).addClass("border-bottom").removeClass("padding-small").css({
        "padding": "10px 2px 6px",
        "margin-bottom": "20px"
    }).html(title);

    $input.siblings(".list-remove-btn").remove();
    let dicionario = dicionarios[form.entity];

    if (isNaN(form.id) || dicionario[column].update) {
        $("<div class='right pointer list-remove-btn color-text-gray-dark color-hover-text-red' style='padding: 7px 10px' onclick=\"deleteRegisterAssociation('" + column + "', this)\"><i class='material-icons'>close</i></div>").insertBefore($input);
        form.modified = !0;
    }
}

function deleteRegisterAssociation(col, el) {
    if (confirm("Remover Associação com este registro?")) {
        form.setColumnValue(col, null);
        getInputsTemplates(form, col).then(inputTemplate => {
            $(el).closest(".parent-input").parent().replaceWith(inputTemplate[0])
        })
    }
}

/**
 * Single form autocomplete relation
 * */
async function addRegisterAssociation(entity, column) {
    form.setRelationColumn(column);
    pageTransition("form/" + entity + (!isEmpty(form.data[column]) && isNumberPositive(form.data[column]) ? "/" + form.data[column] : ""), form.target);
}

/**
 * Single form relation
 * */
function editFormRelation(entity, column) {
    form.setRelationColumn(column);
    pageTransition("form/" + entity, form.target, {
        data: (!isEmpty(form.data[column]) ? form.data[column] : null),
        functionCallBack: ((data) => {
            data.id = Math.floor((Math.random() * 1000)) + "" + Date.now();
            let nav = JSON.parse(localStorage.getItem("navigation_" + form.target));
            let formBefore = nav[nav.length -2].param.form;
            formBefore.data[formBefore.columnRelation] = data;
            formBefore.columnRelation = null;
            formBefore.modified = true;
            localStorage.setItem("navigation_" + form.target, JSON.stringify(nav));
            goBackMaestruNavigation(form.target);
        })
    });
}

function deleteRegisterRelation(column) {
    if (confirm("Remover o registro vinculado?")) {
        let $btn = $(".deleteRegisterRelation[rel='" + column + "']").siblings(".btn");
        $btn.find("i.material-icons").html("add");
        $btn.find("div").html("adicionar");
        form.data[column] = null;
        form.setColumnValue(column, null);
        $(".deleteRegisterRelation[rel='" + column + "'], .registerRelationName[rel='" + column + "']").remove();
    }
}

/**
 * Mult form relation
 * */
function editFormRelationMult(entity, column, id) {
    if (dicionarios[form.entity][column].size === !1 || typeof form.data[column] === "string" || form.data[column] === null || dicionarios[form.entity][column].size > form.data[column].length) {
        let f = null;
        if(isNumberPositive(id) && !isEmpty(form.data[column]))
            f = form.data[column].find(e => e.id == id);

        form.setRelationColumn(column);
        pageTransition("form/" + entity, form.target, {
            data: f,
            functionCallBack: ((data) => {
                let nav = JSON.parse(localStorage.getItem("navigation_" + form.target));
                let navTarget = nav[nav.length -2];

                if(isEmpty(navTarget.param.form.data[navTarget.param.form.columnRelation]) || navTarget.param.form.data[navTarget.param.form.columnRelation].constructor !== Array)
                    navTarget.param.form.data[navTarget.param.form.columnRelation] = [];

                if(isNumberPositive(data.id)) {
                    let elementPos = navTarget.param.form.data[navTarget.param.form.columnRelation].map((x) => {return x.id; }).indexOf(data.id);
                    if(elementPos > -1) {
                        navTarget.param.form.data[navTarget.param.form.columnRelation][elementPos] = data;
                    } else {
                        data.id = Math.floor((Math.random() * 1000)) + "" + Date.now();
                        navTarget.param.form.data[navTarget.param.form.columnRelation].push(data);
                    }
                } else {
                    data.id = parseInt(Math.floor((Math.random() * 1000)) + "" + Date.now());
                    navTarget.param.form.data[navTarget.param.form.columnRelation].push(data);
                }

                navTarget.param.form.modified = true;

                localStorage.setItem("navigation_" + form.target, JSON.stringify(nav));
                goBackMaestruNavigation(form.target);
            })
        });
    } else {
        toast("máximo de registros atingido", 2500, "toast-warning");
    }
}

function deleteExtendMult(column, id) {
    if (confirm("Remover Registro?")) {

        let elementPos = form.data[column].map((x) => {return x.id; }).indexOf(parseInt(id));
        if(elementPos > -1) {
            form.data[column].splice(elementPos, 1);
            form.setColumnValue(column, form.data[column]);
        }

        let $reg = form.$element.find(".extend_register[rel='" + id + "']");
        let $regList = $reg.closest(".extend_list_register");
        $regList.css("height", $regList.css("height")).css("height", (parseInt($regList.css("height")) - parseInt($reg.css("height"))) + "px");
        $reg.css("height", $reg.css("height")).css("height", 0).removeClass("padding-small");
        setTimeout(function () {
            $reg.remove()
        }, 300)
    }
}

function searchListMult($input) {
    let search = $input.val();
    let column = $input.attr("data-column");
    if ($input.is(":focus")) {

        /**
         * Input focus action show results
         * */

        let entity = $input.attr("data-entity");

        if (typeof form.data[column] === null || isEmpty(form.data[column]))
            form.setColumnValue(column, []);

        dbLocal.exeRead("__relevant", 1).then(rel => {
            db.exeRead(entity, search).then(r => {
                let contagemMax = 0;
                let lista = "";

                $.each(r, function (i, datum) {
                    if (form.data[column].indexOf(parseInt(datum.id)) === -1) {
                        let col = "";
                        for (let rr in rel) {
                            for (let dd in dicionarios[entity]) {
                                if (dicionarios[entity][dd].format === rel[rr]) {
                                    col = dd;
                                    break;
                                }
                            }
                            if (col !== "")
                                break;
                        }

                        if (col !== "") {
                            let val = datum[col];

                            /**
                             * Busca em cada campo por um valor que seja parecido com o pesquisado no autocomplete
                             **/
                            if (val === "" || (typeof val === "string" && val.toLowerCase() === search.toLocaleString()) || (typeof val === "string" && (val.indexOf(search) > -1 || val.toLowerCase().indexOf(search) > -1))) {
                                lista += '<li rel="' + datum.id + '" data-title="' + val + '" class="listMultOption col font-light container padding-tiny hover-opacity-off pointer opacity"><span class="color-gray padding-tiny padding-left padding-right s-hide">' + col + '</span><span class="padding-left">' + val + '</span></li>';
                                contagemMax++;
                            }
                        }
                    }

                    /**
                     * Máximo de resultados na lista
                     */
                    if (contagemMax > 14)
                        return !1
                });

                return lista;
            }).then(lista => {

                /**
                 * Cria caixa com resultados
                 * */
                if (!isEmpty(lista)) {
                    $input.siblings("#list-result-" + column).html('<ul class="col s12 card list-result-itens border radius">' + lista + '</ul>')
                        .off("mousedown", ".listMultOption")
                        .on("mousedown", ".listMultOption", function () {

                            /**
                             * Adiciona ação ao clicar em uma opção
                             */
                            addListMultBadge($(this).attr("rel"), $(this).data("title"), $input);
                        });
                }
            });
        });

        $input.off("blur").on("blur", function () {

            /**
             * Out from input action
             * */
            $input.val("");
            $input.siblings("#list-result-" + column).html("");

        }).off("keydown").on("keydown", function (e) {

            /**
             * Enter button action
             * */
            if (e.key === 13 && $input.siblings("#list-result-" + column).find(".listMultOption").length) {
                $input.val("");
                let option = $input.siblings("#list-result-" + column).find(".listMultOption").first();
                addListMultBadge(option.attr("rel"), option.data("title"), $input);
            }
        });

    } else {

        /**
         * Out from input action
         * */
        $input.siblings("#list-result-" + column).html("")
    }
}

function inputListMultSize() {
    $(".listMult").each(function (i, e) {
        $(e).css("width", "calc(100% - " + $(e).siblings(".badgeListMult").width() + "px)");
    });
}

function addListMultBadge(id, title, $input) {
    let column = $input.attr("id");

    /**
     * se o form.data desta input não existir, cria ela
     */
    if (isEmpty(form.data[column]))
        form.setColumnValue(column, []);

    /**
     * Adiciona o ID a lista no form.data
     */
    form.data[column].push(parseInt(id));
    form.setColumnValue(column, form.data[column]);

    /**
     * Adiciona o badge na input
     */
    $input.siblings(".badgeListMult").append("<div class='badge badgeListMultOption' rel='{{column}}' data-id='" + id + "'>" + title + "<i class='material-icons close'>close</i></div>");
    inputListMultSize();
}

function removeBadge(id, column) {
    if (confirm("Remover item?")) {
        $(".badgeListMultOption[rel='" + column + "'][data-id='" + id + "']").remove();
        removeItemArray(form.data[column], parseInt(id));
        form.setColumnValue(column, form.data[column]);
        inputListMultSize();
    }
}