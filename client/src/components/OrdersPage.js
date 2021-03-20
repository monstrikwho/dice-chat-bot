import React, { useState, useEffect } from "react";
import axios from "axios";

import NavbarMenu from "../containers/NavbarMenu";
import GridTable from "@nadavshaar/react-grid-table";

export default function OrdersPage() {
  const [isLoading, setLoading] = useState(false);
  const [rowsData, setRowsData] = useState([]);

  const getData = async () => {
    await axios
      .get(`https://dice-bots.ru/api/get_orders_data`)
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
      field: "type",
      label: "type",
    },
    {
      id: "2",
      field: "amount",
      label: "amount",
    },
    {
      id: "3",
      field: "comment",
      label: "comment",
    },
    {
      id: "4",
      field: "account",
      label: "account",
    },
    {
      id: "5",
      field: "txnId",
      label: "txnId",
    },
    {
      id: "6",
      field: "date",
      label: "date",
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
