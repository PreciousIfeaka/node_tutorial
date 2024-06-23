const fs = require("fs");
require("dotenv").config();
const path = require("path");
const https = require("https");
const helmet = require("helmet");
const express = require("express");
const cookieSession = require("cookie-session");
const passport = require("passport");
const { Strategy } = require("passport-google-oauth20");

const PORT = 3000;

const app = express();

app.use(helmet());

app.use(cookieSession({
  name: 'session',
  keys: [process.env.COOKIE_KEY1, process.env.COOKIE_KEY2],
  maxAge: 24 * 60 * 60 * 1000
}));

app.use(passport.initialize());
app.use(passport.session());

AUTH_OPTIONS = {
  callbackURL: "https://localhost:3000/auth/google/callback",
  clientID: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
}

passport.use(new Strategy(AUTH_OPTIONS, verifyCallBack));

function verifyCallBack(accessToken, refreshToken, profile, done) {
  console.log("Google profile: ", profile);
  done(null, profile);
}

//saves the session to cookie
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// retrieve the session from cookie
passport.deserializeUser((id, done) => {
  done(null, id);
})

async function isLoggedIn(req, res, next) {
  console.log("current user is: ", req.user);
  const loggedIn = req.isAuthenticated() || req.user;
  if (!loggedIn) {
    return res.status(401).json({
      error: 'You must log in'
    })
  }
  next();
}

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"))
});

app.get("/auth/google",
  passport.authenticate('google', { scope: ['email','profile'] })
);

app.get('/auth/google/callback', 
  passport.authenticate('google', {
    failureRedirect: '/failure',
    successRedirect: "/",
  }),
  (req, res) => {
    console.log("Google redirected");
  }
)

app.get("/failure", (req, res) => {
  res.send(`<p>Google authentication has failed. Go back to home page</p>`);
})

app.get("/secret", isLoggedIn, (req, res) => {
  res.send("Our secret number is 42");
})

app.get("/auth/logout", (req, res) => {
  req.logout();
  return res.redirect("/");
})
https.createServer({
  key: fs.readFileSync("key.pem"),
  cert: fs.readFileSync("cert.pem")
}, app).listen(PORT, () => console.log("Listening on port 3000 ..."));