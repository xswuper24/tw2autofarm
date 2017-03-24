module.exports = function (grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        concat: {
            build: {
                src: [
                    'src/core.js',
                    'src/events.js',
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
        replace: {
            build: {
                options: {
                    patterns: [{
                        json: {
                            version: '<%= pkg.version %>',
                            date: '<%= new Date() %>'
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
                banner: '/*! <%= pkg.title %> - v<%= pkg.version %> */'
            },
            build: {
                files: {
                    'dist/<%= pkg.name %>.min.js': 'dist/<%= pkg.name %>.js'
                }
            }
        },
        watch: {
            files: ['src/*.js'],
            tasks: ['eslint', 'concat', 'replace', 'uglify']
        }
    })

    grunt.loadNpmTasks('grunt-eslint');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-replace');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.registerTask('default', [
        'eslint',
        'concat',
        'replace',
        'uglify'
    ]);
}
