module.exports = function(RED) {
    "use strict";

    var mustache = require("mustache");

    function copyPropertiesExceptMethods(newArr, originalArr) {
        for (var i = 0; i < originalArr.length; i++){
            var obj = JSON.stringify(originalArr[i]);
            obj = JSON.parse(obj);
            newArr.push({content_id: originalArr[i].id, payload: obj})
        }
    }

    // In order of priority: 1. HTML text OR mustache syntax, 2. msg.msgProp 
    function parseField(msg, nodeProp, msgProp) {
        var field = null;
        var isTemplatedField = (nodeProp||"").indexOf("{{") != -1
        if (isTemplatedField) {
            field = mustache.render(nodeProp,msg);
        }
        else {
            field = nodeProp || msg[msgProp];
        }

        return field;
    }

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

  function ReplyNode(n) {
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

            var content_type = n.content_type || msg.content_type;
            var content_id = parseField(msg, n.content_id, "content_id");
            var text = parseField(msg, n.text, "text");

            var snoowrap_obj;
            if (content_type == "submission") {
                snoowrap_obj = r.getSubmission(content_id);
            }
            else if (content_type == "comment") {
                snoowrap_obj = r.getComment(content_id);
            }
            else if (content_type == "pm") {
                snoowrap_obj = r.getMessage(content_id);
            }

            snoowrap_obj.reply(text).then(response => {
                msg.payload = response;
                node.status({})
                node.send(msg) 
            })              
            .catch(function(err) {
                node.error(err)
                node.status({fill:"red",shape:"dot",text:"error"});
            })
        });        
    }
    RED.nodes.registerType("reply",ReplyNode);
}
