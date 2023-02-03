import { useCallback, useEffect, useRef, useState } from "react";
import { Helmet } from "react-helmet";
import "./App.css";
import onlineIcon from "./assets/online.svg";
import offlineIcon from "./assets/offline.svg";

const indicators = {
  OFFLINE: "offline",
  ONLINE: "online",
};

function Indicator({ indicator }) {
  return <span className={indicator === indicators.OFFLINE ? "offline" : "online"}>{indicator}</span>;
}

function History({ history }) {
  return (
    <table className="history">
      <caption>History</caption>
      <thead>
        <tr>
          <th>Time</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        {history.map((entry) => (
          <tr>
            <td>{entry.time.toLocaleTimeString()}</td>
            <td>
              <Indicator indicator={entry.status} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function App() {
  const sessionStart = useRef(new Date());
  const [indicator, setIndicator] = useState(navigator.onLine ? indicators.ONLINE : indicators.OFFLINE);
  const [history, setHistory] = useState([
    {
      status: indicator,
      time: sessionStart.current,
    },
  ]);

  const makeOnline = useCallback(() => {
    if (indicator === indicators.ONLINE) return;
    setIndicator(indicators.ONLINE);
    setHistory((oldHistory) => {
      const newEntry = {
        status: indicators.ONLINE,
        time: new Date(),
      };
      return [...oldHistory, newEntry];
    });
  }, [indicator]);

  const makeOffine = useCallback(() => {
    if (indicator === indicators.OFFLINE) return;
    setIndicator(indicators.OFFLINE);
    setHistory((oldHistory) => {
      const newEntry = {
        status: indicators.OFFLINE,
        time: new Date(),
      };
      return [...oldHistory, newEntry];
    });
  }, [indicator]);

  useEffect(() => {
    window.addEventListener("online", makeOnline);
    window.addEventListener("offline", makeOffine);
    return () => {
      window.removeEventListener("online", makeOnline);
      window.removeEventListener("offline", makeOffine);
    };
  }, [makeOffine, makeOnline]);

  return (
    <div className="App">
      <Helmet>
        <meta charset="UTF-8" />
        <link rel="icon" type="image/svg+xml" href={indicator === indicators.ONLINE ? onlineIcon : offlineIcon} />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{indicator.toUpperCase()}</title>
      </Helmet>
      <div className="indicator">
        <span>You are currently: </span>
        <Indicator indicator={indicator} />
      </div>
      <div className="sessionstart">
        <span>Start Time: </span>
        <span>{sessionStart.current.toLocaleTimeString()}</span>
      </div>
      <History history={history} />
    </div>
  );
}

export default App;
