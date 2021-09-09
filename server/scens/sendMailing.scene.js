const Scene = require("telegraf/scenes/base");
const Extra = require("telegraf/extra");
const Markup = require("telegraf/markup");

const { bot } = require("../init/startBot");
const { setupStart } = require("../commands/start");

const User = require("../models/user");
const MainStats = require("../models/mainstats");

const sendMailing = new Scene("sendMailing");

setupStart(sendMailing);

sendMailing.enter(async (ctx) => {
  const state = ctx.session.state;
  let post = state.post;

  if (post.btnStart === undefined) {
    post.btnStart = false;
  }

  post.textMsg = post.text
    ? await ctx.reply(post.text)
    : await ctx.reply("Всем хорошего дня!");

  post.photoMsg = post.photoId
    ? await bot.telegram.sendPhoto(ctx.from.id, post.photoId)
    : null;

  post.videoMsg = post.videoId
    ? await bot.telegram.sendVideo(ctx.from.id, post.videoId)
    : null;

  post.animationMsg = post.animationId
    ? await bot.telegram.sendAnimation(ctx.from.id, post.animationId)
    : null;

  post.audioMsg = post.audioId
    ? await bot.telegram.sendAudio(ctx.from.id, post.audioId)
    : null;

  post.voiceMsg = post.voiceId
    ? await bot.telegram.sendVoice(ctx.from.id, post.voiceId)
    : null;

  post.documentMsg = post.documentId
    ? await bot.telegram.sendDocument(ctx.from.id, post.documentId)
    : null;

  post.actionsMsg = await ctx.reply(
    "✏️ Выберите действие",
    Extra.HTML().markup((m) =>
      m.inlineKeyboard([
        [
          m.callbackButton("Edit photo", "Edit photo"),
          m.callbackButton("Edit video", "Edit video"),
          m.callbackButton("Edit animation", "Edit animation"),
        ],
        [
          m.callbackButton("Edit audio", "Edit audio"),
          m.callbackButton("Edit voice", "Edit voice"),
          m.callbackButton("Edit document", "Edit document"),
        ],
        [
          m.callbackButton("Message", "Message"),
          m.callbackButton(
            `Btn start [${post.btnStart}]`,
            `Btn start [${post.btnStart}]`
          ),
        ],
        [m.callbackButton("💵 Отправить пост", "💵 Отправить пост")],
      ])
    )
  );

  state.post = post;
  ctx.session.state = state;
});

sendMailing.leave(async (ctx) => {
  await deletePostMsg(ctx);
});

async function deletePostMsg(ctx) {
  try {
    await bot.telegram.deleteMessage(
      ctx.from.id,
      ctx.session.state.post.actionsMsg.message_id
    );
  } catch (error) {}
  try {
    await bot.telegram.deleteMessage(
      ctx.from.id,
      ctx.session.state.post.textMsg.message_id
    );
  } catch (error) {}
  try {
    await bot.telegram.deleteMessage(
      ctx.from.id,
      ctx.session.state.post.videoMsg.message_id
    );
  } catch (error) {}
  try {
    await bot.telegram.deleteMessage(
      ctx.from.id,
      ctx.session.state.post.photoMsg.message_id
    );
  } catch (error) {}
  try {
    await bot.telegram.deleteMessage(
      ctx.from.id,
      ctx.session.state.post.animationMsg.message_id
    );
  } catch (error) {}
  try {
    await bot.telegram.deleteMessage(
      ctx.from.id,
      ctx.session.state.post.audioMsg.message_id
    );
  } catch (error) {}
  try {
    await bot.telegram.deleteMessage(
      ctx.from.id,
      ctx.session.state.post.voiceMsg.message_id
    );
  } catch (error) {}
  try {
    await bot.telegram.deleteMessage(
      ctx.from.id,
      ctx.session.state.post.documentMsg.message_id
    );
  } catch (error) {}
}

