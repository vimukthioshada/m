const axios = require('axios');
const config = require('../config')
const { cmd, commands } = require('../command')
const { getBuffer, getGroupAdmins, getRandom, h2k, isUrl, Json, runtime, sleep, fetchJson, fetchApi} = require('../lib/functions');
const fg = require('api-dylux');
const fetch = require('node-fetch');
var os = require('os');
const fs = require("fs-extra");
const Cinesubz = require("../lib/cinesubz");
const cine = new Cinesubz()

const oce = "`"
const oce3 = "```"
const oce2 = '*'
const pk = "`("
const pk2 = ")`"
const { File } = require('megajs');

// =================== F U N C T I O N =====================
const { storenumrepdata } = require('../lib/nonbutton')
function formatNumber(num) {
    return String(num).padStart(2, '0');
} 

// =================== C M D =====================        const mass = await conn.sendMessage(from, { text: `${cot}\n\n${config.FOOTER}` }, { quoted: mek });

        cmd({
    pattern: "mv",
    alias: ["mvall", "search"],
    react: "🎥",
    desc: "Search movie for cinesubz.co",
    category: "movie",
    use: ".mv < Movie Name >",
    filename: __filename
},
async (conn, mek, m, { from, prefix, l, quoted, body, isCmd, command, args, q, msr, reply }) => {
    try {
        // Check if query is provided
        if (!q || q.trim() === '') {
            return await conn.sendMessage(from, { text: "*❗ Please provide a valid movie name.*" }, { quoted: mek });
        }

        // Search for movies
        const movs = await cine.search(q);
        if (!movs || !movs.movies) {
            return await reply("*❗ No movies found for the given input.*");
        }

        let s_t_1 = '';
        let numrep = [];
        const cinem = movs.movies;

        // Iterate through movies
        for (let i = 0; i < cinem.length; i++) {
            s_t_1 += ` *${formatNumber(i + 1)} ||* ${cinem[i].title.replace(/Sinhala Subtitles \| සිංහල උපසිරැසි සමඟ/g, '').replace('Sinhala Subtitle | සිංහල උපසිරැසි සමඟ', '')}\n`;
            numrep.push(`${prefix}mv_jid ${cinem[i].link}`);
        }

        if (!s_t_1) {
            return await reply("*❗ No movies found.*");
        }

        const cines = s_t_1 || "_*Results not found*_";
        const cot = `🔎 *𝖬𝖮𝖵𝖨𝖤-𝖷 𝖬𝖮𝖵𝖨𝖤 𝖲𝖤𝖠𝖱𝖢𝖧 𝖲𝖸𝖲𝖳𝖤𝖬* 🎥\n\n📲 Input: *${q}*\n\n*Cinesubz.co*\n${cines}`;

        const mass = await conn.sendMessage(from, { text: `${cot}\n\n${config.FOOTER}` }, { quoted: mek });

        const jsonmsg = {
            key: mass.key,
            numrep,
            method: 'nondecimal'
        };

        await storenumrepdata(jsonmsg);
    } catch (e) {
        console.error("Error:", e);
        await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
        reply('*❌ An Error Occurred:* ' + e.message);
    }
});

cmd({
    pattern: "mv_jid",
    react: "📽️",
    dontAddCommandList: true,
    filename: __filename
},
async(conn, mek, m,{from, prefix, l, quoted, body, isCmd, command, args, q, msr, creator, isGroup, apilink, apikey, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply}) => {
try{

let anu;
if(q.includes("cinesubz.co")){  
anu = await cine.movieDl(q)
} else return reply(msr.reject)

  
let mov = anu?.data
if(mov) {	
    
let cot = `🎬 *𝖬𝖮𝖵𝖨𝖤-𝖷 𝖬𝖮𝖵𝖨𝖤 𝖣𝖮𝖶𝖭𝖫𝖮𝖠𝖣 𝖲𝖸𝖲𝖳𝖤𝖬* 🎬


   🎞️ ${oce2}ᴛɪᴛʟᴇ :${oce2} ${mov.title}
   📅 ${oce2}ʀᴇʟᴇᴀsᴇ ᴅᴀᴛᴇ :${oce2} ${mov.date}
   ⏱ ${oce2}ᴅᴜᴀʀᴀᴛɪᴏɴ :${oce2} ${mov.duration || mov.runtime}
   🖇️ ${oce2}ᴍᴏᴠɪᴇ ʟɪɴᴋ :${oce2} ${q}

▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃


*${formatNumber(1)} ||* SEND INBOX
`
  
  let numrep = []
	
	numrep.push(`${prefix}mv_go ${q}🎈${from}`)                 

for (let j = 0 ; j < config.JIDS.length; j++) {
     for (let i of config.JIDS[j].split(",") ){
          cot += `*${formatNumber( j + 2)} ||* SEND JID: *${i}*
` 
              numrep.push(`${prefix}mv_go ${q}🎈${i}` )
}}

  
 const mass = await conn.sendMessage(from, { text: `${cot}
 
${config.FOOTER}`,
					    
contextInfo: {
externalAdReply: { 
title: mov.title,
body: config.BODY,
mediaType: 1,
sourceUrl: q,
thumbnailUrl: mov.mainImage ,
renderLargerThumbnail: false
}}}, { quoted: mek });
	
          const jsonmsg = {
            key : mass.key,
            numrep,
            method : 'nondecimal'
           }

await storenumrepdata(jsonmsg) 	 

} else return reply(msr.try)
		
} catch (e) {
await conn.sendMessage(from, { react: { text: '❌', key: mek.key } })
console.log(e)
reply('*❌ An Error Accurated:* ' + e.message)
}
})


