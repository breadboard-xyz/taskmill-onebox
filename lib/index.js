"use strict";

var relay         = require('taskmill-core-relay')
  , codedb        = require('taskmill-core-codedb')
  , logs          = require('taskmill-core-logs')
  , agent         = require('taskmill-core-agent')
  //
  , winston       = require('winston')
  , config        = require('config-url')
  ;

function boot() {
  let relay_opts = {
      web_socket        : undefined
    , public_group_id   : config.get('agent.group-id')
    , port              : config.getUrlObject('relay').port
  };

  return Promise
          .all([ codedb.main(), logs.main(), agent.main(), relay.main(relay_opts) ])
          .then(() => {
            winston.info('all started');
          });
}

module.exports = {
  boot : boot
};