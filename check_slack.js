const { updateSheet } = require("./sheets.js");

module.exports = {
  getSlackChannels: async function(client) {
    try {
      const result = await client.conversations.list({
        types: "public_channel,private_channel"
      });

      if (result.ok) {
        const channels = [];

        result.channels.forEach(async channel => {
          const serialized = {
            description: channel.purpose.value,
            id: channel.id,
            name: channel.name
          };

          await channels.push(serialized);
        });

        updateSheet(channels);
      }
    } catch (error) {
      console.error(error);
    }
  }
};
