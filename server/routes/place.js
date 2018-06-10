var express = require('express');
var router = express.Router();

var Place = require('../models/place.js');

//Index
router.get('/', function(req, res) {
  Place.find({}).catch((err) => {
      res.status(400).send(err);
  })
  .then((places) => {
      res.status(200).json(places);
  });
});

//Find by params
router.get('/query/fields', function(req, res) {
  Place.find(req.query, function(err, places) {
    if (err) {
      res.status(400).send(err);
    } else if (!places){
      res.status(404).send("Lugar não encontrado");
    } else {
      res.status(200).json(places);
    }
  });
});

//Create
router.post('/', function(req, res) {
  var place     = new Place();
  place.name   = req.body.name;
  place.updated_at   = new Date();
  
  place.save(function(err) {
    if (err) {
      res.status(400).send(err);
    } else {
      res.status(200).send(place);
    }
  });
});

// Update
router.post('/update/:place_id', function(req, res) {
  Place.findById(req.params.place_id, function(err, place) {
    if (!place || err) {
      res.status(400).send('Lugar não encontrado!');
    } else {
        if (req.body.name) place.name = req.body.name;
        place.updated_at   = new Date();

        place.save(function(err) {
          if (err) {
            res.status(400).send(err);
          } else {
            res.status(200).send(place);
          }
        });
      }
  })
});

// Delete
router.post('/remove/:place_id', function(req, res) {
  Place.remove({ _id: req.params.place_id }, function(err) {
    if (err) {
      res.status(400).send(err);
    } else {
      res.status(200).send("Lugar removido.");
    }
  });
});

router.delete('/:place_id', function(req, res) {
  Place.remove({ _id: req.params.place_id }, function(err) {
    if (err) {
      res.status(400).send(err);
    } else {
      res.status(200).send("Lugar removido.");
    }
  });
});

module.exports = router;
