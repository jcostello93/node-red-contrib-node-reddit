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

// create submission

  function CreateSubmission(n) {
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
    
    node.status({});
    
    node.on('input', msg => {
      node.status({fill: "blue", shape: "dot", text: "submitting"});

      let submissionType = n.submissionType;
      let subreddit = parseField(msg.payload, n.subreddit, "subreddit");
      let title = parseField(msg.payload, n.title, "title");
      let url = parseField(msg.payload, n.url, "url");
      let text = parseField(msg.payload, n.text, "text");
      let original = parseField(msg.payload, n.original, "original");

      if (submissionType === "self") {
        r.submitSelfpost({
          subredditName: subreddit,
          title: title,
          text: text
        }).then(response => {
          node.status({});
          console.log(response);
          node.send({payload: response});
        }).catch(err => {
          node.error(err);
          node.status({fill: "red", shape: "dot", text: "error"});
        });
      } else if (submissionType === "link") {
        r.submitLink({
          subredditName: subreddit,
          title: title,
          url: url
        }).then(response => {
          node.status({});
          console.log(response);
          node.send({payload: response});
        }).catch(err => {
          node.error(err);
          node.status({fill: "red", shape: "dot", text: "error"});
        });
      } else if (submissionType === "cross") {
        r.submitCrosspost({
          title: title,
          originalPost: original,
          subredditName: subreddit
        }).then(response => {
          node.status({});
          console.log(response);
          node.send({payload: response});
        }).catch(err => {
          node.error(err);
          node.status({fill: "red", shape: "dot", text: "error"});
        });
      }
    });       
  }
  RED.nodes.registerType("create-submission", CreateSubmission);
}
