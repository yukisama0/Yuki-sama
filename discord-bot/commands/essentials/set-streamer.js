const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const Guild = require('../../models/guild');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('set-streamer')
        .setDescription('Set the streamer')
        .addStringOption(option => option
            .setName('username')
            .setDescription('Name of the streamer')
            .setRequired(true)
        )
        .addChannelOption(option => option
            .setName('channel')
            .setDescription('Channel to send the streaming message in')
            .addChannelTypes(ChannelType.GuildText)
            .setRequired(true)
        )
        .addRoleOption(option => option
            .setName('role')
            .setDescription('Role to ping in the streaming message')
            .setRequired(true)
        )
        .addStringOption(option => option
            .setName('embed-color')
            .setDescription('Embed color default: #6400ff')
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

            const username = options.getString('username');
            const channel = options.getChannel('channel');
            const role = options.getRole('role');
            const embedColor = options.getString('embed-color');
            let guildData = await Guild.findOne({ where: { id: guild.id } });

            if (!guildData) {
                guildData = new Guild({ id: guild.id });
            }

            if (username) {
                guildData.twitchUsername = username;
            } else {
                guildData.twitchUsername = null;
            }

            if (channel) {
                guildData.twitchChannelId = channel.id;
            } else {
                guildData.twitchChannelId = null;
            }

            if (role) {
                guildData.twitchRoleId = role.id;
            } else {
                guildData.twitchRoleId = null;
            }

            if (embedColor) {
                guildData.twitchEmbedColor = embedColor;
            } else {
                guildData.twitchEmbedColor = '#6400ff';
            }

            await guildData.save();
            await interaction.editReply({ content: `Streamer settings updated successfully`, ephemeral: true });
        } catch (error) {
            console.error('Error updating guild data:', error);
            await interaction.editReply({ content: 'An error occurred while updating guild data', ephemeral: true });
        }
    },
};
