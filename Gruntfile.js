module.exports = function(grunt) {
    grunt.initConfig({
        eslint: {
            target: ['*/*.js']
        }
    });

    grunt.loadNpmTasks("grunt-eslint");
    grunt.registerTask('default', ['eslint']);
}