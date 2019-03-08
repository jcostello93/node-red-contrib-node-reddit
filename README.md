# node-red-contrib-node-reddit
## Overview
Interact with Reddit using [Node-RED](https://nodered.org).

## Nodes

For more detailed information about functionality, inputs, and outputs, visit the [wiki](https://github.com/jcostello93/node-red-contrib-node-reddit/wiki) or the node's documentation window within the Node-RED editor. 

* **Config:** authentication for the Reddit API
* **Stream:** stream submissions and comments from a subreddit or PMs from your inbox
* **Get:** get submissions, comments, or personal messages from a subreddit, user, your inbox, or the content's id, according to its configuration
* **Create:** create a new Reddit submission or PM
* **Reply:** reply to a submission, comment, or PM
* **Search:** perform a Reddit search query in a subreddit
* **Edit:** edit a Reddit submission or comment.
* **Delete:** delete a Reddit submission, comment, or PM.
* **React:** save/unsave and/or vote/unvote on Reddit content. 

## Populating fields

For all nodes other than config and stream, all text fields may be hardcoded via text or dynamically populated via mustache syntax relative to the incoming msg object.

For example, let's say you're getting hot submissions from a subreddit using the get node. If the target <code>subreddit</code> is located in <code>msg.payload.target</code>, then you can fill in <code>{{payload.target}}</code> in the <code>subreddit</code> field.

## Example flows 
### Develop an interactive website that displays a subreddit. Download the [flow.](/flows/osu-website.json)
![Nba](/screenshots/Node-Reddit-osu-website-flow2.png?raw=true "OSU website flow")
---
![Nba](/screenshots/Node-Reddit-osu-website2.png?raw=true "OSU website")
---

### Create a Node-RED dashboard for a subreddit. Download the [flow.](/flows/osu.json)
![Nba](/screenshots/Node-Reddit-osu-flow.png?raw=true "OSU dashboard flow")
---
![Nba](/screenshots/Node-Reddit-osu-dashboard.png?raw=true "OSU dashboard")
---

### Create a Reddit bot that responds to a trigger. Download the [flow.](/flows/bot.json)
![Nba](/screenshots/Node-Reddit-bot-flow.png?raw=true "blot flow")
---

### Overwrite and delete all of your Reddit comments. Download the [flow.](/flows/overwrite-comments.json)
![Overwrite and delete comments](/screenshots/Node-Reddit-overwrite-comments.png?raw=true "Overwrite")

### Track the pulse of a subreddit by monitoring the most frequently mentioned words and sentiment of its comments. Download the [flow.](/flows/nba.json)
![Nba](/screenshots/Node-Reddit-nba-flow2.png?raw=true "NBA flow")
---
![Nba](/screenshots/Node-Reddit-nba-dashboard2.png?raw=true "NBA dashboard")



## References
* [Reddit API docs](https://www.reddit.com/dev/api/)
* [Snoowrap docs](https://not-an-aardvark.github.io/snoowrap/) 
* [Node-RED docs](https://nodered.org/docs/)
