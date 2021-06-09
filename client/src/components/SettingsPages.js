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
  const [lang, setLang] = useState(null);
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

  const getData = async (url) => {
    await axios.get(`${url}/get_settings`).then(({ data }) => {
      if (data) {
        setData(data);
        setLoading(false);
      }
    });
  };

  const saveChanges = async () => {
    setModalShow(true);
    setLoading(true);

    const url =
      lang === "RU"
        ? process.env.REACT_APP_URL_RU
        : process.env.REACT_APP_URL_TUR;

    await axios.post(`${url}/post_settings`, { data }).then(({ data }) => {
      if (data.status) {
        setLoading(false);
      }
    });
  };

  const changeToken = async () => {
    const token = data.webhook.qiwiToken;

    const url =
      lang === "RU"
        ? process.env.REACT_APP_URL_RU
        : process.env.REACT_APP_URL_TUR;

    await axios.post(`${url}/post_set_token`, { token });
    getData();
  };

  useEffect(() => {
    setLoading(true);
    const lang = localStorage.getItem("lang");
    setLang(lang);

    if (!lang) {
      localStorage.setItem("lang", "RU");
      setLang("RU");
    }

    const url =
      lang === "RU"
        ? process.env.REACT_APP_URL_RU
        : process.env.REACT_APP_URL_TUR;

    getData(url);
  }, []);

  if (loading) {
    return (
      <div id="settings-page" style={{ heigth: "100vh" }}>
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

  return (
    <div id="settings-page">
      <NavbarMenu lang={lang} pageTitle={"Settings page"} />
      <Container>
        <Form>
          <Card>
            <Card.Header as="h5">Common</Card.Header>
            <Card.Body>
              <h6>Коэффициенты игр</h6>

              <label>Slot Coef</label>
              {lang === "RU" ? (
                <Row>
                  <Col>
                    <FormControl
                      type="number"
                      onChange={(e) => {
                        setData({
                          ...data,
                          slotCoef: {
                            ...data.slotCoef,
                            x2: e.target.value,
                          },
                        });
                      }}
                      value={data.slotCoef}
                    />
                  </Col>
                </Row>
              ) : (
                <Row>
                  <Col>
                    <FormControl
                      type="number"
                      onChange={(e) => {
                        setData({
                          ...data,
                          slotCoef: {
                            ...data.slotCoef,
                            x2: e.target.value,
                          },
                        });
                      }}
                      value={data.slotCoef.x2}
                    />
                  </Col>
                  <Col>
                    <FormControl
                      type="number"
                      onChange={(e) => {
                        setData({
                          ...data,
                          slotCoef: {
                            ...data.slotCoef,
                            x3: e.target.value,
                          },
                        });
                      }}
                      value={data.slotCoef.x3}
                    />
                  </Col>
                  <Col>
                    <FormControl
                      type="number"
                      onChange={(e) => {
                        setData({
                          ...data,
                          slotCoef: {
                            ...data.slotCoef,
                            x3_7: e.target.value,
                          },
                        });
                      }}
                      value={data.slotCoef.x3_7}
                    />
                  </Col>
                </Row>
              )}

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

              {lang === "TUR" ? (
                <React.Fragment>
                  <label>Kanal bonus</label>
                  <FormControl
                    type="number"
                    onChange={(e) => {
                      setData({ ...data, kanalBonus: e.target.value });
                    }}
                    value={data.kanalBonus}
                  />

                  <label>TRYRUB</label>
                  <FormControl
                    type="number"
                    onChange={(e) => {
                      setData({ ...data, TRYRUB: e.target.value });
                    }}
                    value={data.TRYRUB}
                  />

                  <label>Exchange coef</label>
                  <FormControl
                    type="number"
                    onChange={(e) => {
                      setData({ ...data, exchangeCoef: e.target.value });
                    }}
                    value={data.exchangeCoef}
                  />

                  <label>Moder UID</label>
                  <FormControl
                    type="number"
                    onChange={(e) => {
                      setData({ ...data, moderId: e.target.value });
                    }}
                    value={data.moderId}
                  />
                </React.Fragment>
              ) : (
                ""
              )}

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

              {lang === "RU" ? (
                <React.Fragment>
                  <label>Min out cash</label>
                  <Row>
                    <Col>
                      <InputGroup className="mb-3">
                        <InputGroup.Prepend>
                          <InputGroup.Text id="basic-addon1">
                            Card
                          </InputGroup.Text>
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
                          <InputGroup.Text id="basic-addon1">
                            Qiwi
                          </InputGroup.Text>
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
                </React.Fragment>
              ) : (
                <React.Fragment>
                  <label>Min out cash</label>
                  <FormControl
                    type="number"
                    onChange={(e) => {
                      setData({ ...data, minOut: e.target.value });
                    }}
                    value={data.minOut}
                  />
                </React.Fragment>
              )}

              <label>PVP percent</label>
              <FormControl
                type="number"
                onChange={(e) => {
                  setData({ ...data, pvpPercent: e.target.value });
                }}
                value={data.pvpPercent}
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

              {lang === "RU" ? (
                <React.Fragment>
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
                </React.Fragment>
              ) : (
                ""
              )}

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

          {lang === "RU" ? (
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
          ) : (
            ""
          )}
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
