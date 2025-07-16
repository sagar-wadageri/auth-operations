export const sendResponse = (res,statusCode,message,data) => {
    let success;
    const responseData = data?data:null;
    if(statusCode >= 200 && statusCode <= 400){
        success = true;
    } else if (statusCode >= 400){
        success = false
    }
    return res.status(statusCode).json({
        success,
        message,
        responseData
});
}