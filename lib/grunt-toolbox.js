/***********************************************************************
 * Grunt Toolbox
 * Author: Copyright 2012-2014, Tyler Beck
 * License: MIT
 ***********************************************************************/

module.exports = {
	Scaffold: require( './classes/GruntScaffold' ),
	BowerCopy: require( './classes/BowerCopy' ),
	JsonSort: require( './classes/JsonSort' ),
	tasks: {
		'bowerCopy': require( './tasks/bower-copy' ),
		'jsonSort': require( './tasks/json-sort' )
	}
};
