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
        let data = form.data;

        if(format === 'list_mult')
            return;

        form.loading = true;

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
                    await AJAX.uploadFile(file).then((mock) => {

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
            value = $input.prop("checked");
        } else {
            value = $input.val()
        }

        data[column] = await _getDefaultValue(dicionario[column], value);
        if (typeof data[column] !== "number") {
            let size = (typeof data[column] === "string" || $.isArray(data[column]) ? data[column].length : 0);
            $input.siblings(".info-container").find(".input-info").html(size)
        }

        await form.setColumnValue(column, value);
        checkRules(form.entity, column, value);

        form.loading = false;
    }

}).off("click", ".remove-file-gallery").on("click", ".remove-file-gallery", function () {
    if (confirm("Remover arquivo?"))
        removeFileForm($(this));

}).off("click", ".btn-form-list").on("click", ".btn-form-list", function () {
    form.save(0).then(() => {
        animateBack(".maestru-form-control").grid(form.entity)
    });

}).off("click", ".btn-form-save").on("click", ".btn-form-save", function () {
    form.save();

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
        let templates = getTemplates();
        let $gal = $input.siblings(".file_gallery");
        if (typeof prepend !== "undefined") {
            $gal.prepend(Mustache.render(templates[tpl], mock));
        } else {
            $gal.append(Mustache.render(templates[tpl], mock))
        }
    }
}

async function searchList($input) {
    let ativoSearch = true;
    let column = $input.data("column");
    let $search = $input.siblings("#list-result-" + column);
    let search = $input.val();
    search = (!isEmpty(search) ? {"*": "%" + search + "%"} : {});

    if ($input.is(":focus")) {
        let entity = $input.data("entity");
        let templates = getTemplates();
        $search.html(Mustache.render(templates.list_result_skeleton));

        $input.off("blur").on("blur", function () {
            $input.val("");
            $search.html("");
            ativoSearch = false;
        });

        let infoEntity = (JSON.parse(sessionStorage.__info))[entity];
        let colStatus = (!isEmpty(infoEntity.status) ? Object.values(dicionarios[entity]).find(e => e.id == infoEntity.status)?.column : "");
        if(!isEmpty(colStatus))
            search[colStatus] = 1;

        let dataRead = await db.exeRead(entity, search, 10);

        if(ativoSearch) {
            let results = [];
            for(let datum of dataRead) {
                let colStatus = (!isEmpty(infoEntity.status) ? Object.values(dicionarios[entity]).find(e => e.id == infoEntity.status)?.column : "");
                if(colStatus && !datum[colStatus])
                    continue;

                results.push({
                    id: datum.id,
                    text: (await getRelevantTitle(entity, datum))
                });
            }

            $search.off("mousedown", ".list-option").on("mousedown", ".list-option", function () {
                addListSetTitle(form, entity, column, $(this).attr("rel"), $input.parent())
            }).html(Mustache.render(templates.list_result, {data: results}));

            $input.off("keyup").on("keyup", function (e) {
                if (e.which === 13 && !isEmpty(results)) {
                    let $opt = $search.find(".list-option.active").length ? $search.find(".list-option.active") : $search.find(".list-option").first();
                    addListSetTitle(form, entity, column, $opt.attr("rel"), $input.parent());
                }
            })
        } else {
            $search.html("");
        }
    } else {
        $search.html("")
    }
}

/**
 * Altera a interface do formulário para mostrar que o mesmo esta salvando
 * */
