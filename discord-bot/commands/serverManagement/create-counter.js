const { SlashCommandBuilder, ChannelType, PermissionsBitField } = require('discord.js');
const Guild = require('../../models/guild');
const dotenv = require('dotenv');
dotenv.config();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('create-counter')
        .setDescription('Create or update member count voice channels'),

    async execute(interaction) {
        const guild = interaction.guild;

        if (interaction.user.id !== process.env.BOT_OWNER) {
            return interaction.reply({
                content: 'You are not authorized to use this command.'
            });
        }

        try {
            await guild.members.fetch();
            const memberCount = guild.members.cache.size;

            let guildData = await Guild.findOne({ where: { id: guild.id } });
            if (!guildData) {
                guildData = new Guild({ id: guild.id });
            }

            if (guildData.memberCountChannelId) {
                const existingChannel = guild.channels.cache.get(guildData.memberCountChannelId);
                if (existingChannel) {
                    await existingChannel.setName(`Members: ${memberCount}`);
                    console.log(`Updated channel: ${existingChannel.name} to 'Members: ${memberCount}'`);
                    return interaction.reply({ content: `The member count channel was updated: <#${existingChannel.id}>`, ephemeral: true });
                }
            }

            const channel = await guild.channels.create({
                name: `Members: ${memberCount}`,
                type: ChannelType.GuildVoice,
                position: 0,
                permissionOverwrites: [
                    {
                        id: guild.id,
                        deny: [PermissionsBitField.Flags.Connect],
                    },
                ],
            });

            guildData.memberCountChannelId = channel.id;
            await guildData.save();

            console.log(`Created new channel: ${channel.name} with ID: ${channel.id}`);
            interaction.reply({ content: `A new locked voice channel has been created: <#${channel.id}>`, ephemeral: true });
        } catch (error) {
            console.error('Error creating/updating channel:', error);
            interaction.reply({ content: 'There was an error creating the member count channel.', ephemeral: true });
        }
    },
};
