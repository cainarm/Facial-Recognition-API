/**
 * Persons.js
 *
 * @description :: The Persons table
 * @docs        :: http://sailsjs.org/#!documentation/models
 */

module.exports = {
  tableName: 'persons',
  autoCreatedAt: false,
  autoUpdatedAt: false,
  attributes: {
    id_person: {
      type: 'integer',
      autoIncrement: true,
      primaryKey: true,
      size: 11
    },
    name: {
      type: 'string',
      required: false,
      size: 300,
      defaultsTo: null
    },
    user_id: {
      type: 'integer',
      required: true,
      index: true,
      size: 11,
      model: 'users'
    },
    group_id: {
      required: false,
      model: 'groups'
    },
    photos: {
      collection: 'photos',
      via: 'person_id'
    },
  }
};