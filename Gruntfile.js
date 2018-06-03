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
            "site_generator_arn":   secrets.site_generator_arn,
            "twitter_poster_arn":   secrets.twitter_poster_arn,
            "skill_arn":            secrets.skill_arn,
            "skill_id":             secrets.skill_id, 
            "bucket":               secrets.bucket
       },
       "test": {
            "skill_id":         "", 
            "profile":          "",
            "importer_arn":     "NONE",
            "processor_arn":    "NONE"
       }
    };

    var config = {
        currDir:                __dirname,
        packageVersion:         pkg.version.replace(/\./g, "-"),
        env:                    env,
        skill_id:               conf[env].skill_id,
        aws_profile:            conf[env].profile,
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
                arn: conf[env].site_generator_arn,
                package: "<%= currDir %>/dist/alexa-skill-certification-time_<%= packageVersion %>_latest.zip"
            },
            runTwitterPoster: {
                arn: conf[env].twitter_poster_arn,
                package: "<%= currDir %>/dist/alexa-skill-certification-time_<%= packageVersion %>_latest.zip"
            },
            runAlexaSkill: {
                arn: conf[env].skill_arn,
                package: "<%= currDir %>/dist/alexa-skill-certification-time_<%= packageVersion %>_latest.zip"
            }
        },

        aws_s3: {
            options: {
                awsProfile: conf[env].profile,
                region: conf[env].region
            },
            templates: {
                options: {
                    bucket: conf[env].bucket
                },
                files: [
                    {expand: true, cwd: 'assets/templates/', src: ['**'], dest: 'templates/'},
                    {expand: true, cwd: 'assets/templates/', src: ['*.css', '*.png'], dest: 'public/'},
                    {expand: true, cwd: 'assets/public/', src: ['**'], dest: 'public/'}
                ]
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

            download_skill: {
                command: "ask api get-skill -s <%= skill_id %> -p <%= aws_profile %> > <%= currDir %>/assets/alexa-skill/skill.json"
            },

            upload_skill: {
                command: "ask api update-skill -s <%= skill_id %> -p <%= aws_profile %> -f <%= currDir %>/assets/alexa-skill/skill.json"
            },

            download_model: {
                command: "ask api get-model -s <%= skill_id %>  -p <%= aws_profile %>-l en-US > <%= currDir %>/assets/alexa-skill/model.json"
            },

            upload_model: {
                command: "ask api update-model -s <%= skill_id %> -p <%= aws_profile %> -l en-US -f <%= currDir %>/assets/alexa-skill/model.json"
            },

            check_model_status: {
                command: "node <%= currDir %>/scripts/checkModelStatus.js <%= skill_id %> en-US"
            }
        }
    };

    grunt.initConfig(config);
    grunt.loadNpmTasks("grunt-contrib-clean");
    grunt.loadNpmTasks("grunt-contrib-copy");
    grunt.loadNpmTasks("grunt-aws-lambda");
    grunt.loadNpmTasks("grunt-aws-s3");
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
            "lambda_deploy:runImporter",
            "lambda_deploy:runPoster"
        ]
    );

    grunt.registerTask(
        "deploy_website",
        "Deploy website pages to S3.",
        [
            "aws_s3:templates"
        ]
    );

    grunt.registerTask(
        "deploy_skill_lambda",
        "Deploy the Alexa skill lambda",
        [
            "copy:env_based_conf_file",
            "lambda_package",
            "clean:env_based_conf_file",
            "lambda_deploy:runAlexaSkill"
        ]
    );

    grunt.registerTask(
        "deploy_skill_model",
        "Upload skill model and wait the completion of its processing",
        [
            "shell:upload_model",
            "shell:check_model_status"
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
