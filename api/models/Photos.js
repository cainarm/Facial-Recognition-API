/**
 * Photos.js
 *
 * @description :: The Photos table
 * @docs        :: http://sailsjs.org/#!documentation/models
 */

module.exports = {
  tableName: 'photos',
  autoCreatedAt: false,
  autoUpdatedAt: false,
  attributes: {
    id_photo: {
      type: 'integer',
      autoIncrement: true,
      primaryKey: true,
      size: 11
    },
    name: {
      type: 'string',
      required: false,
      defaultsTo: null
    },
    path: {
      type: 'string',
      required: false,
      defaultsTo: null
    },
    person_id: {
      type: 'integer',
      required: true,
      index: true,
      size: 11,
      model: 'persons'
    }
  }
};