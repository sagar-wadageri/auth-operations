import dbConnection from "../config/db.config.js";
import { DataTypes } from "sequelize";
import moment from 'moment';

const Password = dbConnection.define('password_master', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    password: {
        type: DataTypes.STRING,
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
    expiry: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: () => {
            return moment().add(6, 'months').toDate(); // Return a Date object, not a string
        }
    }
    ,
    is_expired: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
}, {
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
});

Password.sync({ alter: true }); // Set to true in dev if you want Sequelize to adjust columns

export default Password;
