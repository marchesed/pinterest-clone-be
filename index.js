const { GraphQLServer } = require('graphql-yoga')
const config = require("./config.js")
const request = require('superagent')
var express = require("express"),
    app = express(),
    port = 1234,
    MongoClient = require('mongodb').MongoClient,
    ObjectId = require('mongodb').ObjectId; 
    bodyParser = require("body-parser");

    app.use(bodyParser.json())
    app.get('/user/github/callback', (req,res) => { 
          const { query } = req;
          const { code } = query
          console.log(code)
          if(code){
              request
              .post('https://github.com/login/oauth/access_token')
              .send(
                  { 
                      client_id: config.GITHUB_KEY,
                      client_secret: config.GITHUB_SECRET, 
                      code: code,
                  })
              .set('Accept', 'application/json')
              .then(result => {
                 const data = result.body
                 console.log(data['access_token'])
                 res.cookie('github-auth', data['access_token'])
                 // res.send(data)
                 res.redirect('http://localhost:3000')
              });
          }
      });

      app.get('/api/getAllImages', (req,res) => {
        MongoClient.connect('mongodb://localhost:27017/test1', function (err, client) {
          if (err) throw err
        
          var db = client.db('test1')
        
          db.collection('images').find().toArray(function (err, result) {
            if (err) throw err
        
            res.send(result)
          })
        })
      })

      app.post('/api/getImageList', (req,res) => {
        
        MongoClient.connect('mongodb://localhost:27017/test1', function (err, client) {
          if (err) throw err
          
          if(req.body.pictures){
            var objectIdArr = []
            req.body.pictures.forEach(element => {
              var o_id = new ObjectId(element)
              objectIdArr.push(o_id)
            });
          }
        
          var db = client.db('test1')

          db.collection('images').find(
              {
                _id: {"$in" : objectIdArr}
              }
            ).toArray(function (err, result) {
            if (err) throw err
        
            res.send(result)
          })
        })
      })

      app.get('/api/getAllUsers', (req,res) => {
        MongoClient.connect('mongodb://localhost:27017/test1', function (err, client) {
          if (err) throw err
        
          var db = client.db('test1')
        
          db.collection('users').find().toArray(function (err, result) {
            if (err) throw err
            res.send(result)
          })
        })
      })

      app.post('/api/getUser', (req,res) => {
        MongoClient.connect('mongodb://localhost:27017/test1', function (err, client) {
          if (err) throw err
        
          var db = client.db('test1')
          console.log(req.body.githubId)
        
          db.collection('users').find({"githubId":req.body.githubId}).toArray(function (err, result) {
            if (err) throw err
            res.send(result)
          })
        })
      })

      app.post('/api/createUser', (req,res) => {
        MongoClient.connect('mongodb://localhost:27017/test1', function (err, client) {
          if (err) throw err
        
          var db = client.db('test1')
          console.log(req.body.githubId)
        
          db.collection('users').insertOne(req.body, function(err, result) {
            if (err) throw err;
            console.log("1 document inserted");
            res.send(true)
          });
        })
      })

      app.post('/api/linkImage', (req,res) => {
        MongoClient.connect('mongodb://localhost:27017/test1', function (err, client) {
          if (err) throw err
        
          var db = client.db('test1')
          console.log(req.body)
        
          var myquery = { "githubId": req.body.githubId };
          var newvalues = { $push: { "pictures": req.body.pictureId } };
          db.collection("users").findOneAndUpdate(myquery, newvalues, function(err, result) {
            if (err) throw err;
            res.send(true)
          });
        })
      })

var server = app.listen(port, function() {
  console.log('Listening on port %d', server.address().port);
});