cmd({
    pattern: "mv_go",
    react: "📽️",
    dontAddCommandList: true,
    filename: __filename
},
async(conn, mek, m,{from, prefix, l, quoted, body, isCmd, command, args, q, msr, creator, isGroup, apilink, apikey, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply}) => {
try{

	
	                        var inp = ''
				var jidx = ''	                
				var text = q
				if (q.includes('🎈')) jidx = text.split('🎈')[1]
				if (text.includes('🎈')) { inp = text.split('🎈')[0]}    
	


let anu;
let dlcmd;
let imagecmd;
	
if(q.includes("cinesubz.co")){  
anu = await cine.movieDl(inp)
dlcmd = 'cinedl'
} else return reply(msr.reject)

const move = anu;
let mov = move?.data

	if(mov){
		
let cot = `🎬 *𝖬𝖮𝖵𝖨𝖤-𝖷 𝖬𝖮𝖵𝖨𝖤 𝖣𝖮𝖶𝖭𝖫𝖮𝖠𝖣 𝖲𝖸𝖲𝖳𝖤𝖬* 🎬


  ${oce2}▫ 🎞️ ᴛɪᴛʟᴇ :${oce2} ${mov.title}
  ${oce2}▫ 📅 ʀᴇʟᴇᴀsᴇ ᴅᴀᴛᴇ :${oce2} ${mov.date}   
  ${oce2}▫ 🌍 ᴄᴏᴜɴᴛʀʏ :${oce2} ${mov.country || 'N/A'}
  ${oce2}▫ ⏱ ᴅᴜᴀʀᴀᴛɪᴏɴ :${oce2} ${mov.duration || mov.runtime}  
  ${oce2}▫ 🖇️ ᴍᴏᴠɪᴇ ʟɪɴᴋ :${oce2} ${inp}   
  ${oce2}▫ 🎀 ᴄᴀᴛᴀɢᴏʀɪᴇs :${oce2} ${mov.category}
  ${oce2}▫ 🤵 ᴅɪʀᴇᴄᴛᴏʀ :${oce2} ${mov.director}

▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃

*${formatNumber(1)} ||* Details Card
*${formatNumber(2)} ||* Images

`
  
let numrep = []
numrep.push(`${prefix}mv_det ${q}`) 	
numrep.push(`${prefix}mv_images ${q}`) 	
	

		  mov.dl_links.forEach((movie, index) => {
				
                  cot += `*${formatNumber( index + 3 )} ||* ${movie.quality} ( ${movie.size} )
`
				
                  numrep.push(`${prefix}${dlcmd} ${movie.link}🎈${mov.title}🎈${movie.quality}🎈${movie.size}🎈${jidx}` )
                  })
                 

 const mass = await conn.sendMessage(from, { text: `${cot}
 
${config.FOOTER}` }, { quoted: mek });
	
          const jsonmsg = {
            key : mass.key,
            numrep,
            method : 'nondecimal'
           }

await storenumrepdata(jsonmsg) 

} else return reply(msr.try)
		
} catch (e) {
await conn.sendMessage(from, { react: { text: '❌', key: mek.key } })
console.log(e)
reply('*❌ An Error Accurated:* ' + e.message || JSON.stringify(e, null, 2))
}
})


// =================== D E T A I L S =====================

