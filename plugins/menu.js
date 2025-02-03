const config = require('../config')
const os = require('os')
const {
    cmd,
    commands
} = require('../command')
const {
    getBuffer,
    getGroupAdmins,
    getRandom,
    h2k,
    isUrl,
    Json,
    runtime,
    sleep,
    fetchJson
} = require('../lib/functions')
const { SinhalaSub } = require('@sl-code-lords/movie-api');
const { PixaldrainDL } = require("pixaldrain-sinhalasub");
const path = require('path');
const fs = require('fs');

cmd({
        pattern: "alive",
        react: "🍬",
        alias: ["online", "test", "bot"],
        desc: "Check bot online or no.",
        category: "other",
        use: '.alive',
        filename: __filename
    },
    async (conn, mek, m, {
        from,
        prefix,
        pushname,
        reply
    }) => {
        try {
            if (os.hostname().length == 12) hostname = 'replit'
            else if (os.hostname().length == 36) hostname = 'heroku'
            else if (os.hostname().length == 8) hostname = 'koyeb'
            else hostname = os.hostname()
            let monspace = '```'
            const sssf = `${monspace}👋 Hello ${pushname} I'm alive now${monspace}

*👾 Im Nebula-MD whatsapp bot*
    
> *Version:* ${require("../package.json").version}
> *Memory:* ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)}MB / ${Math.round(require('os').totalmem / 1024 / 1024)}MB
> *Runtime:* ${runtime(process.uptime())}
> *Platform:* ${hostname}
    
*🍭 Have A Nice Day 🍭*`

            let buttons = [{
                    name: "cta_url",
                    buttonParamsJson: JSON.stringify({
                        display_text: config.BTN,
                        url: config.BTNURL,
                        merchant_url: config.BTNURL
                    }),
                },
                {
                    name: "quick_reply",
                    buttonParamsJson: JSON.stringify({
                        display_text: "Get Menu",
                        id: ".menu"
                    }),
                }
            ]
            let opts = {
                image: config.LOGO,
                header: '',
                footer: config.FOOTER,
                body: sssf

            }
            return await conn.sendButtonMessage(from, buttons, m, opts)
        } catch (e) {
            reply('*Error !!*')
            console.log(e)
        }
    })

cmd({
        pattern: "ping",
        react: "📟",
        alias: ["speed"],
        desc: "Check bot\'s ping",
        category: "other",
        use: '.ping',
        filename: __filename
    },
    async (conn, mek, m, {
        from,
        reply
    }) => {
        try {
            let inital = new Date().getTime();
            let ping = await conn.sendMessage(from, {
                text: '```Pinging To index.js!!!```'
            }, {
                quoted: mek
            })
            let final = new Date().getTime();
            return await conn.edit(ping, '*Pong*\n *' + (final - inital) + ' ms* ')
        } catch (e) {
            reply('*Error !!*')
            console.log(e)
        }
        let buttons = [
                    {buttonId: `ytmp3 ${anu.url}`, buttonText: {displayText: '🎶Audio🎶'}, type: 1},
                    {buttonId: `ytmp4 ${anu.url}`, buttonText: {displayText: '📽️Video📽️'}, type: 1}
                ]
    })

