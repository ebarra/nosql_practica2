//We won´t use fs promises because in windows 10 sometimes writefile breaks promises in node 12
//we will use the standard callback version and promisify it
//const fs = require('fs').promises;
const fs = require('fs');
const crypto = require('crypto');
const objectHash = require('object-hash');
const readline = require('readline');
const path = require("path");
const chalk = require('chalk');
const archiver = require('archiver');
const Octokit = require("@octokit/rest");
const needle = require("needle");
const Mocha = require("mocha");
const util = require('util'); //node util module

const Utils = {}; //define our Utils module

const error = chalk.bgRed;
const info = chalk.green;
const ask = chalk.bgCyan;
const suiteTitle = chalk.yellow.inverse;
const finalInfo = chalk.bgRed;
const testTitle = chalk.bgGreen;
const highlight = chalk.green;

let withDebug = false;

const { promisify } = require("util");
const writeFile = promisify(fs.writeFile);
const readFile = promisify(fs.readFile);
const access = promisify(fs.access);
const mkdir = promisify(fs.mkdir);
const stat = promisify(fs.stat);



Utils.setDebug = (status) => {
  withDebug = status;
}

Utils.debug = (...args) => {
  if(withDebug){
    console.log(...args);
  }
}

/* get config from package.json, done this way instead of require because requires are resolved by webpack when uglifying*/
Utils.getConfig = async () => {
  Utils.debug("getConfig");
    if(await Utils.checkFileExists("package.json")){
      try {
        let config = JSON.parse(await readFile(path.resolve(process.cwd(), "package.json")));
        return Promise.resolve(config);
      } catch (err) {
        Utils.debug("Error procesando el package.json", err);
        return Promise.reject(err);
      }
    } else {
      return Promise.reject("Esto no parece un repositorio Git, no tiene package.json. No se puede usar el corrector automático.");
    }
}


Utils.checkFileExists = (filepath) => {
  Utils.debug("checkFileExists", filepath);
  return new Promise(async (resolve, reject) => {
    try {
      await access(filepath, fs.F_OK);
      resolve(true);
    } catch (err) {
      resolve(false);
    }
  });
}

Utils.createFolder = async (folderpath) => {
  if(!await Utils.checkFileExists(path.resolve(process.cwd(), folderpath))) {
    Utils.debug("Data folder does not exist, let's create it");
    await mkdir(folderpath);
  }
}

Utils.delay = async (ms) => {
  return new Promise(res => setTimeout(res, ms));
}

Utils.getEmailAndToken = async (user_file_path) => {
  Utils.debug("getEmailAndToken", user_file_path);
  let user_info = {};
  if(await Utils.checkFileExists(path.resolve(process.cwd(), user_file_path))) {
      user_info = JSON.parse(await readFile(path.resolve(process.cwd(), user_file_path)));

      if(user_info.email.endsWith("upm.es")){
        return Promise.resolve(user_info);
      } else {
        return Promise.reject("FILE WITH INFO USER DOES NOT CONTAIN A VALID EMAIL. It should end with upm.es");
      }
  } else {
    var rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    return new Promise(function(resolve, reject) {
      console.log(info('A continuación se pedirán sus datos (email y token) para cuando se suban los resultados finales a Moodle'));
      rl.question(info('Escriba su email de alumno UPM por favor: '), function(answer) {
        user_info.email = answer;
        rl.question(info('Escriba su token de Moodle UPM por favor: '), (answer2) => {
          user_info.token = answer2;
          if(user_info.email.endsWith("upm.es")){
            rl.question(ask('¿Desea almacenar estos datos en el fichero user.json para evitar tener que introducirlos de nuevo en el futuro? (y/N): '), async function (answer) {
              if(answer==="y" || answer ==="yes"){
                try {
                  fs.writeFileSync(path.resolve(process.cwd(), user_file_path), JSON.stringify(user_info, null, 4));
                  //EXTRANGE. La siguiente linea asincrona funciona, crea el fichero user.json con su contenido pero las promesas más simples
                  //dejan de funcionar, new Promise... se queda tostado y no responde. CUIDADO
                  //fs.writeFile(path.resolve(process.cwd(), user_file_path), JSON.stringify(user_info, null, 4));
                  Utils.debug("Fichero user.json creado");
                } catch(err){
                  console.log(error(err));
                  reject("NO SE HA PODIDO CREAR EL FICHERO");
                }
                rl.close();
                //await Utils.delay(5000);
                resolve(user_info);
              } else {
                rl.close();
                resolve(user_info);
              }
            });
          } else {
            rl.close();
            reject("LA INFORMACIÓN DE USUARIO NO CONTIENE UN EMAIL VALIDO. Debería acabar por upm.es");
          }
        });
      });
    });
  }
};


