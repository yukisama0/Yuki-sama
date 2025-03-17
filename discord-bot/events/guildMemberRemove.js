module.exports = {
    name: 'guildMemberRemove',
    async execute(member) {
        try {
            const memberCountChannel = member.guild.channels.cache.find(channel => channel.name.startsWith('Members:'));
            if (memberCountChannel) {
                await memberCountChannel.setName(`Members: ${member.guild.memberCount}`);
            }

        } catch (err) {
            console.error('Error in guildMemberRemove event handler:', err);
        }
    }
};
