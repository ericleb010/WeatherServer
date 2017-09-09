module.exports = function(grunt) {
    grunt.initConfig({
        eslint: {
            target: ['**/*.js', '!node_modules/**']
        },
        mochaTest: {
            test: {
                src: ["test/**/*.js"]
            }
        },
        mocha_istanbul: {
            coverage: {
                src: "test"
            }
        }
    });

    grunt.loadNpmTasks("grunt-eslint");
    grunt.loadNpmTasks('grunt-mocha-test');
    grunt.loadNpmTasks('grunt-mocha-istanbul');
    
    grunt.registerTask('default', ['mochaTest', 'mocha_istanbul:coverage', 'eslint']);
}