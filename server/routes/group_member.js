var express = require('express');
var router = express.Router();
var bcrypt  = require('bcryptjs');

var User = require('../models/user.js');
var Group = require('../models/group.js');
var GroupMember = require('../models/group_member.js');

//Index
router.get('/', function(req, res) {
  GroupMember.find({}, function(err, members) {
    if (err) {
      res.status(400).send(err);
    } else {
      res.status(200).json(members);
    }
  });
});

//Find by params
router.get('/query/fields', function(req, res) {
  GroupMember.find(req.query, function(err, member) {
    if (err) {
      res.status(400).send(err);
    } else if (!member){
      res.status(404).send("Membro não encontrado");
    } else {
      res.status(200).json(member);
    }
  });
});

//Find groups from user
router.get('/groups', function(req, res) {
  GroupMember.find({ _user: req.query._user}, function(err, members) {
    if (err) {
      res.status(400).send(err);
    } else if (!members){
      res.status(404).send("Membro não encontrado");
    } else {
      promises = members.map(getGroupFromMember);

      Promise.all(promises).then(function(results) {
          res.status(200).json(results);
      })      
    }
  });
});

var getGroupFromMember = async function(member) {
    return Group.findById(member._group).exec();
}

//Create
router.post('/', function(req, res) {
  var member       = new GroupMember();

  User.findOne({ email: req.body.email}, function(err, user) {
    if (err) {
      res.status(400).send(err);
    } else if (!user) {
      res.status(404).send("Usuário não encontrado");
    } else {
      member._user     = user._id;
      member._group    = req.body._group;
      member.is_admin  = req.body.is_admin;

      member.save(function(err) {
        if (err) {
          res.status(400).send(err);
        } else {
          res.status(200).send(member);
        }
      });
    }
  });
});

// Update with post
router.post('/update/:member_id', function(req, res) {
  GroupMember.findById(req.params.member_id, function(err, member) {
    if (req.body.is_admin !== undefined) member.is_admin  = req.body.is_admin;
    
    member.save(function(err) {
      if (err) {
        res.status(400).send(err);
      } else {
        res.status(200).send(member);
      }
    });
  });
});

// Update
router.put('/:member_id', function(req, res) {
  GroupMember.findById(req.params.member_id, function(err, member) {
    if (req.body.is_admin !== undefined) member.is_admin  = req.body.is_admin;
    
    member.save(function(err) {
      if (err) {
        res.status(400).send(err);
      } else {
        res.status(200).send(member);
      }
    });
  });
});

// Delete with post
router.post('/remove/:member_id', function(req, res) {
  GroupMember.remove({ _id: req.params.member_id }, function(err) {
    if (err) {
      res.status(400).send(err);
    } else {
      res.status(200).send("Membro deletado!");
    }
  });
});

// Delete
router.delete('/:member_id', function(req, res) {
  GroupMember.remove({ _id: req.params.member_id }, function(err) {
    if (err) {
      res.status(400).send(err);
    } else {
      res.status(200).send("Membro deletado!");
    }
  });
});

module.exports = router;