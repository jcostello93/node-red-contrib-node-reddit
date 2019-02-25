
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

    function parseError(err) {
        var errorMsg;
        if (err.error && err.error.error && err.error.message) {
            errorMsg = err.error.error + " " + err.error.message;
        } else {
            errorMsg = "403 Forbidden";
        }
        
        return errorMsg;
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
    const snoostorm= require('snoostorm-es6');

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

    try {
      node.on('input', () => {
        // begin displaying the stream counter
        let count = 0;
        node.status({fill: "blue", shape: "dot", text: n.kind + ": " + count}); 

        // stream and update the stream counter
        if (n.kind === "submissions") {
          stream = s.Stream("submission", {
            subreddit: n.subreddit,
            results: 10
          });
        } else if (n.kind === "comments") {
          stream = s.Stream("comment", {
            subreddit: n.subreddit,
            results: 10,
          });
        } else if (n.kind === "PMs") {
          stream = s.Stream("inbox", {
            pollTime: 10000,
            filter: n.filter
          });
        }

        // notify the user when item arrives
        stream.on("item", (item) => {
          node.send({payload: item});
          count++;
          node.status({fill: "blue", shape: "dot", text: n.kind + ": " + count});

          // for PMs only
          if (n.kind === "PMs" && n.markedAsRead) {
            item.markAsRead();
          }
        });

        // notify the user when the stream ends
        stream.on("end", () => {
          node.status({fill: "green", shape: "dot", text: "complete: " + count + " " + n.kind});
        });

        // stop streaming after optional user-provided timeout
        if (n.timeout !== "") {
          let timeout = parseInt(n.timeout, 10);
          if ( !isNaN(timeout) ) {
            setTimeout( () => { 
              stream.emit("end");
            }, timeout * 1000);
          }
        }
      });

      // stop streaming if node deleted from flow
      node.on("close", () => {
        stream.emit("end");
      });

      // don't start streaming until we get user input
      if (n.kind == "inbox" || (n.kind != "" && n.subreddit != "")) {
        node.emit("input", {});
      }
    } catch(err) {
      node.error(err);
      node.status({fill: "red", shape: "dot", text: "error"});
    }
  }
  RED.nodes.registerType("stream", Stream);
}
