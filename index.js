/* Resturant Waitlist Web Service */

const express = require('express');
const fs = require('fs');
const mysql = require('mysql');

const credentials = JSON.parse(fs.readFileSync('credentials.json', 'utf8'));
const connection = mysql.createConnection(credentials);

const service = express();

// Add middleware that express already provides, to parse the request body
service.use (express.json());

connection.connect(error => {
  if (error) {
    console.error(error);
    process.exit(1);
  }
});

// Allows for Cross-Origin Resource Sharing
service.options('*', (request, response) => {
  response.set('Access-Control-Allow-Headers', 'Content-Type');
  response.set('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE');
  response.sendStatus(200);
});

// Helper function
function rowToCustomer(row) {
  return {
    id: row.id,
    cust_LName: row.cust_LName,
    cust_FName: row.cust_FName,
    party_size: row.party_size,
    position_inLine: row.position_inLine,
    checkIn_date: row.checkIn_date,
    checkIn_time: row.checkIn_time,
    is_deleted: row.is_deleted,
  };
}

/* CRUD Endponts */

/*
curl -v \
--header 'Content-Type: application/json' \
--data '{"cust_LName": "Jones", "cust_FName": "Bob", "phone_num": "1800101010", "party_size": 4, "position_inLine": 3, "checkIn_date": "2021-10-27", "checkIn_time": "14:15:20", "is_deleted": false }' \
http://localhost:5000/waitlist 
*/
/* Create - POST: Add party to the waitlist */
service.post ('/waitlist', (request, response) => {
  if (request.body.hasOwnProperty('cust_LName') &&
    request.body.hasOwnProperty('cust_FName') &&
    request.body.hasOwnProperty('phone_num') &&
    request.body.hasOwnProperty('party_size') &&
    request.body.hasOwnProperty('position_inLine') &&
    request.body.hasOwnProperty('checkIn_date') &&
    request.body.hasOwnProperty('checkIn_time') &&
    request.body.hasOwnProperty('is_deleted')) 
  {
    const parameters = [
      request.body.cust_LName,
      request.body.cust_FName,
      request.body.phone_num,
      request.body.party_size,
      request.body.position_inLine,
      request.body.checkIn_date,
      request.body.checkIn_time,
      request.body.is_deleted,
    ];

    const query = 'INSERT INTO waitlist(cust_LName, cust_FName, phone_num, party_size, position_inLine, checkIn_date, checkIn_time, is_deleted) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
    connection.query(query, parameters, (error, result) => {
      if (error) {
        response.status(500);
        response.json({
          ok: false,
          results: error.message,
        });
      } else {
        console.log("Got Here");
        console.log(result);
        response.json({
          ok: true,
          results: result.insertId,
        });
      }
    });
  } else {
    response.status(400);
    response.json({
      ok: false,
      results: 'Unable to add to waitlist - missing parameters.',
    });
  }
});

// curl -v http://localhost:5000/waitlist
/* Read - GET: Return the entire waitlist */
service.get ('/waitlist', (request, response) => {
  
  const query = 'SELECT * FROM waitlist WHERE is_deleted = false';
  connection.query(query, (error, rows) => {
    if (error) {
      response.status(500);
      response.json({
        ok: false,
        results: error.message,
      });
    } else {
      const waitlist = rows.map(rowToCustomer);
      response.json({
        ok: true,
        results: rows.map(rowToCustomer),
      });
    }
  });
});

// curl http://localhost:5000/waitlist/lastname/Bodycoat
/* Read - GET: Return party info from the waitlist based on last name and first name */
service.get ('/waitlist/lastname/:cust_LName', (request, response) => {
  const parameters = [
    request.params.cust_LName,
  ];

  const query = 'SELECT * FROM waitlist WHERE cust_LName = ? AND is_deleted = false ORDER BY position_inLine';
  connection.query(query, parameters, (error, rows) => {
    if (error) {
      response.status(500);
      response.json({
        ok: false,
        results: error.message,
      });
    } else {
      const waitlist = rows.map(rowToCustomer);
      response.json({
        ok: true,
        results: rows.map(rowToCustomer),
      });
    }
  });
});

// curl http://localhost:5000/waitlist/1
/* Read - GET: Return party info from the waitlist based on ID*/
service.get ('/waitlist/:id', (request, response) => {
  const parameters = [
    parseInt(request.params.id),
  ];

  const query = 'SELECT * FROM waitlist WHERE id = ? AND is_deleted = false';
  connection.query(query, parameters, (error, rows) => {
    if (error) {
      response.status(500);
      response.json({
        ok: false,
        results: error.message,
      });
    } else {
      const waitlist = rows.map(rowToCustomer);
      response.json({
        ok: true,
        results: rows.map(rowToCustomer),
      });
    }
  });
});

/* GET report.html */
service.get ('/report.html', (request, response) => {
  response.sendFile (__dirname + "/report.html");
});

/*
curl --header 'Content-Type: application/json' \
  --request PATCH \
  --data '{"cust_LName": "McKenzie", "cust_FName": "Matthew", "phone_num": "6504506693", "party_size": 2, "position_inLine": 2, "checkIn_date": "2021-10-25", "checkIn_time": "11:22:20"}' \
  http://localhost:5000/waitlist/1
*/
/* Update - PATCH: Update info about a party on the waitlist based on ID num */
service.patch ('/waitlist/:id', (request, response) => {
  const parameters = [
    request.body.cust_LName,
    request.body.cust_FName,
    request.body.phone_num,
    request.body.party_size,
    request.body.position_inLine,
    request.body.checkIn_date,
    request.body.checkIn_time,
    request.body.is_deleted,
    parseInt(request.params.id),
  ];

  const query = 'UPDATE waitlist SET cust_LName = ?, cust_FName = ?, phone_num = ?, party_size = ?, position_inLine = ?, checkIn_date = ?, checkIn_time = ?, is_deleted = ? WHERE id = ?';
  connection.query(query, parameters, (error, result) => {
    if (error) {
      response.status(404);
      response.json({
        ok: false,
        results: error.message,
      });
    } else {
      response.json({
        ok: true,
      });
    }
  });
});

/*
  curl --request DELETE \
  http://localhost:5000/waitlist/1
*/
/* Delete - DELETE: Delete a party from the waitlist based on ID num (either they have sat or want to get off the waitlist) */
service.delete ('/waitlist/:id', (request, response) => {
  const parameters = [parseInt(request.params.id)];

  const query = 'UPDATE waitlist SET is_deleted = true WHERE id = ?';
  connection.query(query, parameters, (error, result) => {
    if (error) {
      response.status(404);
      response.json({
        ok: false,
        results: error.message,
      });
    } else {
      response.json({
        ok: true,
      });
    }
  });
});

const port = 5000;
service.listen(port, () => {
  console.log(`We're live on port ${port}!`);
});