sendMailing.hears("↪️ Вернуться назад", async (ctx) => {
  await ctx.scene.enter("lkMenu");
});
sendMailing.action(/(?:Btn start)/, async (ctx) => {
  const post = ctx.session.state.post;
  if (!post.btnStart) {
    post.btnStart = true;
  } else {
    post.btnStart = false;
  }
  try {
    await bot.telegram.editMessageText(
      ctx.from.id,
      post.actionsMsg.message_id,
      null,
      "✏️ Выберите действие",
      Extra.HTML().markup((m) =>
        m.inlineKeyboard([
          [
            m.callbackButton("Edit photo", "Edit photo"),
            m.callbackButton("Edit video", "Edit video"),
            m.callbackButton("Edit animation", "Edit animation"),
          ],
          [
            m.callbackButton("Edit audio", "Edit audio"),
            m.callbackButton("Edit voice", "Edit voice"),
            m.callbackButton("Edit document", "Edit document"),
          ],
          [
            m.callbackButton("Message", "Message"),
            m.callbackButton(
              `Btn start [${post.btnStart}]`,
              `Btn start [${post.btnStart}]`
            ),
          ],
          [m.callbackButton("💵 Отправить пост", "💵 Отправить пост")],
        ])
      )
    );
  } catch (error) {}
  ctx.session.state.post = post;
});
sendMailing.action("Edit photo", async (ctx) => {
  await ctx.scene.enter("editPhoto");
});
sendMailing.action("Edit video", async (ctx) => {
  await ctx.scene.enter("editVideo");
});
sendMailing.action("Edit animation", async (ctx) => {
  await ctx.scene.enter("editAnimation");
});
sendMailing.action("Edit audio", async (ctx) => {
  await ctx.scene.enter("editAudio");
});
sendMailing.action("Edit voice", async (ctx) => {
  await ctx.scene.enter("editVoice");
});
sendMailing.action("Edit document", async (ctx) => {
  await ctx.scene.enter("editDocument");
});
sendMailing.action("Message", async (ctx) => {
  await ctx.scene.enter("editMessage");
});
sendMailing.action("💵 Отправить пост", async (ctx) => {
  const post = ctx.session.state.post;

  await deletePostMsg(ctx);

  let users = await User.find({ isBlocked: false });

  let seconds = 0;
  const statsTime = await ctx.reply(`Начинаем рассылку...
Время выполнения: ${seconds}`);

  let startInterval = setInterval(editMessage, 1000);
  let removeInterval = () => clearInterval(startInterval);

  async function editMessage() {
    seconds++;
    await bot.telegram.editMessageText(
      ctx.from.id,
      statsTime.message_id,
      null,
      `Начинаем рассылку...
Время выполнения: ${seconds}`
    );
  }

  for (let { userId, btnStart } of users) {
    try {
      await bot.telegram.sendMessage(userId, post.text);
    } catch (error) {}
    if (post.photoId) {
      try {
        await bot.telegram.sendPhoto(userId, post.photoId);
      } catch (error) {}
    }
    if (post.videoId) {
      try {
        await bot.telegram.sendVideo(userId, post.videoId);
      } catch (error) {}
    }
    if (post.animationId) {
      try {
        await bot.telegram.sendAnimation(userId, post.animationId);
      } catch (error) {}
    }
    if (post.audioId) {
      try {
        await bot.telegram.sendAudio(userId, post.audioId);
      } catch (error) {}
    }
    if (post.voiceId) {
      try {
        await bot.telegram.sendVoice(userId, post.voiceId);
      } catch (error) {}
    }
    if (post.documentId) {
      try {
        await bot.telegram.sendDocument(userId, post.documentId);
      } catch (error) {}
    }
    if (post.btnStart && btnStart) {
      try {
        await bot.telegram.sendMessage(
          userId,
          'Пожалуйста, нажмите на кнопку "start", чтобы обновить бота.',
          Extra.markup(Markup.keyboard([["/start"]]).resize())
        );
      } catch (error) {}
      await User.updateOne({ userId }, { btnStart: false });
    }
  }

  if (post.btnStart) {
    await MainStats.updateOne({}, { "usersStats.countBtnStart": 0 });
  }

  removeInterval();
  await ctx.reply(`Рассылка завершена.`);
});

//

//

const editPhoto = new Scene("editPhoto");
editPhoto.enter(async (ctx) => {
  const post = ctx.session.state.post;

  const status = post.photoId
    ? Extra.HTML().markup((m) =>
        m.inlineKeyboard([[m.callbackButton("Delete Photo", "Delete Photo")]])
      )
    : null;

  post.editActions = await ctx.reply(
    `Прикрепите фотографию (в сжатом формате) и она будет добавлена либо заменена.
Чтобы удалить фото, нажмите на кнопку.`,
    status
  );

  ctx.session.state.post = post;
});
editPhoto.on("photo", async (ctx) => {
  const photoId = ctx.update.message.photo[0].file_id;
  const post = ctx.session.state.post;
  post.photoId = photoId;
  ctx.session.state.post = post;
  await ctx.reply("Вы успешно прикрепили фото.");
  await ctx.scene.enter("sendMailing");
});
editPhoto.action("Delete Photo", async (ctx) => {
  const state = ctx.session.state;
  delete state.post.photoId;
  delete state.post.photoMsg;
  ctx.session.state = state;
  await ctx.reply("Фото успешно удалено.");
  await ctx.scene.enter("sendMailing");
});
editPhoto.hears("↪️ Вернуться назад", async (ctx) => {
  await ctx.scene.enter("sendMailing");
});
editPhoto.leave(async (ctx) => {
  try {
    await bot.telegram.deleteMessage(
      ctx.from.id,
      ctx.session.state.post.editActions.message_id
    );
  } catch (error) {}
});

