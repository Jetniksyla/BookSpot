require("dotenv").config();
const express = require("express");
const { ApolloServer } = require("@apollo/server");
const { expressMiddleware } = require("@apollo/server/express4");
const path = require("path");
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const { authMiddleware } = require("./utils/auth");
const { typeDefs, resolvers } = require("./schemas");

const PORT = process.env.PORT || 3001;
const app = express();
const server = new ApolloServer({
  typeDefs,
  resolvers,
});

app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(bodyParser.json());

app.use(
  "/graphql",
  expressMiddleware(server, {
    context: authMiddleware,
  })
);

// Define the /save-cache endpoint
app.post("/save-cache", (req, res) => {
  const cacheData = req.body;
  // Save the cache data to your database or handle it as needed
  console.log("Received cache data:", cacheData);

  // Respond to the client
  res.status(200).send("Cache data received");
});

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../client/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../client/dist/index.html"));
  });
}

const startApolloServer = async () => {
  await server.start();

  // Connect to MongoDB using the connection string from environment variables
  mongoose
    .connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => {
      console.log("Successfully connected to MongoDB");
      app.listen(PORT, () => {
        console.log(`API server running on port ${PORT}!`);
        console.log(`Use GraphQL at http://localhost:${PORT}/graphql`);
      });
    })
    .catch((err) => {
      console.error("Error connecting to MongoDB:", err.message);
    });
};

// Call the async function to start the server
startApolloServer();
