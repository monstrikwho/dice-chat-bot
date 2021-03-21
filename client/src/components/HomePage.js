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
        btnStart: 0,
        countUsersBlocked: 0,
        donatedUsers: 0,
      },
      games: {
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
      },
    };

    this.getData = this.getData.bind(this);
  }

  getData = async () => {
    await axios
      .get(`${process.env.REACT_APP_URL}/get_stats`)
      .then(({ data }) => {
        const stats = data.stats;
        delete stats.orderStats.lastNumberOrder;
        delete stats.usersStats.countRefUsers;
        delete stats.games.football;
        this.setState({
          payments: stats.orderStats,
          users: stats.usersStats,
          games: stats.games,
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
              <Card.Text>BtnStart: {users.btnStart}</Card.Text>
              <Card.Text>CountBlocked: {users.countUsersBlocked}</Card.Text>
              <Card.Text>Donaters: {users.donatedUsers.length}</Card.Text>
            </Card.Body>
          </Card>
          <Card bg={"light"} className="mb-2">
            <Card.Header>Статистика по играм</Card.Header>
            <Card.Body>
              <Card.Text>
                Кости
                <br />- countGame: {games.dice.countGame}
                <br />- countWinGame: {games.dice.countWinGame} <br />-
                countAmount: {games.dice.countAmount}
                <br />- countWinAmount: {games.dice.countWinAmount}
                <br />
              </Card.Text>
              <Card.Text>
                Слоты
                <br />- countGame: {games.slot.countGame}
                <br />- countWinGame: {games.slot.countWinGame} <br />-
                countAmount: {games.slot.countAmount}
                <br />- countWinAmount: {games.slot.countWinAmount}
                <br />
              </Card.Text>
            </Card.Body>
          </Card>
        </Container>
      </div>
    );
  }
}
