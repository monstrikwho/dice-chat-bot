import React, { useState, useEffect } from "react";
import axios from "axios";

import NavbarMenu from "../containers/NavbarMenu";
import GridTable from "@nadavshaar/react-grid-table";

import "../styles/GamesPage.sass";

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
      field: "rateAmount",
      label: "Сумма",
      width: "150px",
      cellRenderer: ({ value, data }) => {
        const typeGame =
          data.typeGame === "football"
            ? "⚽️"
            : data.typeGame === "dice"
            ? "🎲"
            : "🎰";
        const result = data.result === "win" ? "res-win" : "res-lose";

        return (
          <div className={result}>
            {typeGame} {value}
          </div>
        );
      },
    },
    {
      id: "2",
      field: "typeBalance",
      label: "⭐️",
      width: "80px",
      cellRenderer: ({ data }) => {
        const typeBalance = data.typeBalance === "mainGame" ? "⭐️" : "";
        return (
          <div className={data.result === "win" ? "res-win" : "res-lose"}>
            {typeBalance}
          </div>
        );
      },
    },
    {
      id: "3",
      field: "rateWinAmount",
      label: "Выигрыш",
      width: "150px",
      cellRenderer: ({ value, data }) => (
        <div className={data.result === "win" ? "res-win" : "res-lose"}>
          {value}
        </div>
      ),
    },
    {
      id: "4",
      field: "userId",
      label: "UID",
      width: "150px",
      sortable: false,
      cellRenderer: ({ value, data }) => (
        <div className={data.result === "win" ? "res-win" : "res-lose"}>
          {value}
        </div>
      ),
    },
    {
      id: "5",
      field: "date",
      label: "Дата",
      width: "150px",
      cellRenderer: ({ value, data }) => (
        <div className={data.result === "win" ? "res-win" : "res-lose"}>
          {value}
        </div>
      ),
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
