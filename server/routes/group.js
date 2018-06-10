var express = require('express');
var router = express.Router();

var User = require('../models/user.js');
var Group = require('../models/group.js');
var Mailer = require('../mailer.js');
var GroupMember = require('../models/group_member.js');


//Index
router.get('/', function(req, res) {
  Group.find({}, function(err, groups) {
    if (err) {
      res.status(400).send(err);
    } else {
      res.status(200).json(groups);
    }
  });
});

//Find by params
router.get('/query/fields', function(req, res) {
  Group.find(req.query, function(err, Group) {
    if (err) {
      res.status(400).send(err);
    } else if (!Group){
      res.status(404).send("Grupo não encontrado");
    } else {
      res.status(200).json(Group);
    }
  });
});

//Send mail to group
router.post('/email', async function(req, res) {
  let group_id = req.body._group;
  let author = req.body.author;
  let message = req.body.message;

  try {
    members = await GroupMember.find({ _group: group_id }).exec();
    promises = members.map(getMemberEmail);
  } catch (err) {
    res.status(400).send(err);
  }

  Promise.all(promises).then(function(results) {
    Mailer.sendMail(results, "Grupos - Mensagem de " + author, message);

    res.status(200).json("Enviando mensagens...");
  });
});

var getMemberEmail = async function(member) {
  let user_obj = await User.findById(member._user).exec();
  return user_obj.email;
}

//Create
router.post('/', function(req, res) {
  var group              = new Group();
  group.name             = req.body.name;
  group.description      = req.body.description;

  group.save(function(err) {
    if (err) {
      res.status(400).send(err);
    } else {
      res.status(200).send(group);
    }
  });
});

// Update with post
router.post('/update/:group_id', function(req, res) {
  Group.findById(req.params.group_id, function(err, group) {
    if (req.body.name) group.name                       = req.body.name;
    if (req.body.description) group.description         = req.body.description;
    
    group.save(function(err) {
      if (err) {
        res.status(400).send(err);
      } else {
        res.status(200).send(group);
      }
    });
  });
});

// Update
router.put('/:group_id', function(req, res) {
  Group.findById(req.params.group_id, function(err, group) {
    if (req.body.name) group.name                       = req.body.name;
    if (req.body.description) group.description         = req.body.description;
    
    group.save(function(err) {
      if (err) {
        res.status(400).send(err);
      } else {
        res.status(200).send(group);
      }
    });
  });
});

// Delete with post
router.post('/remove/:group_id', function(req, res) {
  Group.remove({ _id: req.params.group_id }, function(err) {
    if (err) {
      res.status(400).send(err);
    } else {
      removeGroupMembers(req.params.group_id);

      res.status(200).send("Grupo removido.");
    }
  });
});

// Delete
router.delete('/:group_id', function(req, res) {
  Group.remove({ _id: req.params.group_id }, function(err) {
    if (err) {
      res.status(400).send(err);
    } else {
      removeGroupMembers(req.params.group_id);

      res.status(200).send("Grupo removido.");
    }
  });
});

var removeGroupMembers = function(group_id) {
  GroupMember.deleteMany({ _group: group_id }).exec();
}

module.exports = router;