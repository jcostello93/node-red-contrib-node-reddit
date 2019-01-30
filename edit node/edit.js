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
	
	
	
	function EditContent(n){
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
			var edit_content = n.edit_content || msg.edit_content;
			//console.log(n.name);
			if (content_type == "comment"){
				node.status({fill:"grey",shape:"dot",text:"editing comment"});
				r.getComment(msg.payload).edit(edit_content);
				node.status({});
			}
			else if (content_type == "submission"){
				node.status({fill:"grey",shape:"dot",text:"editing submission"});
				r.getSubmission(msg.payload).edit(edit_content);
				node.status({});
			}
			
        });
	}
	RED.nodes.registerType("reddit-edit", EditContent);
}
