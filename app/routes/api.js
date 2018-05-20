var ObjectID = require('mongodb').ObjectID;
var tabletojson = require('tabletojson');
var scraper = require('table-scraper');
var request = require('request');
var cheerio = require('cheerio'),
    cheerioTableparser = require('cheerio-tableparser');
var dateFormat = require('dateformat');
var bodyParser = require("body-parser");

class DataBCA{ }
module.exports = DataBCA;

class name{ }
module.exports = name;

module.exports = function(app, db) {

  app.use(bodyParser.json());

  app.get('/api/indexing', (req, res) => {
    url = 'https://www.bca.co.id/id/Individu/Sarana/Kurs-dan-Suku-Bunga/Kurs-dan-Kalkulator';

      let objects = [];

      var day=dateFormat(new Date(), "dd-mm-yyyy");
      var todayDB = "DataBCA"+day;
      console.log(todayDB);
      var counter=0;

      db.listCollections({name: todayDB}).next(function(err, collinfo) {
        if (collinfo) {
          res.send('Data is Present');
        }
        else {
          request(url, function(error, response, html){

              if(!error){

                  var $ = cheerio.load(html);

                  $('tbody.text-right tr').each(function(i, elm){

                      var object              = new DataBCA();
                      object.kurs             = $($('td', $(elm)[0])[0]).text();
                      object.eRateJual        = $($('td', $(elm)[0])[1]).text();
                      object.eRateBeli        = $($('td', $(elm)[0])[2]).text();
                      object.tCounterJual     = $($('td', $(elm)[0])[3]).text();
                      object.tCounterBeli     = $($('td', $(elm)[0])[4]).text();
                      object.bankNotesJual    = $($('td', $(elm)[0])[5]).text();
                      object.bankNotesBeli    = $($('td', $(elm)[0])[6]).text();
                      object.date             = day;

                      objects.push(object);
                  });
                  console.log(objects);
                  db.collection("DataBCA"+day).insertMany(objects, function(err, res) {
                  });
              }
          });
          res.send('Data insert Successful');
        }
      });
  });
  app.delete('/api/kurs/:date', (req, res) => {
    var date = new Date(req.params.date);
    date = dateFormat(date,"dd-mm-yyyy");

    db.collection("DataBCA"+date).drop(function(err, res) {
      if (err) throw err;
    });
    res.send('Deleted!');
  });
  app.get('/api/kurs', (req, res) => {
    var start = new Date(req.query['startdate']);
    //start = dateFormat(start,"dd-mm-yyyy");
    var end = new Date(req.query['enddate']);
    if(end>new Date())
    {
      end = new Date();
    }
    //end = dateFormat(end,"dd-mm-yyyy");
    var counterDate = new Date(req.query['startdate']);
    //counterDate = dateFormat(counterDate,"dd-mm-yyyy");
    var arr = [];
    console.log(end);
    var table = 0;
    while(counterDate<=end)
    {
      table = table+1;
      var current = dateFormat(counterDate,"dd-mm-yyyy");
      var currentDB = "DataBCA"+current;
      console.log(table);
      db.collection("DataBCA"+current).find({}).toArray(function(err,item) {
        table =table-1;
        console.log(table);
        console.log(item);
        arr.push(item);
        if(table==0)
        {
          res.send(arr);
        }
      });
      console.log("DataBCA"+current);
      counterDate.setDate( counterDate.getDate() + 1 );
      console.log(counterDate);
    }
  });
  app.get('/api/kurs/:symbol', (req, res) => {
    var start = new Date(req.query['startdate']);
    var symbol = req.params.symbol;
    //start = dateFormat(start,"dd-mm-yyyy");
    var end = new Date(req.query['enddate']);
    if(end>new Date())
    {
      end = new Date();
    }
    //end = dateFormat(end,"dd-mm-yyyy");
    var counterDate = new Date(req.query['startdate']);
    //counterDate = dateFormat(counterDate,"dd-mm-yyyy");
    var arr = [];
    console.log(end);
    var table = 0;
    while(counterDate<=end)
    {
      table = table+1;
      var current = dateFormat(counterDate,"dd-mm-yyyy");
      var currentDB = "DataBCA"+current;
      console.log(table);
      db.collection("DataBCA"+current).find({kurs:symbol},{_id:0, kurs:1, eRateJual:1, eRateBeli:1, tCounterBeli:1, tCounterJual:1, bankNotesBeli:1, bankNotesJual:1, date:1}).toArray(function(err,item) {
        table =table-1;
        console.log(table);
        console.log(item);
        arr.push(item);
        if(table==0)
        {
          res.send(arr);
        }
      });
      console.log("DataBCA"+current);
      counterDate.setDate( counterDate.getDate() + 1 );
      console.log(counterDate);
    }
  });
  app.post('/api/kurs/', (req, res) => {
    var day=dateFormat(req.body.date, "dd-mm-yyyy");
    console.log(req.body.symbol);
    console.log("DataBCA"+day);
    db.collection("DataBCA"+day).findOne({kurs:req.body.symbol}, function(err,item){
      console.log(item);
      if(!item)
      {
        var object              = new DataBCA();
        object.kurs             = req.body.symbol;
        object.eRateJual        = req.body.e_rate.jual;
        object.eRateBeli        = req.body.e_rate.beli;
        object.tCounterJual     = req.body.tt_counter.jual;
        object.tCounterBeli     = req.body.tt_counter.beli;
        object.bankNotesJual    = req.body.bank_notes.jual;
        object.bankNotesBeli    = req.body.bank_notes.beli;
        object.date             = day;

        db.collection("DataBCA"+day).insertOne(object, function(err) {
          res.send(object);
        });
      }
      else
      {
        res.send("Data already in");
      }
    });
  });
  app.put('/api/kurs/', (req, res) => {
    var day=dateFormat(req.body.date, "dd-mm-yyyy");
    console.log(req.body.symbol);
    console.log("DataBCA"+day);
    db.collection("DataBCA"+day).findOne({kurs:req.body.symbol}, function(err,item){
      console.log(item);
      if(!item)
      {
        res.status(404).send("Not Found");
      }
      else
      {
        var object              = new DataBCA();
        object.kurs             = req.body.symbol;
        object.eRateJual        = req.body.e_rate.jual;
        object.eRateBeli        = req.body.e_rate.beli;
        object.tCounterJual     = req.body.tt_counter.jual;
        object.tCounterBeli     = req.body.tt_counter.beli;
        object.bankNotesJual    = req.body.bank_notes.jual;
        object.bankNotesBeli    = req.body.bank_notes.beli;
        object.date             = day;

        db.collection("DataBCA"+day).updateOne({kurs:req.body.symbol}, object, function(err) {
          res.send(object);
        });
      }
    });
  });
};
