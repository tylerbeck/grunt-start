/***********************************************************************
 * This class sorts dependencies listed in .json files
 * Author: Copyright 2012-2014, Tyler Beck
 * License: MIT
 ***********************************************************************/

/**
 * Bower Copy Class
 * @param grunt
 * @param filepath
 * @param props
 * @returns {JsonSort}
 * @constructor
 */
module.exports = function JsonSort( grunt, filepath, props ){
	'use strict';
	/*================================================
	 * Dependencies
	 *===============================================*/
	var path = require( 'path' );
	var _ = require( 'lodash' );

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
			if ( grunt.file.exists( filepath ) ){
				grunt.verbose.writeln( 'Loading: '+ filepath );
				try {
					//read file
					var obj = grunt.file.readJSON( filepath );

					if ( props === "/" ){
						//we want to sort the first level properties
						obj = sortObjectProperties( obj );
					}
					else{
						//if props is set to asterix, get all object keys
						if (props === "*"){
							props = _.keys( obj );
						}

						//iterate specified properties & sort
						props.forEach( function( prop ){
							//only sort own properties of plain objects.
							if ( obj.hasOwnProperty( prop ) && _.isPlainObject( obj[prop] )){
								grunt.verbose.writeln( 'Sorting: '+ prop );
								obj[ prop ] = sortObjectProperties( obj[ prop ] );
							}
						});
					}

					//save file
					grunt.file.write( filepath, JSON.stringify( obj, null,"  ") );

				}
				catch (e){
					grunt.log.error('Error reading '+filepath);
				}
			}
			else{
				grunt.log.error('File not found at: '+filepath);
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
		if ( !filepath || typeof filepath != 'string'){
			grunt.log.error( 'A valid file path must be configured.');
			check = false;
		}

		//validate and recast props
		props = props || '*';
		if( typeof props == 'string' && props != "*" && props != "/" )
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
			//deep cloning shouldn't be needed for prop files, but just in case...
			newObj[ key ] = _.cloneDeep( obj[key] );
		}
		return newObj;
	}


	return this;

};

