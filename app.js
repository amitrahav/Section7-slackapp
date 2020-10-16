const { App } = require("@slack/bolt");
const { getNotRegisteredChannels, getAllSlackChannels, getUsersAllowedChannels} = require("./check_slack.js");
const { readFromSheet } = require("./sheets.js");

const app = new App({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  token: process.env.SLACK_BOT_TOKEN
});

/* Add functionality here */
app.event("app_home_opened", async ({ event, client, context }) => {
  try {
    
    const allChannels = await getAllSlackChannels(client);
    const channelsAsSections = allChannels.map(( channel,idx) =>{
      return {
        "type": "section",
        "text": {
          "type": "mrkdwn",
          "text": "*" + (idx + 1) + ". " + channel.name +"*\n "+ channel.description
        }
      }
    });
      
    /* view.publish is the method that your app uses to push a view to the Home tab */
    const result = await client.views.publish({
      /* the user that opened your app's app home */
      user_id: event.user,

      /* the view object that appears in the app home*/
      view: {
        type: "home",
        callback_id: "home_view",

        /* body of the view */
        blocks: [
          {
            type: "header",
            text: {
              type: "plain_text",
              text: "Welcome to Section 7 Homepage :tada:",
              emoji: true
            }
          },
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text:
                "We'll try to update you with the new channles beeing open at a crazy rate, and make the joining and leaving proccess a lot easier."
            }
          },
          {
            type: "divider"
          },
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: "*Pick channels from the list you want to join*"
            },
            accessory: {
              action_id: "get_all_optional_channels_to_join",
              type: "multi_external_select",
              placeholder: {
                type: "plain_text",
                text: "Select channels to join"
              },
              min_query_length: 0
            }
          },
          {
            type: "divider"
          },
          {
            type: "section",
            block_id: "section670",
            text: {
              type: "mrkdwn",
              text: "*Pick channels from the list you want to leave*"
            },
            accessory: {
              action_id: "get_all_optional_channels_to_leave",
              type: "multi_external_select",
              placeholder: {
                type: "plain_text",
                text: "Select channels to leave"
              },
              min_query_length: 0
            }
          },
          {
            type: "divider"
          },
          {
            type: "header",
            text: {
              type: "plain_text",
              text: "All channels",
              emoji: true
            }
          },
          ...channelsAsSections
        ]
      }
    });
    
  } catch (error) {
    console.error(error);
  }
});

app.event("channel_created", async ({ payload, body, client }) => {
  const channelName = payload.channel.name;
  const teamId = body.team_id;
});

app.options( "get_all_optional_channels_to_join", async ({ client, ack, payload }) => {
  try {
    const channels = await getNotRegisteredChannels(client, app, payload.user.id);
    const serializeForJoin = channels.map(channel => {
      return {
        text: {
          type: "plain_text",
          text: "#"+channel.name
        },
        value: channel.id
      };
    });
    await ack({ options: serializeForJoin });
  } catch (e) {
    await ack();
    console.error(e);
  }
});

app.options( "get_all_optional_channels_to_leave", async ({ client, ack, payload }) => {
  try {
    const channels = await getUsersAllowedChannels(client, payload.user.id);
    const serializeForJoin = channels.map(channel => {
      return {
        text: {
          type: "plain_text",
          text: "#"+channel.name
        },
        value: channel.id
      };
    });
    await ack({ options: serializeForJoin });
  } catch (e) {
    await ack();
    console.error(e);
  }
});

app.view('home_view', async ({ ack, body, view, context }) => {
  // Acknowledge the view_submission event
  await ack();
  console.log('hello');

});

(async () => {
  // Start the app
  await app.start(process.env.PORT || 3000);

  console.log("⚡️ Bolt app is running!");
})();
