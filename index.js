const bodyParser = require("body-parser");
const express = require("express");
const app = express();
const port = 3000; // You can change this port number to any other available port
const jwt = require("jsonwebtoken");

let posts = [];

const myKey = "mykeyeka";

const users = [
  {
    name: "sunera",
    pass: "sunera",
  },
  {
    name: "lochi",
    pass: "lochi",
  },
];

// app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//create authentication midle ware

const authenticateUser = (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) {
    res.status(404).json({ message: "token is invalid" });
    return;
  } else {
    try {
      const tokenData = jwt.verify(token, myKey);
      req.tokenData = tokenData;
      next();
    } catch (e) {
      res.send(e);
    }
  }
};

// Define a route handler for the root URL
app.get("/", authenticateUser, (req, res) => {
  const data = req.tokenData;
  res
    .status(200)
    .json({ message: "API is working crectly and token data = ", data: data });
});

//user login :::::::::::::::::::::::::::::::::::::: for use midleware
// ??used JWT to create token
app.post("/api/login", (req, res) => {
  const { name, pass } = req.body;

  const user = users.find((u) => u.name === name);

  if (!user) {
    res.status(404).json({ message: "invalid username or password" });
    return;
  } else {
    if (user.pass === pass) {
      //generate jwt
      const token = jwt.sign({ name: user.name }, myKey);
      res.status(200).json({ token: token });
    } else {
      res.status(404).json({ message: "invalid username or password" });
      return;
    }
  }
});

// get all
app.get("/api/", authenticateUser, (req, res) => {
  res.status(200).json(posts);
});

// create
app.post("/api/", authenticateUser, (req, res) => {
  const { title, body } = req.body;
  const createdby = req.tokenData.name;

  const newObj = {
    id: Date.now().toString(),
    title,
    body,
    by: createdby,
  };

  posts.push(newObj);

  res.status(200).json(posts);
});

app.get("/api/:id", authenticateUser, (req, res) => {
  const { id } = req.params;

  console.log(id);

  const post = posts.find((p) => p.id === id);

  console.log(post);

  if (!post) {
    res.status(404).json({ error: "Post not found" });
    return;
  }

  res.json(post);
});

app.delete("/api/:id", authenticateUser, (req, res) => {
  const { id } = req.params;

  console.log(id);

  const post = posts.find((p) => p.id === id);

  if (!post) {
    res.status(404).send({ error: "Post not found" });
    return;
  }

  const newPosts = posts.filter((p) => p.id != id);

  posts = newPosts;

  res.status(200).json(posts);
});

app.put("/api/:id", authenticateUser, (req, res) => {
  const { id } = req.params;

  const { title, body } = req.body;

  console.log(id);

  const postIndex = posts.findIndex((p) => p.id === id);

  if (postIndex == -1) {
    res.status(200).json({ error: "Post not Found" });
    return;
  }

  posts[postIndex].title = title;
  posts[postIndex].body = body;

  res.status(200).json(posts);
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
