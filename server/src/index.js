const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // allow requests from the frontend
    methods: ["GET", "POST"],
  },
});

const PORT = process.env.PORT || 3001;

// user's {mentor : socket id} on each room
const users = {
  1: { mentor: false },
  2: { mentor: false },
  3: { mentor: false },
  4: { mentor: false },
};

// default code to be presented in each room
const defcode = {
  1: `/* Task: Write an asynchronous function to fetch data from a URL.
   - Use the Fetch API to make the request.
   - Use 'await' to wait for the response and convert it to JSON.
   - Return the fetched data.
*/
async function fetchData(url) {
  // Your code here
}`,
  2: `/* Task: Write a function that returns a promise which resolves after a delay.
   - Use 'setTimeout' to simulate a delay.
   - Resolve the promise with a success message after 2 seconds.
   - Reject the promise with an error message if there's an error.
*/
function getData() {
  return new Promise((resolve, reject) => {
    // Your code here
  });
}`,
  3: `/* Task: Add an event listener to the document for the 'click' event.
   - Log a message to the console when the document is clicked.
*/
document.addEventListener('click', function() {
  // Your code here
});`,
  4: `/* Task: Write a function to greet a user by name.
  - The function should take a 'name' parameter.
  - Log a greeting message to the console.
  */
 function greet(name) {
  // Your code here
  }`,
};

// tracking current code
const serverCode = { 1: "", 2: "", 3: "", 4: "" };

// inside io.on('connection', ...)
io.on("connection", (socket) => {
  // console.log(`a user connected: ${socket.id}`);

  // listen for a room join event
  socket.on("join-room", (codeBlockId) => {
    socket.join(codeBlockId);

    // assign mentor
    if (!users[codeBlockId].mentor) {
      users[codeBlockId].mentor = socket.id;
      socket.emit("role-assigned", "mentor");
      // check if first load of code. if so - update user
      if (serverCode[codeBlockId] === "") {
        socket.emit("code-update", defcode[codeBlockId]);
        serverCode[codeBlockId] = defcode[codeBlockId];
        // else - load the previous code
      } else {
        socket.emit("code-update", serverCode[codeBlockId]);
      }
      // assign student
    } else if (users[codeBlockId].mentor !== socket.id) {
      socket.emit("role-assigned", "student");
      socket.emit("code-update", serverCode[codeBlockId]);
    }
  });

  socket.on("disconnect", () => {
    // console.log(`user disconnected`);

    // remove user from the users object
    for (const codeBlockId in users) {
      if (users[codeBlockId].mentor === socket.id) {
        users[codeBlockId].mentor = false;
      }
    }
  });

  // handle code changes
  socket.on("code-change", ({ codeBlockId, code }) => {
    // broadcast the code change to everyone else in the room
    serverCode[codeBlockId] = code;
    socket.to(codeBlockId).emit("code-update", code);
  });

  // handle back-to-lobby
  socket.on("back-to-lobby", ({ codeBlockId, role }) => {
    if (role === "mentor") {
      users[codeBlockId].mentor = false;
    }
    socket.leave(codeBlockId);
    console.log("after back to lobby");
    console.log(users);
  });

  // handle reset-code-block
  socket.on("reset-code-block", ({ codeBlockId }) => {
    // broadcast the code change to everyone else in the room
    serverCode[codeBlockId] = defcode[codeBlockId];
    socket.emit("code-update", defcode[codeBlockId]);
    socket.to(codeBlockId).emit("code-update", defcode[codeBlockId]);
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
