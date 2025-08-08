export const getUserByParameter = async (column_name) =>{
    return `SELECT u.id, u.full_name, u.email, pm.password FROM users u
    JOIN password_masters pm 
    ON pm.auth_id = u.id 
    WHERE u.${column_name}= :value
    ORDER BY pm.created_at DESC`
};