const { Events } = require('discord.js');

module.exports = {
    name: Events.GuildMemberUpdate,
    once: false,
    async execute(oldMember, newMember) {
        const serverId = '1306704630171963422';
        const roleId = '1307756165849153688';

        if (newMember.guild.id !== serverId) return;

        if (newMember.roles.cache.has(roleId)) {
            const memberCount = newMember.guild.members.cache.filter(member => 
                member.roles.cache.has(roleId)
            ).size;

            await newMember.client.user.setPresence({
                activities: [{ name: `Customers: ${memberCount}`, type: 'WATCHING' }],
                status: 'dnd',
            });
        }
    },
};
