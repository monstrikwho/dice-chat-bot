const Scene = require("telegraf/scenes/base");

const { bot } = require("../init/startBot");

const infoBlock = new Scene("infoBlock");
infoBlock.enter(async (ctx) => {
  return await bot.telegram.sendMessage(
    ctx.chat.id,
    `‘Zar’ telegram çıkartmalarına dayalı çevrimiçi oyunlara sahip bir bottur. Tek başınıza oynayabilir ya da arkadaşlarınızla rekabet edebilirsiniz!
Bu nedenle, herhangi bir hile veya sahtekarlık olasılığının olmadığını garanti etmekteyiz. Çünkü oyunu ve sonuçlarını etkileyemeyiz. Bize basitçe bir çıkartma gönderirsiniz (manuel olarak yapabilirsiniz, ancak konforunuz için bir düğme oluşturulmuştur) ve tamamen kendi şansınıza  bağlı olarak oynadığınız oyunlardan para kazanırsınız.
    
💦 Demo hesabında ÜCRETSİZ oynayabilirsiniz.
🔥 Anında para çekebilirsiniz.
⚠️ Demo hesabından para çekilemez.

You can also earn money by ınvıtıng your frıends and getting 5% from all of their cash ın.
Ayrıca arkadaşlarınızı davet ederek para kazanabilirsiniz! 
    
<a href="https://t.me/ZAR_destek">❓ Destek</a>
<a href="https://t.me/joinchat/iW9U-P6q-Z4yMGM6">💬 Sohbet sayfamız</a>
<a href="https://t.me/joinchat/wdgqdldMxj1iNTNk">📬 Kanalımız</a>
`,
    {
      parse_mode: "HTML",
      reply_markup: {
        keyboard: [
          [
            {
              text: "↪️ Geri",
            },
          ],
        ],
        resize_keyboard: true,
      },
      disable_web_page_preview: true,
    }
  );
});

infoBlock.hears("↪️ Geri", async ({ scene }) => {
  return await scene.enter("showMainMenu");
});

module.exports = { infoBlock };
