/***********************************************************************
 * Grunt Toolbox Tasks
 * Author: Copyright 2012-2014, Tyler Beck
 * License: MIT
 ***********************************************************************/
module.exports = function( grunt ){

	//auto register tasks
	grunt.registerMultiTask( 'json-sort', require( './tasks/json-sort' ) );
	grunt.registerMultiTask( 'bower-copy', require( './tasks/bower-copy' ) );

};

module.exports.Scaffold = require( './classes/GruntScaffold' );
module.exports.BowerCopy = require( './classes/BowerCopy' );
module.exports.JsonSort = require( './classes/JsonSort' );

