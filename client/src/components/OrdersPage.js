import React, { useState, useEffect } from "react";
import axios from "axios";

import NavbarMenu from "../containers/NavbarMenu";
import GridTable from "@nadavshaar/react-grid-table";

import "../styles/OrdersPage.sass";

export default function OrdersPage() {
  const [isLoading, setLoading] = useState(false);
  const [rowsData, setRowsData] = useState([]);

  const getData = async () => {
    await axios
      .get(`${process.env.REACT_APP_URL}/get_orders_data`)
      .then(({ data }) => {
        setRowsData(data.orders);
        setLoading(false);
      });
  };

  useEffect(() => {
    setLoading(true);
    getData();
  }, []);

  const columns = [
    {
      id: "1",
      field: "amount",
      label: "Сумма",
      cellRenderer: ({
        tableManager,
        value,
        data,
        column,
        colIndex,
        rowIndex,
        onChange,
      }) => (
        <div className={data.type === "IN" ? "type-in" : "type-out"}>
          {value}
        </div>
      ),
    },
    {
      id: "2",
      field: "comment",
      label: "UID",
      cellRenderer: ({
        tableManager,
        value,
        data,
        column,
        colIndex,
        rowIndex,
        onChange,
      }) => (
        <div className={data.type === "IN" ? "type-in" : "type-out"}>
          {value}
        </div>
      ),
    },
    {
      id: "3",
      field: "account",
      label: "Аккаунт",
      cellRenderer: ({
        tableManager,
        value,
        data,
        column,
        colIndex,
        rowIndex,
        onChange,
      }) => (
        <div className={data.type === "IN" ? "type-in" : "type-out"}>
          {value}
        </div>
      ),
    },
    {
      id: "4",
      field: "txnId",
      label: "Order ID",
      cellRenderer: ({
        tableManager,
        value,
        data,
        column,
        colIndex,
        rowIndex,
        onChange,
      }) => (
        <div className={data.type === "IN" ? "type-in" : "type-out"}>
          {value}
        </div>
      ),
    },
    {
      id: "5",
      field: "date",
      label: "Дата",
      cellRenderer: ({
        tableManager,
        value,
        data,
        column,
        colIndex,
        rowIndex,
        onChange,
      }) => (
        <div className={data.type === "IN" ? "type-in" : "type-out"}>
          {value}
        </div>
      ),
    },
  ];

  const PageSize = () => {
    return "";
  };

  return (
    <div id="orders-page">
      <NavbarMenu />
      <GridTable
        rowIdField={"txnId"}
        columns={columns}
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
