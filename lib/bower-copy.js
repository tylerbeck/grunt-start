/***********************************************************************
 * This task copies bower dependencies to the specified destination
 * Author: Copyright 2012-2014, Tyler Beck
 * License: MIT
 ***********************************************************************/
var mpath = process.cwd() + '/node_modules/';
var bower = require( mpath + 'bower' );

module.exports = function( grunt ){

	grunt.registerMultiTask('bower-copy', function(){
		var done = this.async();
		var dest = this.data.dest;
		var map = this.data.map || {};
		var shim = this.data.shim || {};
		if ( dest ){
			bower.commands
					.list({paths:true})
					.on('end', function (results) {
						for (var k in results){
							var destPath = "", srcPath = "";

							//first get source path
							if ( shim[k] ){
								srcPath = 'bower_components/'+k+'/'+shim[k];
							}
							else{
								srcPath = results[ k ];
							}
							if ( srcPath == 'bower_components/'+k ){
								//no file is specified... look for package.json
								if ( grunt.file.exists( srcPath + 'package.json' ) ){
									var pkg = grunt.file.readJSON( srcPath + 'package.json' );
									if ( pkg.main ){
										srcPath += '/'+pkg.main;
									}
									else{
										srcPath = "";
									}
								}
								else{
									srcPath = "";
								}
							}

							if (srcPath == ""){
								grunt.log.error('Unable to determine source for '+k+'...add source to task\'s shim object')
							}
							else{
								//get destination path
								if ( map[ k ] ){
									destPath = map[ k ];
									grunt.log.writeln('   mapping "'+k+'" -> "'+destPath+'"');
								}
								else{
									var parts = srcPath.split('/');
									var name = parts[ parts.length - 1 ];
									destPath = dest+'/'+name
								}

								//copy file
								grunt.file.copy( srcPath, destPath );
							}

						}
						done();
					});
		}
		else{
			grunt.log.error( 'Destination (dest) must be set.');
			done();
		}
	});

};