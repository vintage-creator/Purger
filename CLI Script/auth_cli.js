const { program } = require("commander");
const axios = require("axios");
const fs = require("fs");
const path = require("path");

program.version("1.0.0");

program
  .command("register")
  .description("Register a new user")
  .requiredOption("--name <name>", "User's name")
  .requiredOption("--email <email>", "User's email")
  .requiredOption("--password <password>", "User's password")
  .requiredOption("--confirm_password <confirm_password>", "Confirm password")
  .action(async (options) => {
    const { name, email, password, confirm_password } = options;
    if (password !== confirm_password) {
      console.error("Error: Passwords do not match!");
      return;
    }

    try {
      const response = await axios.post("http://localhost:8080/auth/register", {
        name,
        email,
        password,
        confirm_password
      });

      console.log("Registration successful:", response.data);
    } catch (error) {
      if (error.response) {
        console.error("Error registering user:", error.response.data);
      } else {
        console.error("Error: No response received from the server.");
  }
    }
  });

  program
  .command("login")
  .description("Login with email and password")
  .requiredOption("--email <email>", "User's email")
  .requiredOption("--password <password>", "User's password")
  .action(async (options) => {
    const { email, password } = options;

    try {
      const response = await axios.post("http://localhost:8080/auth/login", {
        email,
        password,
      });

      const {access_token} = response.data;
      fs.writeFileSync(path.join(__dirname, "token.txt"), access_token);

      console.log("Login successful! JWT token saved to token.txt");
    } catch (error) {
        console.error("Error logging in:", error.response.data);
    }
  });

program.parse(process.argv);
