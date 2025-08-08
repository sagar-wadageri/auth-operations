import { QueryTypes, Op, where } from "sequelize";
import dbConnection from "../config/db.config.js";
import Log from "../models/log.model.js";
import Password from "../models/password.model.js";
import User from "../models/user.model.js";
import { getUserByParameter } from "../queries/auth.query.js";
import Otp from "../models/otp.model.js";

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
                password,
                is_active: true
            }, {
                transaction: transactions
            });

            await transactions.commit();
            return createUserModel;
        } catch (error) {
            // await transactions.rollback(); // Uncomment this if needed
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
            });
            console.log(`[]:[]:[]:User Found ${JSON.stringify(userData)}`);
            return userData;
        } catch (error) {
            throw error;
        }
    }

    async generateOtpAndUpdatePassword(email, newPassword) {
        const transaction = await dbConnection.transaction();
        try {
            // Step 1: Find user
            const user = await User.findOne({ where: { email } });
            if (!user) {
                throw new Error("User does not exist");
            }


            const auth_id = user.id;

            // Step 2: Generate 6-digit OTP
            const otp = Math.floor(100000 + Math.random() * 900000);

            // Step 3: Set OTP expiry (1 day)
            const otp_expiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 1 day later

            // Step 4: Log OTP to Log table
            await Log.create({
                auth_id: auth_id,
                reason: "OTP_GENERATION",
                otp: otp.toString(),
                otp_expiry: otp_expiry
            }, { transaction });

            // Step 5: Mark old passwords as inactive
            await Password.update(
                { is_active: false },
                { where: { auth_id }, transaction }
            );

            // Step 6: Insert new password as active
            await Password.create({
                auth_id,
                password: newPassword,
                is_active: true
            }, { transaction });

            await transaction.commit();
            console.log(`OTP Generated and Password Updated for ${email}`);
            return { success: true, otp };
        } catch (error) {
            await transaction.rollback();
            console.error("[generateOtpAndUpdatePassword ERROR]:", error.message);
            throw error;
        }
    }

    async updateUser(userData) {
        const transaction = await dbConnection.transaction();
        try {
            const { email, full_name, is_deleted, user_id, password, otp_id } = userData;
            console.log('[USER OTP UPDATE DATA]:', JSON.stringify(userData))
            if (email && full_name && is_deleted) {
                await User.update({
                    userData,
                    where: { id: user_id }
                }, {
                    transaction
                });
            }
            if (password && user_id) {
                await Password.create({
                    password: password,
                    auth_id: user_id
                }, { transaction });

                console.log(`[Password Create]: Password Created`);
                await Otp.update(
                    {
                        is_deleted: true
                    },
                    {
                        where: {
                            id: otp_id,
                            auth_id: user_id
                        },
                        transaction
                    }
                );
                console.log(`[OTP Deleted]`)
            }
            await transaction.commit();
            return true
        } catch (error) {
            throw error;
        }
    }
    async lastThreePass(user_id) {
        try {
            const lastPasswords = await Password.findAll({
                where: { auth_id: user_id },
                order: [['created_at', 'DESC']],
                limit: 3,
            });
            return lastPasswords;
        } catch (error) {
            throw error
        }
    }
}

export default AuthRepository;
