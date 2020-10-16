const _ = require("lodash");

const serializeChannelForSheet = function(channel) {
  const serialized = {
    description: channel.purpose.value,
    id: channel.id,
    name: channel.name
  };
  return serialized;
};

const getAllSlackChannels = async function(client) {
  try {
    const result = await client.conversations.list({
      token: process.env.SLACK_BOT_TOKEN,
      types: "public_channel,private_channel"
    });

    if (result.ok) {
      return result.channels.filter(channel => !channel.is_archived).map(channel => serializeChannelForSheet(channel));
    }

    throw new Error(result);
    return {};
  } catch (error) {
    console.error(error.data);
    return {};
  }
};

const getUsersAllowedChannels = async function(client, user) {
  try {
    const result = await client.users.conversations({
      token: process.env.SLACK_BOT_TOKEN,
      types: "public_channel,private_channel",
      user: user
    });

    if (result.ok) {
      return result.channels.filter(channel => !channel.is_archived).map(channel => serializeChannelForSheet(channel));
    }

    throw new Error(result);
    return {};
  } catch (error) {
    console.error(error.data);
    return {};
  }
};

const getNotRegisteredChannels = async function(client, app, user_id) {
  const allChannels = await getAllSlackChannels(app.client); //Use bot token
  const myChannels = await getUsersAllowedChannels(client, user_id); // Use user token
  return _.differenceWith(allChannels, myChannels, _.isEqual);
};

module.exports = {
  getNotRegisteredChannels,
  getAllSlackChannels,
  getUsersAllowedChannels
};
