const express = require('express');
const request = require('request');
const router = express.Router();



router.post('/api/pubgStats', (req, res, next) => {
  console.log(req.body.pubgNickname);
  const options = {
    //replace the {pubg-nickname with user supplied name}
    url: `https://pubgtracker.com/api/profile/pc/${req.body.pubgNickname}`,
    headers: {
      'TRN-Api-Key': '9352c919-929d-4486-b07b-59373e98ba7c'
    }
  };

  function callback(error, response, body) {
    if (!error && response.statusCode == 200) {
      var info = JSON.parse(body);
      console.log(body);
      res.send (body);
    }
  }

  request(options, callback);



});

module.exports = router;
