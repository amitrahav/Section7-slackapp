# Section 7
A simple slack app allowing guest users to join and leave all public channels as they wish.

Written as a node server, with [bolt.js](https://github.com/slackapi/bolt-js).

## How does it work?
+ The slack bot get a permission of an workspace admin.
+ On the app home, there's a list of all available channels, and a buttons of joining and leaving.
+ When a user select channels to join - the app's bot invites this person into the channel, and join it self.
+ When a user select channels to leave - it uses the user app token to preform a leave request.

## Deploy
It's a ready for production on Heroku product.