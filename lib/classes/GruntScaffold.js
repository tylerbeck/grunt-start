/***********************************************************************
 * Grunt Scaffolding
 * Author: Copyright 2012-2014, Tyler Beck
 * License: MIT
 ***********************************************************************/

var _ = require('lodash');
var matchdep = require('matchdep');
var glob = require('glob');


/**
 * Creates an autoloading grunt scaffolding
 * @param npmTasks
 * @param taskDirectories
 * @param configDirectories
 * @param initFn
 * @returns {Function}
 */
module.exports = function( npmTasks, taskDirectories, configDirectories, initFn ){


	/*================================================
	 * Private Methods
	 *===============================================*/

	/**
	 * loads any modules prefixed with 'grunt-' listed in
	 * package.json's devDependencies
	 * @param grunt {{}}
	 */
	function loadNpmTasks( grunt ) {
		grunt.verbose.writeln( 'Loading grunt tasks from dev dependencies: '+npmTasks );
		if ( npmTasks ) {
			matchdep.filterDev( 'grunt-*' ).forEach( function( item ) {
				if ( item != "grunt-cli" ) {
					grunt.loadNpmTasks( item );
				}
			} );
		}
	}

	/**
	 * loads tasks from specifed  path
	 * @param grunt {{}}
	 * @param dirs {Array|String}
	 */
	function loadCustomTasks( grunt, dirs ){
		if ( dirs != undefined ){
			//cast to array if value is string
			if (typeof dirs == "string")
				dirs = [ dirs ];

			//iterate directories and load tasks
			dirs.forEach( function( dir ){
				if ( grunt.file.isDir( dir ) ){
					grunt.loadTasks( dir );
				}
				else{
					grunt.log.error( 'error loading tasks: '+dir+' does not appear to be a directory.' );
				}
			});
		}
	}

	/**
	 * creates a configuration object from files in specifed config directory
	 * @param dirs {Array|String}
	 * @returns {{}}
	 */
	function getConfiguration( grunt, dirs ){
		//configuration object
		var config = {};

		if ( dirs != undefined ) {
			//cast to array if value is string
			if ( typeof dirs == "string" )
				dirs = [ dirs ];

			dirs.forEach( function( dir ) {
				glob.sync( '*', {cwd: dir} ).forEach( function( option ) {
					grunt.verbose.writeln( "loading: " + dir + option );
					var options = grunt.file.readJSON( dir + option );
					//merge options into config config
					_.merge( config, options );
				} );
			} );
		}

		return config;
	}


	/*================================================
	 * Return Task
	 *===============================================*/
	/**
	 * return grunt module method
	 */
	return function( grunt ){

		//load tasks defined via package.json
		loadNpmTasks( grunt );

		//load custom tasks
		loadCustomTasks( grunt, taskDirectories );

		//initiealize grunt config
		grunt.initConfig( getConfiguration( grunt, configDirectories ) );

		if (initFn && typeof initFn == 'function')
			initFn( grunt );

	};

};