Utils.getHashMultipleFiles = async (file_paths_array) => {
  Utils.debug("getHashMultipleFiles",file_paths_array);
  //first we get the files as a string
  let files_content = "";
  for (var i = 0; i < file_paths_array.length; i++) {
    files_content += await readFile(path.resolve(process.cwd(), file_paths_array[i]), "utf8");
  }
  files_content = files_content.replace(/\r\n/g, "\n");

  let md5hash = crypto.createHash('md5').update(files_content).digest("hex");
  return md5hash;
}

Utils.getHashMultipleStrings = (string_array) => {
    let files_content = "";

    for (let i = 0; i < string_array.length; i++) {
        files_content += string_array[i];
    }

    const md5hash = crypto.createHash("md5").update(files_content).
        digest("hex");

    return md5hash;
};


Utils.getSignature = (user_info) => {
  Utils.debug("getSignature");
  //return objectHash.MD5(user_info);
  //let hash = crypto.createHash('md5');
  //hash.setEncoding('hex');
  //let md5 = hash.update(JSON.stringify(user_info)).digest("hex");
  //return md5;
  let pepper = "new JSON({user_info})";
  let hash = crypto.createHmac('sha512', pepper);
  let hashed_code = hash.update(JSON.stringify(user_info)).digest('hex');
  return hashed_code;
}


Utils.askForDataCorrect = (user_info)=>{
  Utils.debug("askForDataCorrect", user_info);
  var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  return new Promise(function(resolve, reject) {
    console.log(info(`Los datos con los que se va a firmar la práctica son, email: ${user_info.email}, token: ${user_info.token}`));

    rl.question(ask('¿Son correctos? (y/N): '), function(answer) {
      if(answer!=="y" && answer !=="yes"){
        resolve(false, reject);
      } else {
        resolve(true, reject);
      }
      rl.close();
      return;
    });
  });
}

Utils.askForConsent = (user_info)=>{
  Utils.debug("askForConsent", user_info);
  var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  return new Promise(function(resolve, reject) {
      console.log(info(`El contenido de la práctica, así como los test que se le pasan van a ser firmados.`));
      console.log(info(`Es importante que sepa que se van a enviar al servidor y en él se validará la firma y la autenticidad, así como se pasará un anticopia.`));
      rl.question(ask('¿Confirma que ha realizado usted mismo la práctica y desea enviarla al servidor para registrar la nota? (y/N):'), (answer2) => {
        if(answer2!=="y" && answer2 !=="yes"){
          resolve(false, reject);
        } else {
          resolve(true, reject);
        }
        rl.close();
      });
  });
}


Utils.compress = async (outputFilename) => {
  Utils.debug("compress",outputFilename);
  const archive = archiver('zip', { zlib: { level: 9 }});
  const output = fs.createWriteStream(path.resolve(process.cwd(), outputFilename));
  return new Promise((resolve, reject) => {
     archive.glob('*', {"ignore": ['node_modules', 'tests', 'bin', 'README.md', 'LICENSE', '*.zip']});
     archive.glob('data/res.enc');
     archive.on('error', err => reject(err))
     archive.pipe(output);

     output.on('close', () => {
       resolve();
     });
     archive.finalize();
   });
}


