const UserReg = require("../Models/userReg");
const accessToken = require("../config/accessToken");
const joi = require("joi");
const bcrypt = require("bcrypt");
const uuid = require("uuid");
const mailer = require("../config/mailer");

const register = async (req, res) =>{
const {name, email, password, confirm_password} = req.body;
const userschema = joi.object({
    name: joi.string().required(),
    email: joi.string().email({
        minDomainSegments: 2
    }),
    password: joi.string().pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_\-+=])[a-zA-Z0-9!@#$%^&*()_\-+=]{8,}$/),
    confirm_password: joi.ref("password"),
}).with("password", "confirm_password");

try {
    //validate form fields
    const value = await userschema.validateAsync({
      name: name,
      email: email,
      password: password,
      confirm_password: confirm_password,
    });
    const userExist = await UserReg.findOne({ email }).exec();
     //check if user exists
     if (userExist) {
        throw new Error("User with the email address already exist");
      }
      const hashPassword = bcrypt.hashSync(password, 10);
     await UserReg.create({
        name,
        email,
        password: hashPassword,
        id: uuid.v4()
      });
      res.status(201).send(`Registration is successful, ${name}`);
      mailer(email,"Registration is successful", "<h2>Welcome to Purger!</h2><p>Let's get you started cleaning with Purger.</p>" )

    } catch (err){
        res.status(400).json({
            error: err.message,
          });
    }

}

const login = async (req, res) => {
    const { email, password } = req.body;
  
    if (!password || !email) {
      res
        .status(400)
        .json({ status: "error", message: "Please input your credentials" });
      return;
    }
  
    try {
      //find the user with the email
      const user = await UserReg.findOne({ email }).exec();
      if (!user) {
        throw new Error("User not found");
      };
      const isPasswordMatched = bcrypt.compareSync(password, user.password);
      if (!isPasswordMatched) {
        throw new Error("Email or Password is not correct");
      };
      res.status(200).json({
        status: "success",
        access_token: accessToken(user.id),
      });
    } catch (err) {
      console.log(err);
      res.status(400).json({
        error: err.message,
      });
    }
  };

  module.exports = {register, login}