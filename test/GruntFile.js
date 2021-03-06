/***********************************************************************
 * Default Grunt Scaffolding
 * Author: Copyright 2012-2014, Tyler Beck
 * License: MIT
 ***********************************************************************/

var gs = require('grunt-start');

var configDirs = [
	"./config"
];

var taskDirs = [
	"./tasks"
];

//npmTasks, taskDirectories, configDirectories, initFn
module.exports = new gs.Loader(

		//load npm tasks
		true,

		//array of or single directory path in which grunt tasks have been defined
		taskDirs,

		//array of or single directory path in which grunt configuration objects have been defined
		configDirs,

		//grunt file scripts
		function( grunt ){

			grunt.registerTask('default', function(){
				grunt.log.writeln( 'IT WORKS!' );
			});

			//TODO: add task to clean test


		}
);