cmd({
    pattern: "mv_det",
    react: "📽️",
    dontAddCommandList: true,
    filename: __filename
},
async(conn, mek, m,{from, l, quoted, body, prefix, isCmd, backup, command, args, q, msr, creator, isGroup, apilink, apikey, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, isBotAdmins, isCreator ,isDev, reply}) => {
try{
	
if(!q) return await reply(msr.url)
 
  
	                        var inp = ''
				var jidx = ''	                
				var text = q
				if (q.includes('🎈')) jidx = text.split('🎈')[1]
				if (text.includes('🎈')) { inp = text.split('🎈')[0]}   


let anu;
if(q.includes("cinesubz.co")){  
anu = await cine.movieDl(inp)
} else return reply(msr.reject)

  
let mov = anu?.data	

if(mov){

var cast = ''
for (let i of mov.cast ){ 
let name = i.reall_name ? i.reall_name : i.name
cast += name + ','
}
		
const name = mov.title || ''
const date = mov.date || ''
const country = mov.country || 'N/A'
const runtime = mov.duration || mov.runtime || ''
const cat = mov.category || ''
const imdbrate = mov.imdbRate || mov.tmdbRate || ''
const imdbvote = mov.imdbVoteCount || ''
const director = mov.director || ''
	
let yt = `
🍟 _*${name}*_


🧿 ${oce}Release Date:${oce} ➜ ${date}

🌍 ${oce}Country:${oce} ➜ ${country}

⏱️ ${oce}Duration:${oce} ➜ ${runtime}

🎀 ${oce}Categories:${oce} ➜ ${cat}

⭐ ${oce}IMDB:${oce} ➜ ${imdbrate}

🤵‍♂️ ${oce}Director:${oce} ➜ ${director}

🕵️‍♂️ ${oce}Cast:${oce} ➜ ${cast}

▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃

  


`	
const jid = jidx || from
let movImg; 

if(q.includes("cinesubz.co/movies")){  
movImg = mov.mainImage.replace("fit=", "fit") || mov.images[0] || mov.image || config.LOGO
} else if(q.includes("sinhalasub.lk/movies")){
movImg = mov.images[0] || mov.image || config.LOGO
} else if(q.includes("firemovies")){
movImg = mov.images[0] || mov.mainImage || config.LOGO
}
	
await conn.sendMessage(jid ,  { image : { url : movImg  } , caption : yt + `${config.CAPTION}` })

if (jidx === from) { 
await conn.sendMessage(from, { react: { text: '✔', key: mek.key } }) 
} else {
await conn.sendMessage(from, { text : 'Details Card Sended ✔' }, { quoted: mek }) 
await conn.sendMessage(from, { react: { text: '✔', key: mek.key } })	
}

} else reply(msr.try)
	
} catch (e) {
await conn.sendMessage(from, { react: { text: '❌', key: mek.key } })
console.log(e)
reply('*❌ An Error Accurated:* ' + e.message)
}
})

