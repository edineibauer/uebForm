function validateDicionario(entity, dicionario, form, action) {
    let promessas = [];
    let entityData = (SERVICEWORKER ? db.exeRead(entity) : new Promise((s, f) => {s([])}));
    return Promise.all([entityData]).then(entityData => {
        entityData = entityData[0];

        for(let i in dicionario) {
            let meta = dicionario[i];

            if (meta.key === "identifier")
                continue;

            if (meta.column === "system_id" && USER.setor !== "admin")
                continue;

            if(meta.format === "password")
                meta.default = (action === "create" ? false : "");

            let data = form.data;
            if (data !== null) {
                let dataOld = form.dataOld;
                let error = form.error;
                let value = typeof data !== "undefined" && typeof data[meta.column] !== "undefined" ? data[meta.column] : "";
                if (!isEmpty(value)) {
                    promessas.push(validateMetaUnique(meta, value, form.id, entityData, error));
                    validateMetaEspecialFields(meta, value, error)
                }
                if (!validateRules(entity, meta, value, error, data, dataOld, action)) {
                    validateMetaUpdate(meta, data, dataOld, action);
                    validateMetaNull(meta, value, error);
                    if (!isEmpty(value)) {
                        validateMetaSize(meta, value, error);
                        validateMetaRegExp(meta, value, error)
                    }
                }
            }
        }

        return Promise.all(promessas)
    })
}

function validateRules(entity, meta, value, error, data, dataOld, action) {
    let find = !1;
    if (!isEmpty(meta.rules)) {
        $.each(meta.rules, function (j, r) {
            $.each(dicionarios[entity], function (i, e) {
                if (r.campo == e.id) {
                    $.each(dicionarios[entity], function (p, d) {
                        if (r.campo === d.id) {
                            if (typeof data[d.column] !== "undefined" && data[d.column] !== null && (data[d.column].constructor === Array ? data[d.column].length && data[d.column].indexOf(r.valor.toString()) > -1 : r.valor.toString().toLowerCase().trim() == data[d.column].toString().toLowerCase().trim())) {
                                validateMetaUpdate(r, data, dataOld, action);
                                validateMetaNull(r, value, error);
                                if (!isEmpty(value)) {
                                    validateMetaSize(r, value, error);
                                    validateMetaRegExp(r, value, error)
                                }
                                find = !0;
                                return !1
                            }
                            return !1
                        }
                    })
                }
            });
            if (find)
                return !1
        })
    }
    return find
}

function validateForm() {
    let action = isNumberPositive(form.id) ? 'update' : 'create';
    clearFormError(form);
    return havePermission(form.entity, form.data, action).then(permission => {
        if (permission) {
            return validateDicionario(form.entity, dicionarios[form.entity], form, action).then(() => {
                return formNotHaveError(form.error)
            })
        } else {
            form.error = {"id" : "Sem permissão para " + (isNumberPositive(form.id) ? "atualizar" : "criar")};
        }
        return !1
    })
}

function formNotHaveError(errors) {
    let isValidate = !0;
    $.each(errors, function (col, erro) {
        if (isValidate) {
            if (typeof erro === "object")
                isValidate = formNotHaveError(erro); else if (erro !== "")
                isValidate = !1
        }
    });
    return isValidate
}

function clearFormError(form) {
    $(".error-support").remove();
    form.$element.find(".input-message").html("").siblings("input").css("border-bottom-color", "#999");
    $.each(form.error, function (i, e) {
        form.error[i] = ""
    })
}

function validateMetaUpdate(meta, data, dataOld, action) {
    if (action === "update" && !meta.update)
        data[meta.column] = dataOld[meta.column]
}

function validateMetaNull(meta, value, error) {
    if (meta.default === !1 && isEmpty(value))
        error[meta.column] = "Preencha este Campo"; else if (meta.group === "boolean" && meta.default === !1 && value === !1)
        error[meta.column] = "Este campo é obrigatório"
}

