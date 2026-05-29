import { contactConfirmationEmail, contactEmail } from "../utils/emailTemplates.js";
import transporter from "../utils/nodemailer.js";

export const submitContactQuery = async (req, res) => {
    try {
        const { name, email, phone, userType, message } = req.body;

        // Validate required fields
        if (!name || !email || !userType || !message) {
            return res.status(400).json({
                success: false,
                message: 'Name, email, user type, and message are required'
            });
        }

        contactEmail(transporter, name, email, phone, userType, message)
            .catch(err => console.error('Admin contact email failed:', err.message));

        contactConfirmationEmail(transporter, name, email)
            .catch(err => console.error('User confirmation email failed:', err.message));


        res.status(200).json({
            success: true,
            message: 'Your query has been submitted successfully. We will get back to you within 24 hours.'
        });

    } catch (error) {
        console.error('Submit contact query error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while submitting your query'
        });
    }
};