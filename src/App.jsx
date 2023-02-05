import { useCallback, useEffect, useRef, useState } from "react";
import { Helmet, HelmetProvider } from "react-helmet-async";
import "./App.css";
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
    setIndicator("online");
    setHistory((oldHistory) => {
      if (oldHistory.at(-1).status === "online") return [...oldHistory];
      const newEntry = {
        status: "online",
        time: new Date(),
      };
      return [...oldHistory, newEntry];
    });
  }, []);

  const makeOffine = useCallback(() => {
    setIndicator("offline");
    setHistory((oldHistory) => {
      if (oldHistory.at(-1).status === "offline") return [...oldHistory];
      const newEntry = {
        status: "offline",
        time: new Date(),
      };
      return [...oldHistory, newEntry];
    });
  }, []);

  const checkPulse = useCallback(async () => {
    try {
      setLastChecked(new Date());
      await fetchWithTimeout("https://jsonplaceholder.typicode.com/todos/1", 5000, { mode: "no-cors" });
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
          <title>{indicator === "online" ? "🟢 ON" : "🔴 OFF"}</title>
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
