const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    getDevice,
    fetchLatestBaileysVersion,
    jidNormalizedUser,
    getContentType,
    generateWAMessageFromContent,
    prepareWAMessageMedia,
    Browsers,
    proto
} = require('@whiskeysockets/baileys');

const { getBuffer, getGroupAdmins, getRandom, h2k, isUrl, Json, runtime, sleep, fetchJson } = require('./lib/functions');
const NodeCache = require('node-cache')
const fs = require('fs');
const P = require('pino');
const config = require('./config');
const qrcode = require('qrcode-terminal');
const util = require('util');
const { sms, downloadMediaMessage } = require('./lib/msg');
const axios = require('axios');
const { File } = require('megajs');

const msgRetryCounterCache = new NodeCache()

const googleTTS = require("google-tts-api");
const prefix = config.PREFIX;
const mode = config.MODE || "private";

const ownerNumber = '94755773910' // [config.OWNER_NUMBER];
const { mongodb_connection_start, start_numrep_process, upload_to_mongodb, get_data_from_mongodb, storenumrepdata, getstorednumrep } = require('./lib/nonbutton')

//===================SESSION-AUTH============================
if (!fs.existsSync(__dirname + '/auth_info_baileys/creds.json')) {
    if (!config.SESSION_ID) return console.log('Please add your session to SESSION_ID env !!');
    const sessdata = config.SESSION_ID;
    const filer = File.fromURL(`https://mega.nz/file/${sessdata}`);
    filer.download((err, data) => {
        if (err) throw err;
        fs.writeFile(__dirname + '/auth_info_baileys/creds.json', data, () => {
            console.log("Checking Session ID ⏳");
        });
    });
}

const express = require("express");
const app = express();
const port = process.env.PORT || 8000;

//=============================================

//=============================================

async function connectToWA() {
    //============ connect mongodb====================
    const connectDB = require('./lib/mongodb')
    connectDB();
    //========================================
    const { readEnv } = require('./lib/database')
    const config = await readEnv();
    const prefix = config.PREFIX
    //=======================================
}

