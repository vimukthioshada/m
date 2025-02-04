const { sinhalaSub } = require("mrnima-moviedl");
const axios = require('axios');
const fs = require('fs');
const { cmd } = require('../command');

cmd({
  pattern: "sinhalasub",
  alias: ['mv'],
  react: '📑',
  category: "download",
  desc: "Search movies on sinhalasub and get download links",
  filename: __filename
}, async (conn, message, msg, { from, q, reply }) => {
  try {
    if (!q) return await reply("*Please provide a search query! (e.g., Deadpool)*");

    const sinhalaSubAPI = await sinhalaSub();
    const searchResults = await sinhalaSubAPI.search(q);
    const topResults = searchResults.result.slice(0, 10);

    if (!topResults.length) return await reply("No results found for: " + q);

    let resultMessage = "📽️ *Search Results for* \"" + q + "\":\n\n";
    topResults.forEach((result, index) => {
      resultMessage += `*${index + 1}.* ${result.title}\n`;
    });

    const sentMessage = await conn.sendMessage(from, { text: resultMessage }, { quoted: message });
    const messageId = sentMessage.key.id;

    conn.ev.on('messages.upsert', async msgUpdate => {
      const newMsg = msgUpdate.messages[0];
      if (!newMsg?.message) return;

      const userText = newMsg.message.conversation || newMsg.message.extendedTextMessage?.text;
      const isReplyToBot = newMsg.message.extendedTextMessage?.contextInfo?.stanzaId === messageId;

      if (isReplyToBot) {
        const selectedNumber = parseInt(userText.trim());
        if (!isNaN(selectedNumber) && selectedNumber > 0 && selectedNumber <= topResults.length) {
          const selectedResult = topResults[selectedNumber - 1];
          const detailsUrl = `https://api-site-2.vercel.app/api/sinhalasub/movie?url=${encodeURIComponent(selectedResult.link)}`;

          try {
            const detailsResponse = await axios.get(detailsUrl);
            const movieDetails = detailsResponse.data.result;
            const downloadLinks = [...(movieDetails.dl_links || []), ...(movieDetails.dl_links2 || []), ...(movieDetails.dl_links3 || [])];

            if (!downloadLinks.length) return await reply("🚫 No download links found.");

            let linksMessage = `🎥 *${movieDetails.title}*\n`;
            linksMessage += `🏆 *IMDB:* ${movieDetails.imdb}/10\n`;
            linksMessage += `📅 *Release Date:* ${movieDetails.date}\n`;
            linksMessage += `🕒 *Runtime:* ${movieDetails.runtime}\n`;
            linksMessage += ` *Country:* ${movieDetails.country}\n\n`;
            linksMessage += `*Category:* ${movieDetails.category}\n\n`;
            linksMessage += `🔽 *Available Download Links:*\n`;
            
            downloadLinks.forEach((link, index) => {
              linksMessage += `*${index + 1}.* ${link.quality} - ${link.size}\n🔗 ${link.link}\n\n`;
            });

            const thumbnailBuffer = Buffer.from((await axios.get(movieDetails.thumbnail, { responseType: 'arraybuffer' })).data, "binary");

            const downloadMessage = await conn.sendMessage(from, {
              image: thumbnailBuffer,
              caption: linksMessage,
              jpegThumbnail: thumbnailBuffer
            }, { quoted: newMsg });

            const downloadMessageId = downloadMessage.key.id;

            conn.ev.on("messages.upsert", async downloadMsgUpdate => {
              const downloadMsg = downloadMsgUpdate.messages[0];
              if (!downloadMsg?.message) return;

              const downloadText = downloadMsg.message.conversation || downloadMsg.message.extendedTextMessage?.text;
              const isReplyToDownloadMessage = downloadMsg.message.extendedTextMessage?.contextInfo?.stanzaId === downloadMessageId;

              if (isReplyToDownloadMessage) {
                const downloadNumber = parseInt(downloadText.trim());
                if (!isNaN(downloadNumber) && downloadNumber > 0 && downloadNumber <= downloadLinks.length) {
                  const selectedLink = downloadLinks[downloadNumber - 1];

                  await conn.sendMessage(from, { text: "✅ *Your request is downloading now...*" }, { quoted: downloadMsg });
                  await conn.sendMessage(from, { react: { text: '⬇️', key: message.key } });

                  if (selectedLink.link.includes("pixeldrain.com")) {
                    const fileId = selectedLink.link.split('/').pop();
                    const downloadUrl = `https://pixeldrain.com/api/file/${fileId}`;

                    await conn.sendMessage(from, {
                      document: { url: downloadUrl },
                      mimetype: "video/mp4",
                      fileName: `${movieDetails.title} - ${selectedLink.quality}.mp4`,
                      caption: `${movieDetails.title}\nQuality: ${selectedLink.quality}\n  OSDA`,
                      contextInfo: {
                        externalAdReply: {
                          title: movieDetails.title,
                          body: "  OSDA",
                          mediaType: 1,
                          sourceUrl: selectedResult.link,
                          thumbnailUrl: movieDetails.image
                        }
                      }
                    }, { quoted: downloadMsg });
                  } else {
                    try {
                      const response = await axios.get(selectedLink.link, { responseType: 'arraybuffer' });
                      const videoBuffer = Buffer.from(response.data);

                      await conn.sendMessage(from, {
                        document: videoBuffer,
                        mimetype: "video/mp4",
                        fileName: `${movieDetails.title} - ${selectedLink.quality}.mp4`,
                        caption: `${movieDetails.title}\nQuality: ${selectedLink.quality}\n  OSDA`,
                        contextInfo: {
                          externalAdReply: {
                            title: movieDetails.title,
                            body: "  OSDA",
                            mediaType: 1,
                            sourceUrl: selectedResult.link,
                            thumbnailUrl: movieDetails.image
                          }
                        }
                      }, { quoted: downloadMsg });

                      videoBuffer.fill(0);
                      await conn.sendMessage(from, { react: { text: '✅', key: message.key } });
                    } catch (error) {
                      console.error("Direct download failed:", error);
                      await reply("🚫 *Failed to download the file. Please try another link.*");
                    }
                  }
                } else {
                  await reply("Invalid selection. Please reply with a valid number.");
                }
              }
            });
          } catch (error) {
            console.error("Error fetching movie details:", error);
            await reply("An error occurred while fetching movie details. Please try again.");
          }
        }
      }
    });
  } catch (error) {
    console.error("Error during search:", error);
    reply("*An error occurred while searching!*");
  }
});