// ===================  D O W N L O A D =====================
// =================== CINESUBZ =====================
cmd({
    pattern: "cinedl",
    react: "⬆",
    dontAddCommandList: true,
    filename: __filename
},
async(conn, mek, m,{from, prefix, backup, quoted, body, isCmd, command, args, q, msr, creator, isGroup, apilink, apikey, sender, senderNumber, botNumber2, botNumber, pushname, isMe, form, isOwner, groupMetadata, groupName, isBotAdmins, isAdmins, reply}) => {
try{
	
	
if (!q) return reply("❗ *Please give me valid link*")	
	
                                var typ = ''
				var jidx = ''
				var inp = ''
				var nmf = ''
				var size = ''
			        var quality = ''
				var text = q
				if (q.includes('🎈')) nmf = text.split('🎈')[1]
				if (text.includes('🎈')) { inp = text.split('🎈')[0]
                                                      quality =  text.split('🎈')[2]
							size =  text.split('🎈')[3]
							jidx =  text.split('🎈')[4]}


if (!inp) return await conn.sendMessage(from, { text: "*An error occurred 🧑‍🎨❌*"}, { quoted : mek })	

if(size.includes('GB')) {
size = size.replace('GB' ,'')
if ( size > config.MAX_SIZE_GB || size == config.MAX_SIZE_GB) return await reply(`*The file is too large to download ⛔*\n*Use this link to download the movie. ❗*\n\n` +  down)	
} else if(size.includes('MB')) {
size = size.replace('MB' ,'')
if ( size > config.MAX_SIZE || size == config.MAX_SIZE) return await reply(`*The file is too large to download ⛔*\n*Use this link to download the movie. ❗*\n\n` +  down)	
}
	
const anu = await cine.download(inp)
const down = anu.result.gdrive || inp	
	
if(anu.result.gdrive !== "null") {	
			
const dlk = anu.result.gdrive
var dl_link = dlk
if(dlk.includes("https://drive.usercontent.google.com/")) dl_link = dlk.replace("https://drive.usercontent.google.com/", "https://drive.google.com/");
const up_mg = await conn.sendMessage(from, { text : 'Uploading Your Request Video..⬆' }, {quoted: mek})
		
let res = await fg.GDriveDl(dl_link)
const jid = jidx ? jidx : from
const f_name = nmf ? nmf : res.fileName
var ext = ''
if(res.mimetype == "video/mkv") { ext = "mkv"
} else { ext = "mp4" }

const mvdoc = await conn.sendMessage( jid , { 
		document : { url : res.downloadUrl } , 
		fileName: `${f_name}.` + ext  , 
		mimetype: res.mimetype, 
		caption: f_name + `\n${pk} ${quality} ${pk2}


` + config.CAPTION
	})		
	
await conn.sendMessage(from, { delete: up_mg.key })
	
} else if (anu.result.direct !== "null") {
				
const up_mg = await conn.sendMessage(from, { text : 'Uploading Your Request Video..⬆' }, {quoted: mek})
const bufferdata = await getBuffer( anu.result.direct )	
	
	const { default: fileType } = await import('file-type');
	const type = await fileType.fromBuffer(bufferdata);
	const mime = type ? type.mime : 'video/mp4';
	let ext = mimeType.extension(mime);
        const jid = jidx || from
    
	const mvdoc = await conn.sendMessage( jid , { 
		document : bufferdata , 
		fileName: `${nmf}.` + ext  , 
		mimetype: mime, 
		caption: nmf + `\n${pk} ${quality} ${pk2}


` + config.CAPTION
	})


await conn.sendMessage(from, { delete: up_mg.key })

	
} else if (anu.result.mega !== "null") {

        const up_mg = await conn.sendMessage(from, { text : 'Uploading Your Request Video..⬆' }, {quoted: mek})
        const file = File.fromURL(anu.result.mega)
        await file.loadAttributes()
	const data = await file.downloadBuffer();
        const jid = jidx ? jidx : from
	
            await conn.sendMessage(jid, { 
		    document: data, 
		    mimetype: "video/mp4", 
		    fileName: `${nmf}.mp4`, 
		    caption: nmf + ` ${pk} ${quality} ${pk2}
      
` + config.CAPTION
	    }); 
	
await conn.sendMessage(from, { delete: up_mg.key })
	
} else return reply(msr.try)

	
if (jidx === from) { 	
await conn.sendMessage(from, { react: { text: '✔', key: mek.key } }) 
} else {
await conn.sendMessage(from, { text : 'File Send Succesfull ✔' }, { quoted: mek }) 
await conn.sendMessage(from, { react: { text: '✔', key: mek.key } })	
}

	
} catch (e) {
await conn.sendMessage(from, { react: { text: '❌', key: mek.key } })
console.log(e)
reply('*❌ An Error Accurated:* ' + e.message)
}
})

// =================== I M A G E S =====================
cmd({
    pattern: "mv_images",
    react: "📽",
    dontAddCommandList: true,
    filename: __filename
},
async(conn, mek, m,{from, l, quoted, body, prefix, isCmd, command, args, q, msr, creator, isGroup, apikey, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, isBotAdmins, isCreator ,isDev, isAdmins, reply}) => {
try{

				
	
	
	                        var inp = ''
				var jidx = ''	                
				var text = q
				if (q.includes('🎈')) jidx = text.split('🎈')[1]
				if (text.includes('🎈')) { inp = text.split('🎈')[0]}   


const input = inp ? inp : q
let anu;
if(q.includes("cinesubz.co")){  
anu = await cine.movieDl(input)
} else return reply(msr.reject)

let jid = jidx || from
let mov = anu?.data?.images
if(mov){
if(mov.length < 0) return reply(msr.not_fo)
for(let i of mov){
   await conn.sendMessage(jid, { image: { url: i }, caption: config.CAPTION })
}
	
} else reply(msr.try)
	
} catch (e) {	
await conn.sendMessage(from, { react: { text: '❌', key: mek.key } })
await conn.sendMessage(from, { text: msr.err }, { quoted : mek })
console.log(e)
await conn.sendMessage(creator, { text: `❌ *Error Accurated !!*\n\n${e}` + '' }, { quoted : mek })
}
})
