const fs = require('fs');
if (fs.existsSync('config.env')) require('dotenv').config({ path: './config.env' });
 
function convertToBool(text, fault = 'true') {
    return text === fault ? true : false;
}
module.exports = {
SESSION_ID: process.env.SESSION_ID || "",
ALIVE_IMG : process.env.ALIVE_IMG || "https://pomf2.lain.la/f/id9p5zqm.jpg",
ALIVE_MSG : process.env.ALIVE_MSG || "*🤖𝐇𝐞𝐲 𝐈'𝐦 💃bot name 🤍 𝐖𝐡𝐚𝐭𝐬𝐀𝐩𝐩 𝐁𝐨𝐭⚡*\n\n*🔔𝐈'𝐦 𝐀𝐥𝐢𝐯𝐞 𝐍𝐨𝐰🎠*\n\n*⚖️𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 - : Bot Name",
AUTO_READ_STATUS: process.env.AUTO_READ_STATUS || "true",
    SESSION_ID: process.env.SESSION_ID || "VnFWAKCJ#CUPsbQkgP63nKj8kjdzb3--n9RZFqdeoDgKvyVWpV1E",
    OWNER_NUMBER: process.env.OWNER_NUMBER || "94755773910",
    AUTO_VIEW_STATUS: process.env.AUTO_VIEW_STATUS || "true",
    MODE: process.env.MODE || "private",
    ALIVE_IMG: process.env.ALIVE_IMG || "https://files.catbox.moe/r4decc.jpg",
    PREFIX: process.env.PREFIX || ".",
    OWNER_REACT: process.env.OWNER_REACT || "true",
    AUTO_REACT: process.env.AUTO_REACT || "true",
    OWNER_NAME: process.env.OWNER_NAME || "wolf",
    BOT_NAME: process.env.BOT_NAME || "wolf",
    MONGODB: process.env.MONGODB || "mongodb+srv://redwolf:redwolf@redwolf.rjjjr.mongodb.net/?",
   CAPTION: process.env.CAPTION || "Made By Wolf",
    FOOTER: process.env.FOOTER || "Wolf",
    JIDS: ["120363045197379067@g.us"] // MOVIE GROUP WALA JIDs
};
