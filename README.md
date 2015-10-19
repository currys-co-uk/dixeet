Dixeet
===========

Realtime chat platform allowing private instant broadcast messaging similarly to twitter.

 - max 160 chars
 - supports hash tags & links
 - unlimited count of attachments
 - easy way how to create streams
 - three levels of rights:
    - public (read-only)
    - writer (can create streams & messages)
    - admin (can create stream & message & can delete messages)

### Technologies
 - [Meteor JS](https://www.meteor.com/)
 - [ReactJS](https://facebook.github.io/react/)
 - [MongoDB](https://www.mongodb.org/)


## Build & run

    curl https://install.meteor.com/ | sh
    mkdir project_home
    cd project_home
    git clone <this_repo_url>
    meteor
    
    open http://localhost:3000 in any browser
    
## How to create/open another stream    

 - click on stream name within an message
 - open &lt;app_url&gt;/&lt;stream_name&gt; in browser