function validateMetaSize(meta, value, error) {
    if (typeof meta.size === "number") {
        if (["float", "decimal", "smallint", "int", "tinyint"].indexOf(meta.type) > -1) {
            if (isNumber(value) && value > meta.size)
                error[meta.column] = "Informe um valor menor ou igual a " + meta.size
        } else if (meta.type !== "json" && typeof value === "string" && value.length > meta.size) {
            error[meta.column] = "Tamanho excedido. Máximo de " + meta.size + " caracteres."
        } else if (["source", "json"].indexOf(meta.type) > -1 && $.isArray(value) && value.length > meta.size) {
            error[meta.column] = "Máximo de " + meta.size + " arquivos."
        }
    }
    if (typeof meta.minimo === "number") {
        if (["float", "decimal", "smallint", "int", "tinyint"].indexOf(meta.type) > -1) {
            if (isNumber(value) && value < meta.minimo)
                error[meta.column] = "Informe um valor maior ou igual a " + meta.minimo
        } else if (meta.type !== "json" && typeof value === "string" && value.length < meta.minimo) {
            error[meta.column] = "Mínimo de " + meta.minimo + " caracteres."
        } else if (["source", "json"].indexOf(meta.type) > -1 && $.isArray(value) && value.length < meta.minimo) {
            error[meta.column] = "Mínimo de " + meta.minimo + " arquivos."
        }
    }
}

function validateMetaUnique(meta, value, id, entityData, error) {
	return new Promise(function (s, f) {
        if (meta.unique) {
            if(SERVICEWORKER) {
                if (isEmpty(id)) {
                    if (entityData.some(el => el[meta.column] === value))
                        error[meta.column] = "Valor já existe! Informe outro.";
                } else if (isNumberPositive(id)) {
                    if (entityData.some(el => el['id'] != id && el[meta.column] === value))
                        error[meta.column] = "Valor já existe! Informe outro.";
                }
            }

            if(navigator.onLine && (!SERVICEWORKER || entityData.length > LIMITOFFLINE - 10) && (typeof error[meta.column] === "undefined" || isEmpty(error[meta.column]))) {
                AJAX.post('load/unique', {column: meta.column, id: id, valor: value, entity: form.entity}).then(data => {
                    if(data)
                        error[meta.column] = "Valor já existe! Informe outro.";

                    s(1);
                }).catch(() => {
                    f(1);
                })
            } else {
                s(1);
            }
        } else {
            s(1);
        }
    });
}

function validateMetaRegExp(meta, value, error) {
    if (typeof meta.allow.regexp === "string" && meta.allow.regexp !== "") {
        let r = new RegExp(meta.allow.regexp, "i");
        if (!r.test(value))
            error[meta.column] = "Valor não atende ao formato desejado"
    }
}

function validateMetaEspecialFields(meta, value, error) {
    if (["email", "cpf", "cnpj"].indexOf(meta.format) > -1) {
        switch (meta.format) {
            case 'email':
                if (!isEmail(value))
                    error[meta.column] = "Email inválido.";
                break;
            case 'cpf':
                if (!isCPF(value))
                    error[meta.column] = "CPF inválido.";
                break;
            default:
                if (!isCNPJ(value))
                    error[meta.column] = "CNPJ inválido."
        }
    }
}

function showErrorField($element, errors, dicionario) {
    $.each(errors, function (col, erro) {
        if (typeof erro === 'object') {
            showErrorField($element, erro, dicionarios[dicionario[col].relation])
        } else if (erro !== "") {
            if(col === "id") {
                toast(erro, 3000, "toast-error");
            } else {
                let $field = $element.find(".formCrudInput[data-column='" + col + "']");
                if ("radio" === $field.attr("type")) {
                    $('head').append("<style class='error-support' rel='" + col + "'>[data-column='" + col + "'] ~.md-radio--fake{border-color:red !important;}</style>")
                } else if ("checkbox" === $field.attr("type")) {
                    $('head').append("<style class='error-support' rel='" + col + "'>[data-column='" + col + "']:before{border-color:red !important;}</style>")
                } else {
                    $field.css("border-bottom-color", "red")
                }
                $field.parent().parent().parent().find(".input-message").html(erro);
            }
        }
    })
}