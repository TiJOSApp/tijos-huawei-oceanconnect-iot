cordova.define('cordova/plugin_list', function(require, exports, module) {
module.exports = [
  {
    "id": "cordova-plugin-statusbar.statusbar",
    "file": "plugins/cordova-plugin-statusbar/www/statusbar.js",
    "pluginId": "cordova-plugin-statusbar",
    "clobbers": [
      "window.StatusBar"
    ]
  },
  {
    "id": "com.telerik.plugins.nativepagetransitions.NativePageTransitions",
    "file": "plugins/com.telerik.plugins.nativepagetransitions/www/NativePageTransitions.js",
    "pluginId": "com.telerik.plugins.nativepagetransitions",
    "clobbers": [
      "window.plugins.nativepagetransitions"
    ]
  },
  {
    "id": "cordova-plugin-splashscreen.SplashScreen",
    "file": "plugins/cordova-plugin-splashscreen/www/splashscreen.js",
    "pluginId": "cordova-plugin-splashscreen",
    "clobbers": [
      "navigator.splashscreen"
    ]
  }
];
module.exports.metadata = 
// TOP OF METADATA
{
  "cordova-plugin-whitelist": "1.3.3",
  "cordova-plugin-statusbar": "2.4.2",
  "com.telerik.plugins.nativepagetransitions": "0.6.5",
  "cordova-plugin-splashscreen": "5.0.2"
};
// BOTTOM OF METADATA
});