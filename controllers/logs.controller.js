import dbConnection from "../config/db.config.js";
import { statusCode } from "../constants.js";
import { sendResponse } from "../utils/response.util.js";

class LogController {
    async fetchMyLogs(req,res) {
        try {
            const mainData = {
                message:'ABCDEFG'
            }
            const user_id = req.user.user_id;
            const [rows] = await dbConnection.execute(
                 'SELECT * FROM logs WHERE user_id = ?',[user_id]
            );
            console.log(user_id);
            sendResponse(res,statusCode.SUCCESS,'Data Fetched',mainData)
        } catch (error) {
            sendResponse(res,statusCode.INTERNAL_SERVER_ERROR,'Internal Server Error', null)
        }
    }
}

export default LogController;