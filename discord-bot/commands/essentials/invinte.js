const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('invite')
        .setDescription(`Invite the bot`),
    
    async execute(interaction){

        const embed = new EmbedBuilder()
        .setTitle(`Invite ${interaction.client.user.username}`)
        .setDescription('Thanks for being interested in our bot!')
        .setColor('#6400ff')
        .setAuthor({ name: 'FTS - Est. 2023', iconURL: 'https://i.imgur.com/le0aT56.png', url: 'https://discord.gg/ZyRe42SR4C' });
        const invite = new ButtonBuilder()
            .setLabel('invite the bot into your server!')
            .setURL(`https://discord.com/oauth2/authorize?client_id=1164317211196928030&permissions=8&integration_type=0&scope=bot`)
            .setStyle(ButtonStyle.Link);

        const row = new ActionRowBuilder()
		    .addComponents(invite);
        await interaction.reply({
            embeds: [embed],
            components: [row]
        });
        return interaction;
    }
}