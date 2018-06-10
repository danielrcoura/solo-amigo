var express = require('express');
var router = express.Router();
var bcrypt  = require('bcryptjs');

var Reaction = require('../models/reaction.js');

//Index
router.get('/', function(req, res) {
  Reaction.find({}, function(err, reactions) {
    if (err) {
      res.status(400).send(err);
    } else {
      res.status(200).json(reactions);
    }
  });
});

//Find by params
router.get('/query/fields', function(req, res) {
  Reaction.find(req.query, function(err, reaction) {
    if (err) {
      res.status(400).send(err);
    } else if (!reaction){
      res.status(404).send("Reação não encontrada");
    } else {
      res.status(200).json(reaction);
    }
  });
});

//Like
router.post('/', function(req, res) {
  Reaction.findOne({ _user: req.body._user, _post_reacted: req.body._post_reacted }, function(err, reaction) {
    if (reaction) {
      console.log('update');
      reaction.points += req.body.points;

      reaction.save(function(err) {
        if (err) {
          res.status(400).send(err);
        } else {
          res.status(200).send('Você reagiu!');
        }
      });
    } else {
      console.log('create');
      var react            = new Reaction();
      react._user          = req.body._user;
      react._post_reacted  = req.body._post_reacted;
      react.points         = req.body.points;

      react.save(function(err) {
        if (err) {
          res.status(400).send(err);
        } else {
          res.status(200).send(react);
        }
      });
    }
  });
});


// Delete
router.delete('/:reaction_id', function(req, res) {
  Reaction.remove({ _id: req.params.reaction_id }, function(err) {
    if (err) {
      res.status(400).send(err);
    } else {
      res.status(200).send("Reação removida.");
    }
  });
});

module.exports = router;