module.exports.raspPhoto = `
<head>
<style>
  * {
    padding: 0;
    margin: 0;
  }
  
  html {
    width: 680px;
    background-color: #edeef0;
  }
  
  body {
    padding: 15 12px
  }

  .footer {
    margin-top: 12px;
    display: flex;
    justify-content: center;
    font-size: 18px;
  }

  .header {
    padding: 2px 0;
    width: 100%;
    display: flex;
    color: #fff;
    background: #55677D;
    border-radius: 8px;
    box-shadow: 0px 0px 2px rgba(0, 0, 0, 0.08), 0px 2px 24px rgba(0, 0, 0, 0.08);
  }

  .time-update {
    margin-top: 20px;
    padding: 2px 4px;
    background-color: #4e5966;
    color: #fff;
    text-align: center;
    border-radius: 4px;
  }

  .day-block {
    margin-top: 15px;
    width: 100%;
    display: flex;
    background: #fff;
    border-radius: 8px;
    box-shadow: 2px 4px 12px rgba(12, 12, 12, 0.2);
  }

  .left-content {
    padding: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    border-radius: 8px 0 0 8px;
    background-color: #5181b8;
    color: #fff;
  }

  .right-content {
    flex-grow: 1;
  }

  .row {
    padding: 4px;
    display: flex;
    border-bottom: 1px solid #d7d8d9;
  }

  .row:first-child {
    border-radius: 0 8px 0 0;
  }

  .row:last-child {
    border: none;
    border-radius: 0 0 8px 0;
  }

  .row div {
    padding: 4px;
  }

  .select {
    /* width: calc(100% - 17px); */
    background-color: #ffd6cc;
    border-bottom: 1px solid #fff;
  }

  .date {
    width: 50px;
  }

  .time {
    width: 90px;
    align-self: center;
    text-align: center;
  }

  .descipline {
    width: 190px;
    align-self: center;
  }

  .subgroup {
    width: 20px;
    align-self: center;
  }

  .teacher {
    width: 140px;
    align-self: center;
  }

  .audience {
    width: 90px;
    align-self: center;
  }

  .type {
    width: 30px;
    display: flex;
    flex-direction: column;
    color: #fff;
  }

  .type div {
    padding: 2px 4px;
    border-radius: 4px;
    text-align: center;
  }

  div[name="pz"] {
    background-color: #e64646;
  }
  div[name="lk"] {
    background-color: #4bb34b;
  }
  div[name="lz"] {
    background-color: #ffc107;
  }
  div[name="sz"] {
    background-color: #63b9ba;
  }
  div[name="kp"] {
    background-color: #017072;
  }
</style>
</head>
`