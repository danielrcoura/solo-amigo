var express = require('express');
var router = express.Router();
var bcrypt  = require('bcryptjs');

var User = require('../models/user.js');
var Uploads = require('../upload.js');
var Mailer = require('../mailer.js');

//Index
router.get('/', function(req, res) {
  User.find({}, function(err, usuarios) {
    if (err) {
      res.status(400).send(err);
    } else {
      res.status(200).json(usuarios);
    }
  });
});

//Show
router.get('/:user_id', function(req, res) {
  User.findById(req.params.user_id, function(err, usuario) {
    if (err) {
      res.status(400).send(err);
    } else {
      res.status(200).json(usuario);
    }
  });
});

//Find by params
router.get('/query/fields', function(req, res) {
  User.find(req.query, function(err, usuario) {
    if (err) {
      res.status(400).send(err);
    } else if (!usuario){
      res.status(404).send("Usuário não encontrado");
    } else {
      res.status(200).json(usuario);
    }
  });
});

//Create
router.post('/register', function(req, res) {
  var user      = new User();
  user.name     = req.body.name;
  user.email    = req.body.email;
  user.type     = req.body.type;

  bcrypt.hash(req.body.password, 10, function(err, hash) {
    if (err) {
      res.status(400).send(err);
    } else {
      user.password = hash;
      user.save(function(err) {
        if (err) {
          if (err.name === 'MongoError' && err.code === 11000) {
                // Duplicate username
                console.log(err);
                return res.status(400).send('Usuário já existente.');
              }
              // Some other error
              return res.status(400).send(err);
        } else {
          res.status(200).send(user);
        }
      });
    }
  });
});

//Trade password
router.post('/recovery/password_edit', function(req, res) {
  User.findOne({ email: req.query.email}, function(err, user) {
    if (err) {
      res.status(400).send(err);
    } else if (!user){
      res.status(404).send("Usuário não encontrado");
    } else {
      if (user.new_password) {
        user.password = user.new_password;
        user.new_password = null;

        user.save(function(err) {
          if (err) {
            return res.status(403).send(err);
          } else {
            return res.status(200).send('Senha atualizada!');
          }
        });
      } else {
          return res.status(404).send('Nova senha não encontrada, tente novamente.');
      }
    }
  });
});

//Recover pasword
router.post('/recovery', function(req, res) {
  let user_email = req.body.email;
  let new_password = req.body.new_password;
  let html = "<div style='width:90%; margin-left:auto; margin-right:auto; margin-bottom: 20px; border: 1px solid transparent; border-radius: 4px;'>" +
            "<div style='font-family: Arial; border-color: #502274;'>" +
            "<div style='vertical-align:middle; text-align:justify;'>" +
            "<p style='text-align:left;'>Olá!</p>" + 
            "<p>Você está recebendo esse e-mail que foi requisitada a alteração da sua senha de acesso. Se você não fez nenhuma requisição, pode simplesmente ignorar este e-mail.</p>" +
              "<p>Para confirmar a alteração da senha, clique no botão abaixo:</p>" + 
                "<form action='http://minha-arvore.herokuapp.com/users/recovery/password_edit?email=" + req.body.email + "' method='post'>" +
                "<input type='submit' value='Confirmar alteração de senha' style='margin-top:3px; margin-bottom:3px; background: #502274; margin-bottom: 3px; padding: 10px; text-align: center; color: white; font-weight: bold; border: 1px solid #502274;'></form>" +
                "<p style='text-align:left;' >Bom uso,</p>" + 
                "<p style='text-align:left;' ><b>Equipe Minha Árvore!</b></p>" + 
                "</div></div></div>"

  User.findOne({ email: user_email }, function(err, user) {
    if (err) {
      res.status(400).send(err);
    } if (!user) {
      res.status(400).send(err);
    } else {
      bcrypt.hash(req.body.new_password, 10, function(err, hash) {
        if (err) {
          res.status(400).send(err);
        } else {
          user.new_password = hash;
          user.save(function(err) {
            if (err) {
              return res.status(400).send(err);
            } else {
              Mailer.sendMail(user_email, 'Recuperação de senha', html);
              res.status(200).send(user);
            }
          });
        }
      });
    }
  }); 
});

