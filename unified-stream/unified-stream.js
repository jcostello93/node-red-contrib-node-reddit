
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
    const snoostorm = require('snoostorm');

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

// subreddit stream node

  function StreamSubreddit(n) {
    RED.nodes.createNode(this, n);
    
    let config = RED.nodes.getNode(n.reddit);
    let credentials = config.credentials;
    let node = this;
    let options = {
      userAgent: config.user_agent,
      clientId: credentials.client_id,
      clientSecret: credentials.client_secret,
      username: config.username,
      password: credentials.password
    };
    
    const r = new snoowrap(options);
    const s = new snoostorm(r);

    node.status({});

    node.on('input', () => {
      let stream;
      let count = 0;

      node.status({fill: "blue", shape: "dot", text: n.kind + ": " + count}); 

      if (n.kind === "submissions") {
        stream = s.SubmissionStream({
          subreddit: n.subreddit,
          results: 10
        });
        stream.on("submission", (post) => {
          node.send({payload: post});
          count++;
          node.status({fill: "blue", shape: "dot", text: n.kind + ": " + count});
        });        
      } else if (n.kind === "comments") {
        stream = s.CommentStream({
          subreddit: n.subreddit,
          results: 10
        });
        stream.on("comment", (comment) => {
          node.send({payload: comment});
          count++;
          node.status({fill: "blue", shape: "dot", text: n.kind + ": " + count});
        });
      }

      if (n.timeout != "") {
        let timeout = parseInt(n.timeout, 10);
        if ( !isNaN(timeout) ) {
          setTimeout( () => { 
            stream.emit("stop");
            node.status({fill: "green", shape: "dot", text: "complete: " + count + " " + n.kind});
          }, timeout * 1000);
        }
      }
    });

    if (n.kind != "" && n.subreddit != "") {
      node.emit("input", {});
    }
  }
  RED.nodes.registerType("stream", StreamSubreddit);
}
