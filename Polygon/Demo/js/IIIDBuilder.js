(function ($) {

    "use strict";

    if (!Sylvester || typeof Matrix == "undifined") throw new Error("Sylvester est obligatoire pour utiliser le bundle IIDBuilder");

    var scene = $("<canvas data-role='view' class=''>").css({
        height: "100%",
        width: "100%"
    });

    var Polygon = function () {

    }

    var World = function () {
        this.matrice = Matrix.Zero(4, 4);
        this.identite = Matrix.Diagonal([1, 1, 1, 1]);
    }

    var FreeCamera = function (options) {
        this.position = Vector.create([50, 100, 50]);
        this.lookAtPoint = [0, 0, 0];
        this.fov = 28;
    }

    var Renderer = function () {
        this.width = scene.width();
        this.height = scene.height();

        this.context = scene.get(0).getContext("2d");

        this.camera = new FreeCamera();

        this.drawWorld = function (world) {
            console.log(world);
        }

        this.drawAxes = function () {
            var self = this,
                origin = Vector.create([100, 100, 100]),
                axes = Matrix.Diagonal([20, 20, 20]);
            $.each(axes.elements, function (i, j) {
                var vector = Vector.create(j);
                self.drawVector(origin, vector, i);
            });
        }

        this.drawVector = function (a, b, label) {
            var taille, first, second, base, inverse,
                diff = b.subtract(a).toUnitVector();

            this.context.save();
            this.context.beginPath();
            this.context.miterLimit = 5;
            this.context.lineWidth = 2;

            this.context.fillText("o", a.e(1) - 3, a.e(2) - 3);
            this.context.moveTo(a.e(1), a.e(2));
            this.context.lineTo(b.e(1), b.e(2));
            this.context.fillText(label, b.e(1) - 7, b.e(2) - 7);

            if (b.distanceFrom(a) > 10) taille = -5;
            else taille = -(b.distanceFrom(a) / 10);

            base = diff.x(taille);
            inverse = Vector.create([-diff.e(2), diff.e(1), diff.e(3)]);
            first = b.add(base).add(inverse.x(taille * 0.6));
            second = b.add(base).add(inverse.x(-taille * 0.6));

            this.context.lineTo(first.e(1), first.e(2));
            this.context.moveTo(b.e(1), b.e(2));
            this.context.lineTo(second.e(1), second.e(2));

            this.context.stroke();
            this.context.restore();
        }
    }

    var Builder = function (element, options) {

        this.$element = $(element);
        this.options = options;

        this.world = new World();

        this.scene = new Renderer();

        this.scene.drawAxes();

        // Name
        this.name = "IIIDBuilder";

        // Version
        this.version = "0.0.1";

        // View jQuery object
        this.view = scene;

        // menu declaration
        this.menu = {
            items: [{
                label: "fichier", // menu fichier
                on: {
                    click: function () {
                        this.trigger("show_panel_fichier");
                    }
                }
            }, {
                label: "edition", // menu edition
                dropdown: [{
                    label: "variables", // sous - menu edition
                    on: {
                        click: function () {
                            this.trigger("show_panel_option");
                        }
                    }
                }]
            }]
        };

        this.modals = [{
            id: "panel_fichier",
            title: "Fichier",
            innerBody: "Bienvenue dans les fichiers"
        }, {
            id: "panel_option",
            title: "Options",
            innerBody: "Bienvenue dans les options"
        }];


        this.tools = [{
            icon: "icon-brush",
            on: {
                click: function () {
                    console.log("Brush !");
                }
            }
        }, {
            icon: "icon-cube",
            on: {
                click: function () {
                    console.log("Cube !");
                }
            }
        }, {
            icon: "icon-lock",
            on: {
                click: function () {
                    console.log("Lock !");
                }
            }
        }, {
            icon: "icon-lock-open",
            on: {
                click: function () {
                    console.log("Open !");
                }
            }
        }, {
            icon: "glyphicon glyphicon-circle-arrow-left",
            on: {
                click: function () {}
            }
        }, {
            icon: "glyphicon glyphicon-circle-arrow-right",
            on: {
                click: function () {}
            }
        }, {
            icon: "glyphicon glyphicon-circle-arrow-up",
            on: {
                click: function () {}
            }
        }, {
            icon: "glyphicon glyphicon-circle-arrow-down",
            on: {
                click: function () {}
            }
        }, {
            icon: "glyphicon glyphicon-share-alt",
            on: {
                click: function () {}
            }
        }, {
            icon: "glyphicon glyphicon-share-alt",
            on: {
                click: function () {}
            }
        }];
    }

    Builder.DEFAULTS = {

    }

    // MODAL PLUGIN DEFINITION
    // =======================
    function Plugin(option) {
        return this.each(function () {
            var $this = $(this)
            var app = $this.data('glingo.application')
            var data = $this.data('glingo.IIDBuilder')
            var options = $.extend({}, Builder.DEFAULTS, $this.data(), typeof option == 'object' && option)
            if (!data) $this.data('glingo.IIDBuilder', (data = new Builder(this, options)))
            app.plug(data);
        })
    }

    $.fn.IIID = Plugin;
    $.fn.IIID.Constructor = Builder;

    $(window).on('load', function () {
        $('[data-application-name="IIID"]').each(function () {
            var $application = $(this);
            var data = $application.data();
            Plugin.call($application, data);
        });
    })
})(jQuery);