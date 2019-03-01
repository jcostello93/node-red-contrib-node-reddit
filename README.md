# node-red-contrib-node-reddit

## Overview
These things do stuff

## Nodes
### Config 
Authentication for the Reddit API
#### Details
To create a Reddit app and obtain its Client ID and Client Secret, log in to your Reddit account and visit <a href="https://ssl.reddit.com/prefs/apps/">this link.</a>

There are 3 ways to provide authentication:
  
1. Username/password: For long-term access. Possible for script-type apps only.
2. Refresh token: For long-term access. Visit <a href="https://not-an-aardvark.github.io/reddit-oauth-helper/">here</a> to generate a token.
3. Access token: For short-term access. Expires in one hour. Visit <a href="https://not-an-aardvark.github.io/reddit-oauth-helper/">here</a> to generate a token.

### Stream

* This node will stream submissions and comments from a subreddit or PMs from your inbox.

### Get

* This node will get submissions, comments, or personal messages from subreddits, users, your inbox, or the 's id, according to its configuration. 

### Create

* This node will create a new Reddit submission or PM

### Reply

* This node will reply to a submission, comment, or personal message, identified by its Reddit content id.

### Search

* This node will perform a Reddit search query in a subreddit.

### Edit

* This node will edit a Reddit submission or comment.

### Delete

* This node will delete a Reddit submission, comment, or PM

### React

* This node will save/unsave and/or vote on Reddit content. 

## Populating fields

For all nodes other than config and stream, all text fields may be hardcoded via text or dynamically populated via mustache syntax relative to the incoming msg object.

For example, let's say you're getting hot submissions from a subreddit using the get node. If the target <code>subreddit</code> is located in <code>msg.payload.target</code>, then you can fill in <code>{{payload.target}}</code> in the <code>subreddit</code> field.

## Example flows 
### Overwrite and delete all of your Reddit comments. Download the [flow.](/flows/overwrite-comments.json)
![Overwrite and delete comments](/screenshots/Node-Reddit-overwrite-comments.png?raw=true "Overwrite")

### Track the pulse of a subreddit by monitoring the most frequently mentioned words and sentiment of its comments. Download the [flow.](/flows/nba.json)
![Nba](/screenshots/Node-Reddit-nba-flow.png?raw=true "Nba")
![Nba](/screenshots/Node-Reddit-nba-dashboard.png?raw=true "Nba")

## References
* <a href="https://www.reddit.com/dev/api/">Reddit API docs</a>
* <a href="https://not-an-aardvark.github.io/snoowrap/">Snoowrap docs</a> 

