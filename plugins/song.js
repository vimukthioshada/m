const { sinhalaSub } = require("mrnima-moviedl");
const axios = require("axios");
const { cmd } = require("../command");

cmd({
  pattern: "sinhalasub",
  alias: ["mvss"],
  react: "📑",
  category: "download",
  desc: "Search movies on sinhalasub and get download links",
  filename: __filename
}, async (conn, message, msg, { from, q, reply }) => {
  try {
    if (!q) return await reply("*Please provide a search query! (e.g., Deadpool)*");

    // 🔍 Search for Movies
    const sinhalaSubAPI = await sinhalaSub();
    const searchResults = await sinhalaSubAPI.search(q);
    const topResults = searchResults.result.slice(0, 10);

    if (!topResults.length) return await reply("No results found for: " + q);

    let resultMessage = "📽️ *Search Results for* \"" + q + "\":\n\n";
    topResults.forEach((result, index) => {
      resultMessage += `*${index + 1}.* ${result.title}\n🔗 Link: ${result.link}\n\n`;
    });

    const sentMessage = await conn.sendMessage(from, { text: resultMessage }, { quoted: message });
    const messageId = sentMessage.key.id;

    // 🔁 Listen for User Selection
    conn.ev.on("messages.upsert", async msgUpdate => {
      const newMsg = msgUpdate.messages[0];
      if (!newMsg.message) return;

      const userText = newMsg.message.conversation || newMsg.message.extendedTextMessage?.text;
      const isReplyToBot = newMsg.message.extendedTextMessage && newMsg.message.extendedTextMessage.contextInfo.stanzaId === messageId;

      if (isReplyToBot) {
        const selectedNumber = parseInt(userText.trim());
        if (!isNaN(selectedNumber) && selectedNumber > 0 && selectedNumber <= topResults.length) {
          const selectedResult = topResults[selectedNumber - 1];
          const detailsUrl = `https://api-site-2.vercel.app/api/sinhalasub/movie?url=${encodeURIComponent(selectedResult.link)}`;

          try {
            const detailsResponse = await axios.get(detailsUrl);
            const movieDetails = detailsResponse.data.result;
            const downloadLinks = movieDetails.dl_links || [];

            if (!downloadLinks.length) return await reply("No PixelDrain links found.");

            // 📸 Fetch HD Thumbnail
            const response = await axios.get(movieDetails.image, { responseType: "arraybuffer" });
            const thumbnailBuffer = response.data;

            // 🎥 Movie Details Message
            let detailsMessage = `🍟 _*${movieDetails.title} Sinhala Subtitles | සිංහල උපසිරැසි සමඟ*_ \n\n`;
            detailsMessage += `🧿 *Release Date:* ${movieDetails.release_date}\n`;
            detailsMessage += `🌍 *Country:* ${movieDetails.country}\n`;
            detailsMessage += `⏱️ *Duration:* ${movieDetails.duration}\n`;
            detailsMessage += `⭐ *IMDB:* ${movieDetails.imdb}\n`;
            detailsMessage += `🤵‍♂️ *Director:* ${movieDetails.director}\n`;
            detailsMessage += `💃 *Follow us ➢* https://whatsapp.com/channel/0029VaaPfFK7Noa8nI8zGg27`;

            await conn.sendMessage(from, {
              image: thumbnailBuffer,
              caption: detailsMessage
            }, { quoted: newMsg });

            // 🏆 Send Download Options
            let linksMessage = `🎥 *${movieDetails.title}* - *Select a quality to download:*\n`;
            downloadLinks.forEach((link, index) => {
              linksMessage += `*${index + 1}.* ${link.quality} - ${link.size}\n🔗 Link: ${link.link}\n\n`;
            });

            const downloadMessage = await conn.sendMessage(from, { text: linksMessage }, { quoted: newMsg });
            const downloadMessageId = downloadMessage.key.id;

            // 🔁 Listen for Quality Selection
            conn.ev.on("messages.upsert", async downloadMsgUpdate => {
              const downloadMsg = downloadMsgUpdate.messages[0];
              if (!downloadMsg.message) return;

              const downloadText = downloadMsg.message.conversation || downloadMsg.message.extendedTextMessage?.text;
              const isReplyToDownloadMessage = downloadMsg.message.extendedTextMessage && downloadMsg.message.extendedTextMessage.contextInfo.stanzaId === downloadMessageId;

              if (isReplyToDownloadMessage) {
                const downloadNumber = parseInt(downloadText.trim());
                if (!isNaN(downloadNumber) && downloadNumber > 0 && downloadNumber <= downloadLinks.length) {
                  const selectedLink = downloadLinks[downloadNumber - 1];
                  const fileId = selectedLink.link.split("/").pop();
                  const downloadUrl = `https://pixeldrain.com/api/file/${fileId}`;

                  // 📩 Send MP4 with Thumbnail
                  await conn.sendMessage(from, {
                    document: { url: downloadUrl },
                    mimetype: "video/mp4",
                    fileName: movieDetails.title + " - " + selectedLink.quality + ".mp4",
                    caption: movieDetails.title + "\nQuality: " + selectedLink.quality,
                    jpegThumbnail: thumbnailBuffer // ✅ Attach HD Thumbnail
                  }, { quoted: downloadMsg });

                  await conn.sendMessage(from, { react: { text: "✅", key: message.key } });
                } else {
                  await reply("Invalid selection. Please reply with a valid number.");
                }
              }
            });

          } catch (error) {
            console.error("Error fetching movie details:", error);
            await reply("An error occurred while fetching movie details. Please try again.");
          }
        } else {
          await reply("Invalid selection. Please reply with a valid number.");
        }
      }
    });

  } catch (error) {
    console.error("Error during search:", error);
    reply("*An error occurred while searching!*");
  }
});