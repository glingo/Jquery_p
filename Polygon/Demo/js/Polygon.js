(function ($) {


    "use strict";

    function Polygon(element, option) {
        this.$element = $(element);
        this.options = option;
    }

    function Point(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    function Matrice(length) {
        this.matrix = [];
        for (var i = 0; i < length; i++) {
            matrix[i] = [];
            for (var j = 0; j < length; j++) {
                matrix[i][j] = null;
            }
        }
    }

    function Vector(x, y, z) {
        this.x = x || 0;
        this.y = y || 0;
        this.z = z || 0;
    }

    Vector.prototype = {
        negative: function () {
            return new Vector(-this.x, -this.y, -this.z);
        },
        add: function (v) {
            if (v instanceof Vector) return new Vector(this.x + v.x, this.y + v.y, this.z + v.z);
            else return new Vector(this.x + v, this.y + v, this.z + v);
        },
        subtract: function (v) {
            if (v instanceof Vector) return new Vector(this.x - v.x, this.y - v.y, this.z - v.z);
            else return new Vector(this.x - v, this.y - v, this.z - v);
        },
        multiply: function (v) {
            if (v instanceof Vector) return new Vector(this.x * v.x, this.y * v.y, this.z * v.z);
            else return new Vector(this.x * v, this.y * v, this.z * v);
        },
        divide: function (v) {
            if (v instanceof Vector) return new Vector(this.x / v.x, this.y / v.y, this.z / v.z);
            else return new Vector(this.x / v, this.y / v, this.z / v);
        },
        equals: function (v) {
            return this.x == v.x && this.y == v.y && this.z == v.z;
        },
        dot: function (v) {
            return this.x * v.x + this.y * v.y + this.z * v.z;
        },
        cross: function (v) {
            return new Vector(
                this.y * v.z - this.z * v.y,
                this.z * v.x - this.x * v.z,
                this.x * v.y - this.y * v.x
            );
        },
        length: function () {
            return Math.sqrt(this.dot(this));
        },
        unit: function () {
            return this.divide(this.length());
        },
        min: function () {
            return Math.min(Math.min(this.x, this.y), this.z);
        },
        max: function () {
            return Math.max(Math.max(this.x, this.y), this.z);
        },
        toAngles: function () {
            return {
                theta: Math.atan2(this.z, this.x),
                phi: Math.asin(this.y / this.length())
            };
        },
        toArray: function (n) {
            return [this.x, this.y, this.z].slice(0, n || 3);
        },
        to2d: function (camera, screen) {
            // Translate input point using camera position
            var inputX = this.x - camera.position.x,
                inputY = this.y - camera.position.y,
                inputZ = this.z - camera.position.z,
                aspectRatio = screen.width / screen.height;

            // Apply projection to X and Y
            screenX = inputX / (-inputZ * Math.tan(camera.fov / 2));

            screenY = (inputY * aspectRatio) / (-inputZ * Math.tan(camera.fov / 2));

            // Convert to screen coordinates
            screenX = screen.width * (screenX + 1.0) / 2.0;
            screenY = screen.height * (1.0 - ((screenY + 1.0) / 2.0));

            // var position = camera.focus,
            //     x = ((position.z * (this.x - position.x)) / (position.z - this.z)) + position.x,
            //    y = ((position.z * (this.y - position.y)) / (position.z - this.z)) + position.y;

            return new Vector(screenX, screenY);
        },
        clone: function () {
            return new Vector(this.x, this.y, this.z);
        },
        init: function (x, y, z) {
            this.x = x;
            this.y = y;
            this.z = z;
            return this;
        }
    };

    function Scene(canvas) {
        this.$canvas = canvas;
        var taille = canvas.height = canvas.width;
        this.map = [];
        this.camera = {
            position: new Vector((taille / 2), (taille / 2), -10.0),
            visibility: 100,
            fov: 38
        };
        this.axes = {
            x: new Vector(taille / 10, 0, 0),
            y: new Vector(0, taille / 10, 0),
            z: new Vector(0, 0, taille / 10)
        }
        this.screen = {
            center: new Vector(taille / 2, taille / 2),
            width: taille,
            height: taille
        }
    }

    Scene.prototype.moveCamera = function (vector) {
        this.camera.position = this.camera.position.add(vector);
        this.refresh();
    }

    Scene.prototype.rotateCamera = function (vector) {
        // Convert to screen coordinates
        this.screen.center = this.screen.center.add(vector);
        this.refresh();
    }

    Scene.prototype.refresh = function (context) {
        context = context || this.$canvas.getContext("2d");
        context.clearRect(0, 0, this.$canvas.width, this.$canvas.height);
        this.generateAxes();
        this.generateFloor(0);
    }

    Scene.prototype.patterns = {
        floor: function (length) {
            var i, j, camera = this.camera,
                canvas = this.$canvas,
                context = canvas.getContext("2d"),
                vision = camera.visibility,
                deltaX = new Vector(length, 0, 0),
                deltaZ = new Vector(0, 0, length),
                origin = this.screen.center,
                path = [];

            context.save();
            context.beginPath();
            context.moveTo(origin.x, origin.y);

            for (i = 1; i < vision * 2; i++) {
                var ref = deltaX.multiply(i);
                for (j = 1; j < vision * 2; j++) {
                    if (j > vision)
                        ref = ref.add(deltaX.add(deltaZ).multiply(j));
                    else
                        ref = ref.add(deltaX.add(deltaZ).multiply(-j));

                    path.push(ref)
                }
            }

            $.each(path, function (index, vector) {
                var o = origin.add(vector).to2d(camera, canvas),
                    a = origin.add(vector).add(new Vector(length, 0, 0)).to2d(camera, canvas),
                    b = origin.add(vector).add(new Vector(0, 0, -length)).to2d(camera, canvas);
                context.moveTo(o.x, o.y);
                context.lineTo(a.x, a.y);
                context.moveTo(o.x, o.y);
                context.lineTo(b.x, b.y);
            });

            context.stroke();
            context.restore();
        },
        arrow: function (a, b, label) {

            var taille, first, second, base, inverse,
                diff = b.subtract(a).unit(),
                context = this.$canvas.getContext("2d");
            context.save();
            context.beginPath();
            context.miterLimit = 5;
            context.lineWidth = 2;

            context.fillText("o", a.x - 3, a.y - 3);
            context.moveTo(a.x, a.y);
            context.lineTo(b.x, b.y);
            context.fillText(label, b.x - 7, b.y - 7);

            if (b.length() > 10) taille = -5;
            else taille = -(b.length() / 10);

            base = diff.multiply(taille);
            inverse = new Vector(-diff.y, diff.x);
            first = b.add(base).add(inverse.multiply(taille * 0.6));
            second = b.add(base).add(inverse.multiply(-taille * 0.6));

            context.lineTo(first.x, first.y);
            context.moveTo(b.x, b.y);
            context.lineTo(second.x, second.y);

            context.stroke();
            context.restore();
        }
    }

    Scene.prototype.generateAxes = function () {
        var self = this,
            canvas = this.$canvas,
            camera = this.camera,
            patterns = this.patterns;
        $.each(this.axes, function (name, axe) {
            var a = self.screen.center.to2d(camera, canvas),
                b = self.screen.center.add(axe).to2d(camera, canvas);
            patterns.arrow.bind(self)(a, b, name);
        });
    }

    Scene.prototype.generateFloor = function () {
        var length = 25;
        this.patterns.floor.bind(this)(length);
    }

    var PolygonMaster = function (element, options) {
        this.options = options;
        this.$element = $(element);
        this.$application = this.scene = null;
        this.init();
    }
    PolygonMaster.DEFAULTS = {
        template: "bootstrap"
    }

    PolygonMaster.prototype.templates = {
        bootstrap: {
            application: $("<div data-role='application' class='container'>"),
            modal: $("<div class='modal fade' data-role='modal' tabindex='-1' role='dialog' aria-labelledby='myModalLabel' aria-hidden='true'>")
                .append("<div data-role='modal-dialog' class='modal-dialog'><div data-role='modal-content' class='modal-content'></div></div>"),
            modalHeader: $("<div data-role='modal-header' class='modal-header'>")
                .append("<button type='button' class='close' data-dismiss='modal'><span aria-hidden='true'>&times;</span><span class='sr-only'>Close</span></button>")
                .append("<h4 data-role='modal-title' class='modal-title' id='myModalLabel'>"),
            modalBody: $("<div data-role='modal-body' class='modal-body'>"),
            modalFooter: $("<div data-role='modal-footer' class='modal-footer'><button type='button' class='btn btn.warning' data-dismiss='modal'>Fermer</div></div>"),
            button: $("<button type='button' class='btn btn-default'>"),
            conteneur: $("<div data-role='conteneur' class='row'>"),
            canvas: $("<canvas data-role='canvas' class='well col-lg-10'>"),
            tools: $("<div data-role='tools' class='col-lg-2'>"),
            tool: $("<i data-role='tool' class='btn btn-default'>"),
            menuContainer: $("<ul data-role='menu' class='nav nav-tabs row' role='tablist'>"),
            menuSingleItem: $("<li data-role='menu-item'>")
                .append("<a data-role='menu-label' href='#'>"),
            menuMultipleItem: $("<li data-role='menu-item' class='dropdown'>")
                .append("<a data-role='menu-label' class='dropdown-toggle' data-toggle='dropdown' href='#'><span data-role='caret' class='caret'></span></a>")
                .append("<ul data-role='dropdown-menu' class='dropdown-menu' role='menu'>")
        }
    }

    PolygonMaster.prototype.css = {
        conteneur: {
            "margin-top": "50px"
        },
        canvas: {
            "border": "1px solid black"
        },
        tools: {
            "border": "1px solid red"
        }
    }


    PolygonMaster.prototype.tools = [{
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
                this.scene.moveCamera(new Vector(20, 0, 0));
            }
        }
    }, {
        icon: "glyphicon glyphicon-circle-arrow-right",
        on: {
            click: function () {
                this.scene.moveCamera(new Vector(-20, 0, 0));
            }
        }
    }, {
        icon: "glyphicon glyphicon-circle-arrow-up",
        on: {
            click: function () {
                this.scene.moveCamera(new Vector(0, -20));
            }
        }
    }, {
        icon: "glyphicon glyphicon-circle-arrow-down",
        on: {
            click: function () {
                this.scene.moveCamera(new Vector(0, 20));
            }
        }
    }, {
        icon: "glyphicon glyphicon-share-alt",
        on: {
            click: function () {
                this.scene.rotateCamera(new Vector(20));
            }
        }
    }, {
        icon: "glyphicon glyphicon-share-alt",
        on: {
            click: function () {
                this.scene.rotateCamera(new Vector(-20));
            }
        }
        }]

    PolygonMaster.prototype.menu = [{
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

    PolygonMaster.prototype.buildOptionPanel = function () {
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

    PolygonMaster.prototype.prepareScene = function () {
        this.scene = new Scene(this.$application.find("[data-role=canvas]").get(0));
        this.scene.refresh();
    }

    PolygonMaster.prototype.prepareMenu = function () {
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

    PolygonMaster.prototype.getTemplate = function (template) {
        template = template || this.options.template;
        return this.templates[template];
    }

    PolygonMaster.prototype.prepareBody = function () {
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

    PolygonMaster.prototype.init = function () {
        var template = this.getTemplate();

        $.each(this.css, function (role, css) {
            template[role].css(css);
        });

        this.$application = template.application.clone();
        this.prepareBody();
        this.prepareMenu();
        this.prepareScene();
        this.buildOptionPanel();
        this.$application.appendTo(this.$element);
    }
    // FIN INIT

    PolygonMaster.prototype.buildModal = function (id, title, innerBody, buttons) {
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

    // MODAL PLUGIN DEFINITION
    // =======================

    function Plugin(option) {
        return this.each(function () {
            var $this = $(this)
            var data = $this.data('glingo.polygon.master')
            var options = $.extend({}, PolygonMaster.DEFAULTS, $this.data(), typeof option == 'object' && option)
            if (!data) $this.data('glingo.polygon.master', (data = new PolygonMaster(this, options)))
        })
    }

    $.fn.polygonMaster = Plugin;
    $.fn.polygonMaster.Constructor = PolygonMaster;


    $(window).on('load', function () {
        $('[data-ride="polygon-master"]').each(function () {
            var $polygonMaster = $(this);
            var data = $polygonMaster.data();
            Plugin.call($polygonMaster, data);
        });
    })
})(jQuery);