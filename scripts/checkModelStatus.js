var exec = require('child_process').exec;

if (process.argv.length < 3) {
    throw new Error("ERROR: missing parameters");
}

let args = process.argv.slice(2);
let skillId = args[0]
let language = args[1];

let check = function(skill_id, language, callback) {
    // executes `pwd`
    let command = "ask api get-model-status -s " + skill_id + " -l "+language;

    child = exec(command, function (error, stdout, stderr) {
        if (error !== null) {
            return callback(error);
        }

        console.log(stdout)

        if (stdout.indexOf('SUCCESS') >= 0) {
            return callback(null);
        }

        if (stdout.indexOf('IN_PROGRESS') >= 0) {
            setTimeout(function() {
                check(skillId, language, callback);
            }, 5000);
            return;
        }

        callback(new Error("Invalid build model state"));
    });
}


check(skillId, language, (error) => {

    if (error) {
        console.log('Error: ' + error);
        process.exit(1);
    }

    process.exit(0);
});
