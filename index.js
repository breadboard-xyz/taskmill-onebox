"use strict";

var Promise       = require('bluebird')
  , express       = require('express')
  , winston       = require('winston')
  , _             = require('lodash')
  , config        = require('config-url')
  , relay         = require('taskmill-core-relay')
  , router        = require('taskmill-core-router')
  , lib           = require('./lib')
  // todo [akamel] make this router somewhere else
  , codedb_sdk    = require('taskmill-core-codedb-sdk')
  //
  , colors        = require('colors')
  ;

var app = express();

app.set('view engine', 'jade');

app.get(/ls\/(.*\.git)/, (req, res) => {
  let remote    = 'https://' + req.params[0]
    , branch    = 'master'
    , token     = req.get('FOOBAR-TOKEN')
    ;

  codedb_sdk
    .ls(remote, { branch : branch, token : token })
    .then((result) => {
      res.send(result);
    });
});

app.post(/pull\/(.*\.git)/, (req, res) => {
  let remote    = 'https://' + req.params[0]
    , branch    = 'master'
    , token     = req.get('FOOBAR-TOKEN')
    ;

  codedb_sdk
    .pull(remote, { branch : branch, token : token })
    .then((result) => {
      res.send(result);
    });
});

app.all('/run', (req, res) => {
  let content = (new Buffer(req.get('blob'), 'base64')).toString('utf8');

  let data = { 
    content : content
  };

  relay.instance().emit(data, req, res);
});

app.all('/', (req, res) => {
  res.render('index');
});

app.all('*', (req, res, next) => {
  var route = router.parseUniformScheme(req.path, { allow_action : true });

  if (route && route.action === 'run') {
    var data = _.extend({
      codedb_url  : config.getUrl('codedb')
    }, route);

    relay.instance().emit(data, req, res);
  } else {
    next();
  }
});

function main() {
  return lib
          .boot()
          .then(() => {
            // note: this needs to be a function and not lambda
            app.listen(config.get('www.port'), function() {
              let port = this.address().port;

              console.log(require('fs').readFileSync('banner.txt').toString().green);
              console.log(
`
============================================
      visit http://localhost:${port}
============================================
`.green.bold)
              winston.info("taskmill-onbox [started] :http://localhost:%d", port);
            });
          })
          .catch((err) => {
            winston.error('boot', err);
          });
}

main();