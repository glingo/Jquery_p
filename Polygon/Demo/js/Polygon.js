(function ($) {

    "use strict";
    if (!Sylvester || typeof Sylvester == "undifined") throw new Error("Sylvester est obligatoire");

    function Scene() {}

    Scene.prototype = Scene;

    Scene.prototype.constructor = new Scene();

    Scene.prototype.moveCamera = function (vector) {}

    Scene.prototype.rotateCamera = function (vector) {}

    Scene.prototype.refresh = function () {}

    Scene.prototype.generateAxes = function () {}

    Scene.prototype.generateFloor = function () {}

    function World() {}

    var Modelisateur = function (element, options) {
        this.options = options;
        this.$element = $(element);
    }

    Modelisateur.DEFAULTS = {
        template: "bootstrap"
    }

    Modelisateur.prototype.templates = {
        bootstrap: {
            canvas: $("<canvas data-role='canvas' class='well col-lg-10'>").css("margin-top", "50px")
        }
    }

    Modelisateur.prototype.tools = [{
        icon: "icon-brush",
        on: {
            click: function () {
                console.log("Salut !");
            }
        }
        }, {
        icon: "icon-cube",
        on: {
            click: function () {
                console.log("Salut !");
            }
        }
        }, {
        icon: "icon-lock",
        on: {
            click: function () {
                console.log("Salut !");
            }
        }
        }, {
        icon: "icon-lock-open",
        on: {
            click: function () {
                console.log("Salut !");
            }
        }
        }, {
        icon: "glyphicon glyphicon-circle-arrow-left",
        on: {
            click: function () {
                //this.scene.moveCamera(new Vector(20, 0, 0));
            }
        }
    }, {
        icon: "glyphicon glyphicon-circle-arrow-right",
        on: {
            click: function () {
                //this.scene.moveCamera(new Vector(-20, 0, 0));
            }
        }
    }, {
        icon: "glyphicon glyphicon-circle-arrow-up",
        on: {
            click: function () {
                //this.scene.moveCamera(new Vector(0, -20));
            }
        }
    }, {
        icon: "glyphicon glyphicon-circle-arrow-down",
        on: {
            click: function () {
                //this.scene.moveCamera(new Vector(0, 20));
            }
        }
    }, {
        icon: "glyphicon glyphicon-share-alt",
        on: {
            click: function () {
                //this.scene.rotateCamera(new Vector(20));
            }
        }
    }, {
        icon: "glyphicon glyphicon-share-alt",
        on: {
            click: function () {
                //  this.scene.rotateCamera(new Vector(-20));
            }
        }
        }]

    Application.prototype.menu = [{
        label: "fichier"
        }, {
        label: "edition",
        dropdown: [{
            label: "variables",
            on: {
                click: function () {
                    this.$application.trigger("show_panel_option");
                }
            }
        }]
    }]

    Application.prototype.buildOptionPanel = function () {
        var self = this,
            id = "panel_option",
            form = $("<form role='form'>"),
            date = new Date(),
            input = $("<input class='form-control'>"),
            label = $("<label class='input-group-addon'>"),
            group = $("<div class='input-group col-md-5'>"),
            set = $("<fieldset class='row'>"),
            legend = $("<legend>"),
            h2 = $('<h2>'),
            fieldset = set.clone();

        var toInputs = function (namespace) {
            var self = this,
                title = legend.clone().text(namespace);
            fieldset.append(title);

            function recursive(name, value, old) {
                if ($.isFunction(value) || value.nodeType) return;
                if (value && typeof value == "object") {
                    form.append(fieldset);
                    fieldset = set.clone();
                    title = legend.clone().text(old + "." + name);
                    fieldset.append(title);
                    $.each(value, function (index, val) {
                        recursive.bind(value)(index, val, name);
                    });
                } else {
                    var id = date.getTime() + "_" + name,
                        type = (typeof value == "number") ? "number" : "text",
                        control = input.clone().attr({
                            id: id,
                            name: name,
                            type: type,
                            value: value
                        }).data("linked", this),
                        libelle = label.clone().attr({
                            for: id
                        }).text(name);
                    group.clone().append(libelle)
                        .append(control)
                        .appendTo(fieldset);
                }
            }

            fieldset.prepend(h2.clone().text(name));

            $.each(this, function (i, o) {
                recursive.bind(self)(i, o, namespace);
            });

            form.append(fieldset);
        }

        toInputs.bind(this.options)("options");
        toInputs.bind(this.scene)("scene");

        this.buildModal(id, "Configuration generale", form, {
            Valider: {
                click: function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                    form.find("input").each(function (i, o) {
                        var name = $(o).attr("name");
                        if ($.isNumeric($(o).val()))
                            $(o).data("linked")[name] = Number($(o).val());
                        else $(o).data("linked")[name] = $(o).val();
                    });
                    self.scene.refresh();
                }
            }
        });
    }

    Application.prototype.buildMenu = function () {
        var template = this.getTemplate(),
            menu = template.menuContainer.clone(),
            self = this;

        function ajouterAuMenu(index, object, reciepe) {
            var item = template.menuSingleItem.clone(),
                reciepe = reciepe || menu;

            if (object.on) {
                $.each(object.on, function (name, callback) {
                    item.on(name, callback.bind(self));
                });
            }

            if (object.dropdown) {
                item = template.menuMultipleItem.clone();
                $.each(object.dropdown, function (index, obj) {
                    ajouterAuMenu(index, obj, item.find("[data-role='dropdown-menu']"));
                });
            }

            item.find("[data-role='menu-label']").prepend(object.label);

            reciepe.append(item);
        }

        $.each(this.menu, ajouterAuMenu);

        this.$application.prepend(menu);
    }

    Application.prototype.getTemplate = function (template) {
        template = template || this.options.template;
        return this.templates[template];
    }

    Application.prototype.buildBody = function () {
        var template = this.getTemplate(),
            conteneur = template.conteneur.clone(),
            self = this;

        conteneur
            .append(template.canvas.clone())
            .append(template.tools.clone());

        $.each(this.tools, function (name, options) {
            var tool = template.tool.clone();
            if (options.on) {
                $.each(options.on, function (name, callback) {
                    tool.on(name, callback.bind(self));
                });
            }
            if (options.icon) tool.addClass(options.icon);
            conteneur.find("[data-role=tools]").append(tool);
        });

        this.$application.append(conteneur);
    }

    Application.prototype.buildModal = function (id, title, innerBody, buttons) {
        var template = this.getTemplate(),
            modal = template.modal.clone(),
            header = template.modalHeader.clone(),
            body = template.modalBody.clone(),
            footer = template.modalFooter.clone(),
            button = template.button,
            labelID = id + "-label";

        header
            .find("[data-role=modal-title]").text(title)
            .find("#myModalLabel").attr({
                id: labelID
            });

        if (buttons) {
            $.each(buttons, function (name, object) {
                button.clone().text(name).on(object).prependTo(footer);
            });
        }

        body.prepend(innerBody);

        modal.attr({
            id: id,
            "aria-labelledby": labelID
        }).find("[data-role=modal-content]")
            .append(header)
            .append(body)
            .append(footer);

        this.$application.on("show_" + id, function (event) {
            modal.modal("show");
        });

        this.$application.append(modal);
    }
    // FIN buildModal

    Application.prototype.buildApplication = function () {
        this.$application = template.application.clone();
        this.buildBody();
        this.buildMenu();
        this.buildOptionPanel();
        this.$element.empty().append(this.$application);
    }

    // Function init
    //
    // Prepare Application to run.
    //  -> apply css properties
    //  -> set Application, Body, Menu, Scene, OptionPanel 
    //                          by cloning template
    //  -> append it to $element
    Application.prototype.init = function () {
        var template = this.getTemplate();
        $.each(this.css, function (role, css) {
            template[role].css(css);
        });
    }
    // FIN INIT


    // MODAL PLUGIN DEFINITION
    // =======================
    function Plugin(option) {
        return this.each(function () {
            var $this = $(this)
            var data = $this.data('glingo.application')
            var options = $.extend({}, Application.DEFAULTS, $this.data(), typeof option == 'object' && option)
            if (!data) $this.data('glingo.application', (data = new Application(this, options)))
        })
    }

    $.fn.application = Plugin;
    $.fn.application.Constructor = Application;

    $(window).on('load', function () {
        $('[data-ride="application"]').each(function () {
            var $application = $(this);
            var data = $application.data();
            Plugin.call($application, data);
        });
    })
})(jQuery);