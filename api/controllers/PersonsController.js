/**
 * PersonsController.js
 *
 * @description :: Server-side logic for managing subscriptions
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

const Promise = require('bluebird');

module.exports = {
    index: async (req, res) => {
        let userId = req.options.decoded.id;
        
        try{
            let response = await Persons.find({user_id: userId}).populate('group_id');  
            res.send(response);  
        }catch(err){
            return res.send(500, err);
        }
    },
    create: async (req, res) => {
        let person = req.allParams();
        let userId = req.options.decoded.id;
        let photos = [];
        
        person.user_id = userId;

        try{
           let pathModule = require('path');
           let insertedPerson =  await Persons.create(person);
           return res.send(insertedPerson);

        }catch(err){
            console.log(err);
            return res.send(500, err);
        }
    },
    createPhoto: async (req, res) => {
        req.setTimeout(0);

        var photos = [];
        let userId = req.options.decoded.id;
        let personId = req.param('id');
        let dirname =  require('path').resolve(sails.config.appPath, `assets/images/inner/persons/${userId}/${personId}`);        
        
        try{
            let uploadedImagesInDatabase = await Photos.count({person_id: personId});            

            let uploadedPictures = await UploadService.upload(req, {name: "photos", dirname: dirname});

            if(uploadedPictures.length > 0){
                if(uploadedImagesInDatabase + uploadedPictures.length < 3)
                    return res.send({msg: "need at least 3 images"});

                for(let element of uploadedPictures){
                    let images = await TrainerService.cropFace(require('path').resolve(sails.config.appPath,`assets/images/inner/persons/${userId}/${personId}/${element.filename}`), dirname, element.filename);
                    if(images){
                        if(images.length > 0){
                            for(let x = 0; x < images.length; x++){
                                photos.push({
                                    name: `croppedface-${x}-${element.filename}`,
                                    path: `images/inner/persons/${userId}/${personId}/croppedface-${x}-${element.filename}`,
                                    person_id: personId
                                }); 
                            }
                        }

                    }
                }
                await Photos.create(photos);     
                TrainerService.retrainAllSet(userId);         
                //await TrainerService.trainNewPictures(dirname, personId, userId);

                res.send({msg: "all ok"});
            }else{
                res.send({msg: "pictures not received"});
            }
        }catch(err){
            return res.send(500, err);
        }
    },
    
    update: async(req, res)=> {
        let person = req.allParams();
        let id = req.param('id');
        delete person.id;

        if(person.group_id === 'null'){
            person.group_id = null;
        }

        
        person.user_id = req.options.decoded.id;


        try{
            let update = await Persons.update({id_person: id}, person);
            res.send(update);
        }catch(err){
            return res.send(500, err);
        }
    },

    destroy: async(req, res)=> {
        let id = req.param('id');
        let userId = req.options.decoded.id;

        let path = require('path').resolve(sails.config.appPath, `assets/images/inner/persons/${userId}/${id}`);
        var rimraf = require('rimraf');

        try{
            await Photos.destroy({person_id: id});
            let deletedRecords = await Persons.destroy({id_person: id});

            rimraf(path, () => {});

            res.send(deletedRecords);
            TrainerService.retrainAllSet(userId);
        }catch(err){
            return res.send(500, err);
        }
    },

    deletePhoto: async (req, res) => {
        let photoId = req.param('id');
        let userId = req.options.decoded.id;
        const fs = require('fs');

        try{
            let photo = await Photos.findOne({id_photo: photoId});

            if(!photo){
                return res.send(400, {msg: "photo not found"});
            }
            let deletedPhoto = await Photos.destroy({id_photo: photoId});
            res.send(deletedPhoto);
            fs.unlinkSync(require('path').resolve(sails.config.appPath, "assets/" + photo.path));
            TrainerService.retrainAllSet(userId);
        }catch(err){
            return res.send(500, err);
        }
        
    },
    recognize: async (req, res) => {
        const userId = req.options.decoded.id;
        let result = [];
        let frame = req.param('frame');
        let imageForRead;
        
        try{
            let buffer = new Buffer(frame.split(",")[1], 'base64');
            let result = await TrainerService.predict(userId, buffer);
            if(result){
                for(let x = 0; x < result.length; x++){ 
                    if(result[x].result){
                        let confidence = result[x].result.confidence;
                        result[x].result = await Persons.findOne({id_person: result[x].result.id});
                        result[x].result.confidence = confidence;
                    }
                }
            }

            res.send(result);
            
            if(result && result.length > 0){
                let alertGroups = await Groups.find({alert: 1});
                
                result.forEach(element => {
                    if(element.result && element.result.group_id){
                        let filtered = alertGroups.filter(group => group.id_group === element.result.group_id);
                        if(filtered.length > 0 && element.result.confidence > 50){
                            sails.sockets.blast("alert", {id: element.result.id_person, name: element.result.name, group: filtered[0]});
                        }
                    }
                });
            }

        }catch(err){
            console.log(err);
            return res.send(500, err);
        }       
    },
    setGroup: async (req, res) => {
        let personId = req.param('personId');
        let groupId = req.param('groupId');

        try {
            await Person.update({id_person: personId}, {group_id: groupId});
            res.send({msg: "Record updated succesfully"});
        }catch(err){
            return res.send(500, err);
        }
    },
    unsetGroup: async (req, res) => {
        let personId = req.param('personId');
        let groupId = req.param('groupId');

        try {
            await Person.update({id_person: personId}, {group_id: null});
            res.send({msg: "Record updated succesfully"});
        }catch(err){
            return res.send(500, err);
        }
    },
};