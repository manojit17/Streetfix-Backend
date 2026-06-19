require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();   // ← MUST come before app.use()

const corsOptions = {
  origin: [
    "http://localhost:5173",
    "https://street-fix-six.vercel.app"
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));