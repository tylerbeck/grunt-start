/***********************************************************************
 * This class copies bower dependencies to the specified destination
 * Author: Copyright 2012-2014, Tyler Beck
 * License: MIT
 ***********************************************************************/

var mpath = process.cwd() + '/node_modules/';
var bower = require( mpath + 'bower' );
var path = require( 'path' );

/**
 * Bower Copy Class
 * @param grunt
 * @param bowerPath
 * @param libPath
 * @param shim
 * @param map
 * @param useCommonPath
 * @param done
 * @returns {BowerCopy}
 * @constructor
 */
module.exports = function BowerCopy( grunt, bowerPath, libPath, shim, map, useCommonPath, done ){

	/*================================================
	 * Public Attributes
	 *===============================================*/


	/*================================================
	 * Private Attributes
	 *===============================================*/
	var expandedMap = {};

	/*================================================
	 * Public Methods
	 *===============================================*/
	this.execute = function(){

		//first make sure everything needed is set
		if ( validateParameters() ){

			//expand map
			expandedMap = expandMap( map );

			//get component paths
			bower.commands.list( {paths:true} )
					.on( 'end', handleListResults );
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
		bowerPath = bowerPath || "bower_components";
		if ( typeof bowerPath != 'string'){
			grunt.log.error( 'Bower path must be a string.');
			check = false;
		}

		//lib path must be set
		if ( !libPath || typeof libPath != 'string'){
			grunt.log.error( 'Default destination path must be configured.');
			check = false;
		}

		//shim isn't required, but must be a key value object
		shim = shim || {};
		if ( typeof shim != "object" ){
			grunt.log.error( 'shim must be an object.');
			check = false;
		}

		//map isn't required, but must be a key value object
		map = map || {};
		if ( typeof map != "object" ){
			grunt.log.error( 'map must be an object.');
			check = false;
		}

		//useCommonPath isn't required, but must be boolean
		useCommonPath = useCommonPath || false;
		if ( typeof useCommonPath != "boolean" ){
			grunt.log.error( 'map must be a boolean value.');
			check = false;
		}

		return check;
	}


	/**
	 * pre-flattens and normalizes map values for easier utilization
	 * @param map
	 * @returns {{}}
	 */
	function expandMap( map ){

		var expanded = {};

		for ( var k in map ){
			if ( map.hasOwnProperty( k ) ){
				var value = map[ k ];

				//get full source path
				var src = path.normalize( path.join( bowerPath, k ) );
				var exists = grunt.file.exists( src );

				//continue if the source exists
				if ( exists ){
					if ( grunt.file.isFile( src ) ){
						//src is a file, it must be mapped to a string value
						if ( typeof value == "string" ){
							expanded[ src ] = path.normalize( path.join( libPath, value ) );
						}
						else{
							grunt.log.error( 'Invalid mapped value for: '+src );
						}
					}
					else{
						//assume src is a component directory, value should be an object
						//TODO: add ability to map component directory name
						if ( typeof value == "object" ){

							for ( var f in value ){
								if ( value.hasOwnProperty( f ) ){
									//get file source
									var fsrc = path.join( src, f );
									//get file destination path
									var fpath = path.normalize( path.join( libPath, value[ f ] ) );
									if ( grunt.file.isFile( fsrc ) ){
										//source exists, continue with mapping
										expanded[ fsrc ] = fpath;
									}
									else{
										grunt.log.error( 'Could not locate source path: '+fsrc);
									}
								}
							}

						}
						else{
							grunt.log.error( 'Invalid mapped value for: '+src );
						}
					}
				}
				else{
					grunt.log.error( 'Could not locate source path: '+src);
				}
			}
		}

		return expanded;
	}


	/**
	 * bower list results handler
	 * @param results
	 */
	function handleListResults( results ) {
		for ( var k in results ) {
			if ( results.hasOwnProperty( k ) ) {
				copyComponentFiles( k, results[k]  );
			}
		}
		done();
	}


	/**
	 * copies specified component files based on mapping
	 * @param name
	 * @param files
	 * @returns {boolean}
	 */
	function copyComponentFiles( name, files ) {

		//get map of files to copy
		var componentMap = getComponentMapping( name, files );

		//copy files
		for ( var k in componentMap ){
			if ( componentMap.hasOwnProperty( k ) ){
				grunt.file.copy( k, componentMap[ k ] );
			}
		}

	}

	/**
	 * gets file mapping for specified component
	 * @param name
	 * @param files
	 * @returns {{}}
	 */
	function getComponentMapping( name, files ) {

		//first get list of files
		var fileList = [];
		if ( shim[ name ] ){
			//use shim value
			fileList.concat( shim[name] );
		}
		else {
			//use value
			fileList.concat( files );
		}

		var destinationList = removeCommonPathBase( fileList );

		//build default mapping
		var componentMap = {};
		for ( var i=0, l=fileList.length; i<l; i++ ){
			var src = path.normalize( path.join( bowerPath, name, fileList[i] ) );
			if ( expandedMap[ src ] != undefined ){
				//use user configured mapping if set
				componentMap[ src ] = expandedMap[ src ];
			}
			else{
				componentMap[ src ] = path.normalize( path.join( libPath, name, destinationList[i] ) );
			}
		}

		return componentMap;

	}


	/**
	 * determines a shared base path among paths
	 * @param paths {Array} of strings
	 * @returns {Array} copy
	 */
	function removeCommonPathBase( paths ){

		var list = [];
		var minLength = 999999999;

		//break up paths into parts
		paths.forEach( function( file ){

			//get resolved path parts for file directory
			var parts = path.sep( path.dirname( path.resolve( file ) ) );
			list.push( parts );

			//save minimum path link for next step
			minLength = Math.min( minLength, parts.length );

		});

		var newPaths = [];
		var listLength = list.length;
		//check for common parts
		if (listLength > 1){
			var common = true;
			var index = 0;
			for ( var i=0; i<minLength; i++ ){
				for ( var j=1; j<listLength; j++ ){
					if ( list[ j ][ i ] != list[ j-1 ][ i ] ){
						common = false;
						break;
					}
				}
				if (!common){
					index = i;
					break;
				}
			}

			//build new paths array
			for ( var n=0; n<listLength; n++ ) {
				newPaths.push( path.join( list[n].slice( index ) ) );
			}

		}
		else if ( listLength == 1 ){
			newPaths.push( path.basename( list[0] ) )
		}


		return newPaths;

	}


	return this;

}
