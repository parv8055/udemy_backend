const {connect} = require("mongoose")

const connectdb=async()=>{
    try {
        const connectionInstance = await connect(process.env.MONGO_URL)
        console.log(" 🤖 🤖 Connected to Mongodb !! DB host :" + connectionInstance?.connection?.host)
    } catch (err) {
        console.error("Mongodb connection falied !! ERROR :" + err)
        process.exit(1)
    }
}

module.exports=connectdb