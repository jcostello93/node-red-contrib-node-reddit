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
/*

*/
	
	function DeleteContent(n){
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
			//console.log(n.name);
			if (content_type == "comment"){
				node.status({fill:"grey",shape:"dot",text:"deleting comment"});
				r.getComment(msg.payload).delete();
				node.status({});
			}
			else if (content_type == "submission"){
				node.status({fill:"grey",shape:"dot",text:"deleting submission"});
				r.getSubmission(msg.payload).delete();
				node.status({});
			}
			else if (content_type == "private_message"){
				node.status({fill:"grey",shape:"dot",text:"deleting PM"});
				r.getMessage(msg.payload).deleteFromInbox();
				node.status({});
			}
        });
	}
	RED.nodes.registerType("reddit-delete", DeleteContent);
}
