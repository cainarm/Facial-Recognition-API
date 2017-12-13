/**
 * Groups.js
 *
 * @description :: The Groups table
 * @docs        :: http://sailsjs.org/#!documentation/models
 */

module.exports = {
  tableName: 'groups',
  autoCreatedAt: false,
  autoUpdatedAt: false,
  attributes: {
    id_group: {
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
    alert: {
      type: 'integer',
      required: false,
      size: 4,
      defaultsTo: '0'
    },
    user_id: {
      type: 'integer',
      required: true,
      index: true,
      size: 11,
      model: 'users'
    },
    toJSON: function(){
      return {
        id: this.id_group,
        name: this.name,
        alert : this.alert,
        user_id : this.user_id
      }
    }
  }
};