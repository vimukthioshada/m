const config = require("../config");
const { cmd, commands } = require("../command");
const { fetchJson } = require("../lib/functions");
const axios = require("axios");
const fs = require("fs/promises");
const path = require("path");

// Temporary state to track ongoing interactions
const userState = {};

cmd(
    {
        pattern: "tvs",
        alias: ["searchtv", "searchmovies"],
        react: "🎬",
        desc: "Search for TV shows and movies.",
        category: "entertainment",
        filename: __filename,
    },
    async (conn, mek, m, { from, body, q, reply, pushname }) => {
        try {
            // Validate Input
            if (!q || q.trim().length === 0) {
                return reply(
                    "❌ Please specify the TV show or movie name. Example: .tvs The 100",
                );
            }

            // API URL for search query
            const apiURL = `https://www.dark-yasiya-api.site/movie/firemovie/search?text=${encodeURIComponent(q)}`;
            let data;

            try {
                data = await fetchJson(apiURL);
            } catch (error) {
                console.error("API Fetch Error:", error);
                return reply(
                    "❌ Unable to connect to the API. Please try again later.",
                );
            }

            if (!data || !data.status || !data.result || !data.result.data) {
                console.error("Invalid API Response:", data);
                return reply(`❌ No results found for "${q}".`);
            }

            const results = data.result.data;
            let response = `🔍 *Search Results for "${q}":*\n\n`;

            results.forEach((item) => {
                response += `
🎬 *Title:* ${item.title} (${item.year})
📌 *Type:* ${item.type}
📝 *Description:* ${item.description}
🔗 *Link:* [Click here](${item.link})
🖼️ *Image:* ${item.image}
                `;
            });

            await reply(response);
        } catch (error) {
            console.error("Unexpected Error:", error);
            return reply("❌ An unexpected error occurred. Please try again.");
        }
    },
);

cmd(
    {
        pattern: "tv",
        alias: ["series", "downloadtv"],
        react: "🎥",
        desc: "Fetch TV Series details and episode links.",
        category: "entertainment",
        filename: __filename,
    },
    async (conn, mek, m, { from, body, q, reply, pushname }) => {
        try {
            // Validate Input
            if (!q || q.trim().length === 0) {
                return reply(
                    "❌ Please specify the TV series name. Example: tv Loki",
                );
            }

            // Fetch TV Series Details
            const apiURL = `https://www.dark-yasiya-api.site/movie/firemovie/tvshow?url=${encodeURIComponent(q)}`;
            let data;

            try {
                data = await fetchJson(apiURL);
            } catch (error) {
                console.error("API Fetch Error:", error);
                return reply(
                    "❌ Unable to connect to the API. Please try again later.",
                );
            }

            if (!data || !data.status || !data.result || !data.result.data) {
                console.error("Invalid API Response:", data);
                return reply(`❌ No results found for "${q}".`);
            }

            const series = data.result.data;
            let response = `
🎥 *Title:* ${series.title}
📅 *First Aired:* ${series.first_air_date}
📅 *Last Aired:* ${series.last_air_date}
🕒 *Average Duration:* ${series.avarageDuration}
⭐ *Rating:* ${series.tmdbRate} (${series.tmdbVoteCount} votes)
🎭 *Categories:* ${series.category.join(", ")}
🎬 *Director:* ${series.director}

🌐 *More Info:* [View Here](${series.movie_link})
🖼️ *Poster:* ${series.mainImage}

📺 *Episodes:*
`;

            series.episodes.forEach((episode) => {
                response += `
📌 *${episode.number}: ${episode.name}*
📅 Aired On: ${episode.date}
🔗 [Watch Episode](${episode.link})
Reply with *${episode.number}* for episode details.
`;
            });

            await reply(response);

            // Store user state for episode selection
            userState[from] = {
                series,
                step: "select_episode",
            };
        } catch (error) {
            console.error("Unexpected Error:", error);
            return reply("❌ An unexpected error occurred. Please try again.");
        }
    },
);

// Handle user replies for episode details

