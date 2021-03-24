import React from "react";
import axios from "axios";

import { Card, Container } from "react-bootstrap";
import NavbarMenu from "../containers/NavbarMenu";

import "../styles/HomePage.sass";

export default class HomePage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      payments: {
        amountInMoney: 0,
        amountOutMoney: 0,
        countInOrder: 0,
        countOutOrder: 0,
      },
      users: {
        countUsers: 0,
        countBtnStart: 0,
        countUsersBlocked: 0,
        donaters: 0,
      },
      games: {
        demoGame: {
          dice: {
            countGame: 0,
            countWinGame: 0,
            countAmount: 0,
            countWinAmount: 0,
          },
          slot: {
            countGame: 0,
            countWinGame: 0,
            countAmount: 0,
            countWinAmount: 0,
          },
          football: {
            countGame: 0,
            countWinGame: 0,
            countAmount: 0,
            countWinAmount: 0,
          },
        },
        mainGame: {
          dice: {
            countGame: 0,
            countWinGame: 0,
            countAmount: 0,
            countWinAmount: 0,
          },
          slot: {
            countGame: 0,
            countWinGame: 0,
            countAmount: 0,
            countWinAmount: 0,
          },
          football: {
            countGame: 0,
            countWinGame: 0,
            countAmount: 0,
            countWinAmount: 0,
          },
        },
      },
    };

    this.getData = this.getData.bind(this);
  }

  getData = async () => {
    await axios
      .get(`${process.env.REACT_APP_URL}/get_stats`)
      .then(({ data }) => {
        this.setState({
          payments: data.stats.orderStats,
          users: data.stats.usersStats,
          games: data.stats.gamesStats,
        });
      });
  };

  componentDidMount() {
    this.getData();
  }

  render() {
    const payments = this.state.payments;
    const users = this.state.users;
    const games = this.state.games;
    return (
      <div id="homepage">
        <NavbarMenu />
        <Container>
          <Card bg={"light"} className="mb-2">
            <Card.Header>Статистика по платежам</Card.Header>
            <Card.Body>
              <Card.Text>AmountInMoney: {payments.amountInMoney}</Card.Text>
              <Card.Text>AmountOutMoney: {payments.amountOutMoney}</Card.Text>
              <Card.Text>CountInOrder: {payments.countInOrder}</Card.Text>
              <Card.Text>CountOutOrder: {payments.countOutOrder}</Card.Text>
            </Card.Body>
          </Card>
          <Card bg={"light"} className="mb-2">
            <Card.Header>Статистика по пользователям</Card.Header>
            <Card.Body>
              <Card.Text>CountUsers: {users.countUsers}</Card.Text>
              <Card.Text>BtnStart: {users.countBtnStart}</Card.Text>
              <Card.Text>CountBlocked: {users.countUsersBlocked}</Card.Text>
              <Card.Text>Donaters: {users.donaters.length}</Card.Text>
            </Card.Body>
          </Card>
          <Card bg={"light"} className="mb-2">
            <Card.Header>Статистика по играм</Card.Header>
            <Card.Body>
              <Card.Text>
                Кости
                <br />- countGame: {games.mainGame.dice.countGame} -{" "}
                {games.demoGame.dice.countGame}
                <br />- countWinGame: {games.mainGame.dice.countWinGame} -{" "}
                {games.demoGame.dice.countWinGame}
                <br />- countAmount: {games.mainGame.dice.countAmount} -{" "}
                {games.demoGame.dice.countAmount}
                <br />- countWinAmount: {
                  games.mainGame.dice.countWinAmount
                } - {games.demoGame.dice.countWinAmount}
                <br />
              </Card.Text>
              <Card.Text>
                Слоты
                <br />- countGame: {games.mainGame.slot.countGame} -{" "}
                {games.demoGame.slot.countGame}
                <br />- countWinGame: {games.mainGame.slot.countWinGame} -{" "}
                {games.demoGame.slot.countWinGame}
                <br />- countAmount: {games.mainGame.slot.countAmount} -{" "}
                {games.demoGame.slot.countAmount}
                <br />- countWinAmount: {
                  games.mainGame.slot.countWinAmount
                } - {games.demoGame.slot.countWinAmount}
                <br />
              </Card.Text>
              <Card.Text>
                Футбол
                <br />- countGame: {games.mainGame.football.countGame} -{" "}
                {games.demoGame.football.countGame}
                <br />- countWinGame: {
                  games.mainGame.football.countWinGame
                } - {games.demoGame.football.countWinGame}
                <br />- countAmount: {
                  games.mainGame.football.countAmount
                } - {games.demoGame.football.countAmount}
                <br />- countWinAmount: {
                  games.mainGame.football.countWinAmount
                }{" "}
                - {games.demoGame.football.countWinAmount}
                <br />
              </Card.Text>
            </Card.Body>
          </Card>
        </Container>
      </div>
    );
  }
}
