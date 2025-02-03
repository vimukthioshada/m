const fs = require("fs");
const config = require("../config");
const { cmd, commands } = require("../command");
const path = require('path');

// Load dev.json to get the contact number
const devData = JSON.parse(fs.readFileSync("./lib/dev.json", "utf8"));

cmd({
    pattern: "getprivacy",
    react: "🥏",
    desc: "Get the bot Number Privacy Setting Updates",
    category: "privacy",
    use: '.getprivacy',
    filename: __filename
},
async (conn, mek, m, { from, l, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {
    try {
        if (!isOwner) return reply('🚫 *You must be an Owner to use this command*');
        const duka = await conn.fetchPrivacySettings(true);
        let puka = `🛠️  *Empire_X ᴡʜᴀᴛꜱᴀᴘᴘ ᴘʀɪᴠᴀᴄʏ ꜱᴇᴛᴛɪɴɢꜱ*  ⚙️

⚙️▕  *Read Receipt* - ${duka.readreceipts}
⚙️▕  *Profile Picture* - ${duka.profile}
⚙️▕  *Status*  - ${duka.status}
⚙️▕  *Online* - ${duka.online}
⚙️▕  *Last Seen* - ${duka.last}
⚙️▕  *Group Privacy* - ${duka.groupadd}
⚙️▕  *Call Privacy* - ${duka.calladd}

*Empire_X ᴍᴜʟᴛɪ ᴅᴇᴠɪᴄᴇ ʙᴏᴛ*`;
        await conn.sendMessage(from, { text: puka }, { quoted: mek });
    } catch (e) {
        reply('🚫 *An error occurred!*\n\n' + e);
        l(e);
    }
});

cmd({
    pattern: "updatebio",
    react: "🥏",
    desc: "Change the Bot number Bio",
    category: "privacy",
    use: '.updatebio',
    filename: __filename
},
async (conn, mek, m, { from, l, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {
    try {
        if (!isOwner) return reply('🚫 *You must be an Owner to use this command*');
        if (!q) return reply('❓ *Enter the New Bio*');
        if (q.length > 139) return reply('❗ *Sorry! Character limit exceeded*');
        await conn.updateProfileStatus(q);
        await conn.sendMessage(from, { text: "✔️ *New Bio Added Successfully*" }, { quoted: mek });
    } catch (e) {
        reply('🚫 *An error occurred!*\n\n' + e);
        l(e);
    }
});

cmd({
    pattern: "getbio",
    desc: "Displays the user's bio.",
    category: "privacy",
    filename: __filename,
}, async (conn, mek, m, { args, reply }) => {
    try {
        const jid = args[0] || mek.key.remoteJid;
        const about = await conn.fetchStatus(jid);
        return reply(`User Bio:\n\n${about.status}`);
    } catch (error) {
        console.error("Error in bio command:", error);
        reply("No bio found.");
    }
});

cmd({
    pattern: "developer",
    desc: "Sends the developer's VCard.",
    category: "privacy",
    filename: __filename,
}, async (conn, mek, m, { reply }) => {
    try {
        // Load the phone number from dev.json
        const number = devData[0]; // First number in the dev.json array
        const name = "Only_one_🥇Empire";  // VCard Name
        const info = "Empire_X";  // Profile Information

        const vcard = `BEGIN:VCARD\nVERSION:3.0\nFN:${name}\nORG:${info};\nTEL;type=CELL;type=VOICE;waid=${number}:+${number}\nEND:VCARD`; 

        await conn.sendMessage(m.chat, { contacts: { displayName: name, contacts: [{ vcard }] } }, { quoted: m });
    } catch (error) {
        console.error("Error in vcard command:", error);
        reply("An error occurred while sending VCard.");
    }
});