//

//
const editVideo = new Scene("editVideo");
editVideo.enter(async (ctx) => {
  const post = ctx.session.state.post;

  const status = post.videoId
    ? Extra.HTML().markup((m) =>
        m.inlineKeyboard([[m.callbackButton("Delete Video", "Delete Video")]])
      )
    : null;

  post.editActions = await ctx.reply(
    `Прикрепите видео и оно будет добавлено либо заменено.
Чтобы удалить его, нажмите на кнопку.`,
    status
  );

  ctx.session.state.post = post;
});
editVideo.on("video", async (ctx) => {
  const videoId = ctx.update.message.video.file_id;
  const post = ctx.session.state.post;
  post.videoId = videoId;
  ctx.session.state.post = post;
  await ctx.reply("Вы успешно прикрепили видео.");
  await ctx.scene.enter("sendMailing");
});
editVideo.action("Delete Video", async (ctx) => {
  const state = ctx.session.state;
  delete state.post.videoId;
  delete state.post.videoMsg;
  ctx.session.state = state;
  await ctx.reply("Видео успешно удалено.");
  await ctx.scene.enter("sendMailing");
});
editVideo.hears("↪️ Вернуться назад", async (ctx) => {
  await ctx.scene.enter("sendMailing");
});
editVideo.leave(async (ctx) => {
  try {
    await bot.telegram.deleteMessage(
      ctx.from.id,
      ctx.session.state.post.editActions.message_id
    );
  } catch (error) {}
});

//

//
const editAnimation = new Scene("editAnimation");
editAnimation.enter(async (ctx) => {
  const post = ctx.session.state.post;

  const status = post.animationId
    ? Extra.HTML().markup((m) =>
        m.inlineKeyboard([
          [m.callbackButton("Delete Animation", "Delete Animation")],
        ])
      )
    : null;

  post.editActions = await ctx.reply(
    `Прикрепите анимацию (gif) и она будет добавлена либо заменена.
Чтобы удалить ее, нажмите на кнопку.`,
    status
  );

  ctx.session.state.post = post;
});
editAnimation.on("animation", async (ctx) => {
  const animationId = ctx.update.message.animation.file_id;
  const post = ctx.session.state.post;
  post.animationId = animationId;
  ctx.session.state.post = post;
  await ctx.reply("Вы успешно прикрепили анимацию.");
  await ctx.scene.enter("sendMailing");
});
editAnimation.action("Delete Animation", async (ctx) => {
  const state = ctx.session.state;
  delete state.post.animationId;
  delete state.post.animationMsg;
  ctx.session.state = state;
  await ctx.reply("Анимация успешно удалена.");
  await ctx.scene.enter("sendMailing");
});
editAnimation.hears("↪️ Вернуться назад", async (ctx) => {
  await ctx.scene.enter("sendMailing");
});
editAnimation.leave(async (ctx) => {
  try {
    await bot.telegram.deleteMessage(
      ctx.from.id,
      ctx.session.state.post.editActions.message_id
    );
  } catch (error) {}
});

//

//
const editAudio = new Scene("editAudio");
editAudio.enter(async (ctx) => {
  const post = ctx.session.state.post;

  const status = post.audioId
    ? Extra.HTML().markup((m) =>
        m.inlineKeyboard([[m.callbackButton("Delete Audio", "Delete Audio")]])
      )
    : null;

  post.editActions = await ctx.reply(
    `Прикрепите аудио и оно будет добавлено либо заменено.
Чтобы удалить его, нажмите на кнопку.`,
    status
  );

  ctx.session.state.post = post;
});
editAudio.on("audio", async (ctx) => {
  const audioId = ctx.update.message.audio.file_id;
  const post = ctx.session.state.post;
  post.audioId = audioId;
  ctx.session.state.post = post;
  await ctx.reply("Вы успешно прикрепили аудио.");
  await ctx.scene.enter("sendMailing");
});
editAudio.action("Delete Audio", async (ctx) => {
  const state = ctx.session.state;
  delete state.post.audioId;
  delete state.post.audioMsg;
  ctx.session.state = state;
  await ctx.reply("Аудио успешно удалено.");
  await ctx.scene.enter("sendMailing");
});
editAudio.hears("↪️ Вернуться назад", async (ctx) => {
  await ctx.scene.enter("sendMailing");
});
editAudio.leave(async (ctx) => {
  try {
    await bot.telegram.deleteMessage(
      ctx.from.id,
      ctx.session.state.post.editActions.message_id
    );
  } catch (error) {}
});

