import React from "react";
import axios from "axios";

import { Card, Container, Table } from "react-bootstrap";
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
              <h6>Кости</h6>
              <Table striped bordered hover style={{ fontSize: "14px" }}>
                <thead>
                  <tr>
                    <th></th>
                    <th>Основной счет</th>
                    <th>ДЕМО-счет</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Кол-во игр</td>
                    <td>{games.mainGame.dice.countGame}</td>
                    <td>{games.demoGame.dice.countGame}</td>
                  </tr>
                  <tr>
                    <td>Кол-во выигранных</td>
                    <td>{games.mainGame.dice.countWinGame}</td>
                    <td>{games.demoGame.dice.countWinGame}</td>
                  </tr>
                  <tr>
                    <td>Общая сумма ставок</td>
                    <td>{games.mainGame.dice.countAmount}</td>
                    <td>{games.demoGame.dice.countAmount}</td>
                  </tr>
                  <tr>
                    <td>Общая сумма выигрыша</td>
                    <td>{games.mainGame.dice.countWinAmount}</td>
                    <td>{games.demoGame.dice.countWinAmount}</td>
                  </tr>
                </tbody>
              </Table>
              
              <h6>Слоты</h6>
              <Table striped bordered hover style={{ fontSize: "14px" }}>
                <thead>
                  <tr>
                    <th></th>
                    <th>Основной счет</th>
                    <th>ДЕМО-счет</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Кол-во игр</td>
                    <td>{games.mainGame.slot.countGame}</td>
                    <td>{games.demoGame.slot.countGame}</td>
                  </tr>
                  <tr>
                    <td>Кол-во выигранных</td>
                    <td>{games.mainGame.slot.countWinGame}</td>
                    <td>{games.demoGame.slot.countWinGame}</td>
                  </tr>
                  <tr>
                    <td>Общая сумма ставок</td>
                    <td>{games.mainGame.slot.countAmount}</td>
                    <td>{games.demoGame.slot.countAmount}</td>
                  </tr>
                  <tr>
                    <td>Общая сумма выигрыша</td>
                    <td>{games.mainGame.slot.countWinAmount}</td>
                    <td>{games.demoGame.slot.countWinAmount}</td>
                  </tr>
                </tbody>
              </Table>

              <h6>Футбол</h6>
              <Table striped bordered hover style={{ fontSize: "14px" }}>
                <thead>
                  <tr>
                    <th></th>
                    <th>Основной счет</th>
                    <th>ДЕМО-счет</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Кол-во игр</td>
                    <td>{games.mainGame.football.countGame}</td>
                    <td>{games.demoGame.football.countGame}</td>
                  </tr>
                  <tr>
                    <td>Кол-во выигранных</td>
                    <td>{games.mainGame.football.countWinGame}</td>
                    <td>{games.demoGame.football.countWinGame}</td>
                  </tr>
                  <tr>
                    <td>Общая сумма ставок</td>
                    <td>{games.mainGame.football.countAmount}</td>
                    <td>{games.demoGame.football.countAmount}</td>
                  </tr>
                  <tr>
                    <td>Общая сумма выигрыша</td>
                    <td>{games.mainGame.football.countWinAmount}</td>
                    <td>{games.demoGame.football.countWinAmount}</td>
                  </tr>
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Container>
      </div>
    );
  }
}
