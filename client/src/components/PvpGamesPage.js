import React, { useState, useEffect } from "react";
import axios from "axios";

import NavbarMenu from "../containers/NavbarMenu";
import GridTable from "@nadavshaar/react-grid-table";

import { Button } from "react-bootstrap";

import "../styles/GamesPage.sass";

export default function PvpGames() {
  const [lang, setLang] = useState(null);
  const [game, setGame] = useState("🎲");
  const [isLoading, setLoading] = useState(false);
  const [rowsData, setRowsData] = useState([]);

  const getData = async (url, path) => {
    if (path === "🎲") {
      path = "get_pvpdice";
    }
    if (path === "⚽️") {
      path = "get_pvpfootball";
    }
    if (path === "🎳") {
      path = "get_pvpbouling";
    }
    await axios.get(`${url}/${path}`).then(({ data }) => {
      setRowsData(data);
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
    getData(url, "🎲");
  }, []);

  const columns = [
    {
      id: "1",
      field: "lobbyId",
      label: "LID",
      width: "150px",
      cellRenderer: ({ value, data }) => {
        const typeGame =
          data.typeGame === "🎲"
            ? "🎲"
            : data.typeGame === "⚽️"
            ? "⚽️"
            : "🎳";

        return (
          <div className="custom-cell">
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
        <div className="custom-cell">{value}</div>
      ),
    },
    {
      id: "3",
      field: "rivals",
      label: "Участники",
      width: "150px",
      sortable: false,
      cellRenderer: ({ value, data }) => (
        <div className="custom-cell">{value}</div>
      ),
    },
    {
      id: "4",
      field: "winner",
      label: "Победитель",
      width: "150px",
      sortable: false,
      cellRenderer: ({ value, data }) => (
        <div className="custom-cell">{value}</div>
      ),
    },
    {
      id: "5",
      field: "date",
      label: "Дата",
      width: "150px",
      cellRenderer: ({ value, data }) => (
        <div className="custom-cell">{value}</div>
      ),
    },
  ];

  const PageSize = () => {
    return "";
  };

  const Header = ({ tableManager }) => {
    const { searchApi } = tableManager;
    const { searchText, setSearchText } = searchApi;

    return (
      <div className="rgt-header-container">
        <div class="rgt-search-container">
          <label for="rgt-search" class="rgt-search-label">
            <span class="rgt-search-icon">⚲</span>Search:
          </label>
          <input
            name="rgt-search"
            type="search"
            className="rgt-search-input"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>
        <hr />
        <div className="games">
          <Button
            variant={game === "🎲" ? "primary" : "outline-primary"}
            size="sm"
            onClick={(e) => {
              e.preventDefault();
              const url =
                lang === "RU"
                  ? process.env.REACT_APP_URL_RU
                  : process.env.REACT_APP_URL_TUR;

              setLoading(true);
              setGame("🎲");
              getData(url, "🎲");
            }}
          >
            🎲 Dice
          </Button>
          <Button
            variant={game === "⚽️" ? "primary" : "outline-primary"}
            size="sm"
            onClick={(e) => {
              e.preventDefault();
              const url =
                lang === "RU"
                  ? process.env.REACT_APP_URL_RU
                  : process.env.REACT_APP_URL_TUR;

              setLoading(true);
              setGame("⚽️");
              getData(url, "⚽️");
            }}
          >
            ⚽️ Football
          </Button>
          <Button
            variant={game === "🎳" ? "primary" : "outline-primary"}
            size="sm"
            onClick={(e) => {
              e.preventDefault();
              const url =
                lang === "RU"
                  ? process.env.REACT_APP_URL_RU
                  : process.env.REACT_APP_URL_TUR;

              setLoading(true);
              setGame("🎳");
              getData(url, "🎳");
            }}
          >
            🎳 Bouling
          </Button>
        </div>
      </div>
    );
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
        components={{ Header, PageSize }}
      />
    </div>
  );
}