/*fullrepo is the repo with owner, for example "ebarra/autoCOREctor_client" */
/*jsonPath is the path to the json file inside the repository */
Utils.checkTestVersion = async (fullrepo, jsonPath) => {
  Utils.debug("checkTestVersion",fullrepo, jsonPath);
  const octokit = new Octokit();
  let owner, repo;
  [owner, repo] = fullrepo.split("/");
  return octokit.repos.getContents({
    owner: owner,
    repo: repo,
    path: jsonPath
  }).then(result => {
      // content will be base64 encoded
      const content = Buffer.from(result.data.content, 'base64').toString()
      let config = JSON.parse(content);
      return config.version;
    }).catch(err=>{
      Utils.debug(err);
      return "*";
    })
}

Utils.getGitHubFile = (fullrepo, filePath) => new Promise((resolve, reject) => {
    const octokit = new Octokit();
    let owner, repo;
    [owner, repo] = fullrepo.split("/");

    if(filePath.startsWith("./")){
      filePath = filePath.substring(2); //remove the "./"
    }

    octokit.repos.getContents({
        owner,
        repo,
        "path": filePath
    }).then((result) => {
        // content will be base64 encoded
        const content = Buffer.from(result.data.content, "base64").toString();
        resolve(content);
    }).
        catch((err) => {
            reject(err);
        });
});


Utils.encryptBufferWithRsaPublicKey = async (toEncrypt, pathToPublicKey) => {
    Utils.debug("encryptBufferWithRsaPublicKey");
    var publicKey = await readFile(path.resolve(process.cwd(), pathToPublicKey), "utf8");
    var buffer = Buffer.from(toEncrypt);
    var encrypted = crypto.publicEncrypt({key: publicKey, padding: crypto.constants.RSA_NO_PADDING}, buffer);
    return encrypted.toString("base64");
};


//created following https://medium.com/@anned20/encrypting-files-with-nodejs-a54a0736a50a
//method encryptAES
Utils.en = (toEncrypt, key) => {
    Utils.debug("en");
    // Create an initialization vector
    const algorithm = 'aes-256-ctr';
    let newkey = crypto.createHash('sha256').update(key).digest('base64').substr(0, 32);
    const iv = crypto.randomBytes(16);
    // Create a new cipher using the algorithm, key, and iv
    const cipher = crypto.createCipheriv(algorithm, newkey, iv);
    // Create the new (encrypted) buffer
    let buffer = Buffer.from(toEncrypt);
    const result = Buffer.concat([iv, cipher.update(buffer), cipher.final()]);
    return result.toString('hex');
};

/*Method to decrypt a message*/
Utils.de = (encrypted, key) => {
  Utils.debug("de");
  let encdata = Buffer.from(encrypted, 'hex');
   // Get the iv: the first 16 bytes
   const iv = encdata.slice(0, 16);
   // Get the rest
   encdata = encdata.slice(16);
   // Create a decipher
   let newkey = crypto.createHash('sha256').update(key).digest('base64').substr(0, 32);

   const decipher = crypto.createDecipheriv('aes-256-ctr', newkey, iv);
   // Actually decrypt it
   const result = Buffer.concat([decipher.update(encdata), decipher.final()]);
   return result.toString();
};


Utils.sendFile = async (url, file, history_file) => {
  Utils.debug("sendFile", url, file);
  console.log("Enviando práctica al servidor...");

  const data = {
      "submission": {
          "file": path.resolve(process.cwd(), file),
          "filename": "submission.zip",
          "content_type": "application/zip"
      }
  };
  try {

    const response = await needle("post",
      url,
      data,
      {"multipart": true, "accept": "application/json"});

    if (response.statusCode === 200) {
      console.log(info(response.body || "Ok"));
      await Utils.cleanHistoryRecords(history_file);
    } else {
      console.log(error("ERROR"));

      console.error(response.body || "Error");
    }
  } catch(err) {
      console.error(err || "Error");
  }

};


