var express = require('express');
var router = express.Router();

var TreeType = require('../models/mytree_exclusives/tree_type.js');
var Place = require('../models/place.js');
var Uploads = require('../upload.js');

//Index
router.get('/', function(req, res) {
  TreeType.find({}, async function(err, trees) {
    if (err) {
      res.status(400).send(err);
    } else {
      // final_result = []

      // for (var i = 0; i < trees.length; i++) {
      //   let promises;
      //   let places = trees[i]._places;

      //   try {
      //     promises = await places.map(inject_place);
      //   } catch (err) {
      //     res.status(400).send(err); 
      //   }

      //   await Promise.all(promises).then(function(results) {
      //     let string = JSON.stringify(trees[i]);
      //     let final_tree = JSON.parse(string);
      //     final_tree._places = results;

      //     final_result.push(final_tree);

      //     if(i == trees.length -1) res.status(200).json(final_result);
      //   });
      // }
      res.status(200).json(trees);
    }
  });
});

inject_place = function(place) {
  return Place.findById(place).exec();
}

router.get('/:type_id', function(req, res) {
  TreeType.findById(req.params.type_id, function(err, tree) {
    if (err) {
      res.status(400).send(err);
    } else {
      res.status(200).json(tree);
    }
  });
});

//Find by params
router.get('/query/fields', function(req, res) {
  TreeType.find(req.query, async function(err, trees) {
    if (err) {
      res.status(400).send(err);
    } else if (!trees){
      res.status(404).send("Tipo não encontrado");
    } else {
      final_result = []

      for (var i = 0; i < trees.length; i++) {
        let promises;
        let places = trees[i]._places;

        try {
          promises = await places.map(inject_place);
        } catch (err) {
          res.status(400).send(err); 
        }

        await Promise.all(promises).then(function(results) {
          let string = JSON.stringify(trees[i]);
          let final_tree = JSON.parse(string);
          final_tree._places = results;

          final_result.push(final_tree);

          if(i == trees.length -1) res.status(200).json(final_result);
        });
      };
    }
  });
});

//Create
router.post('/', function(req, res) {
  var type                = new TreeType();
  type.name               = req.body.name;
  type.description        = req.body.description;
  type.ammount_available  = req.body.ammount_available;
  type._places            = req.body._places;
  if (req.body.photo) type.photo = req.body.photo;

  type.save(function(err) {
    if (err) {
      res.status(400).send(err);
    } else {
      res.status(200).send(type);
    }
  });
});

// Update
router.put('/:tree_id', function(req, res) {
  TreeType.findById(req.params.tree_id, function(err, type) {
	  if (req.body.name) type.name             			         = req.body.name;
	  if (req.body.description) type.description             = req.body.description;
    if (req.body.ammount_available) type.ammount_available = req.body.ammount_available;
    if (req.body._places) type._places                     = req.body._places;
    if (req.body.photo) type.photo                         = req.body.photo;
    

    type.save(function(err) {
      if (err) {
        res.status(400).send(err);
      } else {
        res.status(200).send(type);
      }
    });
  });
});


// Update
router.put('/remove/:tree_id', function(req, res) {
  TreeType.findById(req.params.tree_id, function(err, type) {
    if (req.body._places) {
      var index = type._places.indexOf(req.body._places);
      if (index > -1) {
        type._places.splice(index, 1);
      }
    }

    type.save(function(err) {
      if (err) {
        res.status(400).send(err);
      } else {
        res.status(200).send(type);
      }
    });
  });
});

// Delete
router.delete('/:tree_id', function(req, res) {
  TreeType.remove({ _id: req.params.tree_id }, function(err) {
    if (err) {
      res.status(400).send(err);
    } else {
      res.status(200).send("Árvore removida.");
    }
  });
});

module.exports = router;
