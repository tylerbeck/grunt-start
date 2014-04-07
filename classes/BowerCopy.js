/***********************************************************************
 * This class copies bower dependencies to the specified destination
 * Author: Copyright 2012-2014, Tyler Beck
 * License: MIT
 ***********************************************************************/

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
module.exports = function BowerCopy( grunt, bowerPath, libPath, shim, map, useCommonPath, done ) {
	/*================================================
	 * Dependencies
	 *===============================================*/
	var bower = require( 'bower' );
	var path = require( 'path' );
	var glob = require( 'glob' );


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
	this.execute = function() {

		grunt.verbose.writeln( 'BowerCopy::execute' );

		//first make sure everything needed is set
		if ( validateParameters() ) {

			//expand map
			expandedMap = expandMap( map );

			//get component paths
			bower.commands.list( {paths: true} )
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
	function validateParameters() {
		grunt.verbose.writeln( 'BowerCopy::validateParameters' );
		//flag used to determine if validation passes
		var check = true;

		//lib path must be set
		bowerPath = bowerPath || "bower_components";
		grunt.verbose.writeln( 'bowerPath: ' + bowerPath );
		if ( typeof bowerPath != 'string' ) {
			grunt.log.error( 'Bower path must be a string.' );
			check = false;
		}

		//lib path must be set
		grunt.verbose.writeln( 'libPath: ' + libPath );
		if ( !libPath || typeof libPath != 'string' ) {
			grunt.log.error( 'Default destination path must be configured.' );
			check = false;
		}

		//shim isn't required, but must be a key value object
		shim = shim || {};
		grunt.verbose.writeln( 'shim:' );
		grunt.verbose.writeln( JSON.stringify( shim, undefined, "  " ) );
		if ( typeof shim != "object" ) {
			grunt.log.error( 'shim must be an object.' );
			check = false;
		}

		//map isn't required, but must be a key value object
		map = map || {};
		grunt.verbose.writeln( 'map:' );
		grunt.verbose.writeln( JSON.stringify( map, undefined, "  " ) );
		if ( typeof map != "object" ) {
			grunt.log.error( 'map must be an object.' );
			check = false;
		}

		//useCommonPath isn't required, but must be boolean
		useCommonPath = useCommonPath || false;
		grunt.verbose.writeln( 'useCommonPath: ' + useCommonPath );
		if ( typeof useCommonPath != "boolean" ) {
			grunt.log.error( 'map must be a boolean value.' );
			check = false;
		}

		return check;
	}


	/**
	 * pre-flattens and normalizes map values for easier utilization
	 * @param map
	 * @returns {{}}
	 */
		//TODO: add full globbing for from and to mappings
	function expandMap( map ) {
		grunt.verbose.writeln( 'BowerCopy::expandMap' );
		var expanded = {};

		for ( var k in map ) {
			if ( map.hasOwnProperty( k ) ) {
				var value = map[ k ];

				//get full source path
				var src = path.normalize( path.join( bowerPath, k ) );
				var exists = grunt.file.exists( src );

				//continue if the source exists
				if ( exists ) {
					if ( grunt.file.isFile( src ) ) {
						//src is a file, it must be mapped to a string value
						if ( typeof value == "string" ) {
							expanded[ src ] = path.normalize( path.join( libPath, value ) );
						}
						else {
							grunt.log.error( 'Invalid mapped value for: ' + src );
						}
					}
					else {
						//src is a component directory,
						//   value can be an object containing specific file mappings
						//      or
						//   value can be a string path

						var fsrc, fpath;
						if ( typeof value == "object" ) {
							//map specific files
							for ( var f in value ) {
								if ( value.hasOwnProperty( f ) ) {
									//get file source
									fsrc = path.join( src, f );
									//get file destination path
									fpath = path.normalize( path.join( libPath, value[ f ] ) );
									if ( grunt.file.isFile( fsrc ) ) {
										//source exists, continue with mapping
										expanded[ fsrc ] = fpath;
									}
									else if ( grunt.file.isDir( fsrc ) ) {
										grunt.verbose.writeln( '   map directory: ' + fsrc + '/**' );
										glob.sync( fsrc + '/**', { dot: true } ).forEach( function( filename ) {
											if ( grunt.file.isFile( filename ) ) {
												fpath = path.normalize( path.join( libPath, value[ f ], filename.replace( fsrc, "" ) ) );
												grunt.verbose.writeln( '     from:' + filename );
												grunt.verbose.writeln( '       to:' + fpath );
												expanded[ filename ] = fpath;
											}
										} );

									}
									else {
										grunt.log.error( 'Could not locate source path: ' + fsrc );
									}
								}
							}

						}
						else if ( typeof value == "string" ) {
							//map entire directory
							grunt.verbose.writeln( '   map directory: ' + src + '/**' );
							glob.sync( src + '/**', { dot: true } ).forEach( function( filename ) {
								if ( grunt.file.isFile( filename ) ) {
									fpath = path.normalize( path.join( libPath, value, filename.replace( src, "" ) ) );
									grunt.verbose.writeln( '     from:' + filename );
									grunt.verbose.writeln( '       to:' + fpath );

									expanded[ filename ] = fpath;
								}
							} );
						}
						else {
							grunt.log.error( 'Invalid mapped value for: ' + src );
						}
					}
				}
				else {
					grunt.log.error( 'Could not locate source path: ' + src );
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
		grunt.verbose.writeln( 'BowerCopy::handleListResults' );

		for ( var k in results ) {
			if ( results.hasOwnProperty( k ) ) {
				grunt.verbose.writeln( '------------------------------------' );
				grunt.verbose.writeln( '    ' + k + ' - ' + results[k] );
				copyComponentFiles( k, results[k] );
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
		grunt.verbose.writeln( 'BowerCopy::copyComponentFiles - ' + name );
		//get map of files to copy
		var componentMap = getComponentMapping( name, files );

		//copy files
		for ( var k in componentMap ) {
			if ( componentMap.hasOwnProperty( k ) ) {
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
		grunt.verbose.writeln( 'BowerCopy::getComponentMapping - ' + name );


		//first get list of files
		var fileList = [];
		if ( shim[ name ] != undefined ) {
			grunt.verbose.writeln( '    using shim value' );
			//use shim value
			fileList = fileList.concat( shim[ name ] );
		}
		else {
			grunt.verbose.writeln( '    using result value - ' + files );
			//use value
			fileList = fileList.concat( files );
		}

		//get common path for building destination
		var commonPath = getCommonPathBase( fileList );

		//build default mapping
		var componentMap = {};
		grunt.verbose.writeln( '   mapping files:' );
		for ( var i = 0, l = fileList.length; i < l; i++ ) {
			//need to iterate over glob style matches
			glob.sync( path.join( name, fileList[i] ), { cwd: bowerPath, dot: true } ).forEach( function( filename ) {
				var src = path.normalize( path.join( bowerPath, filename ) );
				grunt.verbose.writeln( '      ' + src );
				if ( grunt.file.isFile( src ) ) {
					if ( expandedMap[ src ] != undefined ) {
						//use user configured mapping if set
						componentMap[ src ] = expandedMap[ src ];
					}
					else {
						var newFilename = commonPath == "" ? filename : filename.replace( commonPath, "" );
						componentMap[ src ] = path.normalize( path.join( libPath, newFilename ) );
					}
				}
			} );
		}

		return componentMap;

	}


	/**
	 * determines a shared base path among paths
	 * @param paths {Array} of strings
	 * @returns {String}
	 */
	function getCommonPathBase( paths ) {

		var list = [];
		var minLength = 999999999;

		var commonPath = "";

		//break up paths into parts
		paths.forEach( function( file ) {

			//get resolved path parts for file directory
			var parts = path.dirname( path.resolve( file ) ).split( path.sep );
			list.push( parts );

			//save minimum path length for next step
			minLength = Math.min( minLength, parts.length );

		} );

		var listLength = list.length;

		//check for common parts
		if ( listLength > 1 ) {
			var common = true;
			var index = 0;
			for ( var i = 0; i < minLength; i++ ) {
				for ( var j = 1; j < listLength; j++ ) {
					if ( list[ j ][ i ] != list[ j - 1 ][ i ] ) {
						common = false;
						break;
					}
				}
				if ( !common ) {
					index = i;
					break;
				}
			}

			//build new paths array
			//for ( var n=0; n<listLength; n++ ) {
			//	newPaths.push( path.join( list[n].slice( index ) ) );
			//}

			commonPath = list[0].slice( 0, index ).join( path.sep );

		}
		else if ( listLength == 1 ) {
			commonPath = path.basename( list[0] );
		}


		return commonPath;

	}


	return this;

};
