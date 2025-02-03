const { cmd } = require('../command');
const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

cmd({
    pattern: "dl",
    desc: "Fetch and download TV series episode directly",
    category: "general",
    filename: __filename
},
async (conn, mek, m, { args, reply, from }) => {
    try {
        // Validate input
        if (!args[0]) {
            return reply("Please provide a valid TV series link.\nExample: .episode https://firemovieshub.com/episodes/loki-1x1/");
        }

        const tvSeriesLink = args[0];

        // Notify user about fetching details
        reply("*Fetching episode details...*");

        // API call to fetch episode details
        const response = await axios.get(`https://www.dark-yasiya-api.site/movie/firemovie/episode?url=${encodeURIComponent(tvSeriesLink)}`);

        if (response.data && response.data.status) {
            const data = response.data.result.data;
            const { title, dl_links } = data;

            if (dl_links.length === 0) {
                return reply("❌ No download links found for the provided episode.");
            }

            // Select the first download link
            const selectedDownload = dl_links[0];

            // Notify user about the download details
            reply(`*Starting Episode Download*\n📽️ *Title:* ${title}\n📊 *Quality:* ${selectedDownload.quality}\n📦 *Size:* ${selectedDownload.size}`);

            // Check file size before downloading
            const sizeInMB = parseFloat(selectedDownload.size.replace('MB', '').trim());
            if (sizeInMB > 2048) { // Limit set to 2GB
                return reply(`❌ The file size exceeds 2GB and cannot be sent via WhatsApp.\n📦 *File Size:* ${selectedDownload.size}`);
            }

            // Send the file directly via URL
            await conn.sendMessage(
                from,
                {
                    document: {
                        url: selectedDownload.link, // Direct URL for download
                    },
                    mimetype: "video/mp4",
                    fileName: `${title}_${selectedDownload.quality}.mp4`,
                    jpegThumbnail: `${selectedEpisode.images}`,  // Thumbnail from episode image
                    caption: `*🎬 DIRECT DOWNLOAD*\n\n📽️ *Title:* ${title}\n📊 *Quality:* ${selectedDownload.quality}\n📦 *Size:* ${selectedDownload.size}`,
                },
                { quoted: mek }
            );

            // Notify completion
            await reply("✅ *Download successfully sent via direct link.*");

        } else {
            reply("❌ Unable to fetch episode details. Please check the link and try again.");
        }
    } catch (error) {
        console.error("Error:", error);

        // Error handling
        let errorMessage = "❌ An error occurred during the process.";
        if (error.response) {
            switch (error.response.status) {
                case 404:
                    errorMessage += " The requested link was not found.";
                    break;
                case 403:
                    errorMessage += " Access to the requested file is restricted.";
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
});


//direct download

 // Send error message



cmd({
    pattern: "download",
    desc: "Download and send files (e.g., mp4, mp3, jpg, etc.) from a direct link",
    category: "general",
    filename: __filename
},
async (conn, mek, m, { args, reply, from }) => {
    try {
        if (!args[0]) {
            return reply("Please provide a direct download link.\nExample: .download <direct_link>");
        }

        const directLink = args[0];
        reply("*Starting download...*");

        // Fetch the file from the link
        const downloadResponse = await axios({
            method: "get",
            url: directLink,
            responseType: "arraybuffer",
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
            },
        });

        // Determine file type from content-type or URL
        const contentType = downloadResponse.headers['content-type'];
        const fileExtension = path.extname(directLink) || `.${contentType.split('/')[1]}`;
        const allowedExtensions = ['.mp4', '.mp3', '.jpg', '.png', '.jpeg'];

        if (!allowedExtensions.includes(fileExtension)) {
            return reply(`❌ Unsupported file type: ${fileExtension}. Only mp4, mp3, jpg, and png are allowed.`);
        }

        // Generate a filename and save path
        const tempDir = path.join(__dirname, "temp");
        const filename = `downloaded_file_${Date.now()}${fileExtension}`;
        const tempFilePath = path.join(tempDir, filename);

        // Ensure temp directory exists
        await fs.mkdir(tempDir, { recursive: true });
        await fs.writeFile(tempFilePath, downloadResponse.data);

        // Send the file based on type
        let messageOptions = {};
        if (['.mp4', '.mp3'].includes(fileExtension)) {
            messageOptions = {
                document: {
                    url: tempFilePath,
                },
                mimetype: contentType,
                fileName: filename,
                caption: `*✅ File successfully downloaded and sent.*\n📁 *Name*: ${filename}`,
            };
        } else if (['.jpg', '.png', '.jpeg'].includes(fileExtension)) {
            messageOptions = {
                image: {
                    url: tempFilePath,
                },
                caption: `*✅ Image successfully downloaded and sent.*\n📁 *Name*: ${filename}`,
            };
        }

        await conn.sendMessage(from, messageOptions, { quoted: mek });

        // Clean up temporary file
        setTimeout(async () => {
            try {
                await fs.unlink(tempFilePath);
            } catch (cleanupError) {
                console.log("Error deleting temp file:", cleanupError);
            }
        }, 5 * 60 * 1000); // 5 minutes delay for cleanup

    } catch (error) {
        console.error("Download Error:", error);

        let errorMessage = "❌ Download failed. ";
        if (error.response) {
            switch (error.response.status) {
                case 401:
                    errorMessage += "Unauthorized access. Please provide valid credentials.";
                    break;
                case 404:
                    errorMessage += "File not found.";
                    break;
                case 403:
                    errorMessage += "Access denied.";
                    break;
                default:
                    errorMessage += `HTTP Error: ${error.response.status}`;
            }
        } else if (error.code) {
            errorMessage += `Network Error: ${error.code}`;
        }

        await reply(errorMessage);
    }
});

     
