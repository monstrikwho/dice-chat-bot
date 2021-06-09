import React, { useState, useEffect } from "react";
import axios from "axios";

import NavbarMenu from "../containers/NavbarMenu";
import GridTable from "@nadavshaar/react-grid-table";

import { Container, Spinner } from "react-bootstrap";

import "../styles/OrdersPage.sass";

export default function OrdersPage() {
  const [lang, setLang] = useState(null);
  const [isLoading, setLoading] = useState(false);
  const [rowsData, setRowsData] = useState([]);

  const getData = async (url) => {
    await axios.get(`${url}/get_orders_data`).then(({ data }) => {
      setRowsData(data.orders);
      setLoading(false);
    });
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

  const status = (data) => {
    if (data.status === "paid") return "bg-green";
    if (data.status === "waiting") return "bg-light3";
    if (data.status === "passed") return "bg-red";
  };

  const columns = [
    {
      id: "1",
      field: "amount",
      label: "Сумма",
      width: "100px",
      cellRenderer: ({ value, data }) => (
        <div className={data.type === "IN" ? "type-in" : "type-out"}>
          {value}
        </div>
      ),
    },
    {
      id: "2",
      field: "comment",
      label: "UID",
      width: "150px",
      sortable: false,
      cellRenderer: ({ value, data }) => (
        <div className={data.type === "IN" ? "type-in" : "type-out"}>
          {value}
        </div>
      ),
    },
    {
      id: "3",
      field: "account",
      label: "Аккаунт",
      width: "180px",
      sortable: false,
      cellRenderer: ({ value, data }) => (
        <div className={data.type === "IN" ? "type-in" : "type-out"}>
          {value}
        </div>
      ),
    },
    {
      id: "4",
      field: "txnId",
      label: "Order ID",
      width: "150px",
      sortable: false,
      cellRenderer: ({ value, data }) => (
        <div className={data.type === "IN" ? "type-in" : "type-out"}>
          {value}
        </div>
      ),
    },
    {
      id: "5",
      field: "isRef",
      label: "Пригласил",
      width: "150px",
      sortable: false,
      getValue: ({ value }) => {
        if (!value) return "";
        return value;
      },
      cellRenderer: ({ value, data }) => (
        <div className={data.type === "IN" ? "type-in" : "type-out"}>
          {value}
        </div>
      ),
    },
    {
      id: "6",
      field: "refCash",
      label: "Кэш isRef",
      width: "200px",
      sortable: false,
      getValue: ({ value }) => {
        if (!value) return "";
        return value;
      },
      cellRenderer: ({ value, data }) => (
        <div className={data.type === "IN" ? "type-in" : "type-out"}>
          {value}
        </div>
      ),
    },
    {
      id: "7",
      field: "date",
      label: "Дата",
      width: "130px",
      cellRenderer: ({ value, data }) => (
        <div className={data.type === "IN" ? "type-in" : "type-out"}>
          {value}
        </div>
      ),
    },
  ];

  const columns_tur = [
    {
      id: "1",
      field: "amount",
      label: "Сумма",
      width: "100px",
      cellRenderer: ({ value, data }) => (
        <div className={status(data)}>{data.amount.tl}</div>
      ),
    },
    {
      id: "2",
      field: "userId",
      label: "UID",
      width: "180px",
      sortable: false,
      cellRenderer: ({ value, data }) => (
        <div className={status(data)}>{value}</div>
      ),
    },
    {
      id: "3",
      field: "id",
      label: "Order id",
      width: "180px",
      sortable: false,
      cellRenderer: ({ value, data }) => (
        <div className={status(data)}>{value}</div>
      ),
    },
    {
      id: "4",
      field: "date",
      label: "Дата",
      width: "130px",
      cellRenderer: ({ value, data }) => (
        <div className={status(data)}>{value}</div>
      ),
    },
  ];

  const PageSize = () => {
    return "";
  };

  if (isLoading) {
    return (
      <div id="settings-page" style={{ heigth: "100vh" }}>
        <NavbarMenu lang={lang} pageTitle={"Orders page"} />
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
    <div id="orders-page">
      <NavbarMenu lang={lang} pageTitle={"Orders page"} />
      <GridTable
        rowIdField={"txnId"}
        columns={lang === "RU" ? columns : columns_tur}
        rows={rowsData}
        pageSize={50}
        minSearchChars={1}
        isLoading={isLoading}
        enableColumnsReorder={false}
        showColumnVisibilityManager={false}
        components={{ PageSize }}
      />
    </div>
  );
}
