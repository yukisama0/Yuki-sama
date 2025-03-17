const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const Guild = require('../../models/guild');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('set-welcome-channel')
        .setDescription('Set the welcome channel for this guild where a welcome message will be sent')
        .addChannelOption(option => option
            .setName('channel')
            .setDescription('Channel to send the welcome message in')
            .addChannelTypes(ChannelType.GuildText)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        try {
            await interaction.deferReply({ ephemeral: true });

            const { options, member, guild } = interaction;

            if (!guild || !guild.available) {
                return interaction.editReply({ content: 'Guild not available', ephemeral: true });
            }

            if (guild.ownerId !== member.id) {
                return interaction.editReply({ content: 'Only the server owner can use this command', ephemeral: true });
            }

            const channel = options.getChannel('channel');
            let guildData = await Guild.findOne({ where: { id: guild.id } });

            if (!guildData) {
                guildData = new Guild({ id: guild.id });
            }

            if (!channel) {
                guildData.welcomeChannelId = null;
                await guildData.save();
                await interaction.editReply({ content: 'Disabled the welcome message system', ephemeral: true });
            } else {
                guildData.welcomeChannelId = channel.id;
                await guildData.save();
                await interaction.editReply({ content: `Set the channel for welcome message to ${channel}`, ephemeral: true });
            }
        } catch (error) {
            console.error('Error updating guild data:', error);
            await interaction.editReply({ content: 'An error occurred while updating guild data', ephemeral: true });
        }
    },
};
