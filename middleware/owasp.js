// Example

/*const { body } = require('express-validator');
input validation
app.post('/register', [
  body('email').isEmail(),
  body('password').isLength({ min: 6 })
], (req, res) => {
  // sanitized inputs
});/*

authentication and sesssion management
app.use(session({
  secret: 'your-secret',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: true, httpOnly: true }
}));

use https
const helmet = require('helmet');
app.use(helmet()); // adds secure HTTP headers


acces control
function isAdmin(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).send('Forbidden');
  }
  next();
}

security headers
// Helmet automatically sets these:
Content-Security-Policy
X-Content-Type-Options
X-Frame-Options
Strict-Transport-Security/*/
