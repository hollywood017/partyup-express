const passport = require('passport');
const bcrypt = require('bcrypt');
const LocalStategy = require('passport-local').Strategy;

const UserModel = require('../models/user-model');

//Save the user's ID in the bowel
passport.serializeUser((userFromDb, next) => {
  next(null, userFromDb._id);
});

//Retrieve the user's info from the DB with the ID inside the bowel
passport.deserializeUser((idFromBowl, next) => {
  UserModel.findById(
    idFromBowl,
    (err, userFromDb) => {
      if(err) {
        next(err);
        return;
      }
      next(null, userFromDb);
    }
  );
});


passport.use(new LocalStategy(
  {
    usernameField: 'loginEmail',  //sent through AJAX from angular
    passwordField: 'loginPassword'   //sent through AJAX from angular
  },
  (theEmail, thePassword, next) => {
    UserModel.findOne(
      { email: theEmail },
      (err, userFromDb) => {
        if(err){
          next(err);
          return;
        }
        if(userFromDb === null) {
          next(null, false, { message: 'Incorrect email' });
          return;
        }
        if(bcrypt.compareSync(thePassword, userFromDb.encryptedPassword) === false) {
          next(null, false, { message: 'Incorrect password' });
          return;
        }
        next(null, userFromDb);
      }
    );//close UserModel.findOne()
  }// close (theEmail, thePassword, next)
));
