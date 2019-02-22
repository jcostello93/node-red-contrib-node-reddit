
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

// create node

  function Create(n) {
    RED.nodes.createNode(this, n);
  
    let node = this;
    let options = parseCredentials(n);
   
    const r = new snoowrap(options);
    
    node.status({});
    
    node.on('input', msg => {

      node.status({fill: "blue", shape: "dot", text: "submitting"});
      // parse user input
      let submissionType = n.submissionType;
      let subreddit = parseField(msg, n.subreddit);
      let title = parseField(msg, n.title);
      let url = parseField(msg, n.url);
      let text = parseField(msg, n.text);
      let original = parseField(msg, n.original);
      let to = parseField(msg, n.to);
      let recipient = parseField(msg, n.recipient);
      let subject = parseField(msg, n.subject);
      let message = parseField(msg, n.message);

      // show the correct status message
      let statusMessage;

      if (submissionType === "pm") {
        statusMessage = "sending";
      } else {
        statusMessage = "submitting";
      }

      node.status({fill: "blue", shape: "dot", text: statusMessage});

      // prepare submission
      let snooCall;

      if (submissionType === "self") {
        snooCall = r.submitSelfpost({
          subredditName: subreddit,
          title: title,
          text: text
        });
      } else if (submissionType === "link") {
        snooCall = r.submitLink({
          subredditName: subreddit,
          title: title,
          url: url
        });
      } else if (submissionType === "cross") {
        snooCall = r.submitCrosspost({
          title: title,
          originalPost: original,
          subredditName: subreddit
        });
      } else if (submissionType === "pm") {
        snooCall = r.composeMessage({
          to: recipient,
          subject: subject,
          text: message
        });
      }

      // submit
      snooCall.then(response => {
        let responseMessage;
        if (response.name !== undefined) {
          responseMessage = response.name;
          msg.payload = response;
        } else {
          responseMessage = "PM sent";
          msg.payload = {
            recipient: recipient,
            subject: subject,
            message: message
          }
        }
        node.status({fill: "green", shape: "dot", text: "success: " + responseMessage});
        node.send(msg);
      }).catch(err => {
        node.error(err);
        node.status({fill: "red", shape: "dot", text: "error"});
      });
    });       
  }
  RED.nodes.registerType("create", Create);
}
