switch (navigator.language) {
    default:
        var alike_lang = {
            i18n: "en-US",
            formatDate: function(d, today = true) {
                date = new Date(d);
                if (today &&
                    date.setHours(0, 0, 0, 0) == (new Date).setHours(0, 0, 0, 0))
                    return "today";
                return new Intl.DateTimeFormat(alike_lang.i18n, {
                    year: "numeric",
                    month: "short",
                    day: "numeric"
                }).format(date)
            },
            platform: function(platform) {
                switch (platform) {
                    case "gamepass":
                        return "GAME PASS";
                    case "gamepasspc":
                        return "PC GAME PASS";
                    case "gamepasscon":
                        return "XBOX GAME PASS";
                    case "ubiplus":
                        return "UBISOFT+";
                    case "eaplay":
                        return "EA PLAY"
                    case "eaplaypro":
                        return "EA PLAY PRO"
                }
            },
            options: {
                which_subs_title: "Which Subscriptions should be displayed",
                which_subs_info: "Changes will be visible after page reload.",
                which_sub: function(platform) {
                    return "Enable " + alike_lang.platform(platform)
                },
            },
            flag: {
                active: function(platform) {
                    return "ON " + alike_lang.platform(platform)
                },
                left: function(platform) {
                    return "LEFT " + alike_lang.platform(platform)
                },
                leaving: function(platform) {
                    return "LEAVING " + alike_lang.platform(platform)
                },
                soon: function(platform) {
                    return "SOON ON " + alike_lang.platform(platform)
                },
				missing: function(platform) {
                    return ""
                }
            },
            long: {
                active: function(platform, name, date) {
                    return name + " has been on " + alike_lang.platform(platform) + " since " + alike_lang.formatDate(date.since)
                },
                left: function(platform, name, date) {
                    return name + " left " + alike_lang.platform(platform) + " on " + alike_lang.formatDate(date.until, false)
                },
                leaving: function(platform, name, date) {
                    return name + " is leaving " + alike_lang.platform(platform) + " " + (date.until ? alike_lang.formatDate(date.until) : "soon")
                },
                soon: function(platform, name, date) {
                    return name + " is coming to " + alike_lang.platform(platform) + " on " + alike_lang.formatDate(date.since)
                },
                missing: function(platform, name, date) {
                    return name + " is not on any subscription service"
                }
            }
        };
        break
}