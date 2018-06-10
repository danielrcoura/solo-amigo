var express = require('express');
var router = express.Router();

var User = require('../models/user.js');
var Group = require('../models/group.js');
var Mission = require('../models/mission.js');
var MissionAnswer = require('../models/mission_answer.js');
var Uploads = require('../upload.js');

//Index
router.get('/', function(req, res) {
  MissionAnswer.find({}, function(err, missions) {
    if (err) {
      res.status(400).send(err);
    } else {
      let promises;

      try {
        promises = missions.map(inject_mission_data);
      } catch (err) {
        res.status(400).send(err); 
      }

      Promise.all(promises).then(function(results) {
          res.status(200).json(results);
      });
    }
  });
});

//Show
router.get('/:answer_id', function(req, res) {
  MissionAnswer.find({ _id: req.params.answer_id }, async function(err, answer) {
    if (err) {
      res.status(400).send(err);
    } else if(!answer) {
      res.status(404).send('Resposta não encontrada');
    } else {
      let answer_complete = await inject_mission_data(answer);

      res.status(200).send(answer_complete);
    }
  });
});


var inject_mission_data = async function(answer) {
  let string = JSON.stringify(answer);
  let answer_complete = JSON.parse(string);

  let user_obj = await User.findById(answer._user).exec();
  let mission_obj = await Mission.findById(answer._mission).exec();
  let group_obj = await Group.findById(answer._group).exec();

  answer_complete._user = user_obj;
  answer_complete._group = group_obj;
  answer_complete._mission = mission_obj;

  return answer_complete;
}

//Find by params
router.get('/query/fields', function(req, res) {
  MissionAnswer.find(req.query, function(err, answer) {
    if (err) {
      res.status(400).send(err);
    } else if (!answer){
      res.status(404).send("Resposta da missão não encontrada");
    } else {
      res.status(200).json(answer);
    }
  });
});

//Create
router.post('/', function(req, res) {
  var missionAnswer         = new MissionAnswer();
  missionAnswer._user       = req.body._user;
  missionAnswer._mission    = req.body._mission;
  missionAnswer.status      = "Pendente";
  if (req.body._group) missionAnswer._group      = req.body._group;
  if (req.body.text_msg) missionAnswer.text_msg       = req.body.text_msg;
  if (req.body.location_lat) missionAnswer.location_lat = req.body.location_lat;
  if (req.body.location_lng) missionAnswer.location_lng = req.body.location_lng;
  if (req.body.image) {
    var date = new Date();
    var timeStamp = date.toLocaleString();
    var filename = req.body._user.toString() + timeStamp + '.jpg'; 

    Uploads.uploadFile(req.body.image, req.body._user.toString(), timeStamp);
    missionAnswer.image = 'https://s3.amazonaws.com/compcult/soloamigo/' + filename;
  };
  if (req.body.audio) {
    var date = new Date();
    var timeStamp = date.toLocaleString(); 
    Uploads.uploadAudio(req.body.audio, req.body._user.toString(), timeStamp);

    var filename = req.body._user.toString() + timeStamp + '.wav'; 
    missionAnswer.audio = 'https://s3.amazonaws.com/compcult/soloamigo/' + filename;
  };
  if (req.body.video)  {
    var date = new Date();
    var timeStamp = date.toLocaleString(); 
    Uploads.uploadVideo(req.body.video, req.body._user.toString(), timeStamp);

    var filename = req.body._user.toString() + timeStamp + '.mp4'; 
    missionAnswer.video = 'https://s3.amazonaws.com/compcult/soloamigo/' + filename;
  };

  missionAnswer.save(function(err) {
    if (err) {
      res.status(400).send(err);
    } else {
      res.status(200).send(missionAnswer);
    }
  });
});

// Update
router.put('/:mission_id', function(req, res) {
  MissionAnswer.findById(req.params.mission_id, function(err, missionAnswer) {
    if (req.body._user) missionAnswer._user             = req.body._user;
    if (req.body._mission) missionAnswer._mission       = req.body._mission;
    if (req.body._group) missionAnswer._group           = req.body._group;
    if (req.body.image) {
      var date = new Date();
      var timeStamp = date.toLocaleString(); 
      Uploads.uploadFile(req.body.image, req.body._user.toString(), timeStamp);

      var filename = req.body._user.toString() + timeStamp + '.jpg'; 
      missionAnswer.image = 'https://s3.amazonaws.com/compcult/soloamigo/' + filename;
    };
    if (req.body.audio) {
      var date = new Date();
      var timeStamp = date.toLocaleString(); 
      Uploads.uploadAudio(req.body.audio, req.body._user.toString(), timeStamp);

      var filename = req.body._user.toString() + timeStamp + '.wav'; 
      missionAnswer.audio = 'https://s3.amazonaws.com/compcult/soloamigo/' + filename;
    };
    if (req.body.video)  {
      var date = new Date();
      var timeStamp = date.toLocaleString(); 
      Uploads.uploadVideo(req.body.video, req.body._user.toString(), timeStamp);

      var filename = req.body._user.toString() + timeStamp + '.mp4'; 
      missionAnswer.video = 'https://s3.amazonaws.com/compcult/soloamigo/' + filename;
    };
    if (req.body.text_msg) missionAnswer.text_msg         = req.body.text_msg;
    if (req.body.location_lat) missionAnswer.location_lat = req.body.location_lat;
    if (req.body.location_lng) missionAnswer.location_lng = req.body.location_lng;
    if (req.body.status) {
      missionAnswer.status = req.body.status;
      if (req.body.status == "Aprovado") {
        Mission.findById(missionAnswer._mission, function(err, mission) {
          if (mission) {
            recompenseUser(missionAnswer._user, mission.points);
          }
        });
      }
    }
    
    missionAnswer.save(function(err) {
      if (err) {
        res.status(400).send(err);
      } else {
        res.status(200).send(missionAnswer);
      }
    });
  });
});

var recompenseUser = function(user_id, points) {
  User.findById(user_id, function(err, user) {
      if (user) {
        user.points += points;
        user.save(function(err) {
          console.log("Usuário recompensado");
        });
      }
  });
}

router.delete('/:mission_id', function(req, res) {
  MissionAnswer.remove({ _id: req.params.mission_id }, function(err) {
    if (err) {
      res.status(400).send(err);
    } else {
      res.status(200).send("Missão removida.");
    }
  });
});

router.get('/missions', function(req, res) {
  var mission_name = req.query.missionname;
  MissionAnswer.find({mail: mission_name}, function (err, mission) {
        if (err != null){
            console.log(err); 
        }
        res.json(mission);
  });
});

module.exports = router;
