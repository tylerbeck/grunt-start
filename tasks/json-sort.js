/***********************************************************************
 * This task sorts dependencies listed in json files
 * Author: Copyright 2012-2014, Tyler Beck
 * License: MIT
 ***********************************************************************/


module.exports = function( grunt ){

	/*================================================
	 * Dependencies
	 *===============================================*/
	var JsonSort = require('../classes/JsonSort');

	/**
	 * @documentation
	 *
	 * all confuguration parameters must be defined in a sub-task below 'json-sort'
	 *
	 * @parameter path {String|undefined} the path to the JSON file to sort.
	 *
	 * @parameter properties {String|Array|undefined} properties to sort, can be a string, an array of strings or undefined.
	 *  defaults to "*" which indicates to sort all properties,
	 *  "/" can be used to sort root level properties
	 *
	 *
	 * CONFIG FRAGMENT:
	 *
	 *  "json-sort": {
	 *      "package": {
	 *          "path": "package.json",
	 *          "properties": [
	 *              "dependencies",
	 *              "devDependencies"
	 *          ]
	 *      },
	 *      "bower": {
	 *          "path": "package.json",
	 *          "properties": [
	 *              "dependencies"
	 *          ]
	 *      }
	 *  }
	 *
	 */

	/*================================================
	 * Task
	 *===============================================*/
	grunt.registerMultiTask('json-sort', 'Sort JSON Properties.', function(){

		//create instance of class and execute
		( new JsonSort(
				grunt,
				this.data.path,
				this.data.properties,
				this.data.indent
		) ).execute();

		grunt.log.writeln();

	} );

};