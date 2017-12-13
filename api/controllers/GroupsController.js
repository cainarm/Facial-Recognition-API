/**
 * GroupsController.js
 *
 * @description :: Server-side logic for managing subscriptions
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
    index: async (req, res) => {
        let userId = req.options.decoded.id;
        
        try{
            let response = await Groups.find({user_id: userId});  
            res.send(response);  
        }catch(err){
            return res.send(500, err);
        }
    },
    create: async (req, res) => {
        let group = req.allParams();
        group.user_id = req.options.decoded.id;

        try{
            let insertedGroup = await Groups.create(group);
            res.send(group);
        }catch(err){
            return res.send(500, err);
        }
    },
    getGroupPersons: async (req ,res) => {
        let id = req.param('id');

        try{
            let persons = await Persons.find({group_id: id});
            res.send(persons);
        }catch(err){
            return res.send(500, err);
        }
    },
};