const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser')
const bcrypt = require('bcrypt');

const app = express();
const port = 3030;
app.get('/', (req, res) => res.send('db example app'));
app.listen(port, () => console.log(`dbexample-app listening on port ${port}!`));

// Sequelize
//	 https://www.newline.co/@AoX04/an-elegant-guide-to-sequelize-and-nodejs--1378842c
//   https://stackabuse.com/using-sequelize-orm-with-nodejs-and-express/
const { Sequelize, DataTypes, Model } = require('sequelize');
const sequelize = new Sequelize('database', 'username', 'password', {
    dialect: 'sqlite',
  	// we will be saving our db as a file on this path
    storage: 'database.sqlite', // or ':memory:'
});


// Define new Model/database
const User = sequelize.define('User', {
    // Here we define our model attributes
    // Each attribute will pair to a column in our database
    // Our primaryKey, user uid, our unique identifier
    uid: {
        type: DataTypes.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
    },
    // A column for the title of our book
    uname: {
        type: DataTypes.STRING,
        allowNull: false
    },
    // A column for the bcrypt hash
    hash: {
        type: DataTypes.CHAR.BINARY,
        allowNull: false
   }
 }, {
    // For the sake of clarity we specify our indexes
    indexes: [{ unique: true, fields: ['uid'] }]
});

// `sequelize.define` also returns the model
console.log(User === sequelize.models.User); // true

module.exports = { 
    User,
    sequelize,
}


// Add data to Model
// note: force=true, therefore the database is reset each time we start the app
sequelize.sync({ force: true })
  .then(() => {
    console.log(`Database & tables created!`);
    /*
       Note: the clear text passwords:
        alice1: let me in alice
        bob2: let me in bob
        trudy3: let me in bob
    
    Note: the bcrypt hashed passwrod is stored in the model
   */
    User.bulkCreate([
      { uname: "alice1", hash:"$2b$12$H2V8rhRxVFHLgj2Ly2N15eCWNTq6KzhjM0u5tFZL8GT1KXX12t9YC" },
      { uname: "bob2", hash:"$2b$12$SBM2eLD1h9nRCOsSLqfCmuiNf3AeCKM8ctwv25v3jQLtAM8tuekSa" },
      { uname: "trudy3", hash:"$2b$12$sXHzq3zwjrVUV6.AaxRcA.eK458f0WL9FH1oOSYLMU9B4rJ6gy8Zu" }
    ]).then(function() {
      return User.findAll();
    }).then(function(notes) {
      console.log(notes);
    });
  });


// Examples
// route to get all users from model
// curl http://localhost:3030/api/allusers
app.get('/api/allusers', function(req, res) {
  User.findAll().then(user => res.json(user));
});


// Route to get hash for username 
// curl http://localhost:3030/api/gh/<username>
app.get('/api/gh/:uname', function(req, res) {
  User.findOne({ where: { uname: req.params.uname } }).then(hash => res.json(hash));
});

/*
// Promise wrapper around bcrypt
async function compare(password,hash) {
 const isvalid = await new Promise((resolve, reject) => {
     bcrypt.compare(password, hash, (err, res) => 
     {
                if (err) {
                    reject(err);
                }
                resolve(res);
     });
  })
  return isvalid;
}


app.post('/auth', function(req, res) {
    User.findOne({ where: { uname: req.params.uname } }).then(
            ...      
        
        );
  });

*/
