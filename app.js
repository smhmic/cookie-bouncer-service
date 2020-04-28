const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const app = express();
app.use(cookieParser());
app.use(express.json());

// Add all the hosts that will make requests to the service
const allowedHosts = [
  'https://www.EXAMPLE-DOMAIN.com',
  /^https:\/\/(.*\.)?EXAMPLE-TOP-LEVEL-DOMAIN\.com$/
];

const corsOptions = {
  origin: (origin, cb) => {
    if( ! allowedHosts.some( (h) => {
      if( h === origin || h && h.test && h.test( origin ) ){
        cb( null, true );
        return true;
      }
    })){
      cb( new Error( `CORS error! Attempt to reach API from ${origin}` ) );
    }
  },
  methods: 'POST',
  credentials: true
};

app.options('*', cors(corsOptions));

app.get('*', cors(corsOptions), (req, res, next) => {
  res.set( 'Content-Type', 'text/plain' );
  res.status( 405 ).send( `GET Not Allowed` );
});

app.post('*', cors(corsOptions), (req, res, next) => {

  const msg = req.body;
  const cookies = Array.isArray(msg) ? msg : [msg];
  const hasSet = [];
  cookies.forEach(c => {
    if (typeof c !== 'object') return;
    if (!c.hasOwnProperty('name') || !c.hasOwnProperty('value')) {
      return;
    }
    hasSet.push(c.name);
    res.cookie(c.name, c.value, c.options);
  });

  res.status(200).json({msg: `Processed cookies: ${hasSet}`});
});

const PORT = process.env.PORT || '8080';
/* istanbul ignore next */
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`);
  });
}

module.exports = app;
