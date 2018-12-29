module.exports = function(RED) {
    "use strict";

    const snoowrap = require('snoowrap');

    function CreateNodeRedditNode(n) {
        RED.nodes.createNode(this,n);
        this.username = n.username;
        this.user_agent = n.user_agent;

    }
    RED.nodes.registerType("reddit-credentials",CreateNodeRedditNode,{
      credentials: {
        password: {type: "password"},
        client_id: {type: "password"},
        client_secret: {type: "password"}
      }
    });

    function CommentsNode(n) {
        RED.nodes.createNode(this,n);
        var config = RED.nodes.getNode(n.reddit);
        var credentials = config.credentials;
        var node = this;
        var options = {
            userAgent: config.user_agent,
            clientId: credentials.client_id,
            clientSecret: credentials.client_secret,
            username: config.username, 
            password: credentials.password
          }
        const r = new snoowrap(options);
        node.status({});
        node.on('input', function(msg) {
            node.status({fill:"blue",shape:"dot",text:"loading"});
            r.getUser(msg.payload).getOverview().then(function (response) {
                var arr = []
                for (var i = 0; i < response.length; i++) {
                    arr.push({payload: response[i].body})
                }
                node.status({});
                node.send([arr]);
            })
            .catch(function(err) {
                console.log("ERROR from getUser: ", err)
            })
            
        });
    }
    RED.nodes.registerType("node-reddit",CommentsNode);
}
