module.exports = function(RED) {
    "use strict";

    const snoowrap = require('snoowrap');
	var mustache = require("mustache");
	
	// In order of priority: 1. HTML text OR mustache syntax, 2. msg.msgProp 
    // Credit: John Costello.
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

	//Reddit-credentials node. Credit: John Costello.
    function CreateNodeRedditNode(n) {
        RED.nodes.createNode(this,n);
        this.username = n.username;
        this.user_agent = n.user_agent;
		this.auth_type = n.auth_type;
        this.name = n.name;
    }
    RED.nodes.registerType("reddit-credentials",CreateNodeRedditNode,{
      credentials: {
        password: {type: "password"},
        client_id: {type: "password"},
        client_secret: {type: "password"},
		refresh_token: { type: "password" },
        access_token: { type: "password" }
      }
    });
	
	
	
	function ReactContent(n){
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
			//node.status({fill:"grey",shape:"dot",text:"loading"});
			
			var content_type = n.content_type || msg.content_type;
            var vote = n.vote || msg.vote;
            var save_value = n.save || msg.save;
			var content_id = parseField(msg, n.content_id, "content_id");
            //var gild_value = n.gild || msg.gild;

			//console.log(n.name);
			if (content_type == "comment"){
				if (vote == "upvote"){
					node.status({fill:"grey",shape:"dot",text:"upvoting comment"});
					r.getComment(content_id).upvote();
					//node.status({});
				}
				else if (vote == "downvote"){
					node.status({fill:"grey",shape:"dot",text:"downvoting comment"});
					r.getComment(content_id).downvote();
					//node.status({});
                }
                else if (vote == "unvote") {
                    node.status({ fill: "grey", shape: "dot", text: "unvoting comment" });
                    r.getComment(content_id).unvote();
                    //node.status({});
                }

                if (save_value == "save") {
                    node.status({ fill: "grey", shape: "dot", text: "saving comment" });
                    r.getComment(content_id).save();
                }
                else if (save_value == "unsave") {
                    node.status({ fill: "grey", shape: "dot", text: "unsaving comment" });
                    r.getComment(content_id).unsave();
                }

			}
			else if (content_type == "submission"){
				if (vote == "upvote"){
					node.status({fill:"grey",shape:"dot",text:"upvoting submission"});
					r.getSubmission(content_id).upvote();
					//node.status({});
				}
				else if (vote == "downvote"){
					node.status({fill:"grey",shape:"dot",text:"downvoting submission"});
					r.getSubmission(content_id).downvote();
					//node.status({});
                }
                else if (vote == "unvote") {
                    node.status({ fill: "grey", shape: "dot", text: "unvoting submission" });
                    r.getSubmission(content_id).unvote();
                    //node.status({});
                }

                if (save_value == "save") {
                    node.status({ fill: "grey", shape: "dot", text: "saving submission" });
                    r.getSubmission(content_id).save();
                }
                else if (save_value == "unsave") {
                    node.status({ fill: "grey", shape: "dot", text: "unsaving submission" });
                    r.getSubmission(content_id).unsave();
                }

            }
            node.status({});
        });
	}
	RED.nodes.registerType("reddit-react", ReactContent);
}
