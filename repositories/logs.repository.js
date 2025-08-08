import Log from "../models/log.model.js";

class LogsRepository {
    async createLog(reason,auth_id,transaction){
        try {
            console.log('[]:[]:[]:Logging Record');
            const log = await Log.create(
                {
                    auth_id:auth_id,
                    reason
                },
                transaction
            );
            console.log(`[]:[]:[]:Logger Created for ${auth_id}, Log:${log}`);
        } catch (error) {
            console.error('[]:[]:[]: Logger Creation Failed',error);
            throw error;
        }
    }
}

export default LogsRepository;