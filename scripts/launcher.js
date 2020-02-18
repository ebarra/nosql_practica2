const fs = require('fs');
const path = require("path");
const chalk = require('chalk');
const Utils = require('./utils');

const { promisify } = require("util");
const writeFile = promisify(fs.writeFile);

const ASSIGNMENT_PATH = "./tests/checks.js";
const UTILS_PATH = "./tests/testutils.js";
const DATA_FOLDER = "./data";
const USER_FILE_PATH = "./user.json";
const OUTPUT_FILE = DATA_FOLDER + "/res.enc";
const ZIP_FILE = DATA_FOLDER + "/assignment.zip";
const HISTORY_FILE = DATA_FOLDER + "/his.enc";

const error = chalk.bgRed;
const info = chalk.green;
const ask = chalk.bgCyan;
const finalInfoBad = chalk.bgRed;
const finalInfoGood = chalk.bgGreen;
const suiteTitle = chalk.bgBlue;
const testTitle = chalk.bgGreen;
const highlight = chalk.green;

Utils.getConfig().then(async (CONFIG)=>{
  Utils.setDebug(CONFIG.debug);
  try {
    //FETCH latest version from github for this tests and check
    let remVersion = await Utils.checkTestVersion(CONFIG.info.githubURL, "package.json");
    if(process.argv.length===2 && remVersion==="*"){
        console.log(info("No se ha podido comprobar si tienes la última versión de los test, no hay conexión a Internet. Se empleará la versión " + CONFIG.version));
    } else if (remVersion!==CONFIG.version){
        console.log(error("No tienes la última versión de los TESTs. Debes actualizar el repositorio."));
        console.log(info("Si has utilizado git para bajártelo tan solo tendrás que hacer git pull, si no has usado git vuelve a bajarte el repo completo y sustituye la carpeta tests, carpeta scripts y fichero package.json por la última versión."));
        process.exit(0);
    }
    const autoCOREctorURL = CONFIG.info.serverUrl + 'api/courses/' + CONFIG.info.courseId + '/assignments/' + CONFIG.info.assignmentId;
    await Utils.createFolder(DATA_FOLDER);
    let user_info = await Utils.getEmailAndToken(USER_FILE_PATH);

    let fullScore = await Utils.execTests(ASSIGNMENT_PATH);
    fullScore.score = parseFloat(fullScore.score.toPrecision(12));
    fullScore.score_total = parseFloat(fullScore.score_total.toPrecision(12));
    let history = await Utils.saveHistoryRecord(fullScore, CONFIG.version, HISTORY_FILE);
    //process score y score_total para evitar problema de punto flotante
    if(fullScore.score===10){
      console.log(finalInfoGood(`Resultado Final: ${fullScore.score}/${fullScore.score_total}\n\n`));
    } else {
      console.log(finalInfoBad(`Resultado Final: ${fullScore.score}/${fullScore.score_total}\n\n`));
    }

    if(process.argv.length>2 && process.argv[2]==="upload"){
      let consent = await Utils.askForConsent(user_info);
      if (!consent){
        console.log(error("Rellene correctamente sus datos y asegurese de haber hecho usted la práctica que va a subir al servidor."));
        process.exit(0);
      }
      user_info.score = fullScore.score;
      user_info.score_total = fullScore.score_total;
      user_info.test_version = CONFIG.version;
      user_info.history = history;
      user_info.hash_files = await Utils.getHashMultipleFiles([ASSIGNMENT_PATH, UTILS_PATH]);
      let user_info_clon = JSON.parse(JSON.stringify(user_info))
      user_info.signature = Utils.getSignature(user_info_clon);
      Utils.debug("RESULTS: ", user_info);
      let result_data = Utils.en(JSON.stringify(user_info, null, 4), 'pubkey.pem');
      await writeFile(path.resolve(process.cwd(), OUTPUT_FILE), result_data);
      //compress files in zip to send to moodle the assignment
      await Utils.compress(ZIP_FILE);
      await Utils.sendFile(autoCOREctorURL, ZIP_FILE, HISTORY_FILE);
      Utils.debug("¡FIN!");
    }
  } catch (err){
      console.log("ERROR, CERRAMOS TODO")
      console.log(err);
      console.log(error(err));
  }
}).catch((err)=>{
  Utils.debug(err);
  console.log(error(err));
});
