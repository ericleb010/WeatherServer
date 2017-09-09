module.exports = function(grunt) {
    grunt.initConfig({
        eslint: {
            target: ['**/*.js', '!node_modules/**']
        },
        mochaTest: {
            test: {
                src: ["test/**/*.js"]
            }
        }
    });

    grunt.loadNpmTasks("grunt-eslint");
    grunt.loadNpmTasks('grunt-mocha-test');
    grunt.registerTask('default', ['mochaTest', 'eslint']);
}