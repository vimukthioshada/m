const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  jidNormalizedUser,
  getContentType,
  generateForwardMessageContent,
    generateWAMessageFromContent,
  fetchLatestBaileysVersion,
  prepareWAMessageMedia,
  Browsers,
  proto
} = require('@whiskeysockets/baileys');



const { getBuffer, getGroupAdmins, getRandom, h2k, isUrl, Json, runtime, sleep, fetchJson } = require('./lib/functions');
const fs = require('fs');
const P = require('pino');
const config = require('./config');
const qrcode = require('qrcode-terminal');
const util = require('util');
const { sms, downloadMediaMessage } = require('./lib/msg');
const axios = require('axios');
const { File } = require('megajs');
const NodeCache = require('node-cache')
const googleTTS = require("google-tts-api");
const prefix = config.PREFIX;
const mode = config.MODE || "private";

const msgRetryCounterCache = new NodeCache()
const ownerNumber = '94755773910' // [config.OWNER_NUMBER];
const { mongodb_connection_start, start_numrep_process, upload_to_mongodb, get_data_from_mongodb, storenumrepdata, getstorednumrep } = require('./lib/nonbutton')

//===================SESSION============================
if (!fs.existsSync(__dirname + '/auth_info_baileys/creds.json')) {
    if (config.SESSION_ID) {
      const sessdata = config.SESSION_ID.replace("NEBULA=", "")
      const filer = File.fromURL(`https://mega.nz/file/${sessdata}`)
      filer.download((err, data) => {
        if (err) throw err
        fs.writeFile(__dirname + '/auth_info_baileys/creds.json', data, () => {
          console.log("Session download completed !!")
        })
      })
    }
  }
