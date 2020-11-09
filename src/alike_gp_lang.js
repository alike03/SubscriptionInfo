switch (navigator.language) {
    default:
        var alike_lang = {
            i18n: "en-US",
            formatDate: function(d) {
                if (date = new Date(d),
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
                        return "GAME PASS PC";
                    case "gamepasscon":
                        return "GAME PASS CONSOLE";
                    case "ubiplus":
                        return "UBISOFT+";
                    case "eaplay":
                        return "EA PLAY"
                }
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
                }
            },
            long: {
                active: function(platform, name, date) {
                    return name + " has been on " + alike_lang.platform(platform) + " since " + alike_lang.formatDate(date.since)
                },
                left: function(platform, name, date) {
                    return name + " left " + alike_lang.platform(platform) + " on " + alike_lang.formatDate(date.until)
                },
                leaving: function(platform, name, date) {
                    return name + " is leaving " + alike_lang.platform(platform) + " " + (date.until ? alike_lang.formatDate(date.until) : "soon")
                },
                soon: function(platform, name, date) {
                    return name + " is coming to " + alike_lang.platform(platform) + " on " + alike_lang.formatDate(date.since)
                }
            }
        };
        break
}