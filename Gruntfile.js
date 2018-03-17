var pkg = require("./package.json");
var secrets = require("./secrets.json");

module.exports = function(grunt) {

    // Default environment is prod
    var env = grunt.option("env") || "prod";
    var conf = {
       "prod": {
            "profile":              secrets.credentials_profile,
            "region":               secrets.aws_region,
            "importer_arn":         secrets.importer_arn,
            "processor_arn":        secrets.processor_arn,
            "generator_arn":        secrets.generator_arn,
            "twitter_poster_arn":   secrets.twitter_poster_arn,
            "bucket":               secrets.bucket
       },
       "test": {
            "importer_arn":     "NONE",
            "processor_arn":    "NONE"
       }
    };

    var config = {
        currDir:                __dirname,
        packageVersion:         pkg.version.replace(/\./g, "-"),
        env:                    env,
        now_date:               grunt.template.today('yyyy-mm-dd-HHMMss'),

        watch: {
            run_tests: {
                files: [ "src/**/*.js", "fixtures/*.js" ],
                tasks: [ "shell:run_tests" ],
                options: {
                    spawn: false,
                    debounceDelay: 100,
                    atBegin: true
                }
            }
        },

        copy: {
            env_based_conf_file: {
                files: [{
                    src: ["conf/" + env + ".js"],
                    dest: "conf/conf.js"
                }]
            }
        },

        lambda_package: {
            default: {
                options: {
                    include_time: false
                }
            }
        },

        clean: {
            env_based_conf_file: {
                src: ["conf/conf.js"]
            }
        },

        lambda_deploy: {
            options: {
                profile: conf[env].profile,
                region: conf[env].region
            },
            runImporter: {
                arn: conf[env].importer_arn,
                package: "<%= currDir %>/dist/alexa-skill-certification-time_<%= packageVersion %>_latest.zip"
            },
            runProcessor: {
                arn: conf[env].processor_arn,
                package: "<%= currDir %>/dist/alexa-skill-certification-time_<%= packageVersion %>_latest.zip"
            },
            runGenerator: {
                arn: conf[env].generator_arn,
                package: "<%= currDir %>/dist/alexa-skill-certification-time_<%= packageVersion %>_latest.zip"
            },
            runTwitterPoster: {
                arn: conf[env].twitter_poster_arn,
                package: "<%= currDir %>/dist/alexa-skill-certification-time_<%= packageVersion %>_latest.zip"
            }
        },

        eslint: {
            options: {
                configFile: ".eslintrc",
                fix: true
            },
            src: ["lambda_*.js", "src/**/*.js"]
        },

        shell: {
            options: {
                profile: env,
                stdout: true,
                stdin: false
            },

            run_tests: {
                command: "JASMINE_CONFIG_PATH=./jasmine.json NODE_ENV=test ./node_modules/.bin/jasmine"
            },
        }
    };

    grunt.initConfig(config);
    grunt.loadNpmTasks("grunt-contrib-clean");
    grunt.loadNpmTasks("grunt-contrib-copy");
    grunt.loadNpmTasks("grunt-aws-lambda");
    grunt.loadNpmTasks("grunt-contrib-watch");
    grunt.loadNpmTasks("grunt-shell");
    grunt.loadNpmTasks("gruntify-eslint");

    grunt.registerTask(
        "deploy_importer",
        "Package and deploy the Lambda to AWS.",
        [
            "copy:env_based_conf_file",
            "lambda_package",
            "clean:env_based_conf_file",
            "lambda_deploy:runImporter"
        ]
    );

    grunt.registerTask(
        "deploy_processor",
        "Package and deploy the Lambda to AWS.",
        [
            "copy:env_based_conf_file",
            "lambda_package",
            "clean:env_based_conf_file",
            "lambda_deploy:runProcessor"
        ]
    );

    grunt.registerTask(
        "deploy_generator",
        "Package and deploy the Lambda to AWS.",
        [
            "copy:env_based_conf_file",
            "lambda_package",
            "clean:env_based_conf_file",
            "lambda_deploy:runGenerator"
        ]
    );

    grunt.registerTask(
        "deploy_poster",
        "Package and deploy the Lambda to AWS.",
        [
            "copy:env_based_conf_file",
            "lambda_package",
            "clean:env_based_conf_file",
            "lambda_deploy:runTwitterPoster"
        ]
    );

    grunt.registerTask(
        "deploy_all",
        "Package and deploy the Lambda to AWS.",
        [
            "copy:env_based_conf_file",
            "lambda_package",
            "clean:env_based_conf_file",            
            "lambda_deploy:runGenerator",
            "lambda_deploy:runProcessor",
            "lambda_deploy:runImporter"
        ]
    );

    grunt.registerTask(
        "test",
        "Run tests watching for changed files.",
        [ "watch:run_tests" ]
    );

    grunt.registerTask(
        "lint",
        "Run eslint on project files.",
        [ "eslint" ]
    );

};
