const Seedr = require("seedr");
const axios = require("axios");
const { cmd } = require("../command");

// Delay function for progress simulation
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

cmd({
    pattern: "yts",
    alias: ["movie"],
    react: "🎬",
    category: "download",
    desc: "Search and download movies from YTS",
    filename: __filename,
}, async (conn, mek, m, { from, q, reply }) => {
    try {
        if (!q) {
            return reply("*Please provide a movie name! (e.g., Interstellar)*");
        }

        // Step 1: Search for the movie using the YTS API
        const apiUrl = `https://www.dark-yasiya-api.site/movie/ytsmx/search?text=${q}`;
        const response = await axios.get(apiUrl);

        if (!response.data.status || response.data.result.data.length === 0) {
            return reply(`❌ *No results found for "${q}"!*`);
        }

        const movies = response.data.result.data;
        let movieList = `🎬 *Search Results for "${q}"*\n\n`;
        movies.slice(0, 10).forEach((movie, index) => {
            movieList += `*${index + 1}.* ${movie.title_long}\n   🌟 *Rating:* ${movie.rating}\n\n`;
        });

        // Step 2: Send the movie list to the user
        const sentMessage = await conn.sendMessage(from, { text: movieList }, { quoted: mek });

        // Step 3: Listen for user's movie selection
        conn.ev.on("messages.upsert", async (msgUpdate) => {
            const newMsg = msgUpdate.messages[0];
            if (!newMsg.message) return;

            const userText = newMsg.message.conversation || newMsg.message.extendedTextMessage?.text;
            const isReplyToBot = newMsg.message.extendedTextMessage?.contextInfo.stanzaId === sentMessage.key.id;

            if (isReplyToBot) {
                const selectedIndex = parseInt(userText.trim());
                if (isNaN(selectedIndex) || selectedIndex < 1 || selectedIndex > movies.length) {
                    return reply("*❌ Invalid selection! Please choose a valid number.*");
                }

                const selectedMovie = movies[selectedIndex - 1];
                const {
                    title_long,
                    year,
                    rating,
                    runtime,
                    language,
                    like_count,
                    url,
                    torrents,
                    background_image,
                } = selectedMovie;

                // Send movie details and quality options
                let qualityList = `🎥 *Movie Details*\n\n📌 *Title:* ${title_long}\n📅 *Year:* ${year}\n🌟 *Rating:* ${rating}\n⏳ *Runtime:* ${runtime} minutes\n💖 *Likes:* ${like_count}\n🌐 *Language:* ${language}\n🔗 *URL:* ${url}\n\n📦 *Available Qualities:*\n`;
                torrents.forEach((torrent, index) => {
                    qualityList += `*${index + 1}.* ${torrent.quality} - ${torrent.size}\n`;
                });

                const qualityMessage = await conn.sendMessage(from, {
                    image: { url: background_image },
                    caption: qualityList,
                }, { quoted: mek });

                // Step 4: Listen for user's quality selection
                conn.ev.on("messages.upsert", async (qualityUpdate) => {
                    const qualityMsg = qualityUpdate.messages[0];
                    if (!qualityMsg.message) return;

                    const qualityText = qualityMsg.message.conversation || qualityMsg.message.extendedTextMessage?.text;
                    const isReplyToQuality = qualityMsg.message.extendedTextMessage?.contextInfo.stanzaId === qualityMessage.key.id;

                    if (isReplyToQuality) {
                        const selectedQualityIndex = parseInt(qualityText.trim());
                        if (isNaN(selectedQualityIndex) || selectedQualityIndex < 1 || selectedQualityIndex > torrents.length) {
                            return reply("*❌ Invalid selection! Please choose a valid quality number.*");
                        }

                        const selectedQuality = torrents[selectedQualityIndex - 1];
                        const magnetLink = `magnet:?xt=urn:btih:${selectedQuality.hash}`;
                        console.log(magnetLink);
                        // Step 5: Upload magnet to Seedr
                        const seedr = new Seedr();
                        await seedr.login("oshadavimukthi555@gmail.com", "Oshada2005@");
                        const magnetUpload = await seedr.addMagnet(magnetLink);

                        if (magnetUpload.code === 400 || magnetUpload.result !== true) {
                            return reply("❌ *Failed to upload magnet. Please try again.*");
                        }

                        // Step 6: Simulate progress
                        const progressUpdates = [
                            "📥 *Uploading... 10%*",
                            "📥 *Uploading... 50%*",
                            "📥 *Uploading... 90%*",
                            "✅ *Upload complete!*",
                        ];
                        for (const update of progressUpdates) {
                            await conn.sendMessage(from, { text: update }, { quoted: mek });
                            await sleep(2000);
                        }

                        // Step 7: Get video from Seedr
                        let videos;
                        do {
                            videos = await seedr.getVideos();
                            if (!videos.length) await sleep(3000);
                        } while (!videos.length);

                        const videoData = videos[0][0];
                        if (!videoData || !videoData.id) {
                            return reply("*❌ No video data available. Please try again later.*");
                        }

                        const fileInfo = await seedr.getFile(videoData.id);

                        // Step 8: Send the video to the user
                        await conn.sendMessage(from, {
                            document: { url: fileInfo.url },
                            mimetype: "video/mp4",
                            fileName: fileInfo.name,
                            caption: `🎥 *${fileInfo.name}*\n\n .`,
                        }, { quoted: mek });

                        // Step 9: Clean up the folder
                        await seedr.deleteFolder(videoData.fid);

                        reply("✅ *Movie sent successfully!*");
                    }
                });
            }
        });
    } catch (error) {
        console.error(error);
        reply(`❌ *An error occurred!*\n\n${error.message || error}`);
    }
});