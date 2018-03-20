
var express = require('express');
var passport = require('passport');
var Account = require('../models/account');
var router = express.Router();


router.get('/register', function(req, res) {
    res.render('register', { });
});

router.post('/register', function(req, res) {
    res.cookie("register_id", 0);
    console.log(req.body)
    Account.register(new Account({username : req.body.username }), req.body.password,0,0,0,0, function(err, account) {
        if (err) {
            res.cookie("register_id", 1);
            return res.render('register', { account : account });
        }

        passport.authenticate('local')(req, res, function () {
            res.cookie("register_id", 0);
            res.redirect('/login');
        });
    });
});

router.get('/login', function(req, res) {
    res.render('login', { user : req.user });
});

// sleep time expects milliseconds
function sleep (time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

router.post('/login', passport.authenticate('local'), function(req, res) {
    
    console.log("Successfully login as "+req.body);
    res.cookie('userid', req.body.username);

    // res.send("Successfully logged in, redirecting...")
    // sleep(100).then(() => {
    //     // Do something after the sleep!
    //     res.redirect('./home.html');
    // });
    res.redirect('/');
});

router.get('/logout', function(req, res) {
    req.logout();
    res.cookie('userid', '');
    res.redirect('/');
});



router.get('/ping', function(req, res){
    res.status(200).send("pong!");
});

module.exports = router;