// <<==========PORTS===========>>
const express = require("express");
const app = express();
const port = process.env.PORT || 8000;
//====================================
async function connectToWA() {
    const {
        version,
        isLatest
    } = await fetchLatestBaileysVersion()
    console.log(`using WA v${version.join('.')}, isLatest: ${isLatest}`)
    const {
        state,
        saveCreds
    } = await useMultiFileAuthState(__dirname + '/auth_info_baileys/')
    const conn = makeWASocket({
        logger: P({
            level: "fatal"
        }).child({
            level: "fatal"
        }),
        printQRInTerminal: true,
        generateHighQualityLinkPreview: true,
        auth: state,
        defaultQueryTimeoutMs: undefined,
        msgRetryCounterCache
    })

 conn.ev.on('connection.update', async (update) => {
        const {
            connection,
            lastDisconnect
        } = update
        if (connection === 'close') {
            if (lastDisconnect.error.output.statusCode !== DisconnectReason.loggedOut) {
                connectToWA()
            }
        } else if (connection === 'open') {

            console.log('Installing plugins 🔌... ')
            const path = require('path');
            fs.readdirSync("./plugins/").forEach((plugin) => {
                if (path.extname(plugin).toLowerCase() == ".js") {
                    require("./plugins/" + plugin);
                }
            });
            console.log('Plugins installed ✅')
            console.log('Bot connected ✅')
            await conn.sendMessage("94755773910@s.whatsapp.net", {
                text: "Connected to whatsapp"
            })
        }
    })


conn.ev.on('creds.update', saveCreds)  
    
conn.getstorednumrep = async (quotedid, jid, num,conn,mek) => { 
  return await getstorednumrep(quotedid, jid, num,conn,mek);
        };
    
conn.ev.on('messages.upsert', async(mek) => {
mek = mek.messages[0]
if (mek.key && mek.key.remoteJid === 'status@broadcast' && config.AUTO_READ_STATUS === "true"){
      await conn.readMessages([mek.key])
    }
  if (mek.key && mek.key.remoteJid === 'status@broadcast' && config.AUTO_READ_STATUS === "true"){
    const emojis = ['🧩', '🍉', '💜', '🌸', '🪴', '💊', '💫', '🍂', '🌟', '🎋', '😶‍🌫️', '🫀', '🧿', '👀', '🤖', '🚩', '🥰', '🗿', '💜', '💙', '🌝', '🖤', '💚'];
    const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
    await conn.sendMessage(mek.key.remoteJid, {
      react: {
        text: randomEmoji,
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
              
            } else if (type == 'interactiveResponseMessage' ) {
              body = mek.message.interactiveResponseMessage  && mek.message.interactiveResponseMessage.nativeFlowResponseMessage && JSON.parse(mek.message.interactiveResponseMessage.nativeFlowResponseMessage.paramsJson) && JSON.parse(mek.message.interactiveResponseMessage.nativeFlowResponseMessage.paramsJson).id;
           
            } else if (type == 'templateButtonReplyMessage' ) {
              body = mek.message.templateButtonReplyMessage && mek.message.templateButtonReplyMessage.selectedId;
              
            } else if (type === 'extendedTextMessage') {
              body = mek.message.extendedTextMessage.text;
              
            } else if  (type == 'imageMessage' && mek.message.imageMessage  && mek.message.imageMessage.caption) {
              body = mek.message.imageMessage.caption;
              
            } else if (type == 'videoMessage' && mek.message.videoMessage && mek.message.videoMessage.caption) {
              body = mek.message.videoMessage.caption 
            } else {
            body = '';
            } 
  

const args = body.trim().split(/ +/).slice(1)
const q = args.join(' ')
const isGroup = from.endsWith('@g.us')
const sender = mek.key.fromMe ? (conn.user.id.split(':')[0]+'@s.whatsapp.net' || conn.user.id) : (mek.key.participant || mek.key.remoteJid)
const senderNumber = sender.split('@')[0]
const botNumber = conn.user.id.split(':')[0]
const pushname = mek.pushName || 'Sin Nombre'
const isMe = botNumber.includes(senderNumber)
const isOwner = ownerNumber.includes(senderNumber) || isMe
const botNumber2 = await jidNormalizedUser(conn.user.id);
const groupMetadata = isGroup ? await conn.groupMetadata(from).catch(e => {}) : ''
const groupName = isGroup ? groupMetadata.subject : ''
const participants = isGroup ? await groupMetadata.participants : ''
const groupAdmins = isGroup ? await getGroupAdmins(participants) : ''
const isBotAdmins = isGroup ? groupAdmins.includes(botNumber2) : false
const isAdmins = isGroup ? groupAdmins.includes(sender) : false
const isReact = m.message.reactionMessage ? true 

const isCmd = body.startsWith(prefix)
const command = isCmd ? body.slice(prefix.length).trim().split(' ').shift().toLowerCase() : ''
  
            conn.sendMsg = async (jid, teks, quoted) => {
            return await conn.sendMessage(jid, { text: teks }, { quoted: quoted } );
            }
      
            conn.storenumrepdata = async (json) => {
            return await storenumrepdata(json);
            };    

            
        
conn.copyNForward = async (jid, message, forceForward = false, options = {}) => {
  let vtype;
  if (options.readViewOnce) {
    message.message =
      message.message && message.message.ephemeralMessage && message.message.ephemeralMessage.message
        ? message.message.ephemeralMessage.message
        : message.message || undefined;
    vtype = Object.keys(message.message.viewOnceMessage.message)[0];
    delete message.message?.ignore;
    delete message.message.viewOnceMessage.message[vtype].viewOnce;
    message.message = { ...message.message.viewOnceMessage.message };
  }

  let mtype = Object.keys(message.message)[0];
  let content = await generateForwardMessageContent(message, forceForward);
  let ctype = Object.keys(content)[0];
  let context = {};
  if (mtype != 'conversation') context = message.message[mtype].contextInfo;
  content[ctype].contextInfo = { ...context, ...content[ctype].contextInfo };

  const waMessage = await generateWAMessageFromContent(
    jid,
    content,
    options
      ? {
          ...content[ctype],
          ...options,
          ...(options.contextInfo
            ? { contextInfo: { ...content[ctype].contextInfo, ...options.contextInfo } }
            : {}),
        }
      : {}
  );
  await conn.relayMessage(jid, waMessage.message, { messageId: waMessage.key.id });
  return waMessage;
}


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

  
const msrGet = await fetch(`https://raw.githubusercontent.com/DarkYasiya1/DEMON-DATABASE/refs/heads/main/MEDIA/LANGUAGE/movie-x.json`)     
const msr = (await msrGet.json()).replyMsg
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
if(!isOwner && config.MODE === "private") return
if(!isOwner && isGroup && config.MODE === "inbox") return
if(!isOwner && isGroup && config.MODE === "groups") return
//==================================================
// Function to send a button message

  // Function to send a button message
const sendButtonMessage = async (jid, text, footer, buttons) => {
    const buttonMessage = {
        text: text,
        footer: footer,
        buttons: buttons,
        headerType: 1, // 1 = text-based header
    };

    // Send the button message
    await conn.sendMessage(jid, buttonMessage)
        .then(() => console.log('Button message sent successfully'))
        .catch((error) => console.error('Error sending button message:', error));
};

// Event listener for incoming messages
conn.ev.on('messages.upsert', async (m) => {
    const msg = m.messages[0];
    if (!msg.message || msg.key.fromMe) return;

    const from = msg.key.remoteJid;
    const messageContent = msg.message.conversation;

    // Trigger for the menu
    if (messageContent === 'menu1') {
        const buttons = [
            { buttonId: 'id1', buttonText: { displayText: 'Option 1' }, type: 1 },
            { buttonId: 'id2', buttonText: { displayText: 'Option 2' }, type: 1 },
            { buttonId: 'id3', buttonText: { displayText: 'Option 3' }, type: 1 },
        ];

        // Send the button menu
        await sendButtonMessage(from, 'Choose an option:', 'Your Footer Here', buttons);
    }

    // Handling button responses
    if (msg.message.buttonsResponseMessage) {
        const selectedButtonId = msg.message.buttonsResponseMessage.selectedButtonId;

        switch (selectedButtonId) {
            case 'id1':
                await conn.sendMessage(from, { text: 'You selected Option 1!' });
                break;
            case 'id2':
                await conn.sendMessage(from, { text: 'You selected Option 2!' });
                break;
            case 'id3':
                await conn.sendMessage(from, { text: 'You selected Option 3!' });
                break;
            default:
                await conn.sendMessage(from, { text: 'Invalid selection.' });
                break;
        }
    }
});
        
 
            //==================================plugin map================================
          const events = require('./command')
const cmdName = isCmd ? body.slice(1).trim().split(" ")[0].toLowerCase() : false;
if (isCmd) {
const cmd = events.commands.find((cmd) => cmd.pattern === (cmdName)) || events.commands.find((cmd) => cmd.alias && cmd.alias.includes(cmdName))
if (cmd) {
if (cmd.react) conn.sendMessage(from, { react: { text: cmd.react, key: mek.key }})

try {
cmd.function(conn, mek, m,{from, quoted, body, isCmd, command,prefix,  args, q, isGroup, sender, msr, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply});
} catch (e) {
console.error("[PLUGIN ERROR] " + e);
}
}
}
events.commands.map(async(command) => {
if (body && command.on === "body") {
command.function(conn, mek, m,{from, l, quoted, body, isCmd, prefix, command, args, q, isGroup, sender, msr, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply})
} else if (mek.q && command.on === "text") {
command.function(conn, mek, m,{from, l, quoted, body, isCmd, prefix, command, args, q, isGroup, sender, msr, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply})
} else if (
(command.on === "image" || command.on === "photo") &&
mek.type === "imageMessage"
) {
command.function(conn, mek, m,{from, l, quoted, body, isCmd, prefix, command, args, q, isGroup, sender, msr, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply})
} else if (
command.on === "sticker" &&
mek.type === "stickerMessage"
) {
command.function(conn, mek, m,{from, l, quoted, body, isCmd, prefix, command, args, q, isGroup, sender, msr, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply})
}});

})
}
app.get("/", (req, res) => {
res.send("WOLF IS ON YOUR WAY");
});
app.listen(port, () => console.log(`Server listening on port http://localhost:${port}`));
setTimeout(() => {
connectToWA()
}, 4000);
