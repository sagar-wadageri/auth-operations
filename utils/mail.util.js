import transport from "../config/mail.config.js";
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from "url";

const writeToHtml = async (mailBodyContent, typeOfEmail) => {
    try {
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);
        const templatePath = path.join(__dirname,'../templates/mail.template.html');
        console.log(templatePath)
        const templateContent = fs.readFileSync(templatePath, 'utf-8');
        let updatedContent;

        switch (typeOfEmail) {
            case "RESET_PASS": {
                updatedContent = templateContent.replace('{{user_name}}', mailBodyContent.user_name)
                    .replace('{{start_content}}', mailBodyContent.start_content)
                    .replace('{{main_content}}', mailBodyContent.main_content);
            }
        }
        return updatedContent;

    } catch (error) {
        throw error;
    }
}

const sendMail = async (mailOptions) => {
    try {
        const { fromMail, toMail, subject, htmlBody } = mailOptions;
        await transport.sendMail(
            {
                from: fromMail,
                to: toMail,
                subject: subject,
                html: htmlBody
            }
        )
    } catch (error) {
        throw error
    }
}

export { sendMail,writeToHtml }