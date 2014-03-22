/***********************************************************************
 * This task copies bower dependencies to the specified destination
 * Author: Copyright 2012-2014, Tyler Beck
 * License: MIT
 ***********************************************************************/
var mpath = process.cwd() + '/node_modules/';
var bower = require( mpath+'bower' );
var _ = require( mpath+'lodash' );

/**
 * returns a sorted clone of an object
 * @param obj
 * @returns {{}}
 */
function sortObjectProperties( obj ){
	var newObj = {};
	var keys = _.keys( obj );
	keys = keys.sort().reverse();
	var key;
	while (key = keys.pop()){
		//console.log(key);
		newObj[ key ] = obj[ key ];
	}
	return newObj;
}

module.exports = function( grunt ){

	grunt.registerMultiTask('json-sort', function(){
		var files = this.data.targets;
		files.forEach(function( file ){
			var path,props;
			if (typeof file == 'string'){
				path = file;
			}
			else{
				path = file.path;
				props = file.props;
			}
			props = props || ['dependencies','devDependencies'];
			if ( grunt.file.exists( path ) ){
				try {
					//read file
					var obj = grunt.file.readJSON( path );

					//iterate specified properties & sort
					props.forEach( function(prop){
						if (obj[ prop ]){
							obj[ prop ] = sortObjectProperties( obj[ prop ] );
						}
					});

					//save file
					grunt.file.write( path, JSON.stringify( obj, null,"  ") );

				}
				catch (e){
					grunt.log.error('Error reading '+path);
				}
			}
		});
	});

};