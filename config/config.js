module.exports = function(RED) {
    "use strict";

    const snoowrap = require('snoowrap');

    function ConfigNode(n) {
        RED.nodes.createNode(this,n);
        this.username = n.username;
        this.user_agent = n.user_agent;
    }
    RED.nodes.registerType("reddit-credentials",ConfigNode,{
      credentials: {
        password: {type: "password"},
        client_id: {type: "password"},
        client_secret: {type: "password"}
      }
    });
}
 