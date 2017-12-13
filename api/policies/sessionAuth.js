/**
 * sessionAuth
 *
 * @module      :: Policy
 * @description :: Simple policy to allow any authenticated user
 *                 Assumes that your login action in one of your controllers sets `req.session.authenticated = true;`
 * @docs        :: http://sailsjs.org/#!/documentation/concepts/Policies
 *
 */


module.exports = function(req, res, next) {
	var jwt = require('jsonwebtoken');

	var cert = "IATOKEN";
	var token = req.header('jwt');
  
    jwt.verify(token, cert, function(err, decoded) {
		req.options.decoded = decoded;

    	if(err) return res.forbidden('Invalid Token ! Are you trying to hack us ?');
		
		return next();
  	});
};
