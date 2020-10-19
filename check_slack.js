const _ = require("lodash");

const serializeChannelForSheet = function(channel) {
  const serialized = {
    description: channel.purpose.value,
    id: channel.id,
    name: channel.name
  };
  return serialized;
};

const allSlackChannels = [];
const userSlackChannels = [];

const getAllSlackChannels = async function(client, cursor) {
  try {
    const result = await client.conversations.list({
      token: process.env.SLACK_BOT_TOKEN,
      types: "public_channel,private_channel",
      exclude_archived: true,
      limit: 100,
      cursor: cursor || ''
    });

    if (result.ok) {
      allSlackChannels.push(...result.channels.map(channel => serializeChannelForSheet(channel)))
      if(result.response_metadata.next_cursor !== ''){
        return await getAllSlackChannels(client, result.response_metadata.next_cursor);
      }
      return allSlackChannels;
    }

    throw new Error(result);
    return {};
  } catch (error) {
    console.error(error.data);
    return {};
  }
};

const getUsersAllowedChannels = async function(client, user, cursor) {
  try {
    const result = await client.users.conversations({
      token: process.env.SLACK_BOT_TOKEN,
      types: "public_channel,private_channel",
      user: user,
      exclude_archived: true,
      limit: 100,
      cursor: cursor || ''
    });

    if (result.ok) {
      allSlackChannels.push(...result.channels.map(channel => serializeChannelForSheet(channel)))
      if(result.response_metadata.next_cursor !== ''){
        return await getUsersAllowedChannels(client, user, result.response_metadata.next_cursor);
      }
      return allSlackChannels;
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
