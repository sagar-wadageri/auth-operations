import dbConnection from "../config/db.config.js";
import { DataTypes } from "sequelize";

const Log = dbConnection.define('log_table', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
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
    reason: {
        type: DataTypes.STRING,
        allowNull: true, // You can set this to false if reason should be mandatory
    },
}, {
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
});

Log.sync({ alter: true }); // alter: true in dev mode if needed

export default Log;
