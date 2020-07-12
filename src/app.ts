import * as Discord from 'discord.js';
import * as dotenv from 'dotenv';
import * as moment from 'moment-timezone';
import axios from 'axios';

const axiosInstance = axios.create();

const filteredTopChatters = new Set(['streamlabs', 'ggseppuku']);
const timezonesToUse: Array<{ timezone: string; name: string }> = [
    {
        timezone: 'America/Los_Angeles',
        name: 'Los Angeles',
    },
    {
        timezone: 'America/New_York',
        name: 'New York/Toronto',
    },
    {
        timezone: 'Europe/London',
        name: 'UK',
    },
    {
        timezone: 'Europe/Lisbon',
        name: 'Portugal',
    },
    {
        timezone: 'Europe/Madrid',
        name: 'Spain',
    },
    {
        timezone: 'Europe/Athens',
        name: 'Greece',
    },
];

const emotes = {
    tripleMushroom: '<:ggsepp1up3baby:667018192362799106>',
};

dotenv.config();

const token = process.env.BOT_TOKEN;

const client = new Discord.Client();

client.on('ready', async () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

const getTopChattersEmbed = async () => {
    const res = await axiosInstance.get(
        'https://api.streamelements.com/kappa/v2/chatstats/ggseppuku/stats?limit=10',
    );
    const totalMessages: number = res.data.totalMessages;
    const chatters: Array<{
        name: string;
        amount: number;
    }> = res.data.chatters;
    const topChatters = chatters
        .filter((c) => !filteredTopChatters.has(c.name))
        .slice(0, 10);

    const embed = new Discord.MessageEmbed({
        title: 'Top Chatters',
        fields: [
            ...topChatters.map((chatter, index) => ({
                name: `${index + 1}. ${chatter.name}`,
                value: chatter.amount,
                inline: true,
            })),
            {
                name: 'Total messages',
                value: totalMessages,
                inline: true,
            },
        ],
    });
    return embed;
};

const getTimezoneEmbed = (content: string) => {
    const format = 'hh:mm a';
    const rawInput = content.split(' ')[1];

    if (rawInput) {
        const jpTime = moment.tz(rawInput, format, 'Asia/Tokyo');

        const embed = new Discord.MessageEmbed({
            title: `Japan time ${jpTime.format(format)}`,
            fields: timezonesToUse.map((timezoneEntry) => ({
                name: timezoneEntry.name,
                value: jpTime.clone().tz(timezoneEntry.timezone).format(format),
                inline: true,
            })),
        });
        return embed;
    } else {
        const jpTime = moment.tz('Asia/Tokyo').format(format);
        const embed = new Discord.MessageEmbed({
            title: `Japan time now`,
            description: jpTime,
        });
        return embed;
    }
};

client.on('message', async (msg) => {
    const { content } = msg;
    if (content.toLowerCase().startsWith('!topchat')) {
        const embed = await getTopChattersEmbed();
        return msg.channel.send(embed);
    }

    if (content.toLowerCase().startsWith('!jptime')) {
        const embed = getTimezoneEmbed(content);
        return msg.channel.send(embed);
    }

    if (content.toLowerCase().startsWith('!sushibot')) {
        return msg.channel.send(
            `Open source sushibot created for free by themetalfleece - <https://github.com/themetalfleece/ggseppuku-discord-bot>`,
        );
    }

    if (content.toLowerCase().startsWith('!tm')) {
        return msg.channel.send(
            `${emotes.tripleMushroom} Triple Mushroom Baaaabyy!! ${emotes.tripleMushroom}`,
        );
    }
});

client.login(token);
