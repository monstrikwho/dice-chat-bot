import React, { useState, useEffect } from "react";
import axios from "axios";

import NavbarMenu from "../containers/NavbarMenu";
import GridTable from "@nadavshaar/react-grid-table";

export default function GamesPage() {
  const [isLoading, setLoading] = useState(false);
  const [rowsData, setRowsData] = useState([]);

  const getData = async () => {
    await axios
      .get(`${process.env.REACT_APP_URL}/get_games_data`)
      .then(({ data }) => {
        setRowsData(data.games);
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
      field: "typeGame",
      label: "typeGame",
    },
    {
      id: "2",
      field: "result",
      label: "result",
    },
    {
      id: "3",
      field: "typeBalance",
      label: "typeBalance",
    },
    {
      id: "4",
      field: "rateAmount",
      label: "rateAmount",
    },
    {
      id: "5",
      field: "rateWinAmount",
      label: "rateWinAmount",
    },
    {
      id: "6",
      field: "userId",
      label: "userId",
    },
    {
      id: "7",
      field: "date",
      label: "date",
    },
  ];

  const PageSize = () => {
    return "";
  };

  return (
    <div id="games-page">
      <NavbarMenu />
      <GridTable
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