// Update with post
router.post('/update/:user_id', function(req, res) {
  User.findById(req.params.user_id, function(err, user) {
    if (!user) {
      res.status(400).send('Usuário não encontrado!');
    }

    if (req.body.name) user.name = req.body.name;
    if (req.body.email) user.email = req.body.email;
    if (req.body.type) user.type = req.body.type;
    if (req.body.institution) user.institution = req.body.institution;
    if (req.body.birth) user.birth = new Date(req.body.birth);
    if (req.body.sex) user.sex = req.body.sex;
    if (req.body.phone) user.phone = req.body.phone;
    if (req.body.street) user.street = req.body.street;
    if (req.body.complement) user.complement = req.body.complement;
    if (req.body.number) user.number = req.body.number;
    if (req.body.neighborhood) user.neighborhood = req.body.neighborhood;
    if (req.body.city) user.city = req.body.city;
    if (req.body.state) user.state = req.body.state;
    if (req.body.zipcode) user.zipcode = req.body.zipcode;
    if (req.body.points) user.points = req.body.points;
    if (req.body.sec_points) user.sec_points = req.body.sec_points;
    if (req.body.request_limit) user.request_limit = req.body.request_limit;
    if (req.body.banned_until) {
      let banned = new Date(req.body.banned_until);
      banned.setHours(23, 59, 0);
      user.banned_until = banned;
    }
    if (req.body.picture) {
      var date = new Date();
      var timeStamp = date.toLocaleString();
      var filename = req.params.user_id.toString() + timeStamp + '.jpg';

      Uploads.uploadFile(req.body.picture, req.params.user_id.toString(), timeStamp);
      user.picture = 'https://s3.amazonaws.com/compcult/soloamigo/' + filename;
    };


    if (req.body.password) {
      bcrypt.hash(req.body.password, 10, function(err, hash) {
        user.password = hash;
        user.save(function(err) {
          if (err) {
            res.status(400).send(err);
          } else {
            res.status(200).send("Usuário atualizado.");
          }
        });
      });
    } else {
      user.save(function(err) {
        if (err) {
          res.status(400).send(err);
        } else {
          res.status(200).send("Usuário atualizado.");
        }
      });
    }
  });
});

// Update
router.put('/:user_id', function(req, res) {
  User.findById(req.params.user_id, function(err, user) {
    if (!user) {
      res.status(400).send('Usuário não encontrado!');
    }

    if (req.body.name) user.name = req.body.name;
    if (req.body.email) user.email = req.body.email;
    if (req.body.type) user.type = req.body.type;
    if (req.body.institution) user.institution = req.body.institution;
    if (req.body.birth) user.birth = new Date(req.body.birth);
    if (req.body.sex) user.sex = req.body.sex;
    if (req.body.phone) user.phone = req.body.phone;
    if (req.body.street) user.street = req.body.street;
    if (req.body.complement) user.complement = req.body.complement;
    if (req.body.number) user.number = req.body.number;
    if (req.body.neighborhood) user.neighborhood = req.body.neighborhood;
    if (req.body.city) user.city = req.body.city;
    if (req.body.state) user.state = req.body.state;
    if (req.body.zipcode) user.zipcode = req.body.zipcode;
    if (req.body.points) user.points = req.body.points;
    if (req.body.sec_points) user.sec_points = req.body.sec_points;
    if (req.body.request_limit) user.request_limit = req.body.request_limit;
    if (req.body.banned_until) {
      let banned = new Date(req.body.banned_until);
      banned.setHours(23, 59, 0);
      user.banned_until = banned;
    }
    if (req.body.picture) {
      var date = new Date();
      var timeStamp = date.toLocaleString();
      var filename = req.params.user_id.toString() + timeStamp + '.jpg';

      Uploads.uploadFile(req.body.picture, req.params.user_id.toString(), timeStamp);
      user.picture = 'https://s3.amazonaws.com/compcult/soloamigo/' + filename;
    };


    if (req.body.password) {
      bcrypt.hash(req.body.password, 10, function(err, hash) {
        user.password = hash;
        user.save(function(err) {
          if (err) {
            res.status(400).send(err);
          } else {
            res.status(200).send("Usuário atualizado.");
          }
        });
      });
    } else {
      user.save(function(err) {
        if (err) {
          res.status(400).send(err);
        } else {
          res.status(200).send("Usuário atualizado.");
        }
      });
    }
  });
});

//Auth
router.post('/auth', function(req, res) {
  User.findOne({'email': req.body.email}, function(error, user) {
    if (!user) {
      res.status(404).send('Usuário não encontrado.');
    } else if (userIsBanned(user.banned_until)) {
        res.status(400).send('Usuário banido até ' + user.banned_until.toLocaleString())
    } else {
      bcrypt.compare(req.body.password, user.password, function(err, result) {
        if (err) {
          res.status(400).send(err);
        } else {
          if (result) {
            res.status(200).json(user);
          } else {
            res.status(401).json('Senha incorreta.');
          }
        }
      });
    }
    
  });
});

// Delete
router.delete('/:user_id', function(req, res) {
  User.remove({ _id: req.params.user_id }, function(err) {
    if (err) {
      res.status(400).send(err);
    } else {
      res.status(200).send("Usuário removido.");
    }
  });
});

//Methods
userIsBanned = function(date) {
  if (date) {
    now = new Date();
    if (date.getTime() > now.getTime()) {
      return true;
    }
  }

  return false;  
} 

module.exports = router;
