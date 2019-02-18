
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


    function GetContentNode(n) {
        RED.nodes.createNode(this,n);
        var node = this;
        var options = parseCredentials(n);

        const r = new snoowrap(options);

        node.status({});
        node.on('input', function(msg) {        
            node.status({fill:"blue",shape:"dot",text:"loading"});

            // Get all possible parameters
            var content_type = n.content_type;
            var subreddit = parseField(msg, n.subreddit);
            var user =  parseField(msg, n.user);
            var submission_source = n.submission_source;
            var comment_source = n.comment_source;
            var pm_source = n.pm_source;
            var sort = n.sort;
            var time = n.time;
            var limit = parseInt(n.limit);
            var depth = parseInt(n.depth);
            var content_id = parseField(msg, n.content_id);
            var fetch_all = n.fetch_all;       
            
            var responseArr = [];
            if (content_type == "submission") {  
                if (submission_source == "subreddit") {
                    if (sort == "controversial") {
                        r.getControversial(subreddit, {time: time, limit:limit}).then(response => {
                            copyPropertiesExceptMethods(responseArr, response, msg);
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
                            copyPropertiesExceptMethods(responseArr, response, msg)
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
                            copyPropertiesExceptMethods(responseArr, response, msg)
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
                            copyPropertiesExceptMethods(responseArr, response, msg)
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
                            copyPropertiesExceptMethods(responseArr, response, msg)
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
                            copyPropertiesExceptMethods(responseArr, response, msg)
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
                            copyPropertiesExceptMethods(responseArr, response, msg)
                            node.status({})
                            node.send([responseArr]) 
                        }) 
                        .catch(err => {
                            node.error(err)
                            node.status({fill:"red",shape:"dot",text:"error"});
                        })   
                    }
                }
                else if (submission_source == "id") {
                    r.getSubmission(content_id).fetch().then(response => {
                        msg.payload = JSON.parse(JSON.stringify(response));
                        node.status({});
                        node.send(msg); 
                    }) 
                    .catch(err => {
                        node.error(err)
                        node.status({fill:"red",shape:"dot",text:"error"});
                    }) 
                }
                          
            } 
            else if (content_type == "comment") {
                if (comment_source == "subreddit") {
                    r.getSubreddit(subreddit).getNewComments({limit:limit}).then(response => {
                        copyPropertiesExceptMethods(responseArr, response, msg)
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
                            copyPropertiesExceptMethods(responseArr, response, msg)
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
                            copyPropertiesExceptMethods(responseArr, response, msg)
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

                    r.getSubmission(content_id).expandReplies({limit: limit, depth: depth}).then(response => {
                        console.log(response.comments.length)
                        copyPropertiesExceptMethods(responseArr, response.comments, msg);
                        node.status({})
                        node.send([responseArr]) 
                    }) 
                    .catch(err => {
                        node.error(err)
                        node.status({fill:"red",shape:"dot",text:"error"});
                    })   
                }
                else if (comment_source == "id") {
                    r.getComment(content_id).fetch().then(response => {
                        msg.payload = JSON.parse(JSON.stringify(response));
                        node.status({});
                        node.send(msg); 
                    }) 
                    .catch(err => {
                        node.error(err)
                        node.status({fill:"red",shape:"dot",text:"error"});
                    }) 
                }
            }
            else if (content_type == "pm") {
                if (pm_source == "inbox") {
                    if (fetch_all == "true") {
                        r.getInbox({filter:"messages"}).fetchAll().then(response => {
                            copyPropertiesExceptMethods(responseArr, response, msg)
                            node.status({})
                            node.send([responseArr])  
                        })
                        .catch(err => {
                            node.error(err)
                            node.status({fill:"red",shape:"dot",text:"error"});
                        })
                    }
                    else {
                        r.getInbox({limit:limit, filter:"messages"}).then(response => {
                            copyPropertiesExceptMethods(responseArr, response, msg)
                            node.status({})
                            node.send([responseArr])  
                        })
                        .catch(err => {
                            node.error(err)
                            node.status({fill:"red",shape:"dot",text:"error"});
                        })
                    }
                }
                else if (pm_source == "id") {
                    r.getMessage(content_id).fetch().then(response => {
                        msg.payload = JSON.parse(JSON.stringify(response));
                        node.status({});
                        node.send(msg); 
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


    function ReplyNode(n) {
        RED.nodes.createNode(this,n);
        var node = this;
        var options = parseCredentials(n);

        const r = new snoowrap(options);
        node.status({});
        node.on('input', function(msg) {
            node.status({fill:"blue",shape:"dot",text:"loading"});

            var content_type = n.content_type;
            var content_id = parseField(msg, n.content_id);
            var text = parseField(msg, n.text);

            var snoowrap_obj;
            if (content_type == "submission") {
                snoowrap_obj = r.getSubmission(content_id);
            }
            else if (content_type == "comment") {
                snoowrap_obj = r.getComment(content_id);
            }
            else if (content_type == "pm") {
                snoowrap_obj = r.getMessage(content_id);
            }

            snoowrap_obj.reply(text).then(response => {
                msg.payload = response;
                node.status({fill: "green", shape: "dot", text: "success: " + response.name});
                //node.send(msg) 
            })              
            .catch(function(err) {
                node.error(err.error.error + " " + err.error.message, msg)
                node.status({fill:"red",shape:"dot",text:"error"});
            })
        });        
    }
    RED.nodes.registerType("reply",ReplyNode);

    function SearchNode(n) {
        RED.nodes.createNode(this,n);
        var node = this;
        var options = parseCredentials(n);

        const r = new snoowrap(options);
        node.status({});
        node.on('input', function(msg) {
            node.status({fill:"blue",shape:"dot",text:"loading"});

            var subreddit = parseField(msg, n.subreddit);
            var query = parseField(msg, n.query);
            var sort = n.sort;
            var time = n.time;
            var syntax = n.syntax;
            var responseArr = []

            r.getSubreddit(subreddit).search({query: query, sort: sort, time: time, syntax: syntax}).then(response => {
                copyPropertiesExceptMethods(responseArr, response, msg)
                node.status({})
                node.send([responseArr]) 
            })              
            .catch(function(err) {
                node.error(err)
                node.status({fill:"red",shape:"dot",text:"error"});
            })
        });       
    }
    RED.nodes.registerType("search",SearchNode);  

// create submission

  function CreateSubmission(n) {
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
      }

      // submit
      snooCall.then(response => {
        node.status({fill: "green", shape: "dot", text: "success: " + response.name});
        msg.payload = response;
        node.send(msg);
      }).catch(err => {
        node.error(err);
        node.status({fill: "red", shape: "dot", text: "error"});
      });
    });       
  }
  RED.nodes.registerType("create-submission", CreateSubmission);

// subreddit stream node

  function StreamSubreddit(n) {
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
    if (n.kind != "" && n.subreddit != "") {
      node.emit("input", {});
    }
  }
  RED.nodes.registerType("stream", StreamSubreddit);

  function DeleteContent(n){
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
        var content_id = parseField(msg, n.content_id);
        //console.log(n.name);
        
        if (content_type == "comment"){
            node.status({fill:"grey",shape:"dot",text:"deleting comment"});
            
            r.getComment(content_id).delete();
                    
            node.status({});
        }
        else if (content_type == "submission"){
            node.status({fill:"grey",shape:"dot",text:"deleting submission"});
            
            r.getSubmission(content_id).delete();
            
            node.status({});
        }
        else if (content_type == "private_message"){
            node.status({fill:"grey",shape:"dot",text:"deleting PM"});
            
            r.getMessage(content_id).deleteFromInbox();
            
            node.status({});
        }
    });
}
    RED.nodes.registerType("reddit-delete", DeleteContent);

    function EditContent(n){
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
			var edit_content = n.edit_content || msg.edit_content;
			var content_id = parseField(msg, n.content_id);
			
			//console.log(n.name);
			if (content_type == "comment"){
				node.status({fill:"grey",shape:"dot",text:"editing comment"});
				
				r.getComment(content_id).fetch().then(comment => node.send({ payload: "original: " + comment.body }));
				
				r.getComment(content_id).edit(edit_content);
				
				setTimeout(function() {
					
                    r.getComment(content_id).refresh().then(comment => node.send({ payload: "edited: " + comment.body }));
					
                }, 2000);
				node.status({});
			}
			else if (content_type == "submission"){
				node.status({fill:"grey",shape:"dot",text:"editing submission"});
				
				r.getSubmission(content_id).fetch().then(submission => node.send({ payload: "original: " + submission.selftext }));
				
				r.getSubmission(content_id).edit(edit_content);
				
				setTimeout(function() {
					
                    r.getSubmission(content_id).refresh().then(submission => node.send({ payload: "edited: " + submission.selftext }));
					
                }, 2000);
				node.status({});
			}
			
        });
	}
    RED.nodes.registerType("reddit-edit", EditContent);
    
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
			var content_id = parseField(msg, n.content_id);
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
