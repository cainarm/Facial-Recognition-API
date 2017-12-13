/**
 * Users.js
 *
 * @description :: The Users table
 * @docs        :: http://sailsjs.org/#!documentation/models
 */

module.exports = {
  tableName: 'users',
  autoCreatedAt: false,
  autoUpdatedAt: false,
  attributes: {
    id_user: {
      type: 'integer',
      autoIncrement: true,
      primaryKey: true,
      size: 11
    },
    name: {
      type: 'string',
      required: false,
      size: 45,
      defaultsTo: null
    },
    login: {
      type: 'string',
      required: false,
      size: 45,
      defaultsTo: null
    },
    password: {
      type: 'string',
      required: false,
      size: 45,
      defaultsTo: null
    },
    level: {
      type: 'string',
      required: true,
      defaultsTo: 0,
      size: 11
    },

    toJSON: function(){
      let user = this.toObject();
      delete user.password;
      return user;
    }
  },
};