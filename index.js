var uuid    = require('node-uuid')
  , express = require('express')
  , Relay   = require('taskmill-core-relay').Relay
  ;

const PORT=1337;

var app = express();

var relay = new Relay({
      web_socket        : undefined
    , public_group_id   : '3eb2685e-4fd3-4b1e-acfc-4a03fc76a7e0'
});

app.all('/execute', function(req, res){
  Relay.get().emit({
      id      : uuid.v4()
    , content : req.get('$code')
  }, req, res);
});

relay.listen({ port : 8124 }, function(){
  app.listen(PORT, function(){
    console.log("Server listening on: http://localhost:%s", PORT);
  });
});
