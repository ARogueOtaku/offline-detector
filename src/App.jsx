import { useCallback, useEffect, useRef, useState } from "react";
import { Helmet, HelmetProvider } from "react-helmet-async";
import "./App.css";
import onlineIcon from "./assets/online.svg";
import offlineIcon from "./assets/offline.svg";
import { fetchWithTimeout } from "./utils";

function Indicator({ indicator }) {
  return <span className={indicator}>{indicator}</span>;
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
          <tr key={entry.time.getTime()}>
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
  const [theme, setTheme] = useState(matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  const [lastChecked, setLastChecked] = useState(sessionStart.current);
  const [indicator, setIndicator] = useState(navigator.onLine ? "online" : "offline");
  const [history, setHistory] = useState([
    {
      status: indicator,
      time: sessionStart.current,
    },
  ]);

  const makeOnline = useCallback(() => {
    if (indicator === "online") return;
    setIndicator("online");
    setHistory((oldHistory) => {
      const newEntry = {
        status: "online",
        time: new Date(),
      };
      return [...oldHistory, newEntry];
    });
  }, [indicator]);

  const makeOffine = useCallback(() => {
    if (indicator === "offline") return;
    setIndicator("offline");
    setHistory((oldHistory) => {
      const newEntry = {
        status: "offline",
        time: new Date(),
      };
      return [...oldHistory, newEntry];
    });
  }, [indicator]);

  const checkPulse = useCallback(async () => {
    try {
      setLastChecked(new Date());
      await fetchWithTimeout("https://jsonplaceholder.typicode.com/todos/1", 5000);
      makeOnline();
    } catch (e) {
      makeOffine();
    }
  }, [makeOnline, makeOffine]);

  useEffect(() => {
    const intervalId = setInterval(checkPulse, 10000);
    return () => clearInterval(intervalId);
  }, [checkPulse]);

  return (
    <div className={`App ${theme}`}>
      <HelmetProvider>
        <Helmet>
          <meta charset="UTF-8" />
          <link rel="icon" type="image/svg+xml" href={indicator === "online" ? onlineIcon : offlineIcon} />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>{indicator.toUpperCase()}</title>
        </Helmet>
      </HelmetProvider>
      <div className="indicator">
        <span>You are currently: </span>
        <Indicator indicator={indicator} />
      </div>
      <div className="sessiondetails">
        <span>Start Time: </span>
        <span>{sessionStart.current.toLocaleTimeString()}</span>
      </div>
      <div className="sessiondetails">
        <span>Last Checked at: </span>
        <span>{lastChecked.toLocaleTimeString()}</span>
      </div>
      <History history={history} />
    </div>
  );
}

export default App;
