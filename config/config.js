module.exports = function(RED) {
    "use strict";
    
    function ConfigNode(n) {
      RED.nodes.createNode(this,n);
      this.username = n.username;
      this.user_agent = n.user_agent;
      this.auth_type = n.auth_type;
      this.name = n.name;
  }
  RED.nodes.registerType("reddit-credentials",ConfigNode,{
    credentials: {
      password: {type: "password"},
      client_id: {type: "password"},
      client_secret: {type: "password"},
      refresh_token: {type: "password"},
      access_token: {type: "password"}
    }
  });
}
 