import dbConnection from "../config/db.config.js";
import { DataTypes } from "sequelize";

const Otp = dbConnection.define('otp', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    otp: {
        type: DataTypes.CHAR(6),
        allowNull: false,
    },
    expiry: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    auth_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users', 
            key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
    },
    is_verified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    is_deleted:{
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    }
}, {
    timestamps: true,       // Automatically adds createdAt and updatedAt
    createdAt: 'created_at',
    updatedAt: 'updated_at',
});

Otp.sync({ alter: true }); // Use `alter: true` during development if you want Sequelize to auto update

export default Otp;
