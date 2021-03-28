import React, { useState, useEffect } from "react";
import axios from "axios";

import "../styles/SettingsPage.sass";

import {
  Form,
  Button,
  Row,
  Col,
  Container,
  Modal,
  Spinner,
  InputGroup,
  FormControl,
  Card,
} from "react-bootstrap";
import NavbarMenu from "../containers/NavbarMenu";

export default function SettingsPage() {
  const [data, setData] = useState({
    constRef: 0,
    minGameRate: 0,
    minIn: 0,
    minOut: {
      card: 0,
      qiwi: 0,
    },
    outPercent: 0,
    bonusRefPercent: 0,
    bonusRefDaughter: 0,
    bonusRefFather: 0,
    startDemoBalance: 0,
    slotCoef: 0,
    footballCoef: {
      goal: 0,
      out: 0,
    },
    diceCoef: { one: 0, evenodd: 0, two: 0 },
    webhook: {
      qiwiWallet: "qiwiWallet",
      qiwiToken: "qiwiToken",
      hookUrl: "hookUrl",
      hookId: "hookId",
      authSecret: "authSecret",
    },
  });
  const [modalShow, setModalShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const getData = async () => {
    await axios
      .get(`${process.env.REACT_APP_URL}/get_settings`)
      .then(({ data }) => {
        if (data) {
          setData(data);
        }
      });
  };

  const saveChanges = async () => {
    setModalShow(true);
    setLoading(true);
    await axios
      .post(`${process.env.REACT_APP_URL}/post_settings`, { data })
      .then(({ data }) => {
        if (data.status) {
          setLoading(false);
        }
      });
  };

  const changeToken = async () => {
    const token = data.webhook.qiwiToken;
    await axios.post(`${process.env.REACT_APP_URL}/post_set_token`, { token });
    getData();
  };

  useEffect(() => {
    getData();
  }, []);

  return (
    <div id="settings-page">
      <NavbarMenu />
      <Container>
        <Form>
          <Card>
            <Card.Header as="h5">Common</Card.Header>
            <Card.Body>
              <h6>Коэффициенты игр</h6>

              <label>Slot Coef</label>
              <Row>
                <Col>
                  <FormControl
                    type="number"
                    onChange={(e) => {
                      setData({ ...data, slotCoef: e.target.value });
                    }}
                    value={data.slotCoef}
                  />
                </Col>
              </Row>

              <label>Football Coef</label>
              <Row>
                <Col>
                  <FormControl
                    type="number"
                    onChange={(e) => {
                      setData({
                        ...data,
                        footballCoef: {
                          ...data.footballCoef,
                          goal: e.target.value,
                        },
                      });
                    }}
                    value={data.footballCoef.goal}
                  />
                </Col>
                <Col>
                  <FormControl
                    type="number"
                    onChange={(e) => {
                      setData({
                        ...data,
                        footballCoef: {
                          ...data.footballCoef,
                          out: e.target.value,
                        },
                      });
                    }}
                    value={data.footballCoef.out}
                  />
                </Col>
              </Row>

              <label>Dice Coef</label>
              <Row>
                <Col>
                  <FormControl
                    type="number"
                    onChange={(e) => {
                      setData({
                        ...data,
                        diceCoef: {
                          ...data.diceCoef,
                          one: e.target.value,
                        },
                      });
                    }}
                    value={data.diceCoef.one}
                  />
                </Col>
                <Col>
                  <FormControl
                    type="number"
                    onChange={(e) => {
                      setData({
                        ...data,
                        diceCoef: {
                          ...data.diceCoef,
                          two: e.target.value,
                        },
                      });
                    }}
                    value={data.diceCoef.two}
                  />
                </Col>
                <Col>
                  <FormControl
                    type="number"
                    onChange={(e) => {
                      setData({
                        ...data,
                        diceCoef: {
                          ...data.diceCoef,
                          evenodd: e.target.value,
                        },
                      });
                    }}
                    value={data.diceCoef.evenodd}
                  />
                </Col>
              </Row>

              <hr />
              <h6 className="mt-3">Другие</h6>

              <label>Start demo balance</label>
              <FormControl
                type="number"
                onChange={(e) => {
                  setData({ ...data, startDemoBalance: e.target.value });
                }}
                value={data.startDemoBalance}
              />

              <label>Min game rate</label>
              <FormControl
                type="number"
                onChange={(e) => {
                  setData({ ...data, minGameRate: e.target.value });
                }}
                value={data.minGameRate}
              />

              <label>Min in cash</label>
              <FormControl
                type="number"
                onChange={(e) => {
                  setData({ ...data, minIn: e.target.value });
                }}
                value={data.minIn}
              />

              <label>Min out cash</label>
              <Row>
                <Col>
                  <InputGroup className="mb-3">
                    <InputGroup.Prepend>
                      <InputGroup.Text id="basic-addon1">Card</InputGroup.Text>
                    </InputGroup.Prepend>
                    <FormControl
                      type="number"
                      onChange={(e) => {
                        setData({
                          ...data,
                          minOut: { ...data.minOut, card: e.target.value },
                        });
                      }}
                      value={data.minOut.card}
                    />
                  </InputGroup>
                </Col>
                <Col>
                  <InputGroup className="mb-3">
                    <InputGroup.Prepend>
                      <InputGroup.Text id="basic-addon1">Qiwi</InputGroup.Text>
                    </InputGroup.Prepend>
                    <FormControl
                      type="number"
                      onChange={(e) => {
                        setData({
                          ...data,
                          minOut: { ...data.minOut, qiwi: e.target.value },
                        });
                      }}
                      value={data.minOut.qiwi}
                    />
                  </InputGroup>
                </Col>
              </Row>

              <label>Out percent</label>
              <FormControl
                type="number"
                onChange={(e) => {
                  setData({ ...data, outPercent: e.target.value });
                }}
                value={data.outPercent}
              />

              <label>Const ref (0 or UID)</label>
              <FormControl
                type="number"
                onChange={(e) => {
                  setData({ ...data, constRef: e.target.value });
                }}
                value={data.constRef}
              />

              <label>Bonus ref percent</label>
              <FormControl
                type="number"
                onChange={(e) => {
                  setData({ ...data, bonusRefPercent: e.target.value });
                }}
                value={data.bonusRefPercent}
              />

              <label>Bonus ref daughter</label>
              <FormControl
                type="number"
                onChange={(e) => {
                  setData({ ...data, bonusRefDaughter: e.target.value });
                }}
                value={data.bonusRefDaughter}
              />

              <label>Bonus ref father</label>
              <FormControl
                type="number"
                onChange={(e) => {
                  setData({ ...data, bonusRefFather: e.target.value });
                }}
                value={data.bonusRefFather}
              />

              <label>Auth Secret</label>
              <Form.Control
                type="text"
                onChange={(e) => {
                  setData({
                    ...data,
                    webhook: {
                      ...data.webhook,
                      authSecret: e.target.value,
                    },
                  });
                }}
                value={data.webhook.authSecret}
              />
              <Button
                variant="primary"
                onClick={(e) => {
                  e.preventDefault();
                  saveChanges();
                }}
                block
              >
                Save changes
              </Button>
            </Card.Body>
          </Card>

          <Card>
            <Card.Header as="h5">Webhook</Card.Header>
            <Card.Body>
              <Card.Text>
                Чтобы изменить КИВИ токен, введите его ниже и нажмите кнопку
                "Изменить токен"
              </Card.Text>

              <label>qiwiToken</label>
              <Form.Control
                type="text"
                onChange={(e) => {
                  setData({
                    ...data,
                    webhook: {
                      ...data.webhook,
                      qiwiToken: e.target.value,
                    },
                  });
                }}
                value={data.webhook.qiwiToken}
              />

              <label>qiwiWallet</label>
              <Form.Control value={data.webhook.qiwiWallet} disabled />

              <label>Webhook Uri</label>
              <Form.Control value={data.webhook.hookUrl} disabled />

              <label>Webhook Id</label>
              <Form.Control value={data.webhook.hookId} disabled />

              <Button
                variant="primary"
                onClick={(e) => {
                  e.preventDefault();
                  changeToken();
                }}
                block
              >
                Change Token
              </Button>
            </Card.Body>
          </Card>
        </Form>
      </Container>

      <Modal
        centered
        show={modalShow}
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
      >
        {loading ? (
          <Spinner animation="border" />
        ) : (
          <React.Fragment>
            <Modal.Body>Данные успешно изменены</Modal.Body>
            <Modal.Footer>
              <Button onClick={() => setModalShow(false)}>Close</Button>
            </Modal.Footer>
          </React.Fragment>
        )}
      </Modal>
    </div>
  );
}