//

//
const editVoice = new Scene("editVoice");
editVoice.enter(async (ctx) => {
  const post = ctx.session.state.post;

  const status = post.voiceId
    ? Extra.HTML().markup((m) =>
        m.inlineKeyboard([[m.callbackButton("Delete Voice", "Delete Voice")]])
      )
    : null;

  post.editActions = await ctx.reply(
    `Прикрепите голосовое сообщение и оно будет добавлено либо заменено.
Чтобы удалить его, нажмите на кнопку.`,
    status
  );

  ctx.session.state.post = post;
});
editVoice.on("voice", async (ctx) => {
  const voiceId = ctx.update.message.voice.file_id;
  const post = ctx.session.state.post;
  post.voiceId = voiceId;
  ctx.session.state.post = post;
  await ctx.reply("Вы успешно прикрепили аудио.");
  await ctx.scene.enter("sendMailing");
});
editVoice.action("Delete Voice", async (ctx) => {
  const state = ctx.session.state;
  delete state.post.voiceId;
  delete state.post.voiceMsg;
  ctx.session.state = state;
  await ctx.reply("Голосовое сообщение успешно удалено.");
  await ctx.scene.enter("sendMailing");
});
editVoice.hears("↪️ Вернуться назад", async (ctx) => {
  await ctx.scene.enter("sendMailing");
});
editVoice.leave(async (ctx) => {
  try {
    await bot.telegram.deleteMessage(
      ctx.from.id,
      ctx.session.state.post.editActions.message_id
    );
  } catch (error) {}
});

//

//
const editDocument = new Scene("editDocument");
editDocument.enter(async (ctx) => {
  const post = ctx.session.state.post;

  const status = post.documentId
    ? Extra.HTML().markup((m) =>
        m.inlineKeyboard([
          [m.callbackButton("Delete Document", "Delete Document")],
        ])
      )
    : null;

  post.editActions = await ctx.reply(
    `Прикрепите документ и он будет добавлен либо заменен.
Чтобы удалить его, нажмите на кнопку.`,
    status
  );

  ctx.session.state.post = post;
});
editDocument.on("document", async (ctx) => {
  const documentId = ctx.update.message.document.file_id;
  const post = ctx.session.state.post;
  post.documentId = documentId;
  ctx.session.state.post = post;
  await ctx.reply("Вы успешно прикрепили документ.");
  await ctx.scene.enter("sendMailing");
});
editDocument.on("sticker", async (ctx) => {
  const stickerId = ctx.update.message.sticker.file_id;
  const post = ctx.session.state.post;
  post.documentId = stickerId;
  ctx.session.state.post = post;
  await ctx.reply("Вы успешно прикрепили документ.");
  await ctx.scene.enter("sendMailing");
});
editDocument.action("Delete Document", async (ctx) => {
  const state = ctx.session.state;
  delete state.post.documentId;
  delete state.post.documentMsg;
  ctx.session.state = state;
  await ctx.reply("Документ успешно удален.");
  await ctx.scene.enter("sendMailing");
});
editDocument.hears("↪️ Вернуться назад", async (ctx) => {
  await ctx.scene.enter("sendMailing");
});
editDocument.leave(async (ctx) => {
  try {
    await bot.telegram.deleteMessage(
      ctx.from.id,
      ctx.session.state.post.editActions.message_id
    );
  } catch (error) {}
});

//

//
const editMessage = new Scene("editMessage");
editMessage.enter(async (ctx) => {
  const post = ctx.session.state.post;
  post.editActions = await ctx.reply(
    `Напишите новый текст, чтобы его изменить.`
  );
  ctx.session.state.post = post;
});

editMessage.on("text", async (ctx) => {
  const msg = ctx.update.message.text;
  const post = ctx.session.state.post;

  if (msg === "↪️ Вернуться назад") {
    try {
      await bot.telegram.deleteMessage(
        ctx.from.id,
        post.editActions.message_id
      );
    } catch (error) {}
    return await ctx.scene.enter("sendMailing");
  }

  post.text = msg;
  ctx.session.state.post = post;

  try {
    await bot.telegram.deleteMessage(ctx.from.id, post.editActions.message_id);
  } catch (error) {}

  await ctx.reply("Вы успешно изенили текст сообщения.");
  await ctx.scene.enter("sendMailing");
});

module.exports = {
  sendMailing,
  editPhoto,
  editVideo,
  editAnimation,
  editAudio,
  editVoice,
  editDocument,
  editMessage,
};
