import React, { useState, useEffect } from "react";
import axios from "axios";

import { Card, Container, Table, Button, Spinner } from "react-bootstrap";
import NavbarMenu from "../containers/NavbarMenu";

import "../styles/HomePage.sass";

export default function HomePage() {
  const [lang, setLang] = useState(null);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState();

  const getData = async (url) => {
    await axios.get(`${url}/get_stats`).then(({ data }) => {
      setData({
        orderStats: data.stats.orderStats,
        usersStats: data.stats.usersStats,
        gamesStats: data.stats.gamesStats,
        pvpGames: data.stats.pvpGames,
      });
      setLoading(false);
    });
  };

  useEffect(() => {
    setLoading(true);
    const lang = localStorage.getItem("lang");
    setLang(lang);

    if (!lang) {
      setLoading(false);
      return;
    }

    const url =
      lang === "RU"
        ? process.env.REACT_APP_URL_RU
        : process.env.REACT_APP_URL_TUR;

    getData(url);
  }, []);

  if (loading) {
    return (
      <div id="homepage" style={{ heigth: "100vh" }}>
        <NavbarMenu lang={lang} />
        <Container
          style={{
            height: "calc(100vh - 56px)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Spinner animation="border" role="status">
            <span className="sr-only">Loading...</span>
          </Spinner>
        </Container>
      </div>
    );
  }

  if (!lang) {
    return (
      <div id="homepage" style={{ heigth: "100vh" }}>
        <NavbarMenu />
        <Container
          style={{
            height: "calc(100vh - 56px)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Button
            variant="primary"
            size="lg"
            onClick={(e) => {
              e.preventDefault();
              setLang({ key: "RU", url: process.env.REACT_APP_URL_RU });
              getData(process.env.REACT_APP_URL_RU);
              localStorage.setItem("lang", "RU");
            }}
            block
          >
            RU bot
          </Button>
          <Button
            variant="primary"
            size="lg"
            onClick={(e) => {
              e.preventDefault();
              setLang({ key: "TUR", url: process.env.REACT_APP_URL_TUR });
              getData(process.env.REACT_APP_URL_TUR);
              localStorage.setItem("lang", "RU");
            }}
            block
          >
            TUR bot
          </Button>
        </Container>
      </div>
    );
  }

  const pvpGamesCard =
    lang === "TUR" ? (
      <Card bg={"light"} className="mb-2">
        <Card.Header>Статистика по PVP играм</Card.Header>
        <Card.Body>
          <h6>Кости</h6>
          <Table striped bordered hover style={{ fontSize: "14px" }}>
            <tbody>
              <tr>
                <td>Кол-во игр</td>
                <td>{data.pvpGames.dice.countLobby}</td>
              </tr>
              <tr>
                <td>Общая сумма ставок</td>
                <td>{data.pvpGames.dice.countCash}</td>
              </tr>
            </tbody>
          </Table>

          <h6>Футбол</h6>
          <Table striped bordered hover style={{ fontSize: "14px" }}>
            <tbody>
              <tr>
                <td>Кол-во игр</td>
                <td>{data.pvpGames.football.countLobby}</td>
              </tr>
              <tr>
                <td>Общая сумма ставок</td>
                <td>{data.pvpGames.football.countCash}</td>
              </tr>
            </tbody>
          </Table>

          <h6>Боулинг</h6>
          <Table striped bordered hover style={{ fontSize: "14px" }}>
            <tbody>
              <tr>
                <td>Кол-во игр</td>
                <td>{data.pvpGames.bouling.countLobby}</td>
              </tr>
              <tr>
                <td>Общая сумма ставок</td>
                <td>{data.pvpGames.bouling.countCash}</td>
              </tr>
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    ) : (
      ""
    );

  return (
    <div id="homepage">
      <NavbarMenu lang={lang} pageTitle={"Home page"} />
      <Container>
        <Card bg={"light"} className="mb-2">
          <Card.Header>Статистика по платежам</Card.Header>
          <Card.Body>
            <Card.Text>
              Сумма пополнений: {data.orderStats.amountInMoney}
            </Card.Text>
            <Card.Text>
              Сумма выводов: {data.orderStats.amountOutMoney}
            </Card.Text>
            <Card.Text>
              Кол-во пополнений: {data.orderStats.countInOrder}
            </Card.Text>
            <Card.Text>
              Кол-во выводов: {data.orderStats.countOutOrder}
            </Card.Text>
          </Card.Body>
        </Card>
        <Card bg={"light"} className="mb-2">
          <Card.Header>Статистика по пользователям</Card.Header>
          <Card.Body>
            <Card.Text>Кол-во юзеров: {data.usersStats.countUsers}</Card.Text>
            <Card.Text>BtnStart: {data.usersStats.countBtnStart}</Card.Text>
            <Card.Text>
              Заблокированных: {data.usersStats.countUsersBlocked}
            </Card.Text>
          </Card.Body>
        </Card>
        <Card bg={"light"} className="mb-2">
          <Card.Header>Статистика по играм</Card.Header>
          <Card.Body>
            <h6>Кости</h6>
            <Table striped bordered hover style={{ fontSize: "14px" }}>
              <tbody>
                <tr>
                  <td>Кол-во игр</td>
                  <td>{data.gamesStats.mainGame.dice.countGame}</td>
                </tr>
                <tr>
                  <td>Кол-во выигранных</td>
                  <td>{data.gamesStats.mainGame.dice.countWinGame}</td>
                </tr>
                <tr>
                  <td>Общая сумма ставок</td>
                  <td>{data.gamesStats.mainGame.dice.countAmount}</td>
                </tr>
                <tr>
                  <td>Общая сумма выигрыша</td>
                  <td>{data.gamesStats.mainGame.dice.countWinAmount}</td>
                </tr>
              </tbody>
            </Table>

            <h6>Слоты</h6>
            <Table striped bordered hover style={{ fontSize: "14px" }}>
              <tbody>
                <tr>
                  <td>Кол-во игр</td>
                  <td>{data.gamesStats.mainGame.slot.countGame}</td>
                </tr>
                <tr>
                  <td>Кол-во выигранных</td>
                  <td>{data.gamesStats.mainGame.slot.countWinGame}</td>
                </tr>
                <tr>
                  <td>Общая сумма ставок</td>
                  <td>{data.gamesStats.mainGame.slot.countAmount}</td>
                </tr>
                <tr>
                  <td>Общая сумма выигрыша</td>
                  <td>{data.gamesStats.mainGame.slot.countWinAmount}</td>
                </tr>
              </tbody>
            </Table>

            <h6>Футбол</h6>
            <Table striped bordered hover style={{ fontSize: "14px" }}>
              <tbody>
                <tr>
                  <td>Кол-во игр</td>
                  <td>{data.gamesStats.mainGame.football.countGame}</td>
                </tr>
                <tr>
                  <td>Кол-во выигранных</td>
                  <td>{data.gamesStats.mainGame.football.countWinGame}</td>
                </tr>
                <tr>
                  <td>Общая сумма ставок</td>
                  <td>{data.gamesStats.mainGame.football.countAmount}</td>
                </tr>
                <tr>
                  <td>Общая сумма выигрыша</td>
                  <td>{data.gamesStats.mainGame.football.countWinAmount}</td>
                </tr>
              </tbody>
            </Table>
          </Card.Body>
        </Card>
        {pvpGamesCard}
      </Container>
    </div>
  );
}
