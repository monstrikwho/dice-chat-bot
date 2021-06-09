import React, { useState, useEffect } from "react";
import axios from "axios";

import NavbarMenu from "../containers/NavbarMenu";
import GridTable from "@nadavshaar/react-grid-table";

import "../styles/GamesPage.sass";

export default function PvpGames() {
  const [lang, setLang] = useState(null);
  const [isLoading, setLoading] = useState(false);
  const [rowsData, setRowsData] = useState([]);

  const getData = async (url) => {
    await axios.get(`${url}/get_pvpdice`).then(({ data }) => {
      setRowsData(data.dice);
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

  const columns = [
    {
      id: "1",
      field: "lobbyId",
      label: "lobbyId",
      width: "150px",
      cellRenderer: ({ value, data }) => {
        const typeGame =
          data.typeGame === "🎲"
            ? "🎲"
            : data.typeGame === "⚽️"
            ? "⚽️"
            : "🎳";

        return (
          <div>
            {typeGame} {value}
          </div>
        );
      },
    },
    {
      id: "2",
      field: "prize",
      label: "Ставка",
      width: "150px",
      cellRenderer: ({ value, data }) => (
        <div className={data.result === "win" ? "res-win" : "res-lose"}>
          {value}
        </div>
      ),
    },
    {
      id: "3",
      field: "rivals",
      label: "Участники",
      width: "150px",
      sortable: false,
      cellRenderer: ({ value, data }) => (
        <div className={data.result === "win" ? "res-win" : "res-lose"}>
          {value}
        </div>
      ),
    },
    {
      id: "4",
      field: "winner",
      label: "Победитель",
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
      <NavbarMenu lang={lang} pageTitle={"PVP Games"} />
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
