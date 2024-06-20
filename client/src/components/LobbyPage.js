import React from "react";
import { Link } from "react-router-dom";
import "../styles.css";

const LobbyPage = () => {
  const codeBlocks = [
    {
      id: 1,
      title: "Async case",
    },
    {
      id: 2,
      title: "Promises example",
    },
    {
      id: 3,
      title: "Event listeners",
    },
    {
      id: 4,
      title: "Basic functions",
    },
  ];

  return (
    <div>
      <h1 className="center">Tom's Online Coding Web</h1>
      <h2 className="center">Choose a Code Block:</h2>
      <ul className="centered-ul">
        {codeBlocks.map((block) => (
          <li key={block.id}>
            <Link to={`/codeblock/${block.id}`} className="styled-link">
              {block.title}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default LobbyPage;
