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
            node.status({fill:"blue",shape:"dot",text:"loading"});

            // Check HTML field first and then msg object if necessary 
            var content_type = n.content_type || msg.content_type;
            var subreddit = parseField(msg, n.subreddit, "subreddit");
            var user =  parseField(msg, n.user, "user");

            var submission_source = parseField(msg, n.submission_source, "submission_source");
            var comment_source = parseField(msg, n.comment_source, "comment_source");
            var sort = parseField(msg, n.sort, "sort");
            var time = parseField(msg, n.time, "time");
            var limit = parseField(msg, n.limit, "limit");
            var depth = parseField(msg, n.depth, "depth");
            var content_id = parseField(msg, n.content_id, "content_id");
            limit = parseInt(limit);
            depth = parseInt(depth);
            var fetch_all = n.fetch_all;       
            
            var responseArr = [];
            if (content_type == "submission") {  
                if (submission_source == "subreddit") {
                    if (sort == "controversial") {
                        r.getControversial(subreddit, {time: time, limit:limit}).then(response => {
                            copyPropertiesExceptMethods(responseArr, response);
                            node.status({});
                            node.send([responseArr]);
                        })
                        .catch(err => {
                            node.error(err)
                            node.status({fill:"red",shape:"dot",text:"error"});
                        })   
                    }
                    else if (sort == "hot") {
                        r.getHot(subreddit, {limit: limit}).then(response => {
                            copyPropertiesExceptMethods(responseArr, response)
                            node.status({})
                            node.send([responseArr])  
                        })
                        .catch(err => {
                            node.error(err)
                            node.status({fill:"red",shape:"dot",text:"error"});
                        })   
                    }
                    else if (sort == "new") {
                        r.getNew(subreddit, {limit: limit}).then(response => {
                            copyPropertiesExceptMethods(responseArr, response)
                            node.status({})
                            node.send([responseArr])  
                        })
                        .catch(err => {
                            node.error(err)
                            node.status({fill:"red",shape:"dot",text:"error"});
                        })   
                    }
                    else if (sort == "rising") {
                        r.getRising(subreddit, {limit: limit}).then(response => {
                            copyPropertiesExceptMethods(responseArr, response)
                            node.status({})
                            node.send([responseArr])  
                        })
                        .catch(err => {
                            node.error(err)
                            node.status({fill:"red",shape:"dot",text:"error"});
                        })   
                    }
                    else if (sort == "top") {
                        r.getTop(subreddit, {time: time, limit:limit}).then(response => {
                            copyPropertiesExceptMethods(responseArr, response)
                            node.status({})
                            node.send([responseArr])  
                        })
                        .catch(err => {
                            node.error(err)
                            node.status({fill:"red",shape:"dot",text:"error"});
                        })   
                    }
                    else {
                        node.error("Invalid parameters for submission request")
                    }
                }
                else if (submission_source == "user") {
                    if (fetch_all == "true") {
                        r.getUser(user).getSubmissions().fetchAll().then(response => {
                            copyPropertiesExceptMethods(responseArr, response)
                            node.status({})
                            node.send([responseArr]) 
                        }) 
                        .catch(err => {
                            node.error(err)
                            node.status({fill:"red",shape:"dot",text:"error"});
                        })   
                    }
                    else {
                        r.getUser(user).getSubmissions({limit: limit}).then(response => {
                            copyPropertiesExceptMethods(responseArr, response)
                            node.status({})
                            node.send([responseArr]) 
                        }) 
                        .catch(err => {
                            node.error(err)
                            node.status({fill:"red",shape:"dot",text:"error"});
                        })   
                    }
                }
                          
            } 
            else if (content_type == "comment") {
                if (comment_source == "subreddit") {
                    r.getSubreddit(subreddit).getNewComments({limit:limit}).then(response => {
                        copyPropertiesExceptMethods(responseArr, response)
                        node.status({})
                        node.send([responseArr])  
                    })
                    .catch(err => {
                        node.error(err)
                        node.status({fill:"red",shape:"dot",text:"error"});
                    })
                }
                else if (comment_source == "user") {
                    if (fetch_all == "true") { 
                        r.getUser(user).getComments().fetchAll().then(response => {
                            copyPropertiesExceptMethods(responseArr, response)
                            node.status({})
                            node.send([responseArr]) 
                        }) 
                        .catch(err => {
                            node.error(err)
                            node.status({fill:"red",shape:"dot",text:"error"});
                        })   
                    }
                    else {
                        r.getUser(user).getComments({limit: limit}).then(response => {
                            copyPropertiesExceptMethods(responseArr, response)
                            node.status({})
                            node.send([responseArr]) 
                        }) 
                        .catch(err => {
                            node.error(err)
                            node.status({fill:"red",shape:"dot",text:"error"});
                        })   
                    }
                }
                else if (comment_source == "submission") {
                    if (fetch_all == "true") { 
                        limit = Infinity; 
                        depth = Infinity; 
                    }

                    console.log(limit, depth);
                    r.getSubmission(content_id).expandReplies({limit: limit, depth: depth}).then(response => {
                        console.log(response.comments.length)
                        copyPropertiesExceptMethods(responseArr, response.comments);
                        node.status({})
                        node.send([responseArr]) 
                    }) 
                    .catch(err => {
                        node.error(err)
                        node.status({fill:"red",shape:"dot",text:"error"});
                    })   
                }
            }
            else if (content_type == "pm") {
                if (fetch_all == "true") {
                    r.getInbox().fetchAll().then(response => {
                        copyPropertiesExceptMethods(responseArr, response)
                        node.status({})
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
            }
            else {
                node.error("content_type is required")
            }
        });        
    }
    RED.nodes.registerType("get content",GetContentNode);
}
