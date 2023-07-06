const dotenv = require("dotenv");
dotenv.config();
const nodemailer = require("nodemailer");

const mailer = (email, subject, msg) => {
    const transporter = nodemailer.createTransport({
        service: "outlook",
        auth: {
            user: process.env.User + "@outlook.com",
            pass: process.env.Pass + "##**.",
        }
        
    });
    const mailOptions = {
        from: process.env.User + "@outlook.com",
        to: email,
        subject: subject,
        html: msg 
    };

    return transporter.sendMail(mailOptions, (err, info)=>{
        if(err){
            return console.error(err);
        };
        console.log(`Email has been successfully sent to ${email}`)
    })
};
module.exports = mailer;
