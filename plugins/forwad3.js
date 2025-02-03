const { cmd } = require('../command'); // Adjust path if necessary
const { generateWAMessageFromContent, generateForwardMessageContent, getContentType } = require('@whiskeysockets/baileys'); // Ensure Baileys library is available

cmd({
    pattern: "forward3",
    desc: "Forward any message (text, images, videos, voice notes, etc.) to a specified JID.",
    react: "🔁",
    category: "main",
    filename: __filename,
}, async (conn, mek, m, { from, quoted, body, args, isGroup, reply }) => {
    try {
        // Check if a target JID is provided
        const targetJid = args[0];
        if (!targetJid) return reply("❌ Please provide a valid JID to forward the message.");

        // Check if there's a message to forward
        if (!quoted) return reply("❌ Please reply to a message that you want to forward.");

        let messageContent = quoted.message;

        // Handle view-once messages
        if (messageContent?.viewOnceMessage) {
            messageContent = messageContent.viewOnceMessage.message;
            const viewOnceType = Object.keys(messageContent)[0];
            delete messageContent[viewOnceType].viewOnce;
        }

        // Generate forward message content
        const forwardContent = generateForwardMessageContent(messageContent, false);
        const contentType = getContentType(forwardContent);

        // Prepare message with context info if needed
        const waMessage = generateWAMessageFromContent(targetJid, forwardContent, {
            ...forwardContent[contentType],
            contextInfo: {
                ...(quoted.key.participant ? { participant: quoted.key.participant } : {}),
                ...(quoted.key.remoteJid ? { remoteJid: quoted.key.remoteJid } : {}),
            },
        });

        // Relay the message to the target JID
        await conn.relayMessage(targetJid, waMessage.message, { messageId: waMessage.key.id });
        reply(`✅ Message successfully forwarded to ${targetJid}`);

    } catch (e) {
        console.error("Error forwarding message:", e);
        reply("❌ Failed to forward the message. Ensure the JID and message type are correct.");
    }
});
