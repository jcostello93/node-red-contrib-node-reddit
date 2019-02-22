
module.exports = function(RED) {
    "use strict";

    var mustache = require("mustache");

     function copyPropertiesExceptMethods(newArr, originalArr, msg) {
        for (var i = 0; i < originalArr.length; i++){
            var clonedMsg = RED.util.cloneMessage(msg);
            clonedMsg.payload = JSON.parse(JSON.stringify(originalArr[i]));
            newArr.push(clonedMsg);
        }
    }

    // Check for mustache syntax
    function parseField(msg, nodeProp) {
        var field = null;
        var isTemplatedField = (nodeProp||"").indexOf("{{") != -1
        if (isTemplatedField) {
            field = mustache.render(nodeProp,msg);
        }
        else {
            field = nodeProp;
        }

        return field;
    }

  // setup the credentials for each node
  // ex:  var node = this;
  //      var options = parseCredentials(n);
  const parseCredentials = (n) => {
    let config = RED.nodes.getNode(n.reddit);
    let credentials = config.credentials;
    let options = {
      userAgent: config.user_agent,
      clientId: credentials.client_id,
      clientSecret: credentials.client_secret
    };

    if (config.auth_type == "username_password") {
      options.username = config.username;
      options.password = credentials.password;
    } else if (config.auth_type == "refresh_token") {
      options.refreshToken = credentials.refresh_token;
    } else if (config.auth_type == "access_token") {
      options.accessToken = credentials.access_token;
    }

    return options;
  }

    const snoowrap = require('snoowrap');
    const snoostorm= require('snoostorm');

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

// stream node

  function Stream(n) {
    RED.nodes.createNode(this, n);
    
    let node = this;
    let options = parseCredentials(n);
   
    const r = new snoowrap(options);
    const s = new snoostorm(r);

    node.status({});

    let stream;
    
    node.on('input', () => {
      // begin displaying the stream counter
      let count = 0;
      node.status({fill: "blue", shape: "dot", text: n.kind + ": " + count}); 

      // stream and update the stream counter
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
      } else if (n.kind === "inbox") {
        stream = s.InboxStream({
          polltime: 20000
        });
        stream.on("PrivateMessage", (pm) => {
          r.markMessagesAsRead([pm]);
          node.send({payload: pm});
          count++;
          node.status({fill: "blue", shape: "dot", text: n.kind + ": " + count});
        });
      }

      // stop streaming after optional user-provided timeout
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

    // stop streaming if node deleted from flow
    node.on("close", () => {
      stream.emit("stop");
    });

    // don't start streaming until we get user input
    if (n.kind == "inbox" || (n.kind != "" && n.subreddit != "")) {
      node.emit("input", {});
    }
  }
  RED.nodes.registerType("stream", Stream);
}
