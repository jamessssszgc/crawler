const cheerio = require('cheerio')
const request = require('request')
const express = require('express')

const app = express()
app.set('views', __dirname + "/views")
app.use(express.static('public'));
app.set("view engine", "ejs");
const superagent = require('superagent')

const async = require('async');
let urls = require('./urls')
urls = urls.slice(0)

const url = "mongodb://manager:123@ds123896.mlab.com:23896/melonskin"

const bodyParser = require('body-parser');

const cookieParser = require('cookie-parser');
app.use(bodyParser.urlencoded({
    extended: true
}));
//database
var ObjectId = require('mongodb').ObjectID;
var mongoose = require('mongoose');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var routes = require('./routes/index');
app.use(passport.initialize());
app.use(passport.session());
// app.use(express.static(path.join(__dirname, 'public')));
app.use('/', routes);

// passport config
var Account = require('./models/account');
passport.use(new LocalStrategy(Account.authenticate()));
passport.serializeUser(Account.serializeUser());
passport.deserializeUser(Account.deserializeUser());

// mongoose
mongoose.connect(url);



let id = 0 




function fetPost(url, callback,id) {
  superagent.get(url)
    //.charset('gbk')
    .end(function (err, res) {
      const $ = cheerio.load(res.text);
      let obj =  []
      $('.title>a').each((index,element) => {
        var link = $(element).attr('href')
        link = detecthttp(link,'https://www.reddit.com')
        obj.push({
        id: id,
        title: $(element).text(),
        link: link
      })
      })

      console.log(id)
      callback(null, obj)
    })
}


function fetPost2(url, callback,id) {
  superagent.get(url)
    //.charset('gbk')
    .end(function (err, res) {
      const $ = cheerio.load(res.text);
      let obj =  []
      $('.title>a').each((index,element) => {
        var link = $(element).attr('href')
        link = detecthttp(link,'https://news.ycombinator.com/')
        obj.push({
        id: id,
        title: $(element).text(),
        link: link
      })
      })

      console.log(id)
      callback(null, obj)
    })
}



function detecthttp(url,base) {
   if (!/^(f|ht)tps?:\/\//i.test(url)) {
      url = base+url
   }
   return url;
}



function saveToMysql(results) {
  results.forEach(function (result) {
    pool.query('insert into booktitles set ?', result, function (err, result) {
      if (err) throw err
      console.log(`insert ${result.id} success`)
    })
  })
}


app.get('/',function(req,res){
  res.render('index')
})

app.get('/reddit', function (req, res) {
  async.mapLimit(urls, 5, function (url, callback) {
    id++
    fetPost(url, callback, id)
  }, function (err, results) {
    res.json(JSON.stringify(results))
    //saveToMysql(results)
  })
})

app.get('/hackernews', function (req, res) {
  var hackernews_url = ['https://news.ycombinator.com/']
  async.mapLimit(hackernews_url, 1, function (url, callback) {
    id++
    fetPost2(url, callback, id)
  }, function (err, results) {
    res.json(JSON.stringify(results))
    //saveToMysql(results)
  })
})

app.get("/medium",function(req,res){
  var url = ["https://medium.com/topic/technology"]
  async.mapLimit(url, 1, function (url, callback) {
    id++
    fetPost3(url, callback, id)
  }, function (err, results) {
    res.json(JSON.stringify(results))
    //saveToMysql(results)
  })
})


app.get("/slashdot",function(req,res){
  var url = ["https://slashdot.org/"]
  async.mapLimit(url, 1, function (url, callback) {
    id++
    fetPost4(url, callback, id)
  }, function (err, results) {
    res.json(JSON.stringify(results))
    //saveToMysql(results)
  })
})



function fetPost3(url, callback, id) {
 superagent.get(url)
    //.charset('gbk')
    .end(function (err, res) {
      const $ = cheerio.load(res.text);
      let obj =  []
      $('.ui-h3').each((index,element) => {
        console.log(element)
        var link = $(element).parents().attr('href')
        console.log(link)
        //link = detecthttp(link,'https://news.ycombinator.com/')
        obj.push({
        id: id,
        title: $(element).text(),
        link: link
      })
      })

      console.log(id)
      callback(null, obj)
    })
}


function fetPost4(url, callback, id) {
 superagent.get(url)
    //.charset('gbk')
    .end(function (err, res) {
      const $ = cheerio.load(res.text);
      let obj =  []
      $('.story-title>a').each((index,element) => {
        console.log(element)
        var link = $(element).attr('href')
        console.log(link)
        link = detecthttp(link,'https:')
        obj.push({
        id: id,
        title: $(element).text(),
        link: link
      })
      })

      console.log(id)
      callback(null, obj)
    })
}

app.listen('3379', function () {
  console.log('server listening on 3379')
})