function setFormSaveStatus(form, status) {
    form.saving = typeof status === "undefined";
    if (form.saving) {
        form.$element.find(".loadindTableSpace").find(".btn-form-list").addClass("disabled").prop("disabled", "disabled");
        form.$element.find(".parent-save-form-mini").find("button").html("<img src='" + HOME + "assetsPublic/img/loading.gif?v=" + VERSION + "' height='22' style='height: 22px;margin: 1px;' class='left'><div class='left padding-left-8'>Salvando</div>");
        form.$element.find(".parent-save-form").find("button").html("<img src='" + HOME + "assetsPublic/img/loading.gif?v=" + VERSION + "' height='20' style='height: 20px;margin-bottom: -3px;margin-right: 12px;'>Salvando");
    } else {
        form.$element.find(".loadindTableSpace").find(".btn-form-list").removeClass("disabled").prop("disabled", "");
        form.$element.find(".parent-save-form-mini").find("button").html("<i class='material-icons left'>save</i><div class='left padding-left-8'>salvar</div>")
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
        showErrorField(form.$element, error, dicionarios[form.entity]);
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
                let nav = JSON.parse(sessionStorage.getItem("navigation_" + this.target));
                nav[nav.length - 1].param.form.columnRelation = column;

                salvaNavegacaoHistorico("navigation_" + this.target, nav);
            }
        },
        setColumnValue: async function(column, value) {
            this.data[column] = await _getDefaultValue(dicionarios[this.entity][column], value);
            form.modified = true;

            let nav = JSON.parse(sessionStorage.getItem("navigation_" + this.target));
            nav[nav.length - 1].param.form.data[column] = this.data[column];
            salvaNavegacaoHistorico("navigation_" + this.target, nav);
        },
        setData: async function (dados) {
            if (isEmpty(dicionarios[this.entity])) {
                toast("Erro: '" + this.entity + "' não esta acessível", 5000, "toast-warning");
                return;
            }

            let $this = this;
            $this.id = "";
            $this.data = {};
            let info = JSON.parse(sessionStorage.__info)[this.entity];

            if (typeof dados === "undefined" || isEmpty(dados)) {
                $this.data = await _getDefaultValues($this.entity);
            } else {
                for(let col in dados) {
                    if (col === "id")
                        $this.id = $this.data.id = (isNumberPositive(dados[col]) ? parseInt(dados[col]) : "");
                    else if (typeof dicionarios[$this.entity][col] === "object")
                        $this.data[col] = await _getDefaultValue(dicionarios[$this.entity][col], dados[col]);
                }
            }

            if(isEmpty($this.data.id) && isEmpty($this.data.system_id) && sessionStorage.getItem("navigation_" + $this.target)) {
                let n = JSON.parse(sessionStorage.getItem("navigation_" + $this.target));

                if(typeof n[n.length -2] !== "undefined" && typeof n[n.length -2].param.form !== "undefined" && !isEmpty(n[n.length -2].param.form.columnRelation) && !isEmpty(info.system) && info.system === n[n.length -2].param.form.entity)
                    $this.data.system_id = n[n.length -2].param.form.data.id;
            }

            $this.dataOld = Object.assign({}, $this.data);
        },
        setId: async function (id) {
            if (isNumberPositive(id))
                await this.setData(await loadEntityData(this.entity, parseInt(id)));
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
                this.loading = true;

                this.$element.find(".maestru-form-control").remove();
                this.$element.prepend(await $this.getShow());
                loadMask(this);

                this.loading = false;
            }
        },
        getShow: function () {
            let action = isNumberPositive(this.id) ? "update" : "create";
            return permissionToAction(this.entity, action).then(have => {
                if (have) {
                    return Mustache.render(getTemplates().formCrud, this)
                } else {
                    return "<h2 class='form-control col align-center padding-32 color-text-gray-dark'>Sem Permissão para " + (action === "update" ? "Atualizar" : "Adicionar") + "</h2>"
                }
            })
        },
        save: async function (showMessages, destroy) {
            showMessages = typeof showMessages === "undefined" || ["false", "0", 0, false].indexOf(showMessages) === -1;
            let form = this;

            while(form.loading)
                await sleep(100);

            if (form.saving)
                return Promise.all([]);

            setFormSaveStatus(form);

            return validateForm().then(async validado => {
                if (validado) {
                    /**
                     * Obtém dados do formulário
                     * */
                    let dados = Object.assign({}, form.data);
                    dados.id = (isNumberPositive(form.id) ? form.id : dados.id);

                    form.modified = false;
                    if (form.store) {

                        /**
                         * Faz request ao servidor perguntando sobre o andamento do status de salvamento do formulário
                         * */
                        let checkStatus = setInterval(async function () {
                            $(".saveStatusCallBack").text(await AJAX.get("formSaveStatus/" + form.entity));
                        }, 1000);

                        /**
                         * Salva o formulário
                         * */
                        let dbCreate = await db.exeCreate(form.entity, dados);

                        //desliga o status do save no servidor
                        clearInterval(checkStatus);

                        setFormSaveStatus(form, 1);

                        /**
                         * Show errors on form
                         */
                        if (!dbCreate.response || dbCreate.response !== 1) {
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
                            let n = JSON.parse(sessionStorage.getItem("navigation_" + this.target));
                            if(isEmpty(this.data.id) && sessionStorage.getItem("navigation_" + this.target) && n.length > 1) {
                                let routeBefore = n[n.length-2];

                                if(!isEmpty(routeBefore.param.form) && !isEmpty(routeBefore.param.form.columnRelation)) {
                                    let valueFinalToSave = null;
                                    if(dicionarios[routeBefore.param.form.entity][routeBefore.param.form.columnRelation].group === "many") {
                                        if(isEmpty(n[n.length - 2].param.form.data[routeBefore.param.form.columnRelation]))
                                            n[n.length - 2].param.form.data[routeBefore.param.form.columnRelation] = [];

                                        n[n.length - 2].param.form.data[routeBefore.param.form.columnRelation].push(parseInt(dbCreate.data));
                                        valueFinalToSave = JSON.stringify(n[n.length - 2].param.form.data[routeBefore.param.form.columnRelation].map(n => n.toString()));
                                    } else if(isEmpty(routeBefore.param.form.data[routeBefore.param.form.columnRelation])) {
                                        n[n.length - 2].param.form.data[routeBefore.param.form.columnRelation] = parseInt(dbCreate.data);
                                        valueFinalToSave = n[n.length - 2].param.form.data[routeBefore.param.form.columnRelation];
                                    }

                                    /**
                                     * Se o formulário anterior já existe no banco, atualiza o valor do campo para garantir
                                     */
                                    if(isNumberPositive(n[n.length - 2].param.form.data.id)) {
                                        await AJAX.post('saveAutocompleteAssociation', {
                                            entity: n[n.length - 2].param.form.entity,
                                            id: n[n.length - 2].param.form.data.id,
                                            column: routeBefore.param.form.columnRelation,
                                            value: valueFinalToSave
                                        });
                                    }

                                    n[n.length - 2].param.form.modified = true;
                                    salvaNavegacaoHistorico("navigation_" + target, n);
                                }
                            }

                            /**
                             * Se tiver navegação para trás, volta, senão, mantém o formulário aberto para edição
                             */
                            if(!sessionStorage.getItem("navigation_" + target) || n.length < 2) {
                                await form.show(dbCreate.data);
                            } else {
                                goBackMaestruNavigation(this.target, "back");
                            }
                        }

                    } else {

                        /**
                         * Verifica se é um formulário para preencher no formulário anterior
                         * */
                        let n = JSON.parse(sessionStorage.getItem("navigation_" + this.target));
                        if(sessionStorage.getItem("navigation_" + this.target) && n.length > 1) {
                            let routeBefore = n[n.length-2];

                            /**
                             * Se o formulário anterior já existe no banco, atualiza o valor do campo para garantir
                             */
                            if(!isEmpty(routeBefore.param.form) && !isEmpty(routeBefore.param.form.columnRelation) && isNumberPositive(n[n.length - 2].param.form.data.id)) {

                                let dataF = {};

                                for(let col of JSON.parse(sessionStorage.__info)[form.entity].columns_readable) {
                                    if(typeof form.data[col] !== "undefined" && col !== "id" && col !== "system_id" && col !== "system_entity")
                                        dataF[col] = form.data[col];
                                }

                                dataF.id = Math.random().toString().slice(2, 18);
                                dataF.columnTituloExtend = await getRelevantTitle(form.entity, dataF);
                                dataF.columnName = routeBefore.param.form.columnRelation;
                                dataF.columnRelation = form.entity;
                                dataF.columnStatus = {column: '', have: !1, value: !1};

                                let dataAtual = dataF;
                                if(dicionarios[routeBefore.param.form.entity][routeBefore.param.form.columnRelation].group === "many") {
                                    dataAtual = routeBefore.param.form.data[routeBefore.param.form.columnRelation] || [];
                                    dataAtual.push(dataF);
                                }

                                await AJAX.post('saveAutocompleteAssociation', {
                                    entity: n[n.length - 2].param.form.entity,
                                    id: n[n.length - 2].param.form.data.id,
                                    column: routeBefore.param.form.columnRelation,
                                    value: JSON.stringify(dataAtual)
                                });
                            }
                        }

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

    let navigation = JSON.parse(sessionStorage.getItem( "navigation_" + formCrud.target));
    if (navigation) {
        if (!isEmpty(formCrud.funcao) && typeof formCrud.funcao === "function")
            formCrud.funcaoString = formCrud.funcao.toString();

        navigation[navigation.length - 1].param.form = {
            entity: formCrud.entity,
            columnRelation: formCrud.columnRelation,
            modified: formCrud.modified,
            data: formCrud.data,
            fields: formCrud.fields,
            funcaoString: (!isEmpty(formCrud.funcao) && typeof formCrud.funcao === "function" ? formCrud.funcao.toString() : null)
        };
        salvaNavegacaoHistorico("navigation_" + formCrud.target, navigation);
    }

    return formCrud;
}

async function getInputsTemplates(form, col) {
    let templates = getTemplates();
    let inputs = [];
    let promessas = [];
    let position = 0;
    let dic = orderBy(dicionarios[form.entity], "indice").reverse();
    let infoData = JSON.parse(sessionStorage.__info);
    let info = infoData[form.entity];
    let haveFilesIcons = false;

    for (let meta of dic) {

        /**
         * Ignore system_id field if not have association or if not is admin
         * remove status field
         * Social login remove password fields
         */
        let isEditingMyPerfil = USER.setor === form.entity && form.id == USER.setorData.id;
        let myPerfilIsSocial = isEditingMyPerfil && (USER.login_social === "2" || USER.login_social === "1");

        /**
         * Verifica se mostra o campo system_id
         * irá mostrar caso seja um admin
         * ou caso seja um usuário system parent
         */
        if (meta.column === "system_id") {
            if(isEmpty(info.system) || info.system === USER.setor || (USER.setor !== "admin" && infoData[info.system].system !== infoData[USER.setor].system))
                continue;

            /**
             * Formulário veio de outro formulário e consegue autopreencher o system_id, então não mostra o campo
             */
            if(!isEmpty(form.data.system_id) && sessionStorage.getItem("navigation_" + form.target)) {
                let n = JSON.parse(sessionStorage.getItem("navigation_" + form.target));

                if(typeof n[n.length -2] !== "undefined" && typeof n[n.length -2].param.form !== "undefined" && !isEmpty(n[n.length -2].param.form.columnRelation))
                    continue;
            }

            if(!meta.nome.startsWith("Atribuir ao "))
                meta.nome = "Atribuir ao " + meta.nome;
        }

        if (meta.nome === "" || (isEditingMyPerfil && meta.format === "status") || (myPerfilIsSocial && meta.format === "password"))
            continue;

        /**
         * Check if have to show this field
         */
        if ((isEmpty(form.fields) && isEmpty(col)) || (!isEmpty(form.fields) && form.fields.indexOf(meta.column) > -1) || (!isEmpty(col) && col === meta.column)) {
            let metaInput = Object.assign({}, meta);
            metaInput.value = form.data[meta.column] || (form.data[meta.column] === 0 ? 0 : "");
            metaInput.isNumeric = ["float", "decimal", "smallint", "int", "tinyint"].indexOf(metaInput.type) > -1;
            metaInput.valueLenght = (metaInput.isNumeric && isNumber(metaInput.minimo) ? metaInput.minimo : metaInput.value.length);
            metaInput.isFull = metaInput.valueLenght === metaInput.size;
            metaInput.disabled = isNumberPositive(form.id) && !metaInput.update;

            if (metaInput.format === "password") {
                if(isNumberPositive(form.id)) {
                    metaInput.default = "";
                    metaInput.nome = "Nova senha";
                    if (metaInput.value.length === 32)
                        metaInput.value = "";
                } else {
                    for(let mm of dic) {
                        if(mm.column === "usuarios_id") {
                            metaInput.default = false;
                            break;
                        }
                    }
                }
            }

            if (!isEmpty(metaInput.default) && metaInput.default.length > 7)
                metaInput.default = Mustache.render(metaInput.default, {
                    vendor: VENDOR,
                    home: HOME,
                    version: VERSION,
                    USER: USER,
                    URL: URL
                });

            metaInput = getExtraMeta(form.identificador, form.entity, metaInput);

            metaInput.form = (typeof metaInput.form !== "object" ? {} : metaInput.form);
            metaInput.form.class = (!isEmpty(metaInput.form.class) ? metaInput.form.class : "") + (typeof meta.form.display !== "undefined" && !meta.form.display ? " hide" : "");

            if (typeof templates[metaInput.form.input] === "string") {
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

                if((metaInput.form.input === "list_mult" || metaInput.form.input === "list") && !metaInput.autocompleteexists)
                    metaInput.form.input = "list_save" + (metaInput.form.input === "list_mult" ? "_mult" : "");

                let extraContent = "";
                if(!haveFilesIcons && ["source", "source_list"].indexOf(metaInput.format) > -1) {
                    haveFilesIcons = true;
                    extraContent = templates.fileIconTypes;
                }

                inputs.splice(position, 0,  extraContent + Mustache.render(templates[metaInput.form.input], metaInput, {file_source: templates[file_source]}) + jsContent + cssContent);
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
    }

    return dados;
}

function getExtraMeta(identificador, entity, meta) {
    meta.formIdentificador = identificador;
    meta.entity = entity;
    meta.home = HOME;
    meta.haveAjuda = !isEmpty(meta.ajuda);
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

    if ($form.find(".percent").length) {
        let $v = $form.find('.percent').find("input");
        $v.each(function (i, e) {
            let v = $(e).val();
            checkRules(v)
            if(v !== '') {
                if(/,/.test(v))
                    v = parseFloat(v.replace(",", ".")).toFixed(2);
                else
                    v = parseFloat(v).toFixed(2);

                $(e).val(v);
            }
        });

        $v.mask('##0,00%', {reverse: !0});
    }

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
        let value = $(this).data("value");
        if (isNumberPositive(value))
            await setInputFormatListValue(form, $(this).data("entity"), $(this).data("column"), value, $(this).parent());
    });

    $form.find(".ajuda").off("click").on("click", async function (e) {
        e.preventDefault();
        if($(this).parent().parent().find(".ajudatext").length)
            return;

        await sleep(10);
        let $ajuda = $("<div class='ajudatext left d-inline'>" + $(this).attr("title") + "</div>").appendTo($(this).parent().parent()).on("click", function(e) {
            e.preventDefault();
        });
        await sleep(10000);
        $ajuda.remove();
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
                order.push(parseInt($(this).attr('rel')));
            });
            form.setColumnValue(column, order);
        }
    })
}

async function addListSetTitle(form, entity, column, id, $input) {
    if (isNumberPositive(id)) {
        await form.setColumnValue(column, id);
        await setInputFormatListValue(form, entity, column, id, $input);
    }
}

async function setInputFormatListValue(form, entity, column, id, $input) {
    let $inputText = $input.find("input").prop("disabled", true).attr("readonly", "readonly");
    $inputText.val("Carregando valor .");
    $input.siblings(".btn").addClass("hide");
    let loadingText = setInterval(function () {
        if($inputText.val() === "Carregando valor .")
            $inputText.val("Carregando valor ..");
        else if($inputText.val() === "Carregando valor ..")
            $inputText.val("Carregando valor ...");
        else
            $inputText.val("Carregando valor .");
    }, 300);

    let title = await getRelevantTitle(entity, (await db.exeRead(entity, id))[0]);
    clearInterval(loadingText);
    $input.siblings(".btn").removeClass("hide");
    $inputText.prop("disabled", false).removeAttr("readonly");

    $input.siblings(".btn").find(".list-btn-icon").html("edit");
    $input.siblings(".btn").find("div").html("editar");
    $input.prop("disabled", !1).addClass("border-bottom").removeClass("padding-small").css({
        "padding": "10px 2px 6px",
        "margin-bottom": "20px"
    }).html(title);

    let dicionario = dicionarios[form.entity];

    $input.siblings(".list-remove-btn").removeClass("hide");

    if (isNaN(form.id) || dicionario[column].update)
        form.modified = true;
}

function deleteRegisterAssociation(col) {
    form.setColumnValue(col, null);
    getInputsTemplates(form, col).then(inputTemplate => {
        $(".list-remove-btn[rel='" + col + "']").addClass("hide").closest(".parent-input").parent().replaceWith(inputTemplate[0]);
    })
}

/**
 * Single form autocomplete relation
 * */
async function addRegisterAssociation(entity, column) {
    form.setRelationColumn(column);
    pageTransition("form/" + entity + (!isEmpty(form.data[column]) && isNumberPositive(form.data[column]) ? "/" + form.data[column] : ""), form.target);
}

function editFormMultRelation(entity, id, column) {
    form.setRelationColumn(column);
    pageTransition("form/" + entity + "/" + id, form.target);
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
            let nav = JSON.parse(sessionStorage.getItem("navigation_" + form.target));
            let formBefore = nav[nav.length -2].param.form;
            formBefore.data[formBefore.columnRelation] = data;
            formBefore.columnRelation = null;
            formBefore.modified = true;
            salvaNavegacaoHistorico("navigation_" + form.target, nav);
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
                let nav = JSON.parse(sessionStorage.getItem("navigation_" + form.target));
                let navTarget = nav[nav.length -2];

                if(isEmpty(navTarget.param.form.data[navTarget.param.form.columnRelation]) || navTarget.param.form.data[navTarget.param.form.columnRelation].constructor !== Array)
                    navTarget.param.form.data[navTarget.param.form.columnRelation] = [];

                if(isNumberPositive(data.id)) {
                    let elementPos = navTarget.param.form.data[navTarget.param.form.columnRelation].map((x) => {return x.id; }).indexOf(data.id);
                    if(elementPos === -1)
                        elementPos = navTarget.param.form.data[navTarget.param.form.columnRelation].map((x) => {return x.id; }).indexOf(data.id.toString());

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

                salvaNavegacaoHistorico("navigation_" + form.target, nav);
                goBackMaestruNavigation(form.target);
            })
        });
    } else {
        toast("máximo de registros atingido", 2500, "toast-warning");
    }
}

