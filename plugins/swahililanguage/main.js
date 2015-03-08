var templates = [
    "root/externallib/text!root/plugins/swahililanguage/swlang.json",   
];

define(templates, function (swlang) {
    var plugin = {
        settings: {
            name: "swahililanguage",
            type: "settings",
            menuURL: "#swahililanguage",
            icon: "",
            lang: {
                component: "core"
            }
        },

	MM.loadLang('core', 'sw', JSON.parse(swlang.json));
	
    MM.registerPlugin(plugin);

});