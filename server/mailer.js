var nodeMailer  = require('nodemailer');

class Mailer {
    static sendMail(email, subject, message) {
        var transporter = nodeMailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: process.env.MAILER_MAIL,
                pass: process.env.MAILER_PASS
            },
            tls: {
            // do not fail on invalid certs
            rejectUnauthorized: false
            }
        });

        var mailOptions = {
            from: "Equipe Minha Arvore <ufcgcompcult@gmail.com>", // sender address
            to: email, // list of receivers
            subject: subject, // Subject line
            text: message, // plaintext body
            html: message
        }

        transporter.sendMail(mailOptions, function(error, response){
            if(error){
                console.log(error);
            }else{
                console.log("Message sent!");
            }

            transporter.close(); // shut down the connection pool, no more messages
        });
    }
}

module.exports = Mailer;
