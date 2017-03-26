module.exports = function (grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        concat: {
            build: {
                src: [
                    'src/core.js',
                    'src/command.js',
                    'src/interface.js',
                    'src/run.js'
                ],
                dest: 'dist/<%= pkg.name %>.js'
            }
        },
        eslint: {
            options: {
                configFile: '.eslintrc.json'
            },
            build: ['src/*.js']
        },
        htmlmin: {
            build: {
                options: {
                    removeComments: true,
                    collapseWhitespace: true
                },
                files: {
                    'dist/temp/window.html': 'src/interface/window.html',
                    'dist/temp/button.html': 'src/interface/button.html',
                    'dist/temp/event.html': 'src/interface/event.html'
                }
            }
        },
        cssmin: {
            options: {
                mergeIntoShorthands: false,
                roundingPrecision: -1
            },
            target: {
                files: {
                    'dist/temp/style.css': 'src/interface/style.css'
                }
            }
        },
        replace: {
            build: {
                options: {
                    patterns: [{
                        json: {
                            version: '<%= pkg.version %>',
                            date: '<%= new Date() %>',
                            window: '<%= grunt.file.read("dist/temp/window.html") %>',
                            button: '<%= grunt.file.read("dist/temp/button.html") %>',
                            event: '<%= grunt.file.read("dist/temp/event.html") %>',
                            style: '<%= grunt.file.read("dist/temp/style.css") %>'
                        }
                    }]
                },
                files: [{
                    expand: true,
                    flatten: true,
                    src: ['dist/<%= pkg.name %>.js'],
                    dest: 'dist/'
                }]
            }
        },
        uglify: {
            options: {
                sourceMap: true,
                sourceMapName: 'dist/<%= pkg.name %>.map',
                banner: '/*! <%= pkg.name %>.min.js@<%= pkg.version %> */'
            },
            build: {
                files: {
                    'dist/<%= pkg.name %>.min.js': 'dist/<%= pkg.name %>.js'
                }
            }
        },
        clean: ['dist/temp'],
        watch: {
            files: ['src/**'],
            tasks: ['eslint', 'concat', 'htmlmin', 'cssmin', 'replace', 'clean']
        }
    })

    grunt.loadNpmTasks('grunt-eslint');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-htmlmin');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-replace');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-clean');

    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.registerTask('default', [
        'eslint',
        'concat',
        'htmlmin',
        'cssmin',
        'replace',
        'uglify',
        'clean'
    ]);
}
