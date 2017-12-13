/**
 * UsersController.js
 *
 * @description :: Server-side logic for managing subscriptions
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */
var md5 = require('blueimp-md5');

module.exports = {
    auth: async (req, res) => {
        var jwt = require('jsonwebtoken');
		
		var login = req.param('login');
		var password = req.param('password');

		var cert = "IATOKEN";

		try{
			
            let user = await Users.findOne({
				login: login,
				password: md5(password)			
			});
			
			if(!user) return res.send(403, {"message": "Username or password not found"});

			var token = jwt.sign({id: user.id_user, name: user.name, level: user.level}, cert);
			
			return res.json({jwt: token});

		}catch(err){
			
            return res.send(500, {error: err});
		
        }
    },
	changePassword: async (req, res) => {
		let userId = req.options.decoded.id;


		try{
			let user = await Users.update({id_user: userId}, {password: md5(req.param('password'))});
			res.send(user);
		}catch(err){
			return res.send(500, err);
		}
	},
	create: async (req ,res) => {
		let user = req.allParams();
		const fs = require('fs');
		

		user.password = md5(" ");

		
		try{
			let insertedUser = await Users.create(user);
			res.send(insertedUser);

			let trainingDir = require('path').resolve(sails.config.appPath, `assets/training/${insertedUser.id_user}`);

			fs.mkdirSync(trainingDir);
		}catch(err){
			return res.send(500, err);
		}
	}
};