Utils.execTests = (assignment_path) => {
  Utils.debug("execTests", assignment_path);
  return new Promise((resolve, reject) => {
    //Define globalshould
    global.should = require('chai').should();
    global.exec = util.promisify(require('child_process').exec);
    global.Browser = require('zombie');
    let fullScore = {score: 0, score_total: 0};
    Utils.debug("Call new Mocha");
    new Mocha({
      timeout: 60 * 1000,
      reporter: function () { }
    })
    .addFile(path.resolve(process.cwd(), assignment_path))
    .run()
    .on('suite', function(suite) {
      console.log(suiteTitle(suite.title) + "\n");
    })
    .on('test', function(test) {
      console.log(testTitle(`Test: ${test.title}`));
    })
    .on('pass', function (test) {
      fullScore.score += test.ctx.score;
      fullScore.score_total += test.ctx.score;
      console.log("\t" + highlight(`Puntuación: `) +`${test.ctx.score}/${test.ctx.score}\n\t`+ highlight(`Observaciones: `) + `${test.ctx.msg_ok}` + "\n");
    })
    .on('fail', function (test, err) {
      if ((test.title.indexOf('"after all" hook')<0) && (test.title.indexOf('"before all" hook')<0)) {
        fullScore.score_total += test.ctx.score;
        console.log("\t" +error(`Puntuación: `) +`0/${test.ctx.score}\n\t`+ error(`Observaciones:`) + `${test.ctx.msg_err}` + "\n");
      } else {
        console.error(error("Error Mocha: ") + err);
      }
    })
    .on('end', function () {
      resolve(fullScore);
    });
  });
}

Utils.initHistory = async () => {
  Utils.debug("initHistory");
  let history = [];
  let first_history_entry = {};
  const stats = await stat("package.json");
  first_history_entry.started = true;
  first_history_entry.datetime = stats.mtime;
  history.push(first_history_entry);
  return history;
}

Utils.saveHistoryRecord = async (fullScore, version, history_file) => {
  Utils.debug("saveHistoryRecord", fullScore, version);
  let history;
  if(!await Utils.checkFileExists(path.resolve(process.cwd(), history_file))) {
    history = await Utils.initHistory();
  } else {
    try {
      let history_enc_content = await readFile(path.resolve(process.cwd(), history_file), "utf8");
      let history_content = Utils.de(history_enc_content, "pubkey.pem");
      history = JSON.parse(history_content);
    } catch(err){
      console.log("ERROR Recuperable: ", error(err));
      Utils.debug(err);
      history = await Utils.initHistory();
    }
  }
  let new_history_entry = {started: false, datetime: new Date(), score: fullScore.score, score_total: fullScore.score_total, version: version};
  history.push(new_history_entry);
  let history_data_enc = Utils.en(JSON.stringify(history, null, 4), 'pubkey.pem');

  return writeFile(path.resolve(process.cwd(), history_file), history_data_enc, 'utf8').then((res)=>{
    return Promise.resolve(history);
  }).catch((err)=>{
    console.log(error(err));
    return Promise.reject(err);
  });
};


Utils.cleanHistoryRecords = async (history_file) => {
  Utils.debug("cleanHistoryRecords");
  if(await Utils.checkFileExists(path.resolve(process.cwd(), history_file))) {
    let history_enc_content = await readFile(path.resolve(process.cwd(), history_file), "utf8");
    let history_content = Utils.de(history_enc_content, "pubkey.pem");
    let old_history = JSON.parse(history_content);
    let new_history = [old_history[0]];
    let history_data_enc = Utils.en(JSON.stringify(new_history, null, 4), 'pubkey.pem');
    return writeFile(path.resolve(process.cwd(), history_file), history_data_enc, 'utf8');
  }
};

module.exports = Utils;
