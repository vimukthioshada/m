const fs = require('fs');
const path = require('path');
const axios = require('axios');
const cheerio = require('cheerio');
const { cmd } = require('../command');

cmd({
  pattern: "baiscope",
  alias: ["movies"],
  react: '📑',
  category: 'download',
  desc: "baiscope.lk",
  filename: __filename
}, async (conn, message, msg, { from, q, isDev, reply }) => {
  try {
    if (!q) {
      return await reply("*Please provide a search query! (e.g., Avatar)*");
    }

    const searchUrl = "https://www.baiscope.lk/?s=" + encodeURIComponent(q);
    const response = await axios.get(searchUrl);
    const $ = cheerio.load(response.data);
    let results = [];
    
    $("article.elementor-post").each((index, element) => {
      const title = $(element).find("h5.elementor-post__title > a").text().trim();
      const episodeLink = $(element).find("h5.elementor-post__title > a").attr("href");
      const imgUrl = $(element).find(".elementor-post__thumbnail img").attr("src");
      if (title && episodeLink && imgUrl) {
        results.push({
          title: title,
          episodeLink: episodeLink,
          imgUrl: imgUrl
        });
      }
    });

    if (results.length === 0) {
      return await reply("No results found for: " + q);
    }

    let resultMessage = "📺 Search Results for *" + q + ":*\n\n";
    results.forEach((result, index) => {
      resultMessage += '*' + (index + 1) + ".* " + result.title + "\n\n";
    });

    const sentMessage = await conn.sendMessage(from, {
      text: resultMessage
    }, {
      quoted: message
    });

    const messageId = sentMessage.key.id;
    
    conn.ev.on("messages.upsert", async msgUpdate => {
      const newMsg = msgUpdate.messages[0];
      if (!newMsg.message) return;

      const userText = newMsg.message.conversation || newMsg.message.extendedTextMessage?.text;
      const userId = newMsg.key.remoteJid;
      const isReplyToBot = newMsg.message.extendedTextMessage && newMsg.message.extendedTextMessage.contextInfo.stanzaId === messageId;

      if (isReplyToBot) {
        const selectedNumber = parseInt(userText.trim());
        if (!isNaN(selectedNumber) && selectedNumber > 0 && selectedNumber <= results.length) {
          const selectedResult = results[selectedNumber - 1];
          const episodeResponse = await axios.get(selectedResult.episodeLink);
          const $$ = cheerio.load(episodeResponse.data);
          const downloadLink = $$("a.dlm-buttons-button").attr("href");
          if (downloadLink) {
            await conn.sendMessage(userId, {
              image: { url: selectedResult.imgUrl },
              caption: "🎬 *" + selectedResult.title + "*\n🔗 Link: " + selectedResult.episodeLink + "\n⬇️ Download will follow."
            }, { quoted: newMsg });
            
            const downloadPath = path.join(__dirname, "downloaded_episode.zip");
            const writer = fs.createWriteStream(downloadPath);
            const downloadStream = await axios({
              url: downloadLink,
              method: "GET",
              responseType: "stream"
            });
            downloadStream.data.pipe(writer);
            
            writer.on("finish", async () => {
              await conn.sendMessage(userId, {
                document: { url: downloadPath },
                mimetype: 'application/zip',
                fileName: selectedResult.title + ".zip",
                thumbnail: { url: selectedResult.imgUrl },  // Thumbnail added here
                caption: '*' + selectedResult.title + "*\n\n> OSDA"
              }, { quoted: newMsg });
              fs.unlinkSync(downloadPath);
            });
            
            writer.on("error", error => {
              console.error("Error downloading ZIP file:", error);
              reply("*Error downloading the episode ZIP file.*");
            });
          } else {
            await reply("*Download link not found for the selected episode.*");
          }
        } else {
          await reply("*Invalid selection. Please choose a valid number.*");
        }
      }
    });
  } catch (error) {
    console.error(error);
    await reply("*An error occurred while scraping the data.*");
  }
});