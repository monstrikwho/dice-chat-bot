import React, { useState } from "react";
import axios from "axios";

import { Form, Button, Col, Container, Modal, Spinner } from "react-bootstrap";
import NavbarMenu from "../containers/NavbarMenu";

export default function MailingPage() {
  const [textArea, setTextArea] = useState("");
  const [btnStart, setBtnStart] = useState("false");
  const [modalShow, setModalShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const sendMailing = async () => {
    setModalShow(true);
    setLoading(true);
    await axios
      .post(`${process.env.REACT_APP_URL}/post_mailing`, {
        textArea,
        btnStart,
      })
      .then(({ data }) => {
        if (data.status) {
          setLoading(false);
        }
      });
  };

  return (
    <div id="mailing-page">
      <NavbarMenu />
      <Container>
        <Form>
          <Form.Group controlId="exampleForm.ControlTextarea1">
            <Form.Label>Сообщение для рассылки</Form.Label>
            <Form.Control
              as="textarea"
              rows={6}
              value={textArea}
              onChange={(e) => {
                e.preventDefault();
                setTextArea(e.target.value);
              }}
            />
          </Form.Group>
          <Form.Group
            controlId="exampleForm.ControlSelect1"
            style={{ display: "flex" }}
          >
            <Col>
              <Form.Label>Кнопка "СТАРТ"</Form.Label>
            </Col>
            <Col>
              <Form.Control
                as="select"
                defaultValue={btnStart}
                onChange={(e) => {
                  e.preventDefault();
                  setBtnStart(e.target.value);
                }}
              >
                <option value="false">False</option>
                <option value="true">True</option>
              </Form.Control>
            </Col>
          </Form.Group>
          <Button
            variant="primary"
            onClick={(e) => {
              e.preventDefault();
              sendMailing();
            }}
            block
          >
            Submit
          </Button>
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
            <Modal.Body>Сообщение успешно отправлено.</Modal.Body>
            <Modal.Footer>
              <Button onClick={() => setModalShow(false)}>Close</Button>
            </Modal.Footer>
          </React.Fragment>
        )}
      </Modal>
    </div>
  );
}
