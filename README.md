# node-red-contrib-node-reddit

## Overview
Interact with Reddit using [Node-RED](https://nodered.org).

## Nodes
### Config 
Authentication for the Reddit API
#### Details
To create a Reddit app and obtain its Client ID and Client Secret, log in to your Reddit account and visit [this link](https://ssl.reddit.com/prefs/apps/).

There are 3 ways to provide authentication:
  
1. Username/password: For long-term access. Possible for script-type apps only.
2. Refresh token: For long-term access. Visit [here](https://not-an-aardvark.github.io/reddit-oauth-helper/) to generate a token.
3. Access token: For short-term access. Expires in one hour. Visit [here](https://not-an-aardvark.github.io/reddit-oauth-helper/) to generate a token.

### Stream

* This node will stream submissions and comments from a subreddit or PMs from your inbox.

### Get

* This node will get submissions, comments, or personal messages from subreddits, users, your inbox, or the content's id, according to its configuration.

### Create

* This node will create a new Reddit submission or PM.

### Reply

* This node will reply to a submission, comment, or personal message, identified by its Reddit content id.

### Search

* This node will perform a Reddit search query in a subreddit.

### Edit

* This node will edit a Reddit submission or comment.

### Delete

* This node will delete a Reddit submission, comment, or PM.

### React

* This node will save/unsave and/or vote on Reddit content. 

## Populating fields

For all nodes other than config and stream, all text fields may be hardcoded via text or dynamically populated via mustache syntax relative to the incoming msg object.

For example, let's say you're getting hot submissions from a subreddit using the get node. If the target <code>subreddit</code> is located in <code>msg.payload.target</code>, then you can fill in <code>{{payload.target}}</code> in the <code>subreddit</code> field.

## Example flows 
### Create your own front-end for a subreddit. Download the [flow.](/flows/osu.json)
![Nba](/screenshots/Node-Reddit-osu-flow.png?raw=true "OSU flow")
---
![Nba](/screenshots/Node-Reddit-osu-dashboard.png?raw=true "OSU dashboard")

### Overwrite and delete all of your Reddit comments. Download the [flow.](/flows/overwrite-comments.json)
![Overwrite and delete comments](/screenshots/Node-Reddit-overwrite-comments.png?raw=true "Overwrite")

### Track the pulse of a subreddit by monitoring the most frequently mentioned words and sentiment of its comments. Download the [flow.](/flows/nba.json)
![Nba](/screenshots/Node-Reddit-nba-flow2.png?raw=true "NBA flow")
---
![Nba](/screenshots/Node-Reddit-nba-dashboard2.png?raw=true "NBA dashboard")



## References
* [Reddit API docs](https://www.reddit.com/dev/api/)
* [Snoowrap docs](https://not-an-aardvark.github.io/snoowrap/) 
