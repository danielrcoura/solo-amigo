var express = require('express');
var router = express.Router();
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var googleMapsClient = require('@google/maps').createClient({
  key: 'AIzaSyBaMgfWN5qg0lNFV_iKyqlGFtM457-mB-E'
});


var Uploads = require('../upload.js');
var TreeRequest = require('../models/mytree_exclusives/tree_request.js');
var TreeType = require('../models/mytree_exclusives/tree_type.js');
var Tree = require('../models/mytree_exclusives/tree.js');
var User = require('../models/user.js');

//Index
router.get('/', function(req, res) {
  TreeRequest.find({}, function(err, trees) {
    if (err) {
      res.status(400).send(err);
    } else {
      res.status(200).json(trees);
    }
  });
});

//Find by params
router.get('/query/fields', function(req, res) {
  TreeRequest.find(req.query, function(err, request) {
    if (err) {
      res.status(400).send(err);
    } else if (!request){
      res.status(404).send("Pedido não encontrado");
    } else {
      res.status(200).json(request);
    }
  });
});

//Create
router.post('/', async function(req, res) {
  var request             = new TreeRequest();

  request._user           = req.body._user;
  request._type           = req.body._type;
  request.tree_name       = req.body.tree_name;
  request.quantity        = req.body.quantity;
  request.requester_name  = req.body.requester_name;
  request.requester_phone = req.body.requester_phone;
  request.place			      = req.body.place;
  request.status          = 'Pendente';
  request.updated_at      = new Date();
  if(req.body.planting_date) request.planting_date = new Date(req.body.planting_date);
  if (req.body.photo) {
    var date = new Date();
    var timeStamp = date.toLocaleString(); 
    Uploads.uploadFile(req.body.photo, req.body._user.toString(), timeStamp);

    var filename = req.body._user.toString() + timeStamp + '.jpg'; 
    request.photo = 'https://s3.amazonaws.com/compcult/soloamigo/' + filename;
  }
  if(req.body.sidewalk_size) request.sidewalk_size    = req.body.sidewalk_size;
  if(req.body.answer_date) request.answer_date = new Date(req.body.answer_date);

  if(req.body.location_lat && req.body.location_lng) {
    request.location_lat    = req.body.location_lat;
    request.location_lng    = req.body.location_lng;

    let xmlHttp = new XMLHttpRequest();
    xmlHttp.open("GET", "https://maps.googleapis.com/maps/api/geocode/json?latlng=" + req.body.location_lat + "," + req.body.location_lng + "&sensor=true", true); // true for asynchronous 
    xmlHttp.send(null);

    xmlHttp.onreadystatechange = function() { 
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
          results = JSON.parse(xmlHttp.responseText);
	  console.log(results);
          if (results["results"] !== undefined && results["results"].length > 0) {
            if (results["results"][0]["address_components"][0]) request.number = results["results"][0]["address_components"][0]["long_name"];
            if (results["results"][0]["address_components"][1]) request.street = results["results"][0]["address_components"][1]["long_name"];
            if (results["results"][0]["address_components"][2]) request.neighborhood = results["results"][0]["address_components"][2]["long_name"];
            if (results["results"][0]["address_components"][3]) request.city = results["results"][0]["address_components"][3]["long_name"];
            if (results["results"][0]["address_components"][5]) request.state = results["results"][0]["address_components"][5]["short_name"];
            if (results["results"][0]["address_components"][7])request.zipcode = results["results"][0]["address_components"][7]["long_name"];
          
            User.findById(req.body._user, function(err, user) {
              if (user && (user.request_limit < req.body.quantity)) {
                res.status(400).send('A quantidade pedida ultrapassa o limite do usuário.');
              } else {
                request.save(function(err) {
                  if (err) {
                    res.status(400).send(err);
                  } else {
                    createTrees(request);
                    res.status(200).send(request);
                  }
                });
              }
            });
          } else {
            res.status(400).send("A api não permitiu a operação.");
          }
        }
    }
  } else {
    request.street = req.body.street;
    if (req.body.complement) request.complement = req.body.complement;
    request.number = req.body.number;
    request.neighborhood = req.body.neighborhood;
    request.city = req.body.city;
    request.state = req.body.state;
    request.zipcode = req.body.zipcode;

    if (stringAddressValidator(request.street, request.number, request.neighborhood, request.city, request.state, request.zipcode)) {
      // Geocode an address.
      googleMapsClient.geocode({
        address: stringAddress(request.street, request.number, request.neighborhood, request.city, request.state, request.zipcode),
        region: 'br'
      }, function(err, response) {
        if (err) {
            res.status(400).send(err);
          } else {
            request.location_lat = response.json.results[0].geometry.location.lat;
            request.location_lng = response.json.results[0].geometry.location.lng;

            User.findById(req.body._user, function(err, user) {
            if (user && (user.request_limit < req.body.quantity)) {
              res.status(400).send('A quantidade pedida ultrapassa o limite do usuário.');
            } else {
              request.save(function(err) {
                if (err) {
                  res.status(400).send(err);
                } else {
                  createTrees(request);
                  res.status(200).send(request);
                }
              });
            }
          });
        }
      });
    }
  }
});

