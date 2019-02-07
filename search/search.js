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
    
    function SearchNode(n) {
        RED.nodes.createNode(this,n);
        var config = RED.nodes.getNode(n.reddit);
        var credentials = config.credentials;
        var node = this;
        var options = {
            userAgent: config.user_agent,
            clientId: credentials.client_id,
            clientSecret: credentials.client_secret
        }

        if (config.auth_type == "username_password") {
            options.username = config.username;
            options.password = credentials.password;
        }
        else if (config.auth_type == "refresh_token") {
            options.refreshToken = credentials.refresh_token;
        }
        else if (config.auth_type == "access_token") {
            options.accessToken = credentials.access_token;
        }
        const r = new snoowrap(options);
        node.status({});
        node.on('input', function(msg) {
            node.status({fill:"blue",shape:"dot",text:"loading"});

            var subreddit = parseField(msg, n.subreddit, "subreddit");
            var query = parseField(msg, n.query, "query");
            var sort = parseField(msg, n.sort, "sort");
            var time = parseField(msg, n.time, "time");
            var syntax = parseField(msg, n.syntax, "syntax");
            var responseArr = []

            r.getSubreddit(subreddit).search({query: query, sort: sort, time: time, syntax: syntax}).then(response => {
                copyPropertiesExceptMethods(responseArr, response)
                node.status({})
                node.send([responseArr]) 
            })              
            .catch(function(err) {
                node.error(err)
                node.status({fill:"red",shape:"dot",text:"error"});
            })
        });       
    }
    RED.nodes.registerType("search",SearchNode);  
}
