if (typeof loadMaskPlugin !== 'function') {
    function loadMaskPlugin() {

        var $jscomp = {
            scope: {}, findInternal: function (a, l, d) {
                a instanceof String && (a = String(a));
                for (var p = a.length, h = 0; h < p; h++) {
                    var b = a[h];
                    if (l.call(d, b, h, a)) return {i: h, v: b}
                }
                return {i: -1, v: void 0}
            }
        };
        $jscomp.defineProperty = "function" == typeof Object.defineProperties ? Object.defineProperty : function (a, l, d) {
            if (d.get || d.set) throw new TypeError("ES3 does not support getters and setters.");
            a != Array.prototype && a != Object.prototype && (a[l] = d.value)
        };
        $jscomp.getGlobal = function (a) {
            return "undefined" != typeof window && window === a ? a : "undefined" != typeof global && null != global ? global : a
        };
        $jscomp.global = $jscomp.getGlobal(this);
        $jscomp.polyfill = function (a, l, d, p) {
            if (l) {
                d = $jscomp.global;
                a = a.split(".");
                for (p = 0; p < a.length - 1; p++) {
                    var h = a[p];
                    h in d || (d[h] = {});
                    d = d[h]
                }
                a = a[a.length - 1];
                p = d[a];
                l = l(p);
                l != p && null != l && $jscomp.defineProperty(d, a, {configurable: !0, writable: !0, value: l})
            }
        };
        $jscomp.polyfill("Array.prototype.find", function (a) {
            return a ? a : function (a, d) {
                return $jscomp.findInternal(this, a, d).v
            }
        }, "es6-impl", "es3");
        (function (a, l, d) {
            "function" === typeof define && define.amd ? define(["jquery"], a) : "object" === typeof exports ? module.exports = a(require("jquery")) : a(l || d)
        })(function (a) {
            var l = function (b, e, f) {
                var c = {
                    invalid: [], getCaret: function () {
                        try {
                            var a, r = 0, g = b.get(0), e = document.selection, f = g.selectionStart;
                            if (e && -1 === navigator.appVersion.indexOf("MSIE 10")) a = e.createRange(), a.moveStart("character", -c.val().length), r = a.text.length; else if (f || "0" === f) r = f;
                            return r
                        } catch (C) {
                        }
                    }, setCaret: function (a) {
                        try {
                            if (b.is(":focus")) {
                                var c,
                                    g = b.get(0);
                                g.setSelectionRange ? g.setSelectionRange(a, a) : (c = g.createTextRange(), c.collapse(!0), c.moveEnd("character", a), c.moveStart("character", a), c.select())
                            }
                        } catch (B) {
                        }
                    }, events: function () {
                        b.on("keydown.mask", function (a) {
                            b.data("mask-keycode", a.keyCode || a.which);
                            b.data("mask-previus-value", b.val());
                            b.data("mask-previus-caret-pos", c.getCaret());
                            c.maskDigitPosMapOld = c.maskDigitPosMap
                        }).on(a.jMaskGlobals.useInput ? "input.mask" : "keyup.mask", c.behaviour).on("paste.mask drop.mask", function () {
                            setTimeout(function () {
                                    b.keydown().keyup()
                                },
                                100)
                        }).on("change.mask", function () {
                            b.data("changed", !0)
                        }).on("blur.mask", function () {
                            d === c.val() || b.data("changed") || b.trigger("change");
                            b.data("changed", !1)
                        }).on("blur.mask", function () {
                            d = c.val()
                        }).on("focus.mask", function (b) {
                            !0 === f.selectOnFocus && a(b.target).select()
                        }).on("focusout.mask", function () {
                            f.clearIfNotMatch && !h.test(c.val()) && c.val("")
                        })
                    }, getRegexMask: function () {
                        for (var a = [], b, c, f, n, d = 0; d < e.length; d++) (b = m.translation[e.charAt(d)]) ? (c = b.pattern.toString().replace(/.{1}$|^.{1}/g, ""), f = b.optional,
                            (b = b.recursive) ? (a.push(e.charAt(d)), n = {
                                digit: e.charAt(d),
                                pattern: c
                            }) : a.push(f || b ? c + "?" : c)) : a.push(e.charAt(d).replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&"));
                        a = a.join("");
                        n && (a = a.replace(new RegExp("(" + n.digit + "(.*" + n.digit + ")?)"), "($1)?").replace(new RegExp(n.digit, "g"), n.pattern));
                        return new RegExp(a)
                    }, destroyEvents: function () {
                        b.off("input keydown keyup paste drop blur focusout ".split(" ").join(".mask "))
                    }, val: function (a) {
                        var c = b.is("input") ? "val" : "text";
                        if (0 < arguments.length) {
                            if (b[c]() !== a) b[c](a);
                            c = b
                        } else c = b[c]();
                        return c
                    }, calculateCaretPosition: function () {
                        var a = b.data("mask-previus-value") || "", e = c.getMasked(), g = c.getCaret();
                        if (a !== e) {
                            var f = b.data("mask-previus-caret-pos") || 0, e = e.length, d = a.length, m = a = 0, h = 0,
                                l = 0,
                                k;
                            for (k = g; k < e && c.maskDigitPosMap[k]; k++) m++;
                            for (k = g - 1; 0 <= k && c.maskDigitPosMap[k]; k--) a++;
                            for (k = g - 1; 0 <= k; k--) c.maskDigitPosMap[k] && h++;
                            for (k = f - 1; 0 <= k; k--) c.maskDigitPosMapOld[k] && l++;
                            g > d ? g = 10 * e : f >= g && f !== d ? c.maskDigitPosMapOld[g] || (f = g, g = g - (l - h) - a, c.maskDigitPosMap[g] && (g = f)) : g > f &&
                                (g = g + (h - l) + m)
                        }
                        return g
                    }, behaviour: function (f) {
                        f = f || window.event;
                        c.invalid = [];
                        var e = b.data("mask-keycode");
                        if (-1 === a.inArray(e, m.byPassKeys)) {
                            var e = c.getMasked(), g = c.getCaret();
                            setTimeout(function () {
                                c.setCaret(c.calculateCaretPosition())
                            }, 10);
                            c.val(e);
                            c.setCaret(g);
                            return c.callbacks(f)
                        }
                    }, getMasked: function (a, b) {
                        var g = [], d = void 0 === b ? c.val() : b + "", n = 0, h = e.length, q = 0, l = d.length,
                            k = 1,
                            r = "push", p = -1, t = 0, y = [], v, z;
                        f.reverse ? (r = "unshift", k = -1, v = 0, n = h - 1, q = l - 1, z = function () {
                            return -1 < n && -1 < q
                        }) : (v = h - 1, z = function () {
                            return n <
                                h && q < l
                        });
                        for (var A; z();) {
                            var x = e.charAt(n), w = d.charAt(q), u = m.translation[x];
                            if (u) w.match(u.pattern) ? (g[r](w), u.recursive && (-1 === p ? p = n : n === v && n !== p && (n = p - k), v === p && (n -= k)), n += k) : w === A ? (t--, A = void 0) : u.optional ? (n += k, q -= k) : u.fallback ? (g[r](u.fallback), n += k, q -= k) : c.invalid.push({
                                p: q,
                                v: w,
                                e: u.pattern
                            }), q += k; else {
                                if (!a) g[r](x);
                                w === x ? (y.push(q), q += k) : (A = x, y.push(q + t), t++);
                                n += k
                            }
                        }
                        d = e.charAt(v);
                        h !== l + 1 || m.translation[d] || g.push(d);
                        g = g.join("");
                        c.mapMaskdigitPositions(g, y, l);
                        return g
                    }, mapMaskdigitPositions: function (a,
                                                        b, e) {
                        a = f.reverse ? a.length - e : 0;
                        c.maskDigitPosMap = {};
                        for (e = 0; e < b.length; e++) c.maskDigitPosMap[b[e] + a] = 1
                    }, callbacks: function (a) {
                        var h = c.val(), g = h !== d, m = [h, a, b, f], q = function (a, b, c) {
                            "function" === typeof f[a] && b && f[a].apply(this, c)
                        };
                        q("onChange", !0 === g, m);
                        q("onKeyPress", !0 === g, m);
                        q("onComplete", h.length === e.length, m);
                        q("onInvalid", 0 < c.invalid.length, [h, a, b, c.invalid, f])
                    }
                };
                b = a(b);
                var m = this, d = c.val(), h;
                e = "function" === typeof e ? e(c.val(), void 0, b, f) : e;
                m.mask = e;
                m.options = f;
                m.remove = function () {
                    var a = c.getCaret();
                    c.destroyEvents();
                    c.val(m.getCleanVal());
                    c.setCaret(a);
                    return b
                };
                m.getCleanVal = function () {
                    return c.getMasked(!0)
                };
                m.getMaskedVal = function (a) {
                    return c.getMasked(!1, a)
                };
                m.init = function (d) {
                    d = d || !1;
                    f = f || {};
                    m.clearIfNotMatch = a.jMaskGlobals.clearIfNotMatch;
                    m.byPassKeys = a.jMaskGlobals.byPassKeys;
                    m.translation = a.extend({}, a.jMaskGlobals.translation, f.translation);
                    m = a.extend(!0, {}, m, f);
                    h = c.getRegexMask();
                    if (d) c.events(), c.val(c.getMasked()); else {
                        f.placeholder && b.attr("placeholder", f.placeholder);
                        b.data("mask") &&
                        b.attr("autocomplete", "off");
                        d = 0;
                        for (var l = !0; d < e.length; d++) {
                            var g = m.translation[e.charAt(d)];
                            if (g && g.recursive) {
                                l = !1;
                                break
                            }
                        }
                        l && b.attr("maxlength", e.length);
                        c.destroyEvents();
                        c.events();
                        d = c.getCaret();
                        c.val(c.getMasked());
                        c.setCaret(d)
                    }
                };
                m.init(!b.is("input"))
            };
            a.maskWatchers = {};
            var d = function () {
                var b = a(this), e = {}, f = b.attr("data-mask");
                b.attr("data-mask-reverse") && (e.reverse = !0);
                b.attr("data-mask-clearifnotmatch") && (e.clearIfNotMatch = !0);
                "true" === b.attr("data-mask-selectonfocus") && (e.selectOnFocus =
                    !0);
                if (p(b, f, e)) return b.data("mask", new l(this, f, e))
            }, p = function (b, e, f) {
                f = f || {};
                var c = a(b).data("mask"), d = JSON.stringify;
                b = a(b).val() || a(b).text();
                try {
                    return "function" === typeof e && (e = e(b)), "object" !== typeof c || d(c.options) !== d(f) || c.mask !== e
                } catch (t) {
                }
            }, h = function (a) {
                var b = document.createElement("div"), d;
                a = "on" + a;
                d = a in b;
                d || (b.setAttribute(a, "return;"), d = "function" === typeof b[a]);
                return d
            };
            a.fn.mask = function (b, d) {
                d = d || {};
                var e = this.selector, c = a.jMaskGlobals, h = c.watchInterval, c = d.watchInputs || c.watchInputs,
                    t = function () {
                        if (p(this, b, d)) return a(this).data("mask", new l(this, b, d))
                    };
                a(this).each(t);
                e && "" !== e && c && (clearInterval(a.maskWatchers[e]), a.maskWatchers[e] = setInterval(function () {
                    a(document).find(e).each(t)
                }, h));
                return this
            };
            a.fn.masked = function (a) {
                return this.data("mask").getMaskedVal(a)
            };
            a.fn.unmask = function () {
                clearInterval(a.maskWatchers[this.selector]);
                delete a.maskWatchers[this.selector];
                return this.each(function () {
                    var b = a(this).data("mask");
                    b && b.remove().removeData("mask")
                })
            };
            a.fn.cleanVal = function () {
                return this.data("mask").getCleanVal()
            };
            a.applyDataMask = function (b) {
                b = b || a.jMaskGlobals.maskElements;
                (b instanceof a ? b : a(b)).filter(a.jMaskGlobals.dataMaskAttr).each(d)
            };
            h = {
                maskElements: "input,td,span,div",
                dataMaskAttr: "*[data-mask]",
                dataMask: !0,
                watchInterval: 300,
                watchInputs: !0,
                useInput: !/Chrome\/[2-4][0-9]|SamsungBrowser/.test(window.navigator.userAgent) && h("input"),
                watchDataMask: !1,
                byPassKeys: [9, 16, 17, 18, 36, 37, 38, 39, 40, 91],
                translation: {
                    0: {pattern: /\d/},
                    9: {pattern: /\d/, optional: !0},
                    "#": {pattern: /\d/, recursive: !0},
                    A: {pattern: /[a-zA-Z0-9]/},
                    S: {pattern: /[a-zA-Z]/}
                }
            };
            a.jMaskGlobals = a.jMaskGlobals || {};
            h = a.jMaskGlobals = a.extend(!0, {}, h, a.jMaskGlobals);
            h.dataMask && a.applyDataMask();
            setInterval(function () {
                a.jMaskGlobals.watchDataMask && a.applyDataMask()
            }, h.watchInterval)
        }, window.jQuery, window.Zepto);
    }

    loadMaskPlugin();
}

if (typeof loadMask !== 'function') {
    var SPMaskBehavior = function (val) {
            return val.replace(/\D/g, '').length === 11 ? '(00) 00000-0000' : '(00) 0000-00009';
        },
        spOptions = {
            onKeyPress: function (val, e, field, options) {
                field.mask(SPMaskBehavior.apply({}, arguments), options);
            }
        };

    function loadMask() {
        $('.telefone').mask(SPMaskBehavior, spOptions);
        $(".rg").mask('9999999999', {reverse: true});
        $(".ie").mask('999.999.999.999', {reverse: true});
        $(".cpf").mask('999.999.999-99', {reverse: true});
        $(".cnpj").mask('99.999.999/9999-99', {reverse: true});
        $(".cep").mask('99999-999', {reverse: true});
        $(".valor").mask('#.##0,00', {reverse: true});
        $('.date_time').mask('00/00/0000 00:00:00');
    }
}

if (typeof openPanel !== 'function') {
    function openPanel(entity, $id, value, $this) {
        $this.panel(
            themeDashboard("<i class='statusPanel left' title='sem mudanças'></i><span class='left'>Editar " + ucFirst(entity) + "</span>", {
                lib: 'form-crud',
                file: 'api',
                entity: entity,
                id: value
            }, function (idOntab) {
                formSubmit($("#" + idOntab).find(".ontab-content").find(".form-crud"), $id);
            })
        );
    }
}

if (typeof formGetData !== 'function') {
    function formGetData($form) {

        function checkBox($this, valor) {
            if ($this.hasClass("switchCheck")) {
                return $this.prop("checked") ? 1 : 0;
            } else {
                if (!valor)
                    valor = [];

                if ($this.prop("checked"))
                    valor.push(parseInt($this.val()));
                else
                    valor.removeItem($this.val());

                return valor;
            }
        }

        function setDados($this, valor) {
            if ($this.attr("type") === "checkbox") {
                return checkBox($this, valor);
            } else if ($this.attr("type") === "html") {
                return $this.jqteVal();
            } else if ($this.attr("type") === "radio") {
                if ($this.prop("checked"))
                    return $this.val();
                else if (valor)
                    return valor;
            } else if ($this.is('.telefone, .rg, .ie, .cpf, .cnpj, .cep, .valor, .date_time') && $this.val() !== "") {
                return $this.cleanVal();
            } else {
                return $this.val();
            }
        }

        var dados = {};
        $form.find("input, textarea, select").each(function () {
            if (typeof ($(this).attr("data-model")) !== "undefined")
                dados[$(this).attr("data-model")] = setDados($(this), typeof(dados[$(this).attr("data-model")]) !== "undefined" ? dados[$(this).attr("data-model")] : null);
        });

        return dados;
    }
}

if (typeof formSubmit !== 'function') {
    var saveTime;
    var isSavingNew = false;

    function setError($form, erro, novo, t) {
        isSavingNew = false;
        t = t || "dados.";
        $.each(erro, function (c, mensagem) {
            if (typeof (mensagem) === "object") {
                setError($form, mensagem, novo, t + c + '.');
            } else {
                var color = novo ? "red" : "goldenrod";
                var $input = $form.find("[data-model='" + (t + c) + "']");
                if ($input.attr("data-format") === "radio") {
                    $input.siblings(".md-radio--fake").css("border-color", color);
                    $input.parent().siblings(".radio-title").addClass(color + "-span");
                } else if ($input.attr("data-format") === "list") {
                    $input.parent().parent().prev().addClass(color + "-span");
                    $input.siblings(".listButton").parent().siblings(".rest").find("input[type=text]").siblings('.error-message').remove();
                    $input.parent().siblings(".rest").append('<span class="' + color + '-span error-message">' + mensagem + '</span>');
                } else {
                    $input.siblings('label').addClass(color + "-span");
                    $input.siblings('.error-message').remove();
                    $input.addClass(color + "-subErro").parent().append('<span class="' + color + '-span error-message">' + mensagem + '</span>');
                }
            }
        });
    }

    function cleanError($form) {
        $form.find(".error-span").removeClass("error-span red-span goldenrod-span");
        $form.find(".md-radio--fake").css("border-color", "initial");
        $form.find(".radio-title").removeClass("error-span red-span goldenrod-span");
        $form.find(".listButton").removeClass('error-btn');
        $form.find(".error-message").remove();
        $form.find("input,textarea,select").removeClass("red-subErro goldenrod-subErro").siblings('label').removeClass("error-span red-span goldenrod-span")
            .siblings('.error-message').remove();
    }

    function reloadForm(entity, id) {
        id = id || null;
        $("#form_" + entity).closest(".ontab").loading();
        var fields = $("#fields-" + entity).val();
        post('form-crud', 'children/form', {entity: entity, id: id, fields: fields}, function (data) {
            if (data) {
                var $form = $("#form_" + entity).closest(".form-control");
                $input = $form.find(":focus");
                var val = $input.val();
                $form.replaceWith(data);
                var $form = $("#form_" + entity).closest(".form-control");
                $form.find("input[data-model='" + $input.attr("data-model") + "']").focus().val("").val(val);
                $form.closest(".ontab").loading();
                isSavingNew = !1;
                statusPanel("salvo", $form);
            }
        });
    }

    function formSave($form, save) {
        var dados = formGetData($form);
        isSavingNew = (dados['dados.id'] === "");

        post('form-crud', "save/form", {
            entity: $form.attr("data-entity"),
            dados: dados,
            save: typeof (save) !== "undefined" ? save : $form.find("#autoSave").val()
        }, function (data) {
            cleanError($form);
            if (isNaN(data)) {
                setError($form, data[$form.attr("data-entity")], (dados['dados.id'] === ""));
                statusPanel((dados['dados.id'] === "" ? "error" : "salvo"), $form);
            } else if (data === null && !$form.find("#autoSave").val()) {

            } else if (dados['dados.id'] === "") {
                reloadForm($form.attr("data-entity"), data);
                if($("#callbackAction").val() !== "")
                    window[$("#callbackAction").val()](dados);
            } else {
                statusPanel("salvo", $form);
                if($("#callbackAction").val() !== "")
                    window[$("#callbackAction").val()](dados);
            }

            if (!saveTime)
                window.onbeforeunload = null;
        });
    }

    function statusPanel(status, $form) {
        var $status = $form.closest(".ontab").find(".ontab-header .ontab-title .statusPanel");
        if(status === "change") {
            $status.css("background", "orange").attr("title", "alterações não salvas");
        } else if(status === "error"){
            $status.css("background", "red").attr("title", "erros não salvos");
        } else {
            $status.css("background", "#32cd32").attr("title", "salvo");
        }
    }

    function formSubmit($form, $idReturn) {

        clearTimeout(saveTime);
        statusPanel('change', $form);

        window.onbeforeunload = function () {
            clearTimeout(saveTime);
            formSave($form);
            window.onbeforeunload = null;
            return true;
        };

        if (typeof ($idReturn) !== "undefined") {
            post('form-crud', $form.attr("data-action"), {
                entity: $form.attr("data-entity"),
                dados: formGetData($form)
            }, function (data) {
                var title = $form.find("[data-model='dados." + $form.find("input[type=hidden][rel='title']").val() + "']").val();

                if (["list_mult", "extend_mult", "selecao_mult", "list", "selecao"].indexOf($idReturn.attr("data-format")) > -1)
                    checkEntityMultValue($idReturn);

                if (["list_mult", "extend_mult", "selecao_mult"].indexOf($idReturn.attr("data-format")) > -1) {
                    if (!isNaN(data) && data > 0)
                        setListMultValue($idReturn, data, title);
                } else {
                    if (!isNaN(data) && data > 0 && $idReturn.val() !== data)
                        $idReturn.val(data).trigger("change");

                    else if ($idReturn.val() === "" && $form.find("input[type=hidden][data-model='dados.id']").val() !== "")
                        $idReturn.val($form.find("input[type=hidden][data-model='dados.id']").val()).trigger("change");

                    if ($idReturn.val() !== "" && typeof ($form.find("input[type=hidden][rel='title']").val()) === "string")
                        $idReturn.parent().siblings(".rest").find("input[type=text]").val(title);
                }

                window.onbeforeunload = null;
            });

        } else {
            if (!isSavingNew) {
                saveTime = setTimeout(function () {
                    saveTime = null;
                    formSave($form);
                }, 400);
            }
        }
    }
}

if (typeof formAutoSubmit !== 'function') {
    function formAutoSubmit(element) {
        $(element).off("keyup change", ".jqte_editor").on("keyup change", ".jqte_editor", function (e) {
            if (e.which !== undefined && [13, 37, 38, 39, 40, 116].indexOf(e.which) < 0)
                formSubmit($(this).closest(".form-crud"));

        }).off("keyup", "input, textarea, select").on("keyup", "input, textarea, select", function (e) {

            if (e.which !== undefined && [13, 37, 38, 39, 40, 116].indexOf(e.which) < 0 && typeof($(this).attr("data-model")) === "string") {
                formSubmit($(this).closest(".form-crud"));

            } else if (e.which !== undefined && $(this).val() === "" && $(this).hasClass("form-list")) {
                $(this).parent().prev().find("input[type=hidden]").val("").trigger("change");
                $.each($(this).parent().next(".multFieldsSelect").find(".selecaoUniqueCard"), function () {
                    $(this).find(".titleRequired").removeClass("hide").parent().next().find(".form-list").prop("disabled", true).addClass("disabled").val("").trigger("change");
                });
            }

        }).off("change", "input, textarea, select").on("change", "input, textarea, select", function () {
            if (typeof($(this).attr("data-model")) === "string") {
                formSubmit($(this).closest(".form-crud"));

            } else if ($(this).val() === "" && $(this).hasClass("form-list")) {
                $(this).parent().prev().find("input[type=hidden]").val("").trigger("change");
                $.each($(this).parent().next(".multFieldsSelect").find(".selecaoUniqueCard"), function () {
                    $(this).find(".titleRequired").removeClass("hide").parent().next().find(".form-list").prop("disabled", true).addClass("disabled").val("").trigger("change");
                });
            }

        }).off("click", ".listButton").on("click", ".listButton", function () {
            openPanel($(this).attr("data-entity"), $(this).siblings('input[type=hidden]'), $(this).siblings('input[type=hidden]').val(), $(this));

        }).off("keypress keydown", "button").on("keypress keydown", "button", function (e) {
            e.preventDefault();

        }).off("keyup", ".form-list").on("keyup", ".form-list", function (e) {
            var $this = $(this);
            if ([38, 40, 13].indexOf(e.which) > -1) {
                var $list = $this.siblings(".list-complete");
                if (e.which === 38) {
                    if ($list.find("li.active").prev().length)
                        $list.find("li.active").removeClass("active").prev().addClass("active");
                } else if (e.which === 40) {
                    if ($list.find("li.active").next().length)
                        $list.find("li.active").removeClass("active").next().addClass("active");
                } else if (e.which === 13) {
                    selectList($list);
                }
            } else if ([37, 39].indexOf(e.which) < 0) {
                if ($this.val() !== "") {
                    readList($this, $this.attr("data-entity"), $this.attr("data-parent"), $this.val(), $this.attr("id"));
                } else {
                    $this.siblings(".list-complete").html("");
                    $("#list-" + $this.attr("id")).removeClass("color-white").addClass("color-teal").find("i").html("add");
                }
            }

        }).off("dblclick", ".form-list").on("dblclick", ".form-list", function () {
            if (!$(this).prop("disabled"))
                readList($(this), $(this).attr("data-entity"), $(this).attr("data-parent"), $(this).val(), $(this).attr("id"));

        }).off("focusout", ".form-list").on("focusout", ".form-list", function () {
            $this = $(this);
            setTimeout(function () {
                $(".list-complete").html("");
            }, 50);
        });

        $(".editorHtml").jqte();

        if ($(".dropzone").length) {
            $(".dropzone").each(function () {
                var $this = $(this);
                var $file = $this.siblings("input[type=hidden]");
                var type = $file.attr("data-format");
                new Dropzone("#" + $this.attr("id"), {
                    acceptedFiles: $this.find("input[type=file]").attr("accept"),
                    uploadMultiple: type === "files",
                    maxFiles: type === "files" ? 20 : 1,
                    addRemoveLinks: true,
                    maxFilesize: 500,
                    dictDefaultMessage: "Selecione ou Arraste Arquivos",
                    dictCancelUpload: "Cancelar",
                    dictRemoveFile: "Excluir",
                    dictInvalidFileType: "Tipo não Permitido",
                    dictFileTooBig: "Máximo de 500MB",
                    dictResponseError: "Erro ao Salvar",
                    dictMaxFilesExceeded: "Máximo de Uploads Atingido",
                    init: function () {
                        this.on("success", function (file, response) {
                            response = $.parseJSON(response);

                            var t = $file.val() !== "" ? $.parseJSON($file.val()) : [];
                            t = $.grep(t, function () {
                                return true;
                            });

                            $.each($.parseJSON(response.data), function (i, e) {
                                if (e.response === 1 && e.data.name === file.name && $.grep(t, function (n) {
                                    return n.name === file.name;
                                }).length === 0)
                                    t.push(e.data);

                                else if (typeof (e.data) === "string")
                                    toast(e.data, "warning");
                            });
                            $(response.id).val(JSON.stringify(t)).trigger("change");

                        }).on("removedfile", function (file) {
                            post('form-crud', 'delete/source', {
                                entity: $this.find("input[name=entity]").val(),
                                column: $this.find("input[name=column]").val(),
                                name: file.name,
                                files: $file.val()
                            }, function (data) {
                                $file.val(data).trigger("change");
                            });
                        });

                        if ($file.val() !== "") {
                            var myDropzone = this;
                            $.each($.parseJSON($file.val()), function (i, e) {
                                var mockFile = {
                                    name: e.name,
                                    size: e.size,
                                    type: e.type,
                                    status: Dropzone.ADDED,
                                    url: e.url,
                                    accepted: true
                                };

                                myDropzone.emit("addedfile", mockFile);
                                if (e.type.match(/image.*/))
                                    myDropzone.emit("thumbnail", mockFile, e.url);
                                myDropzone.emit("complete", mockFile);

                                myDropzone.files.push(mockFile);
                            });
                        }
                    }
                });
            });
        }
    }

    function setJsonValue($id, value) {
        var dataRecovery = $.grep(($id.val() !== "" ? $.parseJSON($id.val()) : []), function () {
            return true;
        });

        if ($.inArray(value, dataRecovery) === -1)
            dataRecovery.push(value);

        $id.val(JSON.stringify(dataRecovery)).trigger("change");
    }

    function removeJsonValue($id, value) {
        var dataRecovery = $.grep(($id.val() !== "" ? $.parseJSON($id.val()) : []), function () {
            return true;
        });
        dataRecovery.removeItem(value);
        $id.val(JSON.stringify(dataRecovery)).trigger("change");
    }

    function removerListMult(id, value) {
        var $content = $(id).parent().siblings(".listmult-content");
        removeJsonValue($(id), value);
        $content.find(".listmult-card[rel=" + value + "]").remove();
    }

    function editListMult(entity, id, value) {
        openPanel(entity, $(id), value, $(id + "-btn"));
    }

    function readList($input, entity, parent, search, id) {
        var selecao = $input.hasClass("selecaoUnique") ? $input.closest(".multFieldsSelect").prev().prev().find("input[type=hidden]").val() : 0;
        post('form-crud', 'read/list', {
            search: search,
            entity: entity,
            parent: parent,
            column: id,
            selecao: selecao
        }, function (data) {
            var $list = $input.siblings(".list-complete");
            $list.html(data);

            $(".list-option").off("mousedown").on("mousedown", function () {
                $(".list-option").removeClass("active");
                $(this).addClass("active");
                selectList($list);
            });
        });
    }

    function selectList($list) {
        var $active = $list.find("li.active");
        $list.html("");
        $list.parent().prev().find(".btn-floating").removeClass("color-teal").addClass("color-white").find("i").html("edit");
        if ($list.attr("rel") === "mult")
            setListMultValue($list.parent().prev().find("input[type=hidden]"), parseInt($active.attr("rel")), $active.text().trim());
        else
            selectListOne($list, $active);

        var lista = $list.siblings(".form-list");
        if (["list_mult", "extend_mult", "selecao_mult", "list", "selecao"].indexOf($list.parent().prev().find("input[type=hidden]").attr("data-format")) > -1)
            checkEntityMultValue(lista);
    }

    function checkEntityMultValue($id) {
        $id.parent().parent().find(".titleRequired").addClass("hide").parent().next().find(".form-list").val("").removeClass("disabled").prop("disabled", false).parent().prev().find("input[type=hidden]").val("").trigger("click");
    }

    function setListMultValue($id, value, title) {
        var isNew = true;
        var isTitle = false;
        var $content = $id.parent().siblings(".listmult-content");
        var $tpl = $id.parent().siblings(".tpl_list_mult");
        $.each($id.parent().siblings(".listmult-content").find(".listmult-card"), function () {
            if ($(this).attr("rel") === value) {
                isNew = false;
                if ($(this).find(".listmult-title").text().trim() !== title)
                    isTitle = $(this).find(".listmult-title");
            }
        });

        if (isNew) {
            $id.parent().siblings(".rest").find("input[type=text]").html("");
            copy($tpl, $content, [value, title], "append");
            setJsonValue($id, value);

        } else if (isTitle !== false) {
            isTitle.text(title);
        }
    }

    function selectListOne($list, $active) {
        $list.siblings("input[type=text]").val($active.text().trim());
        $list.parent().prev().find("input[type=hidden]").val(parseInt($active.attr("rel"))).trigger("change");
    }
}

Dropzone.autoDiscover = false;