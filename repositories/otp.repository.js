import Otp from "../models/otp.model.js";

class OtpRepository {
    async createOtp(otp, expiry, auth_id) {
        try {
            return await Otp.create({
                otp: otp,
                auth_id: auth_id,
                expiry: expiry
            });
        } catch (error) {
            throw error;
        }
    }

    async getOtpRecord(auth_id, otp) {
        try {
            return await Otp.findOne({
                where: {
                    auth_id,
                    otp,
                    is_verified: false
                }
            });
        } catch (error) {
            throw error;
        }
    }

    async findByUserAndCode(userId, otp) {
        try {
            return await Otp.findOne({ where: { userId, otp } });
        } catch (error) {
            throw error;
        }
    }

    async latestVerifiedButUnused(userId) {
        try {
            return await Otp.findOne({
                where: { auth_id: userId, is_verified: true},
                order: [['created_at', 'DESC']],
                limit: 1
            });
        } catch (error) {
            throw error;
        }
    }

    async markVerified(otpRec) {
        try {
            return await otpRec.update({ verified: true });
        } catch (error) {
            throw error;
        }
    }

    async markUsed(otpRec) {
        try {
            return await otpRec.update({ usedForPwd: true });
        } catch (error) {
            throw error;
        }
    }
}

export default OtpRepository;