cmd({
        pattern: "menu",
        react: "🗃️",
        alias: ["panel", "list", "commands"],
        desc: "Get bot\'s command list.",
        category: "other",
        use: '.menu',
        filename: __filename
    },
    async (conn, mek, m, {
        from,
        pushname,
        reply
    }) => {
        try {
            if (os.hostname().length == 12) hostname = 'replit'
            else if (os.hostname().length == 36) hostname = 'heroku'
            else if (os.hostname().length == 8) hostname = 'koyeb'
            else hostname = os.hostname()
            let monspace = '```'
            const MNG = `${monspace}👋 Hello ${pushname}${monspace}

*👾 Nebula-MD commands menu...*
  
> *Version:* ${require("../package.json").version}
> *Memory:* ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)}MB / ${Math.round(require('os').totalmem / 1024 / 1024)}MB
> *Runtime:* ${runtime(process.uptime())}
> *Platform:* ${hostname}`
            const categories = [];
            const categoryMap = new Map();

            for (let i = 0; i < commands.length; i++) {
                const cmd = commands[i];
                if (!cmd.dontAddCommandList && cmd.pattern !== undefined) {
                    const category = cmd.category.toUpperCase();
                    if (!categoryMap.has(category)) {
                        categories.push(category);
                        categoryMap.set(category, []);
                    }
                    categoryMap.get(category).push(cmd.pattern);
                }
            }
            const rows = []
            for (const category of categories) {

                rows.push({
                    header: '',
                    title: `${category} MENU`,
                    description: '',
                    id: `.menu`
                })

            }
            let buttons = [{
                    name: "cta_url",
                    buttonParamsJson: JSON.stringify({
                        display_text: config.BTN,
                        url: config.BTNURL,
                        merchant_url: config.BTNURL
                    }),
                },
                {
                    name: "single_select",
                    buttonParamsJson: JSON.stringify({
                        title: 'Select a Category :)',
                        sections: [{
                            title: 'Please select a category',
                            highlight_label: 'NEBULA-MD',
                            rows: rows

                        }]
                    }),
                }

            ]
            let opts = {
                image: config.LOGO,
                header: '',
                footer: config.FOOTER,
                body: MNG

            }
            return await conn.sendButtonMessage(from, buttons, m, opts)
        } catch (e) {
            reply('*Error !!*')
            console.log(e)
        }
    })
cmd({
    pattern: "tiktok",
    react: "🎥",
    alias: ["ttdl", "tt"],
    desc: "TikTok videos download.",
    category: "downloader",
    use: ".tiktok <link>",
    filename: __filename
},
async (conn, mek, m, { from, args, reply }) => {
    try {
        if (!args[0]) {
            return reply('⚠️ කරුණාකර TikTok වීඩියෝ ලින්ක් එකක් ඇතුළත් කරන්න.');
        }

        const videoUrl = args[0];
        const apiUrl = `https://api.botcahx.eu.org/api/dowloader/allin?url=${videoUrl}&apikey=Xio2TWEk`;
        const response = await fetchJson(apiUrl);

        if (!response.status) {
            return reply('⚠️ විඩියෝ ලැබීම අසාර්ථකයි. කරුණාකර නැවත උත්සහ කරන්න!');
        }

        // Button Options
        const buttons = [
            { buttonId: `video ${response.result.video}`, buttonText: { displayText: '📽️ Video' }, type: 1 },
            { buttonId: `audio ${response.result.audio}`, buttonText: { displayText: '🎶 Audio' }, type: 1 }
        ];

        const buttonMessage = {
            text: `✅ ${response.result.title}\n\n⚙️ කරුණාකර පහත මෙනුවෙන් තෝරන්න.`,
            footer: 'TikTok Downloader | Powered by NekoBot',
            buttons: buttons,
            headerType: 1
        };

        // Send Button Message
        await conn.sendMessage(from, buttonMessage, { quoted: mek });

        // Handle Video Sending
        conn.sendMessage('buttonClick', async (buttonData) => {
            const buttonId = buttonData.buttonId;
            if (buttonId.startsWith('video')) {
                const videoLink = buttonId.split(' ')[1];
                await conn.sendMessage(from, { video: { url: videoLink }, caption: '📽️ ඔබේ TikTok Video.' }, { quoted: mek });
            } else if (buttonId.startsWith('audio')) {
                const audioLink = buttonId.split(' ')[1];
                await conn.sendMessage(from, { audio: { url: audioLink }, mimetype: 'audio/mp4', caption: '🎶 ඔබේ TikTok Audio.' }, { quoted: mek });
            }
        });
    } catch (error) {
        console.log(error);
        reply('⚠️ දෝෂයක් ඇතිවී ඇත!');
    }
});


