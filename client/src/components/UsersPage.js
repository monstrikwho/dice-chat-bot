import React, { useState, useEffect } from "react";
import axios from "axios";

import NavbarMenu from "../containers/NavbarMenu";
import GridTable from "@nadavshaar/react-grid-table";

import "../styles/UsersPage.sass";

export default function UsersPage() {
  const [lang, setLang] = useState(null);
  const [isLoading, setLoading] = useState(false);
  const [rowsData, setRowsData] = useState([]);

  const getData = async (url) => {
    await axios.get(`${url}/get_user_data`).then(({ data }) => {
      setRowsData(data.users);
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

  const changeRow = async (tableManager, data) => {
    const url =
      lang === "RU"
        ? process.env.REACT_APP_URL_RU
        : process.env.REACT_APP_URL_TUR;

    await axios.post(`${url}/post_update_user`, data).then(() => {
      let rowsClone = [...rowsData];
      let updatedRowIndex = rowsClone.findIndex(
        (r) => r.userId === data.userId
      );
      rowsClone[updatedRowIndex] = data;
      setRowsData(rowsClone);
      tableManager.rowEditApi.setEditRowId(null);
    });
  };

  const columns = [
    {
      id: "1",
      field: "userId",
      label: "UID",
      width: "130px",
      editable: false,
      sortable: false,
      getValue: ({ value }) => value.toString(),
      cellRenderer: ({ value, data }) => (
        <div
          className={
            data.isBlocked === false ? "is-block-false" : "is-block-true"
          }
        >
          {value}
        </div>
      ),
    },
    {
      id: "2",
      field: "mainBalance",
      label: "MainBalance",
      width: "150px",
      searchable: false,
      getValue: ({ value }) => value.toString(),
      cellRenderer: ({ value, data }) => (
        <div
          className={
            data.isBlocked === false ? "is-block-false" : "is-block-true"
          }
        >
          {value}
        </div>
      ),
    },
    {
      id: "3",
      field: "demoBalance",
      label: "DemoBalance",
      width: "150px",
      searchable: false,
      getValue: ({ value }) => value.toString(),
      cellRenderer: ({ value, data }) => (
        <div
          className={
            data.isBlocked === false ? "is-block-false" : "is-block-true"
          }
        >
          {value}
        </div>
      ),
    },
    {
      id: "4",
      field: "userRights",
      label: "Права доступа",
      width: "150px",
      sortable: false,
      cellRenderer: ({ value, data }) => (
        <div
          className={
            data.isBlocked === false ? "is-block-false" : "is-block-true"
          }
        >
          {value}
        </div>
      ),
    },
    {
      id: "5",
      field: "userName",
      label: "User Name",
      width: "200px",
      editable: false,
      sortable: false,
      getValue: ({ value }) => {
        if (!value) return "";
        return value;
      },
      cellRenderer: ({ value, data }) => (
        <div
          className={
            data.isBlocked === false ? "is-block-false" : "is-block-true"
          }
        >
          {value}
        </div>
      ),
    },
    {
      id: "6",
      field: "isRef",
      label: "Пригласил",
      width: "130px",
      searchable: false,
      editable: false,
      sortable: false,
      cellRenderer: ({ value, data }) => (
        <div
          className={
            data.isBlocked === false ? "is-block-false" : "is-block-true"
          }
        >
          {value}
        </div>
      ),
    },
    {
      id: "7",
      field: "refCash",
      label: "Кэш с рефералки",
      width: "180px",
      searchable: false,
      editable: false,
      cellRenderer: ({ value, data }) => (
        <div
          className={
            data.isBlocked === false ? "is-block-false" : "is-block-true"
          }
        >
          {value}
        </div>
      ),
    },
    {
      id: "8",
      field: "countRef",
      label: "Кол-во рефералов",
      width: "180px",
      searchable: false,
      editable: false,
      cellRenderer: ({ value, data }) => (
        <div
          className={
            data.isBlocked === false ? "is-block-false" : "is-block-true"
          }
        >
          {value}
        </div>
      ),
    },
    {
      id: "9",
      field: "regDate",
      label: "RegDate",
      width: "130px",
      searchable: false,
      editable: false,
      cellRenderer: ({ value, data }) => (
        <div
          className={
            data.isBlocked === false ? "is-block-false" : "is-block-true"
          }
        >
          {value}
        </div>
      ),
    },
    {
      id: "my-buttons",
      width: "max-content",
      pinned: true,
      sortable: false,
      resizable: false,
      cellRenderer: ({ tableManager, data }) => (
        <button
          style={{ margin: 10 }}
          onClick={(e) => {
            tableManager.rowEditApi.setEditRowId(data.userId);
          }}
        >
          &#x270E;
        </button>
      ),
      editorCellRenderer: ({ tableManager, data }) => (
        <div style={{ display: "inline-flex" }}>
          <button
            style={{ marginLeft: 20 }}
            onClick={(e) => tableManager.rowEditApi.setEditRowId(null)}
          >
            &#x2716;
          </button>
          <button
            style={{ marginLeft: 10, marginRight: 20 }}
            onClick={(e) => {
              changeRow(tableManager, data);
            }}
          >
            &#x2714;
          </button>
        </div>
      ),
    },
  ];

  const PageSize = () => {
    return "";
  };

  return (
    <div id="users-page">
      <NavbarMenu lang={lang} pageTitle={"Users page"} />
      <GridTable
        rowIdField={"userId"}
        columns={columns}
        onColumnsChange={() => {}}
        rows={rowsData}
        pageSize={50}
        minSearchChars={1}
        showColumnVisibilityManager={false}
        enableColumnsReorder={false}
        components={{ PageSize }}
        isLoading={isLoading}
        // onSearchTextChange={(searchText, tableManager) => {
        //   // tableManager.searchApi.setSearchText(searchText);
        //   tableManager.searchApi.searchRows(rowsData);
        // }}
        onRowClick={(
          { rowIndex, data, column, isEdit, event },
          tableManager
        ) => {
          !isEdit &&
            tableManager.rowSelectionApi.getIsRowSelectable(data.id) &&
            tableManager.rowSelectionApi.toggleRowSelection(data.id);
        }}
      />
    </div>
  );
}
