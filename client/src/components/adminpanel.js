import React from "react";
import axios from "axios";
import ReactPaginate from "react-paginate";
import { ArrowLeftSVG, ArrowRightSVG } from "../assets/svg";
import {
  Container,
  Row,
  Spinner,
  Table,
  ButtonGroup,
  Button,
} from "react-bootstrap";

export default class AdminPanel extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      userArr: [],
      select50user: [],
      isLoading: false,
      countPage: 1,
      amountPage: 1,
    };
  }

  handlePageClick = (event) => {
    const select50user = this.state.userArr.slice(
      event.selected * 50,
      (event.selected + 1) * 50
    );
    this.setState({
      select50user,
    });
  };

  request = async () => {
    await axios
      .get("https://dice-bots.ru/api/get_users")
      .then(({ data }) => {
        this.setState({
          userArr: data.sort((a, b) => b.mainBalance - a.mainBalance),
          isLoading: true,
        });
      })
      .catch(function (error) {
        console.log(error);
      });
    const amountPage = Math.ceil(this.state.userArr.length / 50);
    const select50user = this.state.userArr.slice(0, 50);
    this.setState({
      amountPage,
      select50user,
    });
  };

  componentDidMount() {
    this.request();
  }

  render() {
    return (
      <Container>
        {this.state.isLoading ? (
          <div>
            <ButtonGroup aria-label="Basic example">
              <Button variant="secondary">По балансу</Button>
              <Button variant="secondary">Последние</Button>
            </ButtonGroup>
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Username</th>
                  <th>User ID</th>
                  <th>Demo Balance</th>
                  <th>Balance</th>
                </tr>
              </thead>
              <tbody>
                {this.state.select50user.map((item, index) => (
                  <tr key={index}>
                    <td>{index}</td>
                    <td>{item.usernName}</td>
                    <td>{item.userId}</td>
                    <td>{item.demoBalance}</td>
                    <td>{item.mainBalance}</td>
                  </tr>
                ))}
              </tbody>
            </Table>

            <ReactPaginate
              previousLabel={<ArrowLeftSVG />}
              nextLabel={<ArrowRightSVG />}
              breakLabel={"..."}
              breakClassName={"break-me"}
              pageCount={this.state.amountPage}
              marginPagesDisplayed={1}
              pageRangeDisplayed={3}
              onPageChange={this.handlePageClick}
              pageClassName={"page-item"}
              containerClassName={"pagination"}
              subContainerClassName={"pages pagination"}
              activeClassName={"active"}
            />
          </div>
        ) : (
          <div className="loading">
            <Spinner animation="border" />
            Идет загрузка...
          </div>
        )}
      </Container>
    );
  }
}
