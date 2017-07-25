const express = require('express');
const bcrypt = require('bcrypt');
const passport = require('passport');

const UserModel = require('../models/user-model');

const router = express.Router();

//POST signup
router.post('/api/signup', (req, res, next) => {
  if(!req.body.signupEmail || !req.body.signupPassword){
    //.status helps the front end know that you have an error
    //400 for client errors (user needs to fix something)
    res.status(400).json({ message: 'Need both email and password'});
  }
  UserModel.findOne(
    {email: req.body.signupEmail },
    (err, userFromDB) => {
      if(err){
        //500 for server errors (nothing user can do)
        res.status(500).json({ message: 'Server could\'t check email. '});
        return;
      }
      if(userFromDB){
        //400 for client errors (user needs to fix something)
        res.status(400).json({ message: 'Email already exists.' });
        return;
      }
      const salt = bcrypt.genSaltSync(10);
      const scrambledPassword = bcrypt.hashSync(req.body.signupPassword, salt);

      const theUser = new UserModel ({
        username: req.body.signupUsername,
        email: req.body.signupEmail,
        encryptedPassword: scrambledPassword
      });
      theUser.save((err) => {
        if(err) {
          res.status(500).json({ message: 'Server could\'t save User'});
          return;
        }

        req.login(theUser, (err) => {
          if(err) {
            res.status(500).json({ message: 'Server could\'t save login.'});
            return;
          }

          //clear the encryptedPassword before sending
          //(not from the database, just from the object)
          theUser.encryptedPassword = undefined;

          //send the user's information to the frontend
          res.status(200).json(theUser);

        });//close req.login()
      });//close theUser.save()
    }
  );//close UserModel.findOne()
});//close router.post



//POST login
//this is different beacuse passport.authenticate() redirects
//(APIs normally shouldn't redirect)
router.post('/api/login', (req, res, next) => {
  const authenticateFunction =
    passport.authenticate('local', (err, theUser, extraInfo) => {
      //Errors prevented us from decided if login was successful/failure
      if(err){
        res.status(500).json({ message: 'Unkown login error' });
        return;
      }
      //Login failed for sure if "theUser" is empty
      if(!theUser){
        //"extraInfo" contains feedback messages from LocalStrategy
          res.status(401).json(extraInfo);
          return;
      }

      //login successful save them in the session.
      req.login(theUser, (err) => {
        if(err){
          res.status(500).json({ message: 'Session save error' });
          return;
        }

        //clear the encryptedPassword before sending
        //(not from the database, just from the object** that is being sent)
        theUser.encryptedPassword = undefined;

        //Everything worked! Send the user's information to the client.
        res.status(201).json(theUser);
      });
    });
    authenticateFunction(req, res, next);
});


//POST logout
router.post('/api/logout', (req, res, next) => {
  //req.logout() is defined by passport
  req.logout();
  res.status(200).json({ message: 'Log out success' });
});



//GET checklogin
router.get('/api/checklogin', (req, res, next) => {
  if(!req.user){
    res.status(401).json({ message: 'Please log in.' });
    return;
  }
  //Clear the encryptedPassword before sending
  //(not from the database, just from the object)
  req.user.encryptedPassword = undefined;

  res.status(200).json (req.user);
});


module.exports = router;
