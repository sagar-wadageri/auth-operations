import dbConnection from "../config/db.config.js";
import { DataTypes } from "sequelize";

const User = dbConnection.define('user', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    email: {
        type: DataTypes.STRING(50),
        unique: true,
        allowNull: false,
    },
    full_name: {
        type: DataTypes.STRING(150),
        allowNull: false,
    },
    is_deleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
},
    {
        timestamps: true,
        createdAt: true,
        updatedAt: true,
    }
);

User.sync({alter:false});

export default User;