cmd(
    {
        pattern: "episode",
        desc: "Fetch and download TV series episode",
        category: "general",
        filename: __filename,
    },
    async (conn, mek, m, { args, reply, from }) => {
        try {
            // Validate input
            if (!args[0]) {
                return reply(
                    "Please provide a valid TV series link.\nExample: .episode https://firemovieshub.com/episodes/loki-1x1/",
                );
            }

            const tvSeriesLink = args[0];

            // Notify user that fetching has started
            reply("*Fetching episode details...*");

            // API call to fetch episode details
            const response = await axios.get(
                `https://www.dark-yasiya-api.site/movie/firemovie/episode?url=${encodeURIComponent(tvSeriesLink)}`,
            );

            if (response.data && response.data.status) {
                const data = response.data.result.data;
                const { title, dl_links } = data;

                if (dl_links.length === 0) {
                    return reply(
                        "❌ No download links found for the provided episode.",
                    );
                }

                // Select the first download link (you can modify this logic if needed)
                const selectedDownload = dl_links[0];
                reply(
                    `*Downloading Episode*\n📽️ *Title:* ${title}\n📊 *Quality:* ${selectedDownload.quality}\n📦 *Size:* ${selectedDownload.size}`,
                );

                // Download the file
                const downloadResponse = await axios({
                    method: "get",
                    url: selectedDownload.link,
                    responseType: "arraybuffer",
                    maxContentLength: Infinity,
                    maxBodyLength: Infinity,
                    headers: {
                        "User-Agent":
                            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
                    },
                });

                // Generate a random filename
                const sanitizedTitle = title
                    .replace(/[^a-zA-Z0-9]/g, "_")
                    .substring(0, 50);
                const filename = `${sanitizedTitle}_${selectedDownload.quality}.mp4`;
                const tempFilePath = path.join(__dirname, "temp", filename);

                // Ensure temp directory exists
                await fs.mkdir(path.join(__dirname, "temp"), {
                    recursive: true,
                });

                // Write the file temporarily
                await fs.writeFile(tempFilePath, downloadResponse.data);

                // Send the file to WhatsApp
                await conn.sendMessage(
                    from,
                    {
                        document: { url: tempFilePath },
                        mimetype: "video/mp4",
                        fileName: filename,
                        caption: `*🎬 DOWNLOADED EPISODE*\n\n📽️ *Title:* ${title}\n📊 *Quality:* ${selectedDownload.quality}\n📦 *Size:* ${selectedDownload.size}`,
                    },
                    { quoted: mek },
                );

                // Notify user of successful download
                await reply(`✅ *Download Complete*\n📥 File: ${filename}`);

                // Clean up temporary file after 5 minutes
                setTimeout(
                    async () => {
                        try {
                            await fs.unlink(tempFilePath);
                        } catch (cleanupError) {
                            console.log(
                                "Temp file cleanup error:",
                                cleanupError,
                            );
                        }
                    },
                    5 * 60 * 1000,
                ); // 5 minutes delay
            } else {
                reply(
                    "❌ Unable to fetch episode details. Please check the link and try again.",
                );
            }
        } catch (error) {
            console.error("Error:", error);

            // Detailed error handling
            let errorMessage = "❌ An error occurred during the process.";
            if (error.response) {
                switch (error.response.status) {
                    case 404:
                        errorMessage += " The requested link was not found.";
                        break;
                    case 403:
                        errorMessage +=
                            " Access to the requested file is restricted.";
                        break;
                    case 500:
                        errorMessage += " The server encountered an error.";
                        break;
                    default:
                        errorMessage += ` HTTP Error: ${error.response.status}`;
                }
            } else if (error.code) {
                switch (error.code) {
                    case "ECONNABORTED":
                        errorMessage += " The download process timed out.";
                        break;
                    case "ENOTFOUND":
                        errorMessage += " Unable to reach the download server.";
                        break;
                    default:
                        errorMessage += ` Network Error: ${error.code}`;
                }
            }

            // Send error message
            await reply(errorMessage);
        }
    },
);
