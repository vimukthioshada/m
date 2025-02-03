const ytdl = require('ytdl-core'); // Ensure to install ytdl-core using `npm install ytdl-core`
const fs = require('fs');
const { ytsearch, ytmp3 } = require('@dark-yasiya/yt-dl.js'); // request package.json "@dark-yasiya/yt-dl.js": "latest"

const { cmd, commands } = require('../command');
const path = require('path');

cmd({
    pattern: "ytmp3",
    react: "🎵",
    alias: ["youtubeaudio", "downloadaudio"],
    desc: "Download YouTube audio as MP3",
    category: "media",
    use: '.ytmp3 <YouTube URL>',
    filename: __filename
}, async (conn, mek, m, { from, reply, args }) => {
    try {
        if (!args[0]) return reply("ඔබට YouTube සබැඳියක් ලබා දිය යුතුය!");
        const isValidUrl = ytdl.validateURL(args[0]);
        if (!isValidUrl) return reply("මෙම URL වලංගු නොවේ!");

        const info = await ytdl.getInfo(args[0]);
        const title = info.videoDetails.title.replace(/[^a-zA-Z0-9]/g, "_");
        const filePath = path.join(__dirname, `${title}.mp3`);

        reply("🎶 MP3 ඩවුන්ලෝඩ් වෙමින් පවතී...");
        
        const stream = ytdl(args[0], { filter: 'audioonly' });
        stream.pipe(fs.createWriteStream(filePath)).on('finish', async () => {
            // Button options
            const buttons = [
                { buttonId: `.ytmp3 ${args[0]}`, buttonText: { displayText: '🎧 Download Again' }, type: 1 },
                { buttonId: `.menu`, buttonText: { displayText: '📜 Menu' }, type: 1 }
            ];

            const buttonMessage = {
                text: `✅ *${info.videoDetails.title}* MP3 ලෙස සාර්ථකව ඩවුන්ලෝඩ් කරන ලදී!`,
                footer: "YouTube Downloader",
                buttons: buttons,
                headerType: 1
            };

            await conn.sendMessage(from, { 
                document: { url: filePath }, 
                mimetype: 'audio/mpeg', 
                fileName: `${title}.mp3` 
            });
            await conn.sendMessage(from, buttonMessage);
            fs.unlinkSync(filePath); // Delete file after sending
        });
    } catch (error) {
        console.error(error);
        reply("⚠️ MP3 ඩවුන්ලෝඩ් කිරීමේදී දෝෂයක් ඇතිවිය!");
    }
});

// YTMP3 DL PLUGIN
/*
Please Give Credit 🙂❤️
⚖️𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 - : ©𝐌𝐑 𝐌𝐀𝐍𝐔𝐋 𝐎𝐅𝐂 💚
*/
//===========================================

//===========================================
cmd({
    pattern: "song",
    alias: ["ytmp3", "ytsong"],
    react: "🎶",
    desc: "Download Youtube song",
    category: "download",
    use: '.song < Yt url or Name >',
    filename: __filename
},
async (conn, mek, m, { from, prefix, quoted, q, reply }) => {
    try {
        if (!q) return await reply("Please give me Yt url or Name");

        const yt = await ytsearch(q);
        if (yt.results.length < 1) return reply("Results not found!");

        let yts = yt.results[0];
        const ytdl = await ytmp3(yts.url);

        let ytmsg = `*◈ 𝐀𝐔𝐃𝐈𝐎 𝐃𝐎𝐖𝐍𝐋𝐎𝐀𝐃𝐄𝐑*
        
◈=======================◈
╭──────────────╮
┃ 🎵 \`𝙏𝙞𝙩𝙡𝙚\` : ${yts.title}
┃
┃ ⏱️ \`𝘿𝙪𝙧𝙖𝙩𝙞𝙤𝙣\` : ${yts.timestamp}
┃
┃ 📅 \`𝙍𝙚𝙡𝙚𝙖𝙨𝙚\` : ${yts.ago}
┃
┃ 📊 \`𝙑𝙞𝙚𝙬𝙨\` : ${yts.views}
┃
┃ 🔗 \`𝙇𝙞𝙣𝙠\` : ${yts.url}
╰──────────────╯

⦁⦂⦁*━┉━┉━┉━┉━┉━┉━┉━⦁⦂⦁


*🔢 Reply below number*

1 │❯❯◦ Audio File 🎶
2 │❯❯◦ Document File 📂


`;

        // Send details
        const sentMsg = await conn.sendMessage(from, { image: { url: yts.thumbnail || yts.image || '' }, caption: `${ytmsg}` }, { quoted: mek });

        conn.ev.on('messages.upsert', async (msgUpdate) => {
            const msg = msgUpdate.messages[0];
            if (!msg.message || !msg.message.extendedTextMessage) return;

            const selectedOption = msg.message.extendedTextMessage.text.trim();

            if (msg.message.extendedTextMessage.contextInfo && msg.message.extendedTextMessage.contextInfo.stanzaId === sentMsg.key.id) {
                switch (selectedOption) {
                    case '1':
                        await conn.sendMessage(from, { audio: { url: ytdl.download.url }, mimetype: "audio/mpeg" }, { quoted: mek });
                        break;

                    case '2':
                        await conn.sendMessage(from, {
                            document: { url: ytdl.download.url },
                            mimetype: "audio/mpeg",
                            fileName: yts.title + ".mp3",
                            caption: "> ᴘᴏᴡᴇʀᴅ ʙʏ ɴᴀᴠɪʏᴀ ツ"
                        }, { quoted: mek });
                        break;

                    default:
                        reply("Invalid option. Please select a valid option 💗");
                }
            }
        });

    } catch (e) {
        console.log(e);
        reply('An error occurred while processing your request.');
    }
});
