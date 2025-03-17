const Guild = require('../models/guild');

module.exports = {
    name: 'guildMemberAdd',
    async execute(member) {
        try {
            const dbGuild = await Guild.findOne({ where: { id: member.guild.id } });
            if (dbGuild.welcomeRoleId) {
                const welcomeRole = await member.guild.roles.fetch(dbGuild.welcomeRoleId);
                await member.roles.add(welcomeRole);
            }

            const rulesChannel = await member.guild.channels.fetch(dbGuild.rulesId);
            if (dbGuild.welcomeChannelId) {
                const welcomeChannel = await member.guild.channels.fetch(dbGuild.welcomeChannelId);
                await welcomeChannel.send(`${member.user}, welcome to ${member.guild.name}! Please read our rules under ${rulesChannel}`);
            }

            const memberCountChannel = member.guild.channels.cache.find(channel => channel.name.startsWith('Members:'));
            if (memberCountChannel) {
                await memberCountChannel.setName(`Members: ${member.guild.memberCount}`);
            }

        } catch (err) {
            console.error('Error in guildMemberAdd event handler:', err);
        }
    }
};
