const cv = require('opencv');
const fs = require('fs');

let TrainerService = {
    trainNewPictures: (dir, id, user, photos) => {
        let trainingFile = require('path').resolve(sails.config.appPath, `assets/training/${user}/trained.xml`);
        let trainingDir = require('path').resolve(sails.config.appPath, `assets/training/${user}`);
        let samples = [];

        return new Promise((resolve, reject) => {
            try{
                let f = fs.readdirSync(dir);
                
                const fr = new cv.FaceRecognizer();

                if (fs.existsSync(trainingFile)) {
                    fr.loadSync(trainingFile);
                }else if(!fs.existsSync(trainingDir)){
                    fs.mkdirSync(trainingDir);
                }
                
                f.forEach((fpath, index, array) => {
                    if(fpath.indexOf("croppedface-") !== -1){
                        cv.readImage(`${dir}/${fpath}`, function (err, im) {
                            im.convertGrayscale();
                            samples.push([parseInt(id), im]);
                        });
                    }
                });    

                if(samples.length > 0){
                    fr.trainSync(samples);
                    fr.saveSync(trainingFile);
                }

                resolve(samples);
            }catch(err){
                reject(err);
            }
        });
    },
    
    cropFace: (photo, pathToSave, filename) => {
      let face;
      let cropped;
      return new Promise((resolve, reject) => {
        cv.readImage(photo, (err, im) => {
            if(err) reject(err);
            im.detectObject(cv.FACE_CASCADE, {}, (error, faces) => {
                if(error) reject(error);
                if(faces.length > 0){
                    for(let  x = 0; x < faces.length ; x++){
                        face = faces[x];
                        let cropped = im.crop(face.x, face.y, face.width, face.height);
                        cropped.save(`${pathToSave}/croppedface-${x}-${filename}`);
                    }
                    resolve(faces);
                }
                resolve(null);
            })
        });
      });
    },

    retrainAllSet: (userId) => {
        const fr = new cv.FaceRecognizer();

        let path = require('path').resolve(sails.config.appPath, `assets/images/inner/persons/${userId}`);
        let trainingFilePath = require('path').resolve(sails.config.appPath, `assets/training/${userId}/trained.xml`);
        let samples = [];
        return new Promise((resolve, reject) => {
            try{
                fs.readdir(path, (err, directories) => {
                    if(err) reject(err);
                    directories.forEach(dir => {
                        let id = dir; 
                        let files = fs.readdirSync(`${path}/${dir}`);
                        for(let picture of files){
                            if(picture.indexOf("croppedface-") !== -1){
                                cv.readImage(`${path}/${id}/${picture}`, (readError, im) => {
                                    if(readError) reject(readError);
                                    im.convertGrayscale();
                                    samples.push([parseInt(id), im]);
                                });
                            }
                        }
                    
                    });
                    if(samples.length > 0){
                        fr.trainSync(samples);
                        fr.saveSync(trainingFilePath);
                    }
                    resolve();
                });
            }catch(err){
                reject(err);
            }
        });

    },
    predict: (userId, photo) => {
        const FaceRecognizer = new cv.FaceRecognizer();
        let trainingFile =  require('path').resolve(sails.config.appPath, `assets/training/${userId}/trained.xml`);
        let data = [];

        return new Promise((resolve, reject) => {
            try{
                if (fs.existsSync(trainingFile)) {
                    FaceRecognizer.loadSync(trainingFile);
                }else{
                    resolve([]);
                    return;
                }

                cv.readImage(photo, function(err, im){
                    if(err) reject(err);
                    im.detectObject(cv.FACE_CASCADE, {}, function(error, faces) {
                        if(error) reject(error);
                        if(faces){
                            for (var i = 0; i < faces.length; i++) {
                                let face = faces[i];

                                let cropped = im.crop(face.x, face.y, face.width, face.height);
                                 cropped.convertGrayscale();

                                let result = FaceRecognizer.predictSync(cropped);
                                result.confidence = 100 - result.confidence;

                                if(result.confidence > 30)
                                    data.push({ coordinates:[face.x, face.y], sizes:[face.width, face.height], result: result });
                                else
                                    data.push({ coordinates:[face.x, face.y], sizes:[face.width, face.height]});
                            }
                            resolve(data);
                        }
                    });
                });
            }catch(err){
                reject(err);
            }
        });
    },
};

module.exports = TrainerService;