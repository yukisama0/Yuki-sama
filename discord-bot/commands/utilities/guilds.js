const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('guilds')
        .setDescription('All active guilds'),
    
    async execute(interaction) {
        const rulesChannelId = '1150146916194193639';
        const rulesChannel = interaction.guild.channels.cache.get(rulesChannelId);

        const embed = new EmbedBuilder()
            .setTitle('**Help**')
            .setDescription('Displays a list of all active guilds the bot is a part of.')
            .setColor('#6400ff')
            .setAuthor({ name: 'FTS - Est. 2023', iconURL: 'https://i.imgur.com/le0aT56.png', url: 'https://discord.gg/ZyRe42SR4C' })
            .addFields(
                { name: 'Rules', value: `[${rulesChannel.name}](https://discord.com/channels/1132332567459278878/${rulesChannelId})`, inline: true },
                { name: 'Need more help?', value: `join our [support server](https://discord.gg/ZyRe42SR4C)`, inline: true }
            );
        
        const rulesButton = new ButtonBuilder()
            .setLabel('View rules')
            .setURL(`https://discord.com/channels/1132332567459278878/${rulesChannelId}`)
            .setStyle(ButtonStyle.Link);

        const joinButton = new ButtonBuilder()
            .setLabel('Join server')
            .setURL('https://discord.gg/ZyRe42SR4C')
            .setStyle(ButtonStyle.Link);

        const row = new ActionRowBuilder().addComponents(rulesButton, joinButton);

        await interaction.reply({
            embeds: [embed],
            components: [row]
        });
    }
};
