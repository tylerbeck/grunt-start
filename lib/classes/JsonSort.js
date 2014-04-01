/***********************************************************************
 * This class sorts dependencies listed in .json files
 * Author: Copyright 2012-2014, Tyler Beck
 * License: MIT
 ***********************************************************************/

var path = require( 'path' );

/**
 * Bower Copy Class
 * @param grunt
 * @param path
 * @param props
 * @param done
 * @returns {JsonSort}
 * @constructor
 */
module.exports = function JsonSort( grunt, path, props, done ){

	/*================================================
	 * Public Attributes
	 *===============================================*/

	/*================================================
	 * Private Attributes
	 *===============================================*/

	/*================================================
	 * Public Methods
	 *===============================================*/
	this.execute = function(){

		//first make sure everything needed is set
		if ( validateParameters() ){

			if ( grunt.file.exists( path ) ){
				try {
					//read file
					var obj = grunt.file.readJSON( path );

					//iterate specified properties & sort
					props.forEach( function( prop ){
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
			else{
				grunt.log.error('File not found at: '+path);
			}
		}

	};


	/*================================================
	 * Private Methods
	 *===============================================*/
	/**
	 * validates bower copy task parameters
	 * @returns {boolean}
	 */
	function validateParameters(){

		//flag used to determine if validation passes
		var check = true;

		//lib path must be set
		if ( !path || typeof path != 'string'){
			grunt.log.error( 'A valid file path must be configured.');
			check = false;
		}

		//validate and recast props
		props = props || ['dependencies','devDependencies'];
		if( typeof props == 'string' )
			props = [props];

		return check;
	}

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
			//deep cloning shouldn't be needed for prop files, but just in case...
			newObj[ key ] = _.cloneDeep( obj[key] );
		}
		return newObj;
	}


	return this;

};

