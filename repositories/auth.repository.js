import { QueryTypes } from "sequelize";
import dbConnection from "../config/db.config.js";
import Log from "../models/log.model.js";
import Password from "../models/password.model.js";
import User from "../models/user.model.js";
import { getUserByParameter } from "../queries/auth.query.js";

class AuthRepository {
    async createUser(email, password, full_name) {
        try {
            const transactions = await dbConnection.transaction();
            console.log('Started Repo')
            const createUserModel = await User.create({
                email: email,
                full_name: full_name
            }, {
                transaction: transactions
            });
            console.log(createUserModel)
            const { id } = createUserModel;
            await Password.create({
                auth_id: id,
                password
            }, {
                transaction: transactions
            });
            await Log.create({
                auth_id: id,
                reason: 'User Registered'
            }, {
                transaction: transactions
            })
            await transactions.commit();
            return true;
        } catch (error) {
            //await transactions.rollback(); // Important for rollback on error
            console.error("[ERROR]:", error);
            throw error;
        }
    }

    async getUserByParameter(parameter, value) {
        try {
            const query = await getUserByParameter(parameter);
            const [userData] = await dbConnection.query(query, {
                type: QueryTypes.SELECT,
                replacements: { value: value }
            }
            );
            console.log(`[]:[]:[]:User Found ${JSON.stringify(userData)}`);
            return userData;
        } catch (error) {
            throw error;
        }
    }
}

export default AuthRepository;