// Command to search for a movie or TV show
cmd({
    pattern: "movie1",
    desc: "Search for a movie",
    category: "movie",
    react: "🔍",
    filename: __filename
},
async (conn, mek, m, { from, q, reply }) => {
    try {
        const input = q.trim();
        if (!input) return reply("Please provide a movie or TV show name to search.");
        
        const result = await SinhalaSub.get_list.by_search(input);
        if (!result.status || result.results.length === 0) return reply("No results found.");

        let message = "*Search Results:*\n\n";
        result.results.forEach((item, index) => {
            message += `${index + 1}. ${item.title}\nType: ${item.type}\nLink: ${item.link}\n\n`;
        });
        await conn.sendMessage(from, { text: message }, { quoted: mek });
    } catch (e) {
        console.log(e);
        await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
        return reply(`Error: ${e.message}`);
    }
});

// Command to get movie details and download links without buttons
cmd({
    pattern: "slsub",
    desc: "Get movie download links.",
    category: "movie",
    react: "🍿",
    filename: __filename
},
async (conn, mek, m, { from, q, reply }) => {
    try {
        const link = q.trim();
        
        const result = await SinhalaSub.movie(link);
        if (!result.status) return reply("Movie details not found.");

        const movie = result.result;
        let msg = `*${movie.title}*\n\n`;
        msg += `Release Date: ${movie.release_date}\n`;
        msg += `Country: ${movie.country}\n\n`;
        msg += `Duration: ${movie.duration}\n\n`;
        msg += `Genres: ${movie.genres}\n\n`;
        msg += `IMDb Rating: ${movie.IMDb_Rating}\n`;
        msg += `Director: ${movie.director.name}\n\n`;
        msg += `Select The Number For Download Movie\n\n`;
        msg += "Available formats:\n 1. 𝗦𝗗 𝟰𝟴𝟬\n 2. 𝗛𝗗 𝟳𝟮𝟬\n 3. 𝗙𝗛𝗗 𝟭𝟬𝟴𝟬\n\n";
        msg += "Use `.mv <Quality Number> <movie_link>` to download.\n\n";
        msg += `> DIZER`;

         const imageUrl = movie.images && movie.images.length > 0 ? movie.images[0] : null;

        await conn.sendMessage(from, {image: {url: imageUrl},caption: msg }, { quoted: mek });
    } catch (e) {
        console.log(e);
        reply('*Error !!*');
    }
});

// Command to handle downloading the movie in specified format without buttons
cmd({
    pattern: "mv",
    react: "🎬",
    dontAddCommandList: true,
    filename: __filename
},
async (conn, mek, m, { from, q, reply }) => {
    try {
        const [format, url] = q.split(' ');
        const result = await SinhalaSub.movie(url);
        const movie = result.result;

        let quality;
        if (format === '1') {
            quality = "SD 480p";
        } else if (format === '2') {
            quality = "HD 720p";
        } else if (format === '3') {
            quality = "FHD 1080p";
        } else {
            return reply("Invalid format. Please choose from 1, 2, or 3.");
        }

        const directLink = await PixaldrainDL(url, quality, "direct");
        if (directLink) {
            await conn.sendMessage(from, {
                document: { url: directLink },
                mimetype: 'video/mp4',
                fileName: `${movie.title}.mp4`,
                caption: "> DIZER"
            }, { quoted: mek });
        } else {
            reply(`Could not find the ${format}p download link. Please check the URL or try a different movie.`);
        }
    } catch (e) {
        console.error(e);
        reply(`❌ Error: ${e.message} ❌`);
    }
});

// Command to get recently added movies without buttons
cmd({
    pattern: "searchmovies",
    alias: ["smv"],
    desc: "Get recently added movies.",
    category: "movie",
    react: "🆕",
    filename: __filename
},
async (conn, mek, m, { from, reply }) => {
    try {
        const page = 1;
        const result = await SinhalaSub.get_list.by_recent_movies(page);
        if (!result.status || result.results.length === 0) return reply("No recent movies found.");

        let message = "*Recently Added Movies:*\n\n";
        result.results.forEach((item, index) => {
            message += `${index + 1}. ${item.title}\nLink: ${item.link}\n\n`;
        });

        message += "> DIZER";

        await conn.sendMessage(from, { text: message }, { quoted: mek });
    } catch (e) {
        console.log(e);
        await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
        return reply(`Error: ${e.message}`);
    }
});
