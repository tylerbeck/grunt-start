/***********************************************************************
 * Grunt Toolbox
 * Author: Copyright 2012-2014, Tyler Beck
 * License: MIT
 ***********************************************************************/

module.exports = function( grunt ){

	//return object with class references
	return {
		Scaffold: require( './classes/GruntScaffold' ),
		BowerCopy: require( './classes/BowerCopy' ),
		JsonSort: require( './classes/JsonSort' )
	};

};
