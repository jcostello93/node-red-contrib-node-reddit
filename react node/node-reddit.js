module.exports = function(RED) {
    "use strict";

    const snoowrap = require('snoowrap');

	//Reddit-credentials node. Credit: John Costello.
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
	
	
	
	function ReactContent(n){
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
			//node.status({fill:"grey",shape:"dot",text:"loading"});
			
			var content_type = n.content_type || msg.content_type;
            var vote = n.vote || msg.vote;
            var save_value = n.save || msg.save;
            var gild_value = n.gild || msg.gild;

			//console.log(n.name);
			if (content_type == "comment"){
				if (vote == "upvote"){
					node.status({fill:"grey",shape:"dot",text:"upvoting comment"});
					r.getComment(msg.payload).upvote();
					//node.status({});
				}
				else if (vote == "downvote"){
					node.status({fill:"grey",shape:"dot",text:"downvoting comment"});
					r.getComment(msg.payload).downvote();
					//node.status({});
                }
                else if (vote == "unvote") {
                    node.status({ fill: "grey", shape: "dot", text: "unvoting comment" });
                    r.getComment(msg.payload).unvote();
                    //node.status({});
                }

                if (save_value == "save") {
                    node.status({ fill: "grey", shape: "dot", text: "saving comment" });
                    r.getComment(msg.payload).save();
                }
                else if (save_value == "unsave") {
                    node.status({ fill: "grey", shape: "dot", text: "unsaving comment" });
                    r.getComment(msg.payload).unsave();
                }

			}
			else if (content_type == "submission"){
				if (vote == "upvote"){
					node.status({fill:"grey",shape:"dot",text:"upvoting submission"});
					r.getSubmission(msg.payload).upvote();
					//node.status({});
				}
				else if (vote == "downvote"){
					node.status({fill:"grey",shape:"dot",text:"downvoting submission"});
					r.getSubmission(msg.payload).downvote();
					//node.status({});
                }
                else if (vote == "unvote") {
                    node.status({ fill: "grey", shape: "dot", text: "unvoting submission" });
                    r.getSubmission(msg.payload).unvote();
                    //node.status({});
                }

                if (save_value == "save") {
                    node.status({ fill: "grey", shape: "dot", text: "saving submission" });
                    r.getSubmission(msg.payload).save();
                }
                else if (save_value == "unsave") {
                    node.status({ fill: "grey", shape: "dot", text: "unsaving submission" });
                    r.getSubmission(msg.payload).unsave();
                }

            }
            node.status({});
        });
	}
	RED.nodes.registerType("reddit-react", ReactContent);
}