async function deleteExtendMult(column, id) {
    let elementPos = form.data[column].map((x) => { return x.id; }).indexOf(parseInt(id));
    if(elementPos === -1)
        elementPos = form.data[column].map((x) => { return x.id; }).indexOf(id);

    if(elementPos > -1) {
        form.data[column].splice(elementPos, 1);
        form.setColumnValue(column, form.data[column]);

        let $reg = form.$element.find(".extend_register[rel='" + id + "']");
        let $regList = $reg.closest(".extend_list_register");
        $regList.css("height", $regList.css("height")).css("height", (parseInt($regList.css("height")) - parseInt($reg.css("height"))) + "px");
        $reg.css("height", $reg.css("height")).css("height", 0).removeClass("padding-small");

        await sleep(300);
        $reg.remove()

    } else {
        toast("Registro não encontrado para remover", "toast-warning");
    }
}

async function searchListMult($input) {
    let ativoSearch = true;
    let $search = $input.siblings(".list-results");
    let search = $input.val();
    let column = $input.attr("data-column");
    if (!$input.is(":focus")) {
        $search.html("");
        return;
    }

    /**
     * Input focus action show results
     * */

    let entity = $input.attr("data-entity");

    if (typeof form.data[column] === null || isEmpty(form.data[column]))
        form.setColumnValue(column, []);

    let templates = getTemplates();
    $search.html(Mustache.render(templates.list_result_skeleton));

    $input.off("blur").on("blur", function () {
        $input.val("");
        $search.html("");
        ativoSearch = false;
    });

    let infoEntity = (JSON.parse(sessionStorage.__info))[entity];
    let r = await db.exeRead(entity, search, 15);

    if(ativoSearch) {
        let results = [];
        for (let datum of r) {
            let colStatus = (!isEmpty(infoEntity.status) ? Object.values(dicionarios[entity]).find(e => e.id == infoEntity.status)?.column : "");
            if ((colStatus && !datum[colStatus]) || form.data[column].indexOf(parseInt(datum.id)) > -1 || form.data[column].indexOf(datum.id) > -1)
                continue;

            results.push({
                id: datum.id,
                text: (await getRelevantTitle(entity, datum))
            });
        }

        /**
         * Cria caixa com resultados
         * */
        if (!isEmpty(results)) {
            $search.html(Mustache.render(templates.list_result, {data: results}))
                .off("mousedown", ".list-option")
                .on("mousedown", ".list-option", async function () {

                    /**
                     * Adiciona ação ao clicar em uma opção
                     */
                    addListMultBadge($(this).attr("rel"), $(this).find("span").text().trim(), $input);
                });
        } else {
            $search.html('<ul class="col s12 card list-result-itens border radius opacity" style="padding: 3px 10px!important;">Nenhum resultado</ul>')
        }

        $input.off("keydown").on("keydown", async function (e) {
            if (e.which === 13 && !isEmpty(results)) {
                let option = $search.find(".list-option.active").length ? $search.find(".list-option.active") : $search.find(".list-option").first();
                addListMultBadge(option.attr("rel"), option.find("span").text().trim(), $input);
                $input.val("").blur();
                $search.html("");
            }
        });
    } else {
        $search.html("");
    }
}

