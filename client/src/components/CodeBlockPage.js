import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Editor from "@monaco-editor/react";
import { Link } from "react-router-dom";
import { socket } from "../App";
import smiley from "../smiley-face.png";
import "../styles.css";

const CodeBlockPage = () => {
  const { id } = useParams(); // room id
  const [code, setCode] = useState(""); // code in codeblock
  const [title, setTitle] = useState(""); // title of the room
  const [role, setRole] = useState(""); // role of user in the room (mentor/student)
  const mySocket = socket; // user socket
  const solutions = {
    1: "/* Task: Write an asynchronous function to fetch data from a URL.\r\n   - Use the Fetch API to make the request.\r\n   - Use 'await' to wait for the response and convert it to JSON.\r\n   - Return the fetched data.\r\n*/\r\nasync function fetchData(url) {\r\n  const response = await fetch(url);\r\n  const data = await response.json();\r\n  return data;\r\n}",
    2: '/* Task: Write a function that returns a promise which resolves after a delay.\r\n   - Use \'setTimeout\' to simulate a delay.\r\n   - Resolve the promise with a success message after 2 seconds.\r\n   - Reject the promise with an error message if there\'s an error.\r\n*/\r\nfunction getData() {\r\n  return new Promise((resolve, reject) => {\r\n    try {\r\n      setTimeout(() => {\r\n        resolve("Success!");\r\n      }, 2000);\r\n    } catch (error) {\r\n      reject("An error occurred: " + error.message);\r\n    }\r\n  });\r\n}',
    3: "/* Task: Add an event listener to the document for the 'click' event.\r\n   - Log a message to the console when the document is clicked.\r\n*/\r\ndocument.addEventListener('click', function() {\r\n  console.log(\"Document clicked!\");\r\n});",
    4: "/* Task: Write a function to greet a user by name.\r\n   - The function should take a 'name' parameter.\r\n   - Log a greeting message to the console.\r\n*/\r\nfunction greet(name) {\r\n  console.log(\"Hello\" + name);\r\n}",
  };

  useEffect(() => {
    const codeBlocks = [
      {
        id: "1",
        title: "Async case",
      },
      {
        id: "2",
        title: "Promises example",
      },
      {
        id: "3",
        title: "Event listeners",
      },
      {
        id: "4",
        title: "Basic functions",
      },
    ];

    // load initial data and join room
    const selectedBlock = codeBlocks.find((block) => block.id === id);
    if (selectedBlock) {
      socket.emit("join-room", id);
      setTitle(selectedBlock.title);
    }
  }, [id]);

  useEffect(() => {
    // join the room for the specific code block
    socket.emit("join-room", id);

    // receive role from server
    socket.on("role-assigned", (assignedRole) => {
      setRole(assignedRole);
    });

    // handle code updates from server
    socket.on("code-update", (newCode) => {
      setCode(newCode);
    });
  }, [mySocket]);

  // handle code change event
  const handleCodeChange = (newCode) => {
    setCode(newCode);
    if (role === "student") {
      socket.emit("code-change", { codeBlockId: id, code: newCode });
    }
  };

  // handle back to lobby event
  const handleBackToLobby = () => {
    socket.off("role-assigned");
    socket.off("code-update");
    socket.emit("back-to-lobby", { codeBlockId: id, role: role });
  };

  // handle reset of code block page
  const handleReset = () => {
    socket.emit("reset-code-block", { codeBlockId: id });
  };

  return (
    <div className="centered-container">
      <h1 className="center">{title}</h1>
      <Link onClick={handleBackToLobby} to={"/"} className="styled-link">
        back to lobby
      </Link>
      <button onClick={handleReset} className="styled-button">
        reset code block
      </button>
      <Editor
        height="400px"
        width="700px"
        theme="vs-dark"
        defaultLanguage="javascript"
        value={code}
        onChange={handleCodeChange}
        options={{ readOnly: role === "mentor" }}
        className="editor"
      ></Editor>
      <img
        alt="smiley"
        src={smiley}
        style={{
          display: solutions[id] === code ? "block" : "none",
          width: "200px",
          marginTop: "20px",
        }}
      ></img>
    </div>
  );
};

export default CodeBlockPage;
