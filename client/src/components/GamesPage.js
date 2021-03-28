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
      cellRenderer: ({
        tableManager,
        value,
        data,
        column,
        colIndex,
        rowIndex,
        onChange,
      }) => {
        const typeGame =
          data.typeGame === "football"
            ? "⚽️"
            : data.typeGame === "dice"
            ? "🎲"
            : "🎰";
        const result = data.result === "win" ? "res-win" : "res-lose";
        const typeBalance = data.typeBalance === "mainGame" ? "⭐️" : "";

        return (
          <div className={result}>
            {typeGame} {value} <span>{typeBalance}</span>
          </div>
        );
      },
    },
    {
      id: "2",
      field: "rateWinAmount",
      label: "Выигрыш",
      cellRenderer: ({
        tableManager,
        value,
        data,
        column,
        colIndex,
        rowIndex,
        onChange,
      }) => (
        <div className={data.result === "win" ? "res-win" : "res-lose"}>
          {value}
        </div>
      ),
    },
    {
      id: "3",
      field: "userId",
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
        <div className={data.result === "win" ? "res-win" : "res-lose"}>
          {value}
        </div>
      ),
    },
    {
      id: "4",
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
