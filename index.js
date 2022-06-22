const qrcode = require('qrcode-terminal');
const { Client, LocalAuth, Buttons, List } = require('whatsapp-web.js');
const { lfgxup, waitFor } = require('./handlers');
require('dotenv').config();


/* User settings */

const timer = process.env.TIMER //In seconds
const groupName = process.env.WHATSAPP_GROUPNAME;



/* Initialisation and authentication */
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: { headless: true }
});

client.on('qr', qr => {
    qrcode.generate(qr, { small: true });
});

client.on('authenticated', () => {
    console.log('AUTHENTICATED');
});

client.on('auth_failure', msg => {
    // Fired if session restore was unsuccessful
    console.error('AUTHENTICATION FAILURE', msg);
});

client.on('ready', () => {
    console.log('Client is ready!');
});

client.initialize();


/* Main section of code */
let playerList = []
client.on('message_create', async msg => {
    console.log('MESSAGE RECEIVED', msg);
    if (msg.type === 'list_response') {
        const contact = await msg.getContact();
        const name = contact.pushname
        playerList.push(name)
        console.log("playerlist: ", playerList)
    }

    if (msg.body === '!ping') {
        // Send a new message as a reply to the current one
        msg.reply('pong');
    } else if (msg.body === '!help') {
        const commandsToSend = '*🤖--BAMBOO BOT--🤖*\nCommand List:\n-*!ping*--pong\n-*!groupinfo*--Provides information about group chat.\n-*!lfg*--Starts the team building process\n-*!x*--Used to signify you want to play this session.'
        let chat = await msg.getChat();
        client.sendMessage(chat.id._serialized, '*🤖--BAMBOO BOT--🤖*\nCommand List:\n-*!ping*--pong\n-*!groupinfo*--Provides information about group chat.\n-*!teams*--Starts the team building process.');

    } else if (msg.body === '!groupinfo') {
        if (chat.isGroup) {
            let chat = await msg.getChat();
            msg.reply(`
                *Group Details*
                Name: ${chat.name}
                Description: ${chat.description}
                Created At: ${chat.createdAt.toString()}
                Created By: ${chat.owner.user}
                Participant count: ${chat.participants.length}
            `);
        } else {
            msg.reply('This command can only be used in a group!');
        }
    } else if (msg.body === '!lfg') {
        // Send a new message to the same chat
        let chat = await msg.getChat();
        if (chat.isGroup) {
            client.sendMessage(chat.id._serialized, '🤖*--BAMBOO BOT--*🤖\nStarting New Session! \n\n *Reply to this message* with *!x* if your looking to play this session. The bot will do its best to split everyone into random teams.');
            await waitFor(60000)
            await client.sendMessage(chat.id._serialized, lfgxup(playerList))
            playerList = []
        } else {
            msg.reply('🤖*--BAMBOO BOT--*🤖\nThis command can only be used in a group!');
        }

    } else if (msg.body === '!x') {
        let chat = await msg.getChat();
        let quotedMessage = await msg.getQuotedMessage()
        if (chat.isGroup) {
            if (msg.hasQuotedMsg) {
                if (quotedMessage.body.includes('Starting New Session!')) {
                    const contact = await msg.getContact();
                    const name = contact.pushname
                    playerList.push(name)
                } else {
                    msg.reply('🤖*--BAMBOO BOT--*🤖\nyou need to reply to the "*Starting New Session!*" message.')
                }
            } else {
                msg.reply('🤖*--BAMBOO BOT--*🤖\nyou need to reply to the "*!lfg*" command.')
            }
        } else {

            msg.reply('🤖*--BAMBOO BOT--*🤖\nThis command can only be used in a group!');
        }
    } else if (msg.body === '!buttons') {
        let button = new Buttons('Button body', [{ body: 'bt1' }], 'title', 'footer');
        client.sendMessage(msg.from, button);
    } else if (msg.body === '!teams') {
        let chat = await msg.getChat();
        if (chat.isGroup) {
            let sections = [{ title: '', rows: [{ title: 'Join Team', description: '' }] }];
            let list = new List(`🤖*--BAMBOO BOT--*🤖\nStarting New Session! \n\n Click *Join Session* below, then click *Ready*. The bot will do its best to split everyone into random teams. Be sure to complete the above instructions within *${timer}* seconds, otherwise you will not be included in this session! \n\n _minimum of 5 people need to join (otherwise whats the point just play quads.)_`, 'Join Session', sections, 'Team Maker', 'footer');
            client.sendMessage(chat.id._serialized, list);
            await waitFor((timer * 1000))
            client.sendMessage(chat.id._serialized, '🤖*--BAMBOO BOT--*🤖\nTimes up, generating teams...')
            await waitFor(5000)
            await client.sendMessage(chat.id._serialized, lfgxup(playerList))
            playerList = []
        }
    }
})
