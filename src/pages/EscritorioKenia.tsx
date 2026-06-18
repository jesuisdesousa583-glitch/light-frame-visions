import { useEffect } from "react";

/**
 * Clone fiel da única tela existente em
 * https://github.com/francesdefranceff-droid/escritorio-kenia
 * (frontend/src/App.js — boilerplate Emergent.sh "Hello World").
 */
const EscritorioKenia = () => {
  useEffect(() => {
    const backend = (import.meta.env.VITE_BACKEND_URL as string | undefined) ?? "";
    if (!backend) return;
    fetch(`${backend}/api/`)
      .then((r) => r.json())
      .then((d) => console.log(d?.message))
      .catch((e) => console.error(e, "errored out requesting / api"));
  }, []);

  return (
    <div className="App">
      <header
        className="App-header"
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0f1115",
          color: "white",
        }}
      >
        <a
          className="App-link"
          href="https://emergent.sh"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img
            src="https://avatars.githubusercontent.com/in/1201222?s=120&u=2686cf91179bbafbc7a71bfbc43004cf9ae1acea&v=4"
            alt="Emergent"
          />
        </a>
        <p className="mt-5">Building something incredible ~!</p>
      </header>
    </div>
  );
};

export default EscritorioKenia;
