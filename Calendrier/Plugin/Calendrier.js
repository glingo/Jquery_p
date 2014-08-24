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
        console.log("Nouveau clendrier", element, options);
        var self = this;
        this.uniqueID = new Date().getTime() + (Math.random(1) * 100);
        this.$element = $(element);
        this.options = options;
        this.toDay = new Date();
        this.jour = 0;
        this.mois = this.toDay.getMonth();
        this.annee = this.toDay.getFullYear();

        this.toBootstrap();

        this.loadEvents(function () {
            self.generate();
        });

    }

    Calendrier.DEFAULTS = {
        "src": "data/json/reservations.json", // data
        "srcType": "json", // dataType,
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
                var precedent = calendrier.options.date.getMonth() - 1;
                calendrier.options.date.setMonth(precedent);
                calendrier.generate();
            }
        },
        "suivant": {
            "click": function (me, event, calendrier) {
                console.log("click suivant");
                var precedent = calendrier.options.date.getMonth() + 1;
                calendrier.options.date.setMonth(precedent);
                calendrier.generate();
            }
        },
        "event": {
            "click": function (me, event, calendrier) {
                console.log("click event");
                $(me).popover('toggle');
            }
        },
        "jour": {
            "click": function (me, event, calendrier) {
                console.log("click jour");
                $('.ondayclick').modal('toggle');
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
        "precedent": $("<div class='precedent'><i class='glyphicon glyphicon-chevron-left'></div>"),
        "suivant": $("<div class='suivant'><i class='glyphicon glyphicon-chevron-right'></div>"),
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
    }

    Calendrier.prototype.toBootstrap = function (calendrier) {
        var elements = this.elements;
        $.each(this.boostrapClasses, function (i, o) {
            elements[i].addClass(o);
        });
    }

    Calendrier.prototype.genererHeader = function (date) {
        var $header = this.elements.header.clone(),
            $date = this.elements.date.clone(),
            $annee = this.elements.annee.clone(),
            $mois = this.elements.mois.clone(),
            $precedent = this.elements.precedent.clone(),
            $suivant = this.elements.suivant.clone(),
            mois = this.options.mois[date.getMonth()],
            annee = date.getFullYear();

        $mois.text(mois);
        $annee.text(annee);

        $date.append($mois)
            .append($annee);

        return $header
            .prepend($precedent)
            .append($date)
            .append($suivant);
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

    Calendrier.prototype.genererJour = function (isValid, date) {
        var self = this,
            cell = this.elements.cell.clone(),
            $jour = this.elements.jour,
            $invalide = this.elements.invalide,
            $event = this.elements.event;

        var jour = null,
            dateObj = null,
            event = null;

        if (this.utils.verifierDate(date, this.mois, this.annee)) {
            var tab = [date.toString(), this.mois.toString(), this.annee.toString()];
            dateObj = new Date().fromFrString(tab.join('/'));
            event = $.grep(this.events, function (objet) {
                return dateObj.compareToFrString(objet.date);
            });
        }

        if (event && event.length > 0) {
            event = event[0];
            jour = $event.clone();
            jour.popover({
                'title': event.titre,
                'content': event.description,
                'html': true,
                'container': 'body',
                'trigger': 'manual'
            });
        } else if (isValid) {
            jour = $jour.clone();
        } else {
            jour = $invalide.clone();
        }

        jour.data("date", dateObj);
        jour.text(date);
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
                date = ++self.jour;
                isValid = true;
            }
            jour = self.genererJour(isValid, date);
            semaine.append(jour);
        });

        return semaine;
    }

    Calendrier.prototype.genererBody = function (date) {
        var self = this,
            $body = this.elements.body.clone(),
            today = this.toDay,
            annee = this.annee,
            mois = this.mois;

        var premierJour = this.utils.quelJourEstCe(1, mois, annee),
            dernierJour = this.utils.dernierJour(date),
            isCurrent = ((today.getMonth() == mois) && (today.getFullYear() == annee));

        while (this.jour < dernierJour) {
            var debutDeSemaine = Math.max(0, ((premierJour + this.jour) % 7) - 1);
            var finDeSemaine = Math.min(6, (dernierJour - this.jour) - 1);
            console.log("fin", finDeSemaine, dernierJour, this.jour);
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

        cell.html(innerfooter);

        cell.attr("colspan", this.options.jours.length);

        ligne.append(cell);

        $footer.append(ligne);

        $.each(mapping, function (selecteur, fn) {
            fn($footer.find(selecteur), self);
        })

        return $footer;
    }

    Calendrier.prototype.generate = function () {
        var calendar = this.elements.calendrier.clone(),
            date = this.options.date;

        this.jour = 0;
        this.mois = date.getMonth();
        this.annee = date.getFullYear();

        calendar.prepend(this.genererHeader(date))
            .append(this.genererFooter())
            .append(this.genererSemainier())
            .append(this.genererBody(date));

        this.$element.html(calendar);

        this.bindEvents();
    }

    Calendrier.prototype.loadEvents = function (url, callback) {

        if (typeof url == 'function') {
            callback = url;
            url = "";
        }

        var self = this,
            provider = url || this.options.src,
            type = this.options.srcType;

        $.ajax({
            url: provider,
            dataType: type,
            success: function (data) {
                self.events = data.reponse;
                if (callback) callback(data.reponse);
            },
            error: function (error) {
                console.log(error)
            },
            always: function () {
                console.log("always")
            }
        });
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

})(jQuery);