require("dotenv").config();
const axios = require("axios");
const nodemailer = require("nodemailer");

const mailer = async (email, subject, msg, attachment) => {
  const imageURL = attachment;
  const response = await axios.get(imageURL, { responseType: "arraybuffer" });
  const image = {
    filename: "logo.png",
    content: response.data,
  };
  const transporter = nodemailer.createTransport({
    service: "Outlook", // Use "Outlook" with a capital "O"
    auth: {
      user: process.env.User + "@outlook.com",
      pass: process.env.Pass + "##**.", //Use your password
    },
  });

  const mailOptions = {
    from: `[Purger App] <${process.env.User}@outlook.com>`,
    to: email,
    subject: subject,
    html: msg,
    attachments: [image],
  };

  // Wrap the sendMail function in a Promise
  return new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        reject(err); // Reject the promise with the error
      } else {
        resolve(info); // Resolve the promise with the info object
      }
    });
  });
};

module.exports = mailer;
