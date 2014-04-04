/***********************************************************************
 * This task copies bower dependencies to the specified destination
 * Author: Copyright 2012-2014, Tyler Beck
 * License: MIT
 ***********************************************************************/


module.exports = function( grunt ){

	/*================================================
	 * Dependencies
	 *===============================================*/
	var BowerCopy = require('../classes/BowerCopy');

	/**
	 * @documentation
	 *
	 * all confuguration parameters must be defined in a sub-task below 'bower-copy'
	 *
	 * @parameter bowerPath {String|undefined} the default bower directory, default value "bower_components".
	 *
	 * @parameter libPath {String} the default base lib path for copying components.
	 *
	 * @parameter shim {Object|undefined} a map used to specify or replace the value of 'main'
	 * defined in bower.json or package.json for the specified keys (component names).
	 *
	 * @parameter map {Object|Undefined} a map used to remap file paths
	 *
	 * @parameter maintainCommonPaths {Boolean} default false, copies unmapped files relative
	 * to higest level common directory
	 *
	 *
	 *
	 * CONFIG FRAGMENT:
	 *
	 *  "bower-copy": {
	 *      "default": {
	 *          "libPath": "assets/js/lib",
	 *          "shim": {
	 *              "component-1": "main.js",
	 *              "component-2": [
	 *                  "file-one.js",
	 *                  "file-two.js"
	 *              ],
	 *              "component-3": [
	 *                  "lib/file-one.js",
	 *                  "lib/file-two.js"
	 *              ]
	 *              "component-4": [
	 *                  "common/lib/one.js",
	 *                  "common/lib/two.js"
	 *              ],
	 *              "css-component": "lib/styles/style.css"
	 *          },
	 *          "map": {
	 *              "component-1/main.js": "component-1.js",
	 *              "component-2/file-one.js": "component-2.one.js",
	 *              "component-2/file-two.js": "component-2.two.js",
	 *              "component-3": {
	 *                  "lib/file-one.js": "component-3.one.js",
	 *                  "lib/file-two.js": "component-3.two.js"
	 *              },
	 *              "css-component": {
	 *                  "lib/styles/style.css": "../../css/style-component.css"
	 *              }
	 *          }
	 *      }
	 *  }
	 *
	 *
	 *  TASK-RESULT:
	 *      ./assets
	 *      |-- js/lib
	 *      |   |--component-1.js
	 *      |   |--component-2.one.js
	 *      |   |--component-2.two.js
	 *      |   |--component-3.one.js
	 *      |   |--component-3.two.js
	 *      |   |--component-4
	 *      |      |-- one.js
	 *      |      |-- two.js
	 *      |
	 *      |-- css
	 *      |   |-- style-component.css
	 *
	 */


	/*================================================
	 * Task
	 *===============================================*/
	grunt.registerMultiTask('bower-copy', 'Copy Bower Dependencies.', function(){
		//create instance of class and execute
		( new BowerCopy(
				grunt,
				this.data.bowerPath,
				this.data.libPath,
				this.data.shim,
				this.data.map,
				this.data.useCommonPath,
				this.async()
		) ).execute();

		grunt.log.writeln();

	} );

};