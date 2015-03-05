var templates = [
    "root/externallib/text!root/plugins/suzamoodle/theme.css",
    "root/externallib/text!root/plugins/suzamoodle/login.html",
	"root/externallib/text!root/plugins/suzamoodle/swlang.json"
    
];

define(templates, function (theme, loginForm,swlang) {
    var plugin = {
        settings: {
            name: "suzamoodle",
            type: "general",
            menuURL: "#suzamoodle",
            icon: "plugins/events/icon.png",
            lang: {
                component: "core"
            }
        },

        routes: [
            ["suzamoodle", "show_program", "showProgram"]
        ],

        showProgram: function() {
            var tpl = {};
            var html = MM.tpl.render(program, tpl);
            MM.panels.show('center', html, {title: MM.lang.s("suzamoodle")});
        }
    };

    // Inject allways our custom theme.
    $("#mobilecssurl").html(theme);

    // Replace the sign-up form with our custom template.
    $("#add-site_template").html(loginForm);

    // Automatically use the URL of the moodle moot without further checks.
    MM.checkSite = function(e) {
        MM.addSite(e);
    };

    // Inject allways our custom theme.
    MM.loadCachedRemoteCSS = function(e) {
        $("#mobilecssurl").html(theme);
    };

    // Do not display the manage accounts page.
    MM._displayManageAccounts = function() {
        MM._displayAddSite();
    };

	MM.loadLang('core', 'sw', JSON.parse(swlang.json));
	
    MM.registerPlugin(plugin);

});