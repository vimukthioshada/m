const axios = require('axios');
const config = require('../config')
const { cmd, commands } = require('../command')
const { getBuffer, getGroupAdmins, getRandom, h2k, isUrl, Json, runtime, sleep, fetchJson, fetchApi} = require('../lib/functions')
const fg = require('api-dylux');
var os = require('os');
const fs = require("fs-extra");
const Cinesubz = require("../lib/cinesubz");
const cine = new Cinesubz()
const apiz = 'https://api-cine-dyxt-gilt.vercel.app'
const apizkey = 'private999apikey'

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

// =================== C M D =====================
cmd({
    pattern: "ctv",
    alias: ["tvall","searchtv"],
    react: "🎥",
    desc: "Search tvshow for cinesubz.co, sinhalasub.lk, firemovies.lk",
    category: "movie",
    use: '.tv < Tvshow Name >',
    filename: __filename
},
async(conn, mek, m,{from, prefix, l, quoted, body, isCmd, command, args, q, msr, creator, isGroup, apilink, apikey, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply}) => {
try{

	
if (!q) return await conn.sendMessage(from, { text: msr.giveme }, { quoted: mek })
	
const movs = await cine.search(q);
var ty = ''
let cinem = movs?.tvshows


let numrep = []
var s_t_1 = ''
var s_t_2 = ''
var s_t_3 = ''

	if(cinem){
		
	
    
		  for (let i = 0 ; i < cinem.length; i++) {	
				
                  s_t_1 += ` *${formatNumber( i + 1 )} ||* ${cinem[i].title.replace(/Sinhala Subtitles \| සිංහල උපසිරැසි සමඟ/g , '').replace('Sinhala Subtitle | සිංහල උපසිරැසි සමඟ' , '')}
`
				
                  numrep.push(`${prefix}tv_jid ${cinem[i].link}` )
                  }
		

	
if(!s_t_1) { return await reply(msr.not_fo) }
let cines = s_t_1 || "_*Results not found*_"	

			
let cot = `🔎 *𝖬𝖮𝖵𝖨𝖤-𝖷 𝖬𝖮𝖵𝖨𝖤 𝖲𝖤𝖠𝖱𝖢𝖧 𝖲𝖸𝖲𝖳𝖤𝖬* 🎥
              

📲 ${oce}Input:${oce} *${q}*


*Cinesubz.co*
${cines}
`
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
reply('*❌ An Error Accurated:* ' + e.message)
}
})



cmd({
    pattern: "tv_jid",
    react: "📽️",
    dontAddCommandList: true,
    filename: __filename
},
async(conn, mek, m,{from, prefix, l, quoted, body, isCmd, command, args, q, msr, creator, isGroup, apilink, apikey, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply}) => {
try{

let anu;
if(q.includes("cinesubz.co/tvshows")){  
anu = await cine.tvshow(q)
} else return reply(msr.reject)

  
let mov = anu?.data
if(mov) {	
    
let cot = `📺 *𝖬𝖮𝖵𝖨𝖤-𝖷 𝖳𝖵 𝖲𝖧𝖮𝖶 𝖣𝖮𝖶𝖭𝖫𝖮𝖠𝖣 𝖲𝖸𝖲𝖳𝖤𝖬* 📺


  🎞 ${oce2}ᴛɪᴛʟᴇ :${oce2} ${mov.title || 'N/A'}
  ✨ ${oce2}ꜰɪʀꜱᴛ ᴀɪʀ ᴅᴀᴛᴇ :${oce2} ${mov.first_air_date || mov.date || 'N/A'}
  🎐 ${oce2}ʟᴀꜱᴛ ᴀɪʀ ᴅᴀᴛᴇ :${oce2} ${mov.last_air_date || 'N/A'}
  🖇️ ${oce2}ᴛᴠꜱʜᴏᴡ ʟɪɴᴋ :${oce2} ${q}


▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃

*${formatNumber(1)} ||* SEND INBOX
`
  
  let numrep = []
	
	numrep.push(`${prefix}tv_go ${q}🎈${from}`)                 

for (let j = 0 ; j < config.JIDS.length; j++) {
     for (let i of config.JIDS[j].split(",") ){
          cot += `*${formatNumber( j + 2)} ||* SEND JID: *${i}*
` 
              numrep.push(`${prefix}tv_go ${q}🎈${i}` )
}}

  
 const mass = await conn.sendMessage(from, { text: `${cot}
 
${config.FOOTER}`,
					    
contextInfo: {
externalAdReply: { 
title: mov.title,
body: config.BODY,
mediaType: 1,
sourceUrl: q,
thumbnailUrl: mov.mainImage || config.LOGO ,
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
    pattern: "tv_go",
    react: "📺",
    dontAddCommandList: true,
    filename: __filename
},
async(conn, mek, m,{from, prefix, msr, creator, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, apilink, apikey, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply}) => {
try{


	                        var inp = ''
				var jidx = ''	                
				var text = q
				if (q.includes('🎈')) jidx = text.split('🎈')[1]
				if (text.includes('🎈')) { inp = text.split('🎈')[0]}  

let anu;
let response;
var cast = '';
var mov = '';
let episodesDetails = ''	
// CINESUBZ
if(inp.includes("cinesubz.co/tvshows")){  
response = await fetchJson(`${apiz}/api/cinesubz/tvshow?url=${inp}&apikey=${apizkey}`);
mov = response.data.data;
	
for (let i = 0; i < mov.moviedata.castDetails.cast.length; i++) {
  cast += mov.moviedata.castDetails.cast[i].actor.name + ','
}

episodesDetails = response.data.data.episodesDetails;

} else return reply(msr.reject)



    let numrep = []
    let seasonMsg = '';
    const formattedEpisodes = episodesDetails.flatMap((season) => {
      const seasonHeader = `${season.season.number}.1 ${prefix}${cmd} ${q}🎈${season.season.number}`; // Format the "All" entry
      numrep.push(`${season.season.number}.1 ${prefix}${cmd} ${q}🎈${season.season.number}`)
      seasonMsg += `\n*${season.season.number}.1 ||* All Episodes\n`
      const episodes = season.episodes.map((episode, index) => {
        const seasonNumber = season.season.number; // Season number
        const episodeNumber = index + 1; // Episode number (incremental index)
        const formattedNumber = `${seasonNumber}.${episodeNumber + 1}`; // Format as "1.2", "1.3", etc.
        seasonMsg += `*${formattedNumber} ||* Season ${season.season.number} Episode ${episodeNumber}\n`
        numrep.push(`${formattedNumber} ${prefix}epi_go ${episode.url}🎈${jidx}`)
        return `${formattedNumber} ${prefix}epi_go ${episode.url}🎈${jidx}`;
      });
      return [seasonHeader, ...episodes];
    });




	
const title = mov.mainDetails ? mov.mainDetails.maintitle : mov.title ? mov.title : 'N/A'
const genres = mov.mainDetails ? mov.mainDetails.genres : mov.category ? mov.category : 'N/A'
	
const output = `*📺𝖬𝖮𝖵𝖨𝖤-𝖷 𝖳𝖵 𝖲𝖧𝖮𝖶 𝖣𝖮𝖶𝖭𝖫𝖮𝖠𝖣 𝖲𝖸𝖲𝖳𝖤𝖬📺*


*│ 🎞️ ᴛɪᴛʟᴇ :* ${title}

*│ 🔮 ᴄᴀᴛᴀɢᴏʀɪᴇs :* ${genres}

*│ 🕵️‍♂️ ᴄʜᴀʀᴀᴄᴛᴇʀs :* ${cast}

▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃

${seasonMsg}

${config.FOOTER}
`
const image = mov.mainDetails ? mov.mainDetails.imageUrl : mov.mainImage ? mov.mainImage : config.LOGO;
	
	
            const mass = await conn.sendMessage(from, { image: { url :  image }, caption: output }, { quoted: mek });
            const jsonmsg = {
             key : mass.key,
             numrep,
             method : 'decimal'
            }

	
await storenumrepdata(jsonmsg)
	
 } catch (e) {
await conn.sendMessage(from, { react: { text: '❌', key: mek.key } })
console.log(e)
reply('*❌ An Error Accurated:* ' + e.message)
}
})


cmd({
    pattern: "epi_dl",
    react: "📺",
    dontAddCommandList: true,
    filename: __filename
},
async(conn, mek, m,{from, prefix, msr, creator, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, apilink, apikey, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply}) => {
try{

var numrep = []

	                        var inp = ''
				var jidx = ''
	                        var sid = ''
				var text = q
				if (q.includes('🎈')) jidx = text.split('🎈')[1]
				if (text.includes('🎈')) { inp = text.split('🎈')[0]
							sid = text.split('🎈')[2]}  


	

let cmd;
var cast = '';
var mov = '';
var ssn = '';
var response = '';
	
if(inp.includes("cinesubz.co/tvshows")){  
cmd = 'cine_eps_dl';
response = await fetchApi(`${apiz}/api/cinesubz/tvshow?url=${inp}&apikey=${apizkey}`)
mov = response.data.data;  
ssn = mov.episodesDetails[sid - 1].episodes
for (let i = 0; i < mov.moviedata.castDetails.cast.length; i++) {
  cast += mov.moviedata.castDetails.cast[i].actor.name + ','
}

	
} else return reply(msr.reject)

		
let epi_num = '';
	
  ssn.forEach((episode, i) => {

   var episodeNumber = episode.number.replace(' - ', '.');
   var episodeNumbers = episode.number.replace(' - ', '.');
   var ep_2 = episodeNumber.includes('.') ? episodeNumber.split('.') : ''
   if((ep_2[1] + '').length == 1 ) ep_2[1] = '0' + ep_2[1]
   episodeNumbers = ep_2[0] + '.' + ep_2[1]	 
   episodeNumber = ep_2[1] 
    epi_num += `*1.${i + 1} ||* Season ${sid} - Episode ${episodeNumber}\n`; 
	  numrep.push(`1.${( i + 1 )} ${prefix}epi_go ${episode.url}🎈${jidx}`)
})
	
const title = mov.mainDetails ? mov.mainDetails.maintitle : mov.title ? mov.title : 'N/A'
const genres = mov.mainDetails ? mov.mainDetails.genres : mov.category ? mov.category : 'N/A'

	
const output = `📺 *𝖬𝖮𝖵𝖨𝖤-𝖷 𝖳𝖵 𝖲𝖧𝖮𝖶 𝖣𝖮𝖶𝖭𝖫𝖮𝖠𝖣 𝖲𝖸𝖲𝖳𝖤𝖬* 📺


*│ 🎞️ ᴛɪᴛʟᴇ :* ${title}

*│ 🔮 ᴄᴀᴛᴀɢᴏʀɪᴇs :* ${genres}

*│ 🕵️‍♂️ ᴄʜᴀʀᴀᴄᴛᴇʀs :* ${cast}

▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃

${epi_num}

${config.FOOTER}
`
numrep.push(`1.1 ${prefix}${cmd} ${q}`)

const image = mov.mainDetails ? mov.mainDetails.imageUrl : mov.mainImage ? mov.mainImage : config.LOGO;
	
const mass = await conn.sendMessage(from, { image: { url : image }, caption: output }, { quoted: mek });
            const jsonmsg = {
             key : mass.key,
             numrep,
             method : 'decimal'
            }

await storenumrepdata(jsonmsg)

	
 } catch (e) {
await conn.sendMessage(from, { react: { text: '❌', key: mek.key } })
console.log(e)
reply('*❌ An Error Accurated:* ' + e.message)
}
})


cmd({
    pattern: "epi_go",
    react: "📺",
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
let cmd;
if(inp.includes("cinesubz.co/episodes")){  
anu = await cine.episodeDl(inp);
cmd = 'cinedl';
} else return reply(msr.reject)  

let mov = anu?.data

	if(mov){
	    
let cot = `📺 *𝖬𝖮𝖵𝖨𝖤-𝖷 𝖳𝖵 𝖲𝖧𝖮𝖶 𝖣𝖮𝖶𝖭𝖫𝖮𝖠𝖣 𝖲𝖸𝖲𝖳𝖤𝖬* 📺


  📽 *ᴇᴘɪꜱᴏᴅᴇ ɴᴀᴍᴇ:* ${mov.episode_name || 'N/A'}
  
  🖇️ *ʟɪɴᴋ :* ${inp}
  
  🧿 *ʀᴇʟᴇᴀꜱᴇ ᴅᴀᴛᴇ :* ${mov.date || 'N/A'}
  
▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃


 *${formatNumber(1)} ||* Details Card
 *${formatNumber(2)} ||* Details Card (2)
 *${formatNumber(3)} ||* Images

`
  
let numrep = []
numrep.push(`${prefix}epi_det ${q}`)
numrep.push(`${prefix}epi_det2 ${q}`)
numrep.push(`${prefix}epi_images ${q}`)

	
		                mov.dl_links.forEach((movie, index) => {
				
                  cot += ` *${formatNumber( index + 4)} ||* ${movie.quality} ( ${movie.size} )\n`
				
                  numrep.push(`${prefix}${cmd} ${movie.link}🎈${mov.title}🎈${movie.quality}🎈${movie.size}🎈${jidx}🎈${mov.images[0] || config.LOGO}` )
                  })
                 

 const mass = await conn.sendMessage(from, { text: `${cot}\n\n${config.FOOTER}` }, { quoted: mek });
	
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


// =================== D E T A I L S =====================

cmd({
    pattern: "epi_det",
    react: "📺",
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
if(inp.includes("cinesubz.co/episodes")){  
anu = await cine.episodeDl(inp);
} else return reply(msr.reject)  

let mov = anu?.data
	

if(mov){
	
let movImg;
if(inp.includes("cinesubz.co/episodes")){  
movImg = mov.images[0] || mov.image || config.LOGO;
} else if(inp.includes("sinhalasub.lk/episodes")){
movImg = mov.images[0] || mov.image || config.LOGO;
} else if(inp.includes("firemovieshub.com/episodes")){
movImg = mov.images[0] || mov.mainImage || config.LOGO;
}	
	
const name = mov.title || 'N/A'
const date = mov.date || 'N/A'
const ep_name = mov.ep_name || mov.episode_name || 'N/A'

	
let yt = `
🍟 _*${name}*_


🧿 ${oce}Release Date:${oce} ➜ ${date}

🎄 ${oce}Episode Name:${oce} ➜ ${ep_name}

🖇 ${oce}Url:${oce} ➜ ${inp}

▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃

  💃 *ғᴏʟʟᴏᴡ ᴜs ➢* https://whatsapp.com/channel/0029VaaPfFK7Noa8nI8zGg27


`	
const jid = jidx || from

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


cmd({
    pattern: "epi_det2",
    react: "📺",
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
if(inp.includes("cinesubz.co/episodes")){  
anu = await cine.episodeDl(inp);
} else return reply(msr.reject)  

let mov = anu?.data


	
if(mov){
	
let movImg;
if(inp.includes("cinesubz.co/episodes")){  
movImg = mov.images[0] || mov.image || config.LOGO;
} else if(inp.includes("sinhalasub.lk/episodes")){
movImg = mov.images[0] || mov.image || config.LOGO;
} else if(inp.includes("firemovies/episodes")){
movImg = mov.images[0] || mov.mainImage || config.LOGO;
}	
	
const name = mov.title || 'N/A'
const date = mov.date || 'N/A'
const ep_name = mov.ep_name || mov.episode_name || 'N/A'

	
let yt = `
🍟 _*${name}*_


🧿 ${oce}Release Date:${oce} ➜ ${date}

🎄 ${oce}Episode Name:${oce} ➜ ${ep_name}

🖇 ${oce}Url:${oce} ➜ ${inp}

▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃

  💃 *ғᴏʟʟᴏᴡ ᴜs ➢* https://whatsapp.com/channel/0029VaaPfFK7Noa8nI8zGg27


`	
const jid = jidx || from

await conn.sendMessage(jid ,  { image : { url : movImg  } , text : yt + `${config.CAPTION}` })


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
