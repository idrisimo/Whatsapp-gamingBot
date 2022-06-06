const qrcode = require('qrcode-terminal');
const { Client, LocalAuth } = require('whatsapp-web.js');
const { lfgxup } = require('./handlers');

const waitFor = (time) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => resolve(true), time);
    });
  };


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


let playerList = []
let startTime = ''
let timerIsArmed = false

client.on('message_create', async msg => {
    console.log('MESSAGE RECEIVED', msg);

    if (msg.body === '!ping') {
        // Send a new message as a reply to the current one
        msg.reply('pong');

    } else if (msg.body === '!help') {
        let chat = await msg.getChat();
        client.sendMessage(chat.id._serialized, '*--Bamboo Bot--*\nCommand List:\n-*!ping*--pong\n-*!groupinfo*--Provides information about group chat.\n-*!lfg*--Starts the team building process\n-*!x*--Used to signify you want to play this session.');

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
            startTime = msg.timestamp
            timerIsArmed = true
            client.sendMessage(chat.id._serialized, '🤖*--BAMBOO BOT--*🤖\nStarting New Session! \n\n *Reply to this message* with *!x* if your looking to play this session. The bot will do its best to split everyone into random teams.');
            await waitFor(15000)
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
    }
})



while(timerIsArmed) {
    console.log(startTime, startTime + 10)
    const currentTime = new Date()
    const currentTimeEpoch = Math.round(currentTime.getTime() / 1000)
    if(currentTimeEpoch == startTime + 10) {
        console.log('timer up')
        timerIsArmed = false
    }
}
