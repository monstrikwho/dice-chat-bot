const Scene = require("telegraf/scenes/base");

const { bot } = require("../init/startBot");

const infoBlock = new Scene("infoBlock");
infoBlock.enter(async (ctx) => {
  return await bot.telegram.sendMessage(
    ctx.chat.id,
    `Bu nedenle, herhangi bir hile veya sahtekarlık olasılığının olmadığını garanti etmekteyiz. Çünkü oyunu ve sonuçlarını etkileyemeyiz. Bize basitçe bir çıkartma gönderirsiniz (manuel olarak yapabilirsiniz, ancak konforunuz için bir düğme oluşturulmuştur) ve tamamen kendi şansınıza  bağlı olarak oynadığınız oyunlardan para kazanırsınız.

💦 Demo hesabında ÜCRETSİZ oynayabilirsiniz.
🔥 Anında para çekebilirsiniz.
⚠️Demo hesabından para çekilemez.

Nasıl oynanır?
1) Bahsin tutarını seçin;
2) Bahis yapın;
3) Sohbete çıkartma gönderin.
    
<a href="http://t.me/LuckyCatGames">❓ Destek</a>
<a href="http://t.me/joinchat/P0el-xuDN6g-ZsY7decv7A">💬 Oyuncularla iletişim kurmak için sohbet hesabımız</a>
<a href="http://t.me/luckycat_orders">💳 Ödemelerin paylaşıldığı sohbet hesabımız</a>`,
    {
      parse_mode: "HTML",
      reply_markup: {
        keyboard: [
          [
            {
              text: "↪️ Вернуться назад",
            },
          ],
        ],
        resize_keyboard: true,
      },
      disable_web_page_preview: true,
    }
  );
});

infoBlock.hears("↪️ Вернуться назад", async ({ scene }) => {
  return await scene.enter("showMainMenu");
});

module.exports = { infoBlock };
