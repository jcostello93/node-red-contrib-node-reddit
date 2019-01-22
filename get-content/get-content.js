// Quick fix to avoid sending objects attached to methods
function copyPropertiesExceptMethods(newArr, originalArr) {
    for (var i = 0; i < originalArr.length; i++){
        var obj = {}
        for (var prop in originalArr[i]) {
            if (typeof originalArr[i][prop] != "function") {
                obj[prop] = originalArr[i][prop] 
            }
        }
        newArr.push({content_id: originalArr[i].id, payload: obj})
    }
}

module.exports = function(RED) {
    "use strict";

    const snoowrap = require('snoowrap');

    function ConfigNode(n) {
        RED.nodes.createNode(this,n);
        this.username = n.username;
        this.user_agent = n.user_agent;
        this.name = n.name;
    }
    RED.nodes.registerType("reddit-credentials",ConfigNode,{
      credentials: {
        password: {type: "password"},
        client_id: {type: "password"},
        client_secret: {type: "password"}
      }
    });


    function GetContentNode(n) {
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
            node.status({fill:"blue",shape:"dot",text:"loading"});

            // Check HTML field first and then msg object if necessary 
            var content_type = n.content_type || msg.type;
            var subreddit = n.subreddit || msg.subreddit;
            var sort = n.sort || msg.sort;
            var time = n.time || msg.time; 
            var limit = n.limit || msg.limit;
            limit = parseInt(limit);
            var responseArr = []

            if (content_type == "submission") {  
                // Not sure if this is ok but it saves a lot of code      
                var map = {
                    "controversial": r.getSubreddit(subreddit).getControversial({time: time, limit:limit}),
                    "hot": r.getSubreddit(subreddit).getHot({limit: limit}),
                    "new": r.getSubreddit(subreddit).getNew({limit: limit}),
                    "rising": r.getSubreddit(subreddit).getRising({limit: limit}),
                    "top": r.getSubreddit(subreddit).getTop({time: time, limit:limit})
                }
                
                map[sort].then(response => {
                    copyPropertiesExceptMethods(responseArr, response)
                    node.status({})
                    // This syntax sends the objects in the array one at a time
                    node.send([responseArr])  
                })
                .catch(err => {
                    node.error(err)
                    node.status({fill:"red",shape:"dot",text:"error"});
                })              
            } 
            else if (content_type == "comment") {
                r.getSubreddit(subreddit).getNewComments({limit:limit}).then(response => {
                    copyPropertiesExceptMethods(responseArr, response)
                    node.status({})
                    // This syntax sends the objects in the array one at a time
                    node.send([responseArr])  
                })
                .catch(err => {
                    node.error(err)
                    node.status({fill:"red",shape:"dot",text:"error"});
                })
            }
            else {
                r.getInbox({limit:limit}).then(response => {
                    copyPropertiesExceptMethods(responseArr, response)
                    node.status({})
                    node.send([responseArr])  
                })
                .catch(err => {
                    node.error(err)
                    node.status({fill:"red",shape:"dot",text:"error"});
                })
            }
        });

        
    }
    RED.nodes.registerType("get content",GetContentNode);
}