function inputListMultSize() {
    $(".listMult").each(function (i, e) {
        let wb = $(e).siblings(".badgeListMult").width();
        let pr = $(e).siblings(".badgeListMult").parent().width();
        if(wb + 151 > pr)
            $(e).css("width", "100%");
        else
            $(e).css("width", "calc(100% - " + wb + "px)");
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
    $input.siblings(".badgeListMult").append("<div class='badge badgeListMultOption' onclick=\"removeBadge(" + id + ", '" + column + "')\" rel='" + column + "' data-id='" + id + "'>" + title + "<i class='material-icons close'>close</i></div>");
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

async function removeListSaveItem(column, id) {
    if (confirm("Remover item?")) {

        await db.exeDelete('{{relation}}', id);

        removeItemArray(form.data[column], parseInt(id));
        form.setColumnValue(column, form.data[column]);

        let $reg = form.$element.find(".extend_register[rel='" + id + "']");
        let $regList = $reg.closest(".extend_list_register");
        $regList.css("height", $regList.css("height")).css("height", (parseInt($regList.css("height")) - parseInt($reg.css("height"))) + "px");
        $reg.css("height", $reg.css("height")).css("height", 0).removeClass("padding-small");

        await sleep(300);
        $reg.remove()
    }
}

$(function () {
    $(document).off("mouseup").on("mouseup", async function (e) {
        await sleep(5);
        $(".ajudatext").remove();
    });

    let timeWrite = 0;

    /**
     * Atribui função ao click duplo nesta input
     */
    $("#form-maestru").off("focus", ".list").on("focus", ".list", function () {
        searchList($(this));

    }).off("keyup", ".list").on("keyup", ".list", function (e) {
        let $search = $(this).siblings(".list-results");
        if(e.which === 40) {
            if(!$search.find("li.active").length) {
                $search.find("li:first-of-type").addClass("active");
            } else if($search.find("li.active").next().length) {
                $search.find("li.active").removeClass("active").next().addClass("active");
            }

        } else if(e.which === 38) {
            if(!$search.find("li.active").length) {
                $search.find("li:last-of-type").addClass("active");
            } else if($search.find("li.active").prev().length) {
                $search.find("li.active").removeClass("active").prev().addClass("active");
            }

        } else if ([13, 9, 16, 17, 18, 19, 20, 27, 33, 34, 35, 36, 37, 39, 45, 46, 91, 92, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123, 144, 145].indexOf(e.which) === -1) {
            let $this = $(this);
            clearTimeout(timeWrite);
            timeWrite = setTimeout(function () {
                searchList($this);
            }, 300);
        }

    }).off("focus", ".listMult").on("focus", ".listMult", function () {
        searchListMult($(this));

    }).off("keyup", ".listMult").on("keyup", ".listMult", function (e) {
        let $search = $(this).siblings(".list-results");
        if(e.which === 40) {
            if(!$search.find("li.active").length) {
                $search.find("li:first-of-type").addClass("active");
            } else if($search.find("li.active").next().length) {
                $search.find("li.active").removeClass("active").next().addClass("active");
            }

        } else if(e.which === 38) {
            if(!$search.find("li.active").length) {
                $search.find("li:last-of-type").addClass("active");
            } else if($search.find("li.active").prev().length) {
                $search.find("li.active").removeClass("active").prev().addClass("active");
            }

        } else if ([13, 9, 16, 17, 18, 19, 20, 27, 33, 34, 35, 36, 37, 39, 45, 46, 91, 92, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123, 144, 145].indexOf(e.which) === -1) {
            let $this = $(this);
            clearTimeout(timeWrite);
            timeWrite = setTimeout(function () {
                searchListMult($this);
            }, 300);
        }

    }).off("click", ".btnListAction").on("click", ".btnListAction", function () {
        addRegisterAssociation($(this).data("entity"), $(this).data("column"));
    });

    inputListMultSize();
})