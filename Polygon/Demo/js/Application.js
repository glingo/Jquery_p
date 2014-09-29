(function ($) {

    "use strict";

    //useless
    var infos = $("<div class='container'><p> Developpé par Florian Cailly </p></div>");

    var Application = function (element, options) {
        this.options = options;
        this.$element = $(element);
        this.$application = null;
        this.menu = {
            items: []
        };
        this.tools = [];
        this.bundles = [];
        this.buildApplication();
    }

    Application.DEFAULTS = {
        template: "bootstrap"
    }

    /********************************************************/
    //                                                      */
    // Litteral templates                                   */
    //   v 1.0                                              */
    //                                                      */
    // jQuery objects composing Application                 */
    //                                                      */
    //////////////////////////////////////////////////////////
    Application.prototype.templates = {
        bootstrap: {
            application: $("<div data-role='application' class='container'>")
        }
    }

    var Item = function (options, context) {
        $.extend(this, Item.DEFAULTS, typeof options == 'object' && options);
        this.context = context;
        this.$element = this.build();
    }

    Item.DEFAULTS = {
        label: "default label",
        dorpdown: null, // multiple ? 
        on: {},
        template: "bootstrap"
    }

    Item.prototype.templates = {
        bootstrap: {
            single: $("<li data-role='menu-item'>")
                .append("<a data-role='menu-label' href='#'>"),
            multiple: $("<li data-role='menu-item' class='dropdown'>")
                .append("<a data-role='menu-label' class='dropdown-toggle' data-toggle='dropdown' href='#'><span data-role='caret' class='caret'></span></a>")
                .append("<ul data-role='dropdown-menu' class='dropdown-menu' role='menu'>")
        }
    }

    Item.prototype.build = function () {
        var template = this.getTemplate(),
            item = template.single.clone(),
            self = this;

        if (this.dropdown && this.dropdown.length > 0) {
            item = template.multiple.clone();
            $.each(this.dropdown, function (i, object) {
                var subItem = new Item(object, self.context);
                item.find("[data-role='dropdown-menu']").append(subItem.$element);
            });
        }

        item.find("[data-role='menu-label']").prepend(this.label);

        $.each(this.on, function (name, callback) {
            item.on(name, callback.bind(self.context));
        });

        return item;
    }

    var Menu = function (options, context) {
        $.extend(this, Menu.DEFAULTS, typeof options == 'object' && options);
        this.context = context;
        this.$element = this.build();
    }

    Menu.DEFAULTS = {
        template: "bootstrap",
        items: []
    }

    Menu.prototype.templates = {
        bootstrap: {
            menu: $("<ul data-role='menu' class='nav nav-tabs row' role='tablist'>"),
            menuSingleItem: $("<li data-role='menu-item'>")
                .append("<a data-role='menu-label' href='#'>"),
            menuMultipleItem: $("<li data-role='menu-item' class='dropdown'>")
                .append("<a data-role='menu-label' class='dropdown-toggle' data-toggle='dropdown' href='#'><span data-role='caret' class='caret'></span></a>")
                .append("<ul data-role='dropdown-menu' class='dropdown-menu' role='menu'>")
        }
    }

    Menu.prototype.build = function () {
        var menu = this.getTemplate().menu.clone(),
            context = this.context;

        $.each(this.items, function (i, object) {
            var item = new Item(object, context);
            menu.append(item.$element);
        });

        return menu;
    }

    /********************************************************/
    //                                                      */
    // Function find                                        */
    //   v 1.0                                              */
    //                                                      */
    // Return the mathing role objects in DOMTREE           */
    //                                                      */
    //////////////////////////////////////////////////////////
    Application.prototype.find = function (role) {
        return this.$application.find("[data-role='" + role + "']");
    }

    /********************************************************/
    //                                                      */
    // Function refresh                                     */
    //   v 1.0                                              */
    //                                                      */
    // refreshing DOMTREE                                   */
    //                                                      */
    //////////////////////////////////////////////////////////
    Application.prototype.refresh = function () {
        this.$application.remove();
        this.buildApplication();
    }

    /********************************************************/
    //                                                      */
    // Function buildApplication                            */
    //   v 1.0                                              */
    //                                                      */
    // Prepare Application to run.                          */
    //  -> build Body, Menu, Scene, panel_info              */
    //        by cloning template                           */
    //  -> append it to $element                            */
    //////////////////////////////////////////////////////////
    Application.prototype.buildApplication = function () {
        var app = this.$application = this.getTemplate().application.clone();
        new Modal({
            id: "panel_info",
            title: "Informations developpeur",
            innerBody: infos,
            buttons: {
                Ok: {
                    click: function (e) {
                        e.preventDefault();
                        e.stopPropagation();
                        app.trigger("hide_panel_info");
                    }
                }
            }
        }, app);
        var menu = new Menu(this.menu, app);
        app.prepend(menu.$element);
        this.$element.empty().append(app);
        app.on("rebuild", this.buildApplication.bind(this));
    }

    /********************************************************/
    //                                                      */
    // Object Modal                                         */
    //   v 1.0                                              */
    //                                                      */
    //                                                      */
    //////////////////////////////////////////////////////////

    var Modal = function (options, context) {
        var self = $.extend(this, Modal.DEFAULTS, typeof options == 'object' && options);
        this.$element = this.build();

        context.append(self.$element);

        $.each(["show", "hide", "destroy"], function (index, ev) {
            context.on("show_" + self.id, function (event) {
                self.$element.modal("show");
            });
        });

    }

    Modal.DEFAULTS = {
        id: "default_modal_id",
        title: "default_modal_title",
        innerBody: "default_modal_inner",
        buttons: [],
        labelID: function () {
            return this.id + "_label";
        },
        template: "bootstrap"
    }

    /********************************************************/
    //                                                      */
    // Litteral templates                                   */
    //   v 1.0                                              */
    //                                                      */
    // jQuery objects composing Modal                       */
    //                                                      */
    //////////////////////////////////////////////////////////
    Modal.prototype.templates = {
        bootstrap: {
            modal: $("<div class='modal fade' data-role='modal' tabindex='-1' role='dialog' aria-hidden='true'>"),
            modalDialog: $("<div data-role='modal-dialog' class='modal-dialog'>"),
            modalContent: $("<div data-role='modal-content' class='modal-content'>"),
            modalHeader: $("<div data-role='modal-header' class='modal-header'>")
                .append("<button type='button' class='close' data-dismiss='modal'><span aria-hidden='true'>&times;</span><span class='sr-only'>Close</span></button>"),
            modalTitle: $("<h4 data-role='modal-title' class='modal-title'>"),
            modalBody: $("<div data-role='modal-body' class='modal-body'>"),
            modalFooter: $("<div data-role='modal-footer' class='modal-footer'><button type='button' class='btn btn-warning' data-dismiss='modal'>Fermer</div></div>"),
            button: $("<button type='button' class='btn btn-default'>")
        }
    }

    Modal.prototype.build = function () {
        var template = this.getTemplate(),
            modal = template.modal.clone(),
            header = template.modalHeader.clone(),
            title = template.modalTitle.clone(),
            body = template.modalBody.clone(),
            dialog = template.modalDialog.clone(),
            content = template.modalContent.clone(),
            footer = template.modalFooter.clone(),
            button = template.button;

        modal.attr({
            "id": this.id,
            "aria-labelledby": this.labelID
        }).append(header.attr({
            "id": this.labelID
        }).append(title.html(this.title)));

        body.prepend(this.innerBody);

        if (this.buttons) {
            $.each(this.buttons, function (name, object) {
                button.clone().text(name).on(object).prependTo(footer);
            });
        }

        content
            .append(header)
            .append(body)
            .append(footer)
            .appendTo(dialog);

        return modal.append(dialog);
    }


    /********************************************************/
    //                                                      */
    // Object Bundle                                        */
    //   v 1.0                                              */
    //////////////////////////////////////////////////////////
    var Bundle = function (option) {
        $.extend(this, Bundle.DEFAULTS, typeof option == 'object' && option);
        this.$element = this.build();
    }

    Bundle.DEFAULTS = {
        name: "defaultBundle",
        version: "unversioned",
        template: "viewAndTools",
        view: "",
        menu: [],
        tools: [],
        modals: []
    }

    Bundle.prototype.templates = {
        viewAndTools: {
            container: $("<div data-role='container' class='container'>"),
            view: $("<div data-role='view' class='well row'>"),
            tools: $("<div data-role='tools' class='row'>"),
            tool: $("<i data-role='tool' class='btn btn-default'>")
        }
    }

    Bundle.prototype.build = function () {
        var template = this.getTemplate(),
            container = template.container.clone().hide(),
            view = template.view.clone(),
            tools = template.tools.clone(),
            tool = template.tool;

        var menu = new Menu(this.menu, container);

        container.append(menu.$element);

        $.each(this.tools, function (index, o) {
            var item = tool.clone().addClass(o.icon);
            tools.append(item.on(o.on));
        });

        view.append(this.view).appendTo(container);

        container.append(tools).attr({
            "id": this.name
        });

        $.each(this.modals, function (index, options) {
            new Modal(options, container);
        });

        return container;
    }


    /********************************************************/
    //                                                      */
    // Function buildBundle                                 */
    //   v 1.0                                              */
    //                                                      */
    //////////////////////////////////////////////////////////
    Application.prototype.buildBundle = function (bundle) {
        var $app = this.$application;

        $app.append(bundle.$element);

        $.each(["show", "hide", "destroy"], function (index, ev) {
            $app.on(ev + "_" + bundle.name, function (event) {
                bundle.$element.show();
            });
        });
    }
    // FIN buildApplication

    /********************************************************/
    //                                                      */
    // Function plug                                        */
    //   v 1.0                                              */
    //                                                      */
    // Plug a Bundle to actual application  .               */
    //  -> build Body, Menu, Scene, panel_info              */
    //        by cloning template                           */
    //  -> append it to $element                            */
    //////////////////////////////////////////////////////////
    Application.prototype.plug = function (plugin) {
        var bundle = new Bundle(plugin, this);

        if ($.inArray(bundle, this.bundles) < 0) {
            this.menu.items.push({
                label: bundle.name,
                on: {
                    click: function () {
                        bundle.$element.trigger("show_" + bundle.name);
                    }
                }
            });
            this.refresh();
            this.buildBundle(bundle);
            this.bundles.push(bundle);
        }
    }

    /********************************************************/
    //                                                      */
    // Function getTemplate                                 */
    //   v 1.0                                              */
    //                                                      */
    // Return the selected template in options              */
    //                                                      */
    //////////////////////////////////////////////////////////
    Item.prototype.getTemplate = Menu.prototype.getTemplate = Bundle.prototype.getTemplate = Modal.prototype.getTemplate = Application.prototype.getTemplate = function (template) {
        template = template || this.template || this.options.template;
        return this.templates[template];
    }

    // MODAL PLUGIN DEFINITION
    // =======================
    function Plugin(option) {
        return this.each(function () {
            var $this = $(this)
            var data = $this.data('glingo.application')
            var options = $.extend({}, Application.DEFAULTS, $this.data(), typeof option == 'object' && option)
            if (!data) $this.data('glingo.application', (data = new Application(this, options)))
            else data.options = options;
        })
    }

    $.fn.application = Plugin;
    $.fn.application.Constructor = Application;

    $(window).on('load', function () {
        $('[data-role="application"]').each(function () {
            var $application = $(this);
            var data = $application.data();
            Plugin.call($application, data);
        });
    })


})(jQuery);