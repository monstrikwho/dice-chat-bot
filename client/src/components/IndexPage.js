import React from "react";
import "../styles/IndexPage.sass";

export default function IndexPage() {
  return (
    <div id="index-page">
      <a
        href="//telegram.org/dl?tme=dfd18dcfb23db3aa9b_758129073726897911"
        className="tgme_head_dl_button"
      >
        Еще нет телеграм? Установите прямо сейчас!
      </a>

      <div
        className="container d-flex"
        style={{ height: "calc(100vh - 45px)", justifyContent: "center" }}
      >
        <div className="tgme_page_photo">
          <a href="tg://resolve?domain=lovecrashbot">
            <img src="photo.jpg" alt="Luckycat_bot" />
          </a>
        </div>
        <div className="tgme_page_title">
          <span dir="auto">Lucky Cat Games</span>
        </div>
        <div className="tgme_page_extra">@luckycat_bot</div>
        <div className="tgme_page_description ">
          Вы можете задать любые вопросы нашей поддержке @LuckyCatGames
        </div>
        <div className="tgme_page_action">
          <a
            className="tgme_action_button_new"
            href="tg://resolve?domain=luckycat_bot"
          >
            Перейти к боту
          </a>
        </div>
      </div>
    </div>
  );
}