async function connectToWA() {

    console.log("Connecting Bot To WhatsApp 🤖");
    const { state, saveCreds } = await useMultiFileAuthState(__dirname + '/auth_info_baileys/');
    var { version } = await fetchLatestBaileysVersion();

    const conn = makeWASocket({
        logger: P({ level: 'silent' }),
        printQRInTerminal: false,
        browser: Browsers.macOS("Firefox"),
        syncFullHistory: true,
        auth: state,
        version
    });

    conn.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update
        if (connection === 'close') {
            if (lastDisconnect.error.output.statusCode !== DisconnectReason.loggedOut) {
                connectToWA()
            }
        } else if (connection === 'open') {
            console.log('Whatsapp Login Successfully ✅')
            start_numrep_process();
            const path = require('path');
            fs.readdirSync("./plugins/").forEach((plugin) => {
                if (path.extname(plugin).toLowerCase() == ".js") {
                    require("./plugins/" + plugin);
                }
            });
            console.log('Plugins installed ✅')
            console.log('Bot connected ✅')
            conn.sendMessage("1@s.whatsapp.net", {
                text: "Connected to whatsapp"
            })
        }
    })


    conn.ev.on('creds.update', saveCreds)

    conn.getstorednumrep = async (quotedid, jid, num, conn, mek) => {
        return await getstorednumrep(quotedid, jid, num, conn, mek);
    };


    //------- *STATUS AUTO REACT* ----------

    conn.ev.on('messages.upsert', async (mek) => {
        mek = mek.messages[0]
        if (mek.key && mek.key.remoteJid === 'status@broadcast' && config.AUTO_READ_STATUS === "true"){
            await conn.readMessages([mek.key])
          }
          if (
            mek.key && 
            mek.key.remoteJid === 'status@broadcast' && 
            mek.key.participant && 
            config.AUTO_READ_STATUS === "true"
        ) {
            const emoji = '💜'; // මෙතැන ඔබට අවශ්‍ය එකම එමොජියක් යොදන්න
            await conn.sendMessage(mek.key.remoteJid, {
                react: {
                    text: emoji,
                    key: mek.key,
                } 
            }, { statusJidList: [mek.key.participant] });
        
        
        }

        const m = sms(conn, mek)
        const type = getContentType(mek.message)
        const content = JSON.stringify(mek.message)
        const from = mek.key.remoteJid
        const quoted = type == 'extendedTextMessage' && mek.message.extendedTextMessage.contextInfo != null ? mek.message.extendedTextMessage.contextInfo.quotedMessage || [] : []
        const quotedid = type == 'extendedTextMessage' && mek.message.extendedTextMessage.contextInfo != null ? mek.message.extendedTextMessage.contextInfo.stanzaId || null : null

        let body;
        if (type === 'conversation') {
            body = mek.message.conversation;
        } else if (type === 'extendedTextMessage') {
            const storedNumRep = await getstorednumrep(quotedid, from, mek.message.extendedTextMessage.text, conn, mek)
            body = storedNumRep || mek.message.extendedTextMessage.text || '';

        } else if (type == 'interactiveResponseMessage') {
            body = mek.message.interactiveResponseMessage && mek.message.interactiveResponseMessage.nativeFlowResponseMessage && JSON.parse(mek.message.interactiveResponseMessage.nativeFlowResponseMessage.paramsJson) && JSON.parse(mek.message.interactiveResponseMessage.nativeFlowResponseMessage.paramsJson).id;

        } else if (type == 'templateButtonReplyMessage') {
            body = mek.message.templateButtonReplyMessage && mek.message.templateButtonReplyMessage.selectedId;

        } else if (type === 'extendedTextMessage') {
            body = mek.message.extendedTextMessage.text;

        } else if (type == 'imageMessage' && mek.message.imageMessage && mek.message.imageMessage.caption) {
            body = mek.message.imageMessage.caption;

        } else if (type == 'videoMessage' && mek.message.videoMessage && mek.message.videoMessage.caption) {
            body = mek.message.videoMessage.caption
        } else {
            body = '';
        }

        const isCmd = body.startsWith(prefix)
        const command = isCmd ? body.slice(prefix.length).trim().split(' ').shift().toLowerCase() : ''
        const args = body.trim().split(/ +/).slice(1)
        const q = args.join(' ')
        const isGroup = from.endsWith('@g.us')
        const sender = mek.key.fromMe ? (conn.user.id.split(':')[0] + '@s.whatsapp.net' || conn.user.id) : (mek.key.participant || mek.key.remoteJid)
        const senderNumber = sender.split('@')[0]
        const botNumber = conn.user.id.split(':')[0]
        const pushname = mek.pushName || 'Sin Nombre'
        const isMe = botNumber.includes(senderNumber)
        const isOwner = ownerNumber.includes(senderNumber) || isMe
        const botNumber2 = await jidNormalizedUser(conn.user.id);
        const groupMetadata = isGroup ? await conn.groupMetadata(from).catch(e => { }) : ''
        const groupName = isGroup ? groupMetadata.subject : ''
        const participants = isGroup ? await groupMetadata.participants : ''
        const groupAdmins = isGroup ? await getGroupAdmins(participants) : ''
        const isBotAdmins = isGroup ? groupAdmins.includes(botNumber2) : false
        const isAdmins = isGroup ? groupAdmins.includes(sender) : false
       
        const isAnti = (teks) => {
            let getdata = teks
            for (let i = 0; i < getdata.length; i++) {
                if (getdata[i] === from) return true
            }
            return false
        }
        const reply = async (teks) => {
            return await conn.sendMessage(from, {
                text: teks
            }, {
                quoted: mek
            })
        }
        const ownerdata = (await axios.get('https://raw.githubusercontent.com/anonymous-lll/Nebula-Uploads/main/raw.json')).data
        config.LOGO = ownerdata.imageurl
        config.BTN = ownerdata.button
        config.FOOTER = ownerdata.footer
        config.BTNURL = ownerdata.buttonurl
        conn.edit = async (mek, newmg) => {
            await conn.relayMessage(from, {
                protocolMessage: {
                    key: mek.key,
                    type: 14,
                    editedMessage: {
                        conversation: newmg
                    }
                }
            }, {})
        }



        conn.sendMsg = async (jid, teks, quoted) => {
            return await conn.sendMessage(jid, { text: teks }, { quoted: quoted });
        }

        conn.storenumrepdata = async (json) => {
            return await storenumrepdata(json);
        };



        conn.sendFileUrl = async (jid, url, caption, quoted, options = {}) => {
            let mime = '';
            let res = await axios.head(url)
            mime = res.headers['content-type']
            if (mime.split("/")[1] === "gif") {
                return conn.sendMessage(jid, { video: await getBuffer(url), caption: caption, gifPlayback: true, ...options }, { quoted: quoted, ...options })
            }
            let type = mime.split("/")[0] + "Message"
            if (mime === "application/pdf") {
                return conn.sendMessage(jid, { document: await getBuffer(url), mimetype: 'application/pdf', caption: caption, ...options }, { quoted: quoted, ...options })
            }
            if (mime.split("/")[0] === "image") {
                return conn.sendMessage(jid, { image: await getBuffer(url), caption: caption, ...options }, { quoted: quoted, ...options })
            }
            if (mime.split("/")[0] === "video") {
                return conn.sendMessage(jid, { video: await getBuffer(url), caption: caption, mimetype: 'video/mp4', ...options }, { quoted: quoted, ...options })
            }
            if (mime.split("/")[0] === "audio") {
                return conn.sendMessage(jid, { audio: await getBuffer(url), caption: caption, mimetype: 'audio/mpeg', ...options }, { quoted: quoted, ...options })
            }
        }
        conn.sendButtonMessage = async (jid, buttons, quoted, opts = {}) => {

            let header;
            if (opts?.video) {
                var video = await prepareWAMessageMedia({
                    video: {
                        url: opts && opts.video ? opts.video : ''
                    }
                }, {
                    upload: conn.waUploadToServer
                })
                header = {
                    title: opts && opts.header ? opts.header : '',
                    hasMediaAttachment: true,
                    videoMessage: video.videoMessage,
                }

            } else if (opts?.image) {
                var image = await prepareWAMessageMedia({
                    image: {
                        url: opts && opts.image ? opts.image : ''
                    }
                }, {
                    upload: conn.waUploadToServer
                })
                header = {
                    title: opts && opts.header ? opts.header : '',
                    hasMediaAttachment: true,
                    imageMessage: image.imageMessage,
                }

            } else {
                header = {
                    title: opts && opts.header ? opts.header : '',
                    hasMediaAttachment: false,
                }
            }


            let message = generateWAMessageFromContent(jid, {
                viewOnceMessage: {
                    message: {
                        messageContextInfo: {
                            deviceListMetadata: {},
                            deviceListMetadataVersion: 2,
                        },
                        interactiveMessage: {
                            body: {
                                text: opts && opts.body ? opts.body : ''
                            },
                            footer: {
                                text: opts && opts.footer ? opts.footer : ''
                            },
                            header: header,
                            nativeFlowMessage: {
                                buttons: buttons,
                                messageParamsJson: ''
                            }
                        }
                    }
                }
            }, {
                quoted: quoted
            })
            await conn.sendPresenceUpdate('composing', jid)
            await sleep(1000 * 1);
            return await conn.relayMessage(jid, message["message"], {
                messageId: message.key.id
            })
        }

        const msrGet = await fetch(`https://raw.githubusercontent.com/DarkYasiya1/DEMON-DATABASE/refs/heads/main/MEDIA/LANGUAGE/movie-x.json`)
        const msr = (await msrGet.json()).replyMsg

        //==============owner reacts==================
        if (senderNumber.includes(config.OWNER_NUMBER)) {
            if (config.AUTO_REACT === 'true') {
                const reaction = ["🪀", "💀"];
                const randomReaction = reaction[Math.floor(Math.random() * reaction.length)];
                m.react(randomReaction);  // React with a random emoji
            }
        }

        //===========================
        //======================WORKTYPE===============================
        if (!isOwner && config.MODE === "private") return
        if (!isOwner && isGroup && config.MODE === "inbox") return
        if (!isOwner && isGroup && config.MODE === "groups") return
        //==================================================



        const events = require('./command')
        const cmdName = isCmd ? body.slice(1).trim().split(" ")[0].toLowerCase() : false;
        if (isCmd) {
            const cmd = events.commands.find((cmd) => cmd.pattern === (cmdName)) || events.commands.find((cmd) => cmd.alias && cmd.alias.includes(cmdName))
            if (cmd) {
                if (cmd.react) conn.sendMessage(from, { react: { text: cmd.react, key: mek.key } })

                try {
                    cmd.function(conn, mek, m, { from, quoted, body, isCmd, command, prefix, args, q, isGroup, sender, msr, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply });
                } catch (e) {
                    console.error("[PLUGIN ERROR] " + e);
                }
            }
        }
        events.commands.map(async (command) => {
            if (body && command.on === "body") {
                command.function(conn, mek, m, { from, l, quoted, body, isCmd, prefix, command, args, q, isGroup, sender, msr, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply })
            } else if (mek.q && command.on === "text") {
                command.function(conn, mek, m, { from, l, quoted, body, isCmd, prefix, command, args, q, isGroup, sender, msr, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply })
            } else if (
                (command.on === "image" || command.on === "photo") &&
                mek.type === "imageMessage"
            ) {
                command.function(conn, mek, m, { from, l, quoted, body, isCmd, prefix, command, args, q, isGroup, sender, msr, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply })
            } else if (
                command.on === "sticker" &&
                mek.type === "stickerMessage"
            ) {
                command.function(conn, mek, m, { from, l, quoted, body, isCmd, prefix, command, args, q, isGroup, sender, msr, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply })
            }
        });

    })
}
app.get("/", (req, res) => {
    res.send("WOLF IS ON YOUR WAY");
});
app.listen(port, () => console.log(`Server listening on port http://localhost:${port}`));
setTimeout(() => {
    connectToWA()
}, 4000);
