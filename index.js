const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion, jidNormalizedUser, generateWAMessageFromContent, prepareWAMessageMedia, Browsers } = require('@whiskeysockets/baileys');

const fs = require('fs'); const P = require('pino'); const axios = require('axios'); const express = require("express"); const app = express(); const port = process.env.PORT || 8000; const config = require('./config'); const { fetchJson } = require('./lib/functions'); const { googleTTS } = require("google-tts-api"); const ownerNumber = config.OWNER_NUMBER;

async function connectToWA() { console.log("Connecting Bot To WhatsApp 🤖"); const { state, saveCreds } = await useMultiFileAuthState(__dirname + '/auth_info_baileys/'); const { version } = await fetchLatestBaileysVersion();

const conn = makeWASocket({
    logger: P({ level: 'silent' }),
    printQRInTerminal: true,
    browser: Browsers.macOS("Firefox"),
    syncFullHistory: true,
    auth: state,
    version
});

conn.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === 'close') {
        if (lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut) {
            connectToWA();
        }
    } else if (connection === 'open') {
        console.log('WhatsApp Bot Connected ✅');
    }
});

conn.ev.on('creds.update', saveCreds);

conn.ev.on('messages.upsert', async (m) => {
    const message = m.messages[0];
    if (!message.message) return;
    const from = message.key.remoteJid;
    const body = message.message.conversation || "";
    const isCmd = body.startsWith(config.PREFIX);
    const command = isCmd ? body.slice(config.PREFIX.length).trim().split(/ +/).shift().toLowerCase() : "";
    const args = body.trim().split(/ +/).slice(1);
    const q = args.join(" ");

    if (isCmd) {
        let buttons = [];
        let buttonText = "";
        let responseText = "";
        switch (command) {
            case 'tiktok':
                responseText = "TikTok Video Download";
                buttons = [{ buttonId: `download_tiktok ${q}`, buttonText: { displayText: "Download" }, type: 1 }];
                break;
            case 'fb':
                responseText = "Facebook Video Download";
                buttons = [{ buttonId: `download_fb ${q}`, buttonText: { displayText: "Download" }, type: 1 }];
                break;
            case 'yt':
                responseText = "YouTube Video Download";
                buttons = [{ buttonId: `download_yt ${q}`, buttonText: { displayText: "Download" }, type: 1 }];
                break;
            case 'ping':
                responseText = "Pong! 🏓";
                break;
            case 'ai':
                const aiResponse = await fetchJson(`https://api.some-ai.com/chat?q=${q}`);
                responseText = aiResponse.answer;
                break;
            case 'tts':
                const audioUrl = googleTTS.getAudioUrl(q, { lang: 'en', slow: false });
                await conn.sendMessage(from, { audio: { url: audioUrl }, mimetype: 'audio/mp4' }, { quoted: message });
                return;
            default:
                responseText = "Unknown command. Use .help for available commands.";
        }
        
        const buttonMessage = {
            text: responseText,
            footer: "Select an option:",
            buttons: buttons,
            headerType: 1
        };
        await conn.sendMessage(from, buttonMessage, { quoted: message });
    }
});

}

app.get("/", (req, res) => { res.send("Bot is Running!"); });

app.listen(port, () => console.log(Server listening on port http://localhost:${port})); setTimeout(() => { connectToWA(); }, 4000);

