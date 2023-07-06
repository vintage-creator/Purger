const mongoose = require("mongoose");

const purgerDB = async () => {
    try {
        await mongoose.connect(`mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASS}@purgerdb.ytegrjm.mongodb.net/${process.env.MONGODB_NAME}?retryWrites=true&w=majority`, {
            useUnifiedTopology: true,
            useNewUrlParser: true
        });
    } catch (error) {
        console.error(error)
    }
}

module.exports = purgerDB