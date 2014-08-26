(function ($) {


    "use strict";

    Date.prototype.getWeek = function () {
        var onejan = new Date(this.getFullYear(), 0, 1);
        return Math.ceil((((this.getTime() - onejan.getTime()) / 86400000) + onejan.getDay() + 1) / 7);
    };
    Date.prototype.getMonthFormatted = function () {
        var month = this.getMonth() + 1;
        return month < 10 ? '0' + month : month;
    };
    Date.prototype.getDateFormatted = function () {
        var date = this.getDate();
        return date < 10 ? '0' + date : date;
    };
    Date.prototype.getFullDateFormatted = function () {
        var tab = [
            this.getDateFormatted(),
            this.getMonthFormatted(),
            this.getFullYear()
        ];
        return tab.join('/');
    };

    Date.prototype.compareToFrString = function (string) {
        return (this.getFullDateFormatted() == string);
    };

    Date.prototype.fromFrString = function (string) {
        if (typeof string == 'string' && string.split("/")) {
            var tab = string.split("/");
            this.setDate(Number(tab[0]));
            this.setMonth(Number(tab[1]));
            this.setFullYear(Number(tab[2]));
        }
        return this;
    };

    var Calendrier = function (element, options) {
        var self = this;
        this.options = options;
        this.uniqueID = new Date().getTime() + (Math.random(1) * 100);
        this.$element = $(element);
        this.$calendar = null;

        this.jour = 0;

        this.toDay = new Date();

        if (this.options.tobootstrap) this.toBootstrap();

        if (this.options.src && this.options.srcType) {
            $.ajax({
                url: this.options.src,
                dataType: this.options.srcType,
                success: function (data) {
                    self.events = data.reponse;
                },
                error: function (error) {
                    console.log(error)
                },
                always: function () {
                    console.log("always")
                }
            });
        } else if (this.options.events) {
            this.events = this.options.events;
        }
        this.generate();
        this.bindEvents();
    }

    Calendrier.DEFAULTS = {
        "tobootstrap": false,
        "date": new Date(),
        "mois": ["Janvier", "Fevrier", "Mars", "Avril", "Mai", "Juin", "Juillet", "Aout", "Septembre", "Octobre", "Novembre", "Decembre"],
        "jours": ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"],
        'footer': {
            "pattern": "Nous sommes le <span class='date'></span>",
            "map": {
                ".date": function ($date, calendrier) {
                    var date = calendrier.toDay;
                    $date.text(date.getFullDateFormatted());
                }
            }
        }
    }

    Calendrier.prototype.triggers = {
        "precedent": {
            "click": function (me, event, calendrier) {
                console.log("click precedent");
                calendrier.$element.trigger("calendrier.click.precedent");
            }
        },
        "suivant": {
            "click": function (me, event, calendrier) {
                console.log("click suivant");
                calendrier.$element.trigger("calendrier.click.suivant");
            }
        },
        "event": {
            "click": function (me, event, calendrier) {
                console.log("click event");
                calendrier.$element.trigger("calendrier.click.event", $(me).data("event"));
            }
        },
        "jour": {
            "click": function (me, event, calendrier) {
                console.log("click jour");
                calendrier.$element.trigger("calendrier.click.jour");
            }
        }
    }

    Calendrier.prototype.elements = {
        "calendrier": $("<table class='calendar'>"),
        "header": $("<caption class='calendar-header'>"),
        "body": $("<tbody class='calendar-body'>"),
        "footer": $("<tfoot class='calendar-footer'>"),
        "semainier": $("<thead class='semainier'></thead>"),
        "libellejour": $("<th class='libellejour'>"),
        "ligne": $("<tr>"),
        "date": $("<div class='date'>"),
        "annee": $("<div class='annee'>"),
        "mois": $("<div class='mois'>"),
        "jour": $("<div class='cell jour'>"),
        "event": $("<div class='cell event'>"),
        "invalide": $("<div class='cell invalide'>"),
        "precedent": $("<div class='precedent'></div>"),
        "suivant": $("<div class='suivant'></div>"),
        "cell": $("<td>")
    };

    Calendrier.prototype.boostrapClasses = {
        "calendrier": "table table-striped",
        "header": "",
        "body": "",
        "footer": "",
        "semainier": "",
        "libellejour": "",
        "ligne": "",
        "date": "col-md-10",
        "annee": "col-md-6",
        "mois": "col-md-6",
        "jour": "",
        "event": "",
        "invalide": "",
        "precedent": "col-md-1 pull-left",
        "suivant": "col-md-1 pull-right"
    }

    Calendrier.prototype.cssClasses = {
        "calendrier": "",
        "header": "",
        "body": "",
        "footer": "",
        "semainier": "",
        "libellejour": "",
        "ligne": "",
        "date": "",
        "annee": "",
        "mois": "",
        "jour": "",
        "event": "",
        "invalide": "",
        "precedent": "",
        "suivant": ""
    }

    Calendrier.prototype.utils = {
        "dernierJour": function (date) {
            return new Date(date.getFullYear(), date.getMonth() + 1, -1).getDate() + 1;
        },
        "verifierDate": function (d, m, y) {
            return m > 0 && m < 13 && y > 0 && y < 32768 && d > 0 && d <= (new Date(y, m, 0)).getDate();
        },
        "quelJourEstCe": function (jour, mois, annee) {
            var dateObj = new Date();
            dateObj.setDate(jour);
            dateObj.setMonth(mois);
            dateObj.setFullYear(annee);
            var numDay = dateObj.getDay();
            return numDay;
        },
        "getDate": function (day, month, year) {
            if (typeof day == 'string' && day.split("/")) {
                var tab = day.split("/");
                day = Number(tab[0]);
                month = Number(tab[1]);
                year = Number(tab[2]);
            }
            return new Date(day, month, year);
        }
    }

    Calendrier.prototype.findElement = function (name) {
        var selecteur = "." + this.elements[name].attr("class").split(' ').join('.');
        return this.$element.find(selecteur);
    }

    Calendrier.prototype.bindEvents = function () {
        var self = this;
        $.each(self.triggers, function (elName, eventList) {
            var elements = self.findElement(elName);
            $.each(eventList, function (eventName, event) {
                elements.on(eventName + '.' + elName, $.proxy(function fire(evt) {
                    evt.stopPropagation();
                    evt.preventDefault();
                    event(this, evt, self);
                }));
            });
        });

        this.$element.on("calendrier.click.precedent", function (e) {
            console.log("calendrier.click.precedent");
            var precedent = self.options.date.getMonth() - 1;
            self.options.date.setMonth(precedent);
            self.changeBody();
            self.changeDateHeader();
        });

        this.$element.on("calendrier.click.suivant", function (e) {
            console.log("calendrier.click.suivant");
            var precedent = self.options.date.getMonth() + 1;
            self.options.date.setMonth(precedent);
            self.changeBody();
            self.changeDateHeader();
        });

        this.$element.on("calendrier.click.event", function (e, data) {
            console.log("calendrier.click.event", data);

        });

        this.$element.on("calendrier.click.jour", function (e) {
            console.log("calendrier.click.jour");

        });
    }

    Calendrier.prototype.applyCss = function () {
        var elements = this.elements,
            isBootstrap = this.options.tobootstrap;

        if (isBootstrap) {
            $.each(this.boostrapClasses, function (i, o) {
                elements[i].addClass(o);
            });
        }
    }

    Calendrier.prototype.changeBody = function () {
        var newBody = this.genererBody();
        this.findElement('body').replaceWith(newBody);
    }

    Calendrier.prototype.changeDateHeader = function () {
        var mois = this.options.mois[this.options.date.getMonth()];
        this.findElement("mois").text(mois);
        this.findElement("annee").text(this.options.date.getFullYear());
    }

    Calendrier.prototype.genererHeader = function () {
        var $header = this.elements.header.clone(),
            $date = this.elements.date.clone(),
            $annee = this.elements.annee.clone(),
            $mois = this.elements.mois.clone(),
            $precedent = this.elements.precedent.clone(),
            $suivant = this.elements.suivant.clone(),
            mois = this.options.mois[this.options.date.getMonth()],
            annee = this.options.date.getFullYear();

        $mois.text(mois);
        $annee.text(annee);

        $date.append($mois)
            .append($annee);

        if (this.options.tobootstrap) {
            $precedent.append("<i class='glyphicon glyphicon-chevron-left'>");
            $suivant.append("<i class='glyphicon glyphicon-chevron-right'>");
        } else {
            $precedent.append("<span>precedent</span>");
            $suivant.append("<span>suivant</span>");
        }

        $header.prepend($precedent)
            .append($date)
            .append($suivant)

        return $header;
    }

    Calendrier.prototype.genererSemainier = function () {
        var $semainier = this.elements.semainier.clone(),
            ligne = this.elements.ligne.clone(),
            libellejour = this.elements.libellejour;

        $.each(this.options.jours, function (i, o) {
            var jour = libellejour.clone();
            jour.text(o);
            ligne.append(jour);
        });

        return $semainier.append(ligne);
    }

    Calendrier.prototype.genererJour = function (isValid) {
        var self = this,
            cell = this.elements.cell.clone(),
            $jour = this.elements.jour,
            $invalide = this.elements.invalide,
            $event = this.elements.event;

        var jour = null,
            event = null,
            label = "";

        if (this.utils.verifierDate(this.options.date.getDay(), this.options.date.getMonth(), this.options.date.getYear())) {
            event = $.grep(this.events, function (objet) {
                return self.options.date.compareToFrString(objet.date);
            });
        }

        if (event && event.length > 0) {
            event = event[0];
            jour = $event.clone();
            jour.data("event", event);
        } else if (isValid) {
            jour = $jour.clone();
        } else {
            jour = $invalide.clone();
        }

        if (isValid) {
            label = self.jour;
        }

        jour.data("date", this.options.date);
        jour.text(label);
        return cell.append(jour);
    }

    Calendrier.prototype.genererSemaine = function (debut, fin) {
        var self = this,
            semaine = this.elements.ligne.clone(),
            jour = null;

        $.each(this.options.jours, function (i, o) {
            var isValid = false,
                date = "";
            if (i < debut || i > fin) {
                isValid = false;
            } else {
                self.jour++;
                isValid = true;
            }
            jour = self.genererJour(isValid);
            semaine.append(jour);
        });

        return semaine;
    }

    Calendrier.prototype.genererBody = function () {
        var self = this,
            $body = this.elements.body.clone(),
            today = this.toDay,
            date = this.options.date,
            annee = date.getFullYear(),
            mois = date.getMonth();

        var premierJour = this.utils.quelJourEstCe(1, mois, annee),
            dernierJour = this.utils.dernierJour(date),
            isCurrent = ((today.getMonth() == mois) && (today.getFullYear() == annee));

        this.jour = 0;

        while (this.jour < dernierJour) {
            var debutDeSemaine = Math.max(0, ((premierJour + this.jour) % 7) - 1);
            var finDeSemaine = Math.min(6, (dernierJour - this.jour) - 1);
            var semaine = this.genererSemaine(debutDeSemaine, finDeSemaine);
            if (isCurrent) {
                semaine.find(".cell").filter(function () {
                    return ($(this).text() == today.getDate());
                }).addClass("today");
            }
            $body.append(semaine);
        }

        return $body;
    }

    Calendrier.prototype.genererFooter = function () {
        var self = this,
            $footer = this.elements.footer.clone(),
            ligne = this.elements.ligne.clone(),
            cell = this.elements.cell.clone(),
            innerfooter = this.options.footer.pattern,
            mapping = this.options.footer.map;

        cell.html(innerfooter)
            .attr("colspan", this.options.jours.length)
            .appendTo(ligne)
            .appendTo($footer);

        $.each(mapping, function (selecteur, fn) {
            fn($footer.find(selecteur), self);
        })

        this.$calendar.append($footer);
    }

    Calendrier.prototype.generate = function () {
        this.$calendar = this.elements.calendrier.clone();
        this.$calendar.append(this.genererHeader());
        this.$calendar.append(this.genererSemainier());
        this.$calendar.append(this.genererBody());
        this.$calendar.append(this.genererFooter());
        this.$element.html(this.$calendar);
    }

    $.fn.calendrier = function (option) {
        return this.each(function () {
            var $this = $(this);
            var data = $this.data('marquion.calendar');
            var options = $.extend({}, Calendrier.DEFAULTS, $this.data(), typeof option == 'object' && option)
            if (!data) $this.data('marquion.calendar', (data = new Calendrier(this, options)))
        })
    }

    $.fn.calendrier.Constructor = Calendrier;

    $(window).on('load', function () {
        $('[data-ride="calendrier"]').each(function () {
            var $calendrier = $(this)
            $calendrier.calendrier($calendrier.data())
        })
    })

})(jQuery);