// Update
router.put('/:tree_id', function(req, res) {
  TreeRequest.findById(req.params.tree_id, function(err, request) {
    if (req.body._user) request._user                     = req.body._user;
	  if (req.body._type) request._type             		    = req.body._type;
    if (req.body.tree_name) request.tree_name             = req.body.tree_name;
    if (req.body.location_lat) request.location_lat       = req.body.location_lat;
    if (req.body.location_lng) request.location_lng       = req.body.location_lng;
    if (req.body.quantity) request.quantity               = req.body.quantity;
	  if (req.body.requester_name) request.requester_name   = req.body.requester_name;
    if (req.body.requester_phone) request.requester_phone = req.body.requester_phone;
    if (req.body.place) request.place                     = req.body.place;
    if(req.body.planting_date) request.planting_date = new Date(req.body.planting_date);
    if (req.body.status) {
      if (req.body.status == 'Aprovado') {
        decreaseTrees(request.quantity, request._type);
      } 

      if (req.body.status == 'Plantada') {
        request.planting_date = new Date();
      } else {
        request.planting_date = null;
      }

      request.status      = req.body.status;
      request.updated_at  = new Date();
    }
    if (req.body.photo) {
      console.log('has a photo');
      var date = new Date();
      var timeStamp = date.toLocaleString();
      var filename = req.body._user.toString() + timeStamp + '.jpg';    
      Uploads.uploadFile(req.body.photo, req.body._user.toString(), timeStamp);

      request.photo = 'https://s3.amazonaws.com/compcult/soloamigo/' + filename;
    }
    if (req.body.sidewalk_size) request.sidewalk_size   = req.body.sidewalk_size;
    if (req.body.street) request.street = req.body.street;
    if (req.body.complement) request.complement = req.body.complement;
    if (req.body.number) request.number = req.body.number;
    if (req.body.neighborhood) request.neighborhood = req.body.neighborhood;
    if (req.body.city) request.city = req.body.city;
    if (req.body.state) request.state = req.body.state;
    if (req.body.zipcode) request.zipcode = req.body.zipcode;
    
    request.save(function(err) {
      if (err) {
        res.status(400).send(err);
      } else {
        res.status(200).send(request);
      }
    });
  });
});

// Delete
router.delete('/:tree_id', function(req, res) {
  TreeRequest.remove({ _id: req.params.tree_id }, function(err) {
    if (err) {
      res.status(400).send(err);
    } else {
      removeTrees(req.params.tree_id);
      res.status(200).send("Árvore removida.");
    }
  });
});

//Methods
createTrees = function(request) {
  var tree              = new Tree();
  tree._user            = request._user;
  tree._type            = request._type;
  tree._request         = request._id;
  tree.name             = request.tree_name;
  tree.location_lat     = request.location_lat;
  tree.location_lng     = request.location_lng;

  tree.save(function(err) {
    if (err) {
      console.log('Algo deu errado...');
    } else {
      console.log('Arvores criadas!');
    }
  });
} 

removeTrees = function(request_id) {
  Tree.remove({ "_request": request_id}, function(err) {
    if (err) {
      console.log('Algo deu errado...');
    } else {
      console.log('Árvores deletadas!');
    }
  });
}

decreaseTrees = function(quantity, type) {
  TreeType.findById(type, function(err, tt) {
    if (err) {
      console.log(err);
    } else if (!tt) {
      console.log("Tipo não existente!");
    } else {
      tt.ammount_available -= quantity;

      tt.save(function(err) {
        if (err) {
          console.log('algo deu ruim');
        } else {
          console.log('Arvores retiradas!');
        }
      });
    }
  });
}

stringAddressValidator = function(street='', number='', neighborhood='', city='', state='', zipcode='') {
  if ((street || street.lenght > 0) &&
    (number || number.lenght > 0) &&
    (neighborhood || neighborhood.lenght > 0) &&
    (city || city.lenght > 0) &&
    (state || state.lenght > 0) &&
    (zipcode || zipcode.lenght > 0)) {
    return true;
  } else {
    return false;
  }
};

stringAddress = function(street, number, neighborhood, city, state, zipcode) {
  return street + ', ' + number + " - " + neighborhood + ", " + city + " - " + state + ", " + zipcode + ", " + 'Brasil';
}

module.exports = router;
