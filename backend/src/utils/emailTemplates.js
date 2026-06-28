// Brand colors based on your Tailwind config (orange/black theme)
const BRAND_COLORS = {
    primary: '#f97316',     // orange-500
    primaryLight: '#fb923c', // orange-400
    primaryDark: '#ea580c',  // orange-600
    secondary: '#000000',    // black
    secondaryLight: '#262626', // neutral-800
    grayBg: '#f8f9fa',
    grayBorder: '#e9ecef',
    text: '#1f2937',
    textLight: '#6b7280',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444'
};

// Helper to create a consistent card/info box
const createInfoCard = (content, variant = 'default') => {
    const variants = {
        default: `background: ${BRAND_COLORS.grayBg}; border: 1px solid ${BRAND_COLORS.grayBorder}; border-radius: 12px; padding: 20px; margin: 20px 0;`,
        warning: `background: #fffbeb; border-left: 4px solid ${BRAND_COLORS.warning}; padding: 16px; border-radius: 8px; margin: 20px 0;`,
        success: `background: #f0fdf4; border-left: 4px solid ${BRAND_COLORS.success}; padding: 16px; border-radius: 8px; margin: 20px 0;`
    };
    return `<div style="${variants[variant]}">${content}</div>`;
};

// Two-column row for summary data
const createSummaryRow = (label, value) => `
    <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid ${BRAND_COLORS.grayBorder};">
        <span style="font-weight: 600; color: ${BRAND_COLORS.secondaryLight};">${label}</span>
        <span style="color: ${BRAND_COLORS.text};">${value}</span>
    </div>
`;

// Simplified base template – no ticket headers, just clean Partcer branding
const baseTemplate = (content, title = 'Partcer') => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            line-height: 1.5;
            margin: 0;
            padding: 0;
            background-color: #f4f6f9;
            color: ${BRAND_COLORS.text};
        }
        .container {
            max-width: 560px;
            margin: 30px auto;
            background: #ffffff;
            border-radius: 20px;
            overflow: hidden;
            box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05), 0 8px 10px -6px rgba(0,0,0,0.02);
        }
        .content {
            padding: 32px 40px;
        }
        @media (max-width: 600px) {
            .content {
                padding: 24px 20px;
            }
        }
        .button {
            display: inline-block;
            background: ${BRAND_COLORS.primary};
            color: white !important;
            padding: 12px 28px;
            text-decoration: none;
            border-radius: 40px;
            font-weight: 600;
            font-size: 15px;
            margin: 16px 0;
            text-align: center;
        }
        .button:hover {
            background: ${BRAND_COLORS.primaryDark};
        }
        .footer {
            background: ${BRAND_COLORS.grayBg};
            padding: 24px 40px;
            text-align: center;
            color: ${BRAND_COLORS.textLight};
            font-size: 12px;
            border-top: 1px solid ${BRAND_COLORS.grayBorder};
        }
        .footer a {
            color: ${BRAND_COLORS.primary};
            text-decoration: none;
            margin: 0 8px;
        }
        .divider {
            height: 1px;
            background: ${BRAND_COLORS.grayBorder};
            margin: 24px 0;
        }
        .url-box {
            background: ${BRAND_COLORS.grayBg};
            padding: 12px 16px;
            border-radius: 12px;
            font-family: monospace;
            font-size: 13px;
            word-break: break-all;
            margin: 16px 0;
            border: 1px solid ${BRAND_COLORS.grayBorder};
        }
        h2 {
            font-size: 22px;
            font-weight: 600;
            margin: 0 0 8px 0;
            color: ${BRAND_COLORS.secondary};
        }
        h3 {
            font-size: 18px;
            font-weight: 600;
            margin: 0 0 12px 0;
            color: ${BRAND_COLORS.secondary};
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="content">
            <!-- Simple header: Partcer text + orange underline -->
            <div style="text-align: center; margin-bottom: 28px;">
                <h1 style="color: ${BRAND_COLORS.secondary}; font-size: 32px; margin: 0; letter-spacing: -0.5px;">Partcer</h1>
                <div style="width: 50px; height: 3px; background: ${BRAND_COLORS.primary}; margin: 12px auto 0;"></div>
            </div>
            ${content}
        </div>
        <div class="footer">
            <p style="margin: 0 0 12px 0;">Partcer · Support Team</p>
            <p style="margin: 0 0 12px 0;">India | <a href="mailto:admin@partcer.com">admin@partcer.com</a></p>
            <p style="margin: 0;">
                <a href="${process.env.FRONTEND_URL}/contact">Help Center</a> ·
                <a href="${process.env.FRONTEND_URL}/privacy-policy">Privacy Policy</a>
            </p>
            <p style="margin: 20px 0 0 0; font-size: 11px;">© ${new Date().getFullYear()} Partcer. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
`;

// ==================== EMAIL FUNCTIONS (preserved with your changes) ====================

// 1. Welcome Email with Verification
export const welcomeEmail = async (transporter, user, verificationToken) => {
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;

    const content = `
        <h2>Welcome to Partcer, ${user.displayName}!</h2>
        <p>Thanks for joining. Please verify your email to unlock all features and start your journey with us.</p>
        
        <div style="text-align: center;">
            <a href="${verificationUrl}" class="button">Verify Email Address</a>
        </div>
        
        <p style="font-size: 13px; color: ${BRAND_COLORS.textLight};">Or copy this link:</p>
        <div class="url-box">${verificationUrl}</div>
        
        ${createInfoCard(`
            <p style="margin: 0 0 8px 0;"><strong>Account Details:</strong></p>
            <p style="margin: 4px 0;">${user.displayName}</p>
            <p style="margin: 4px 0;">${user.email}</p>
            <p style="margin: 4px 0;">Account: ${user.userType === 'freelancer' ? 'Mentor' : user.userType === 'buyer' && isAgency ? 'Agency' : 'Student'}</p>
        `)}
        
        ${createInfoCard(`This verification link will expire in 24 hours.`, 'warning')}
    `;

    const html = baseTemplate(content, `Welcome, ${user.displayName}`);

    try {
        const info = await transporter.sendMail({
            from: `"Partcer" <${process.env.EMAIL_USER}>`,
            to: user.email,
            subject: `Welcome to Partcer, ${user.displayName}! Verify your email`,
            html
        });
        return !!info;
    } catch (error) {
        throw new Error(`Failed to send welcome email: ${error.message}`);
    }
};

// 2. New User Registration Notification for Admin
export const newUserRegistrationEmailForAdmin = async (transporter, adminEmail, user) => {
    const content = `
        <h2>New User Registration</h2>
        <p>A new user has joined Partcer. Review their details below.</p>
        
        ${createInfoCard(`
            <p style="margin: 0 0 12px 0;"><strong>User Details</strong></p>
            ${createSummaryRow('Name', `${user.firstName} ${user.lastName}`)}
            ${createSummaryRow('Email', user.email)}
            ${createSummaryRow('Phone', user.phone || 'Not provided')}
            ${createSummaryRow('User Type', user.userType === 'freelancer' ? 'Mentor' : 'Student')}
            ${createSummaryRow('Country', user.country || 'Not specified')}
            ${createSummaryRow('Joined', new Date(user.createdAt).toLocaleString())}
            ${createSummaryRow('Status', user.isVerified ? 'Verified' : 'Pending Verification')}
        `)}
        
        <div style="text-align: center;">
            <a href="${process.env.ADMIN_URL}/users/${user._id}" class="button">View User Profile</a>
        </div>
    `;

    const html = baseTemplate(content, 'New User Alert');

    try {
        const info = await transporter.sendMail({
            from: `"Partcer" <${process.env.EMAIL_USER}>`,
            to: adminEmail,
            subject: `New ${user.userType === 'freelancer' ? 'Mentor' : 'Student'} joined Partcer - ${user.firstName} ${user.lastName}`,
            html
        });
        return !!info;
    } catch (error) {
        throw new Error(`Failed to send admin notification: ${error.message}`);
    }
};

// 3. Email Verification Success
export const emailVerifiedSuccessEmail = async (transporter, user) => {
    const content = `
        <div style="text-align: center; margin: 10px 0 20px 0;">
            <h2 style="margin: 0 0 8px 0;">Email Verified!</h2>
            <p>Your email has been confirmed, ${user.firstName}. You now have full access.</p>
        </div>
        
        <div style="text-align: center;">
            <a href="${process.env.FRONTEND_URL}/${user.userType}/profile/settings" class="button">Go to Profile</a>
        </div>
    `;

    const html = baseTemplate(content, 'Verification Success');

    try {
        const info = await transporter.sendMail({
            from: `"Partcer" <${process.env.EMAIL_USER}>`,
            to: user.email,
            subject: `Email Verified - Welcome to Partcer, ${user.firstName}!`,
            html
        });
        return !!info;
    } catch (error) {
        throw new Error(`Failed to send verification success email: ${error.message}`);
    }
};

// 4. Password Reset Email
export const passwordResetEmail = async (transporter, user, resetToken) => {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    const content = `
        <h2>Reset your password</h2>
        <p>Hello ${user.firstName},</p>
        <p>We received a request to reset your Partcer password. Click the button below to create a new one.</p>
        
        <div style="text-align: center;">
            <a href="${resetUrl}" class="button">Reset Password</a>
        </div>
        
        <p style="font-size: 13px; color: ${BRAND_COLORS.textLight};">Link not working? Copy this:</p>
        <div class="url-box">${resetUrl}</div>
        
        ${createInfoCard(`
            <strong>This link will expire in 1 hour.</strong><br>
            If you didn't request this, please ignore this email.
        `, 'warning')}
    `;

    const html = baseTemplate(content, 'Password Reset Request');

    try {
        const info = await transporter.sendMail({
            from: `"Partcer" <${process.env.EMAIL_USER}>`,
            to: user.email,
            subject: `Reset your Partcer password`,
            html
        });
        return !!info;
    } catch (error) {
        throw new Error(`Failed to send password reset email: ${error.message}`);
    }
};

// 5. Password Changed Successfully
export const passwordChangedEmail = async (transporter, user) => {
    const content = `
        <h2>Password changed successfully</h2>
        <p>Your Partcer account password was changed on ${new Date().toLocaleString()}.</p>
        
        ${createInfoCard(`
            <strong>Didn't make this change?</strong><br>
            If you didn't change your password, please contact support immediately.
        `, 'warning')}
        
        <div class="divider"></div>
        <p style="font-size: 14px; text-align: center;">Need help? <a href="${process.env.FRONTEND_URL}/contact" style="color: ${BRAND_COLORS.primary};">Contact our support team</a></p>
    `;

    const html = baseTemplate(content, 'Password Updated');

    try {
        const info = await transporter.sendMail({
            from: `"Partcer" <${process.env.EMAIL_USER}>`,
            to: user.email,
            subject: `Your Partcer password has been changed`,
            html
        });
        return !!info;
    } catch (error) {
        throw new Error(`Failed to send password changed email: ${error.message}`);
    }
};

// 6. Account Suspended/Banned Notification
export const accountSuspendedEmail = async (transporter, user, reason = null, isPermanent = false) => {
    const suspensionType = isPermanent ? 'banned' : 'suspended';
    const actionRequired = isPermanent
        ? 'Your account has been permanently banned due to violation of our Terms of Service.'
        : 'Your account has been temporarily suspended. During this period, you will not be able to access your dashboard, create or join sessions, or use any Partcer features.';

    const content = `
        <h2>Account ${isPermanent ? 'Banned' : 'Suspended'}</h2>
        <p>Hello ${user.firstName},</p>
        <p>We regret to inform you that your Partcer account has been ${suspensionType}.</p>
        
        ${createInfoCard(`
            <p style="margin: 0 0 8px 0;"><strong>${isPermanent ? 'Ban Details' : 'Suspension Details'}:</strong></p>
            ${reason ? `<p style="margin: 4px 0;"><strong>Reason:</strong> ${reason}</p>` : '<p style="margin: 4px 0;">No specific reason was provided by the admin.</p>'}
            <p style="margin: 4px 0;"><strong>Date:</strong> ${new Date().toLocaleString()}</p>
            ${!isPermanent ? `<p style="margin: 4px 0;"><strong>Status:</strong> Temporary</p>` : '<p style="margin: 4px 0;"><strong>Status:</strong> Permanent</p>'}
        `, 'warning')}
        
        ${isPermanent ? `
            <p>If you believe this was a mistake, you may appeal by contacting our support team. Please include your account email and any relevant information.</p>
        ` : `
            <p>If you think this suspension was in error, or if you have questions about the reason, please reply to this email or visit our Help Center.</p>
        `}
        
        <div class="divider"></div>
        <p style="font-size: 14px; text-align: center;">Need help? <a href="${process.env.FRONTEND_URL}/contact" style="color: ${BRAND_COLORS.primary};">Contact Support</a> or email <a href="mailto:admin@partcer.com" style="color: ${BRAND_COLORS.primary};">admin@partcer.com</a></p>
    `;

    const html = baseTemplate(content, `Account ${isPermanent ? 'Banned' : 'Suspended'}`);

    try {
        const info = await transporter.sendMail({
            from: `"Partcer Support" <${process.env.EMAIL_USER}>`,
            to: user.email,
            subject: `Your Partcer account has been ${suspensionType}`,
            html
        });
        return !!info;
    } catch (error) {
        throw new Error(`Failed to send account suspension email: ${error.message}`);
    }
};

// 7. Account Reactivated (Unsuspended/Unbanned) Notification
export const accountReactivatedEmail = async (transporter, user, wasPermanent = false) => {
    const reactivationType = wasPermanent ? 'ban has been lifted' : 'suspension has been lifted';

    const content = `
        <h2>Account Reactivated</h2>
        <p>Hello ${user.firstName},</p>
        <p>We're pleased to inform you that your Partcer account has been activated. You can now access all features again.</p>
        
        ${createInfoCard(`
            <p style="margin: 0 0 8px 0;"><strong>Reactivated Account Details:</strong></p>
            <p style="margin: 4px 0;"><strong>Email:</strong> ${user.email}</p>
            <p style="margin: 4px 0;"><strong>Reactivated On:</strong> ${new Date().toLocaleString()}</p>
            <p style="margin: 4px 0;"><strong>Status:</strong> Active</p>
            ${user.suspensionReason ? `<p style="margin: 4px 0;"><strong>Previous Issue Resolved:</strong> ${user.suspensionReason}</p>` : ''}
        `, 'success')}
        
        <p>You can now log in, join sessions, and access all Partcer features as before.</p>
        
        <div style="text-align: center;">
            <a href="${process.env.FRONTEND_URL}/login" class="button">Log In to Your Account</a>
        </div>
        
        <div class="divider"></div>
        <p style="font-size: 14px; text-align: center;">If you have any questions, please <a href="${process.env.FRONTEND_URL}/contact" style="color: ${BRAND_COLORS.primary};">contact support</a>.</p>
    `;

    const html = baseTemplate(content, 'Account Reactivated');

    try {
        const info = await transporter.sendMail({
            from: `"Partcer Support" <${process.env.EMAIL_USER}>`,
            to: user.email,
            subject: `Your Partcer account has been reactivated`,
            html
        });
        return !!info;
    } catch (error) {
        throw new Error(`Failed to send account reactivation email: ${error.message}`);
    }
};

// 8. New Message Notification (when receiver is offline)
export const newMessageEmail = async (transporter, receiver, sender, messagePreview, conversationId) => {
    const content = `
        <h2>You have a new message</h2>
        <p>Hello ${receiver.firstName},</p>
        <p><strong>${sender.firstName} ${sender.lastName}</strong> sent you a message on Partcer.</p>
        
        ${createInfoCard(`
            <p style="margin: 0 0 8px 0;"><strong>Message preview:</strong></p>
            <p style="margin: 0; color: ${BRAND_COLORS.text};">${messagePreview}</p>
        `, 'default')}
        
        <p>Log in to Partcer to read the full conversation and reply.</p>
    `;

    const html = baseTemplate(content, 'New Message');

    try {
        const info = await transporter.sendMail({
            from: `"Partcer" <${process.env.EMAIL_USER}>`,
            to: receiver.email,
            subject: `New message from ${sender.firstName} ${sender.lastName} on Partcer`,
            html
        });
        return !!info;
    } catch (error) {
        console.error(`Failed to send new message email to ${receiver.email}:`, error.message);
        return false; // Don't throw, just log
    }
};

// 9. Student Order Confirmation Email (after successful payment)
export const orderConfirmationForStudent = async (transporter, student, order, sessionDetails) => {
    // Format the amount the student paid in their own currency
    const formatMoney = (amount, currency) => {
        return new Intl.NumberFormat(currency === 'USD' ? 'en-US' : 'en-IN', {
            style: 'currency',
            currency: currency,
        }).format(amount);
    };

    const studentAmountFormatted = formatMoney(order.studentPaidAmount, order.studentCurrency);

    // Optional: show INR equivalent if paid in USD
    let inrEquivalentHtml = '';
    if (order.studentCurrency === 'USD' && order.exchangeRateUsed) {
        const inrAmountFormatted = formatMoney(order.amountReceivedInINR, 'INR');
        inrEquivalentHtml = `<p style="margin: 4px 0; font-size: 13px; color: ${BRAND_COLORS.textLight};">(1 USD = ${order.exchangeRateUsed} INR)</p>`;
    }

    const content = `
        <h2>Payment Confirmed! Your session is booked</h2>
        <p>Hello ${student.firstName},</p>
        <p>Thank you for your payment. Your session with the mentor has been successfully booked.</p>
        
        ${createInfoCard(`
            <p style="margin: 0 0 12px 0;"><strong>Booking Details</strong></p>
            ${createSummaryRow('Service: ', sessionDetails.serviceType || order.serviceType)}
            ${createSummaryRow('Duration: ', sessionDetails.duration || order.durationDetails)}
            ${createSummaryRow('Mentor: ', sessionDetails.mentorName || 'Your mentor will be assigned')}
            ${createSummaryRow('Amount Paid: ', studentAmountFormatted)}
            ${inrEquivalentHtml}
        `)}
        
        <p>You can view your booking and join the session from your dashboard.</p>
        
        <div style="text-align: center;">
            <a href="${process.env.FRONTEND_URL}/buyer/orders" class="button">View My Order</a>
        </div>
        
        <div class="divider"></div>
        <p style="font-size: 12px; text-align: center;">Need help? Contact us at <a href="mailto:admin@partcer.com">admin@partcer.com</a></p>
    `;

    const html = baseTemplate(content, 'Payment Confirmation');

    try {
        const info = await transporter.sendMail({
            from: `"Partcer" <${process.env.EMAIL_USER}>`,
            to: student.email,
            subject: `Payment confirmed - Your Partcer session is booked`,
            html
        });
        return !!info;
    } catch (error) {
        throw new Error(`Failed to send student order confirmation email: ${error.message}`);
    }
};

// 10. Mentor Order Confirmation Email (after student pays)
export const orderConfirmationForMentor = async (transporter, mentor, order, student, sessionDetails) => {
    // Format mentor fee in INR
    const mentorFeeFormatted = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
    }).format(order.mentorFee);

    const content = `
        <h2>New Session Booking</h2>
        <p>Hello ${mentor.firstName},</p>
        <p>A student has booked a session with you. The payment has been successfully processed.</p>
        
        ${createInfoCard(`
            <p style="margin: 0 0 12px 0;"><strong>Session Details</strong></p>
            ${createSummaryRow('Student: ', `${student.firstName} ${student.lastName}`)}
            ${createSummaryRow('Service: ', sessionDetails.serviceType || order.serviceType)}
            ${createSummaryRow('Duration: ', sessionDetails.duration || order.durationDetails)}
            ${createSummaryRow('Your Fee (INR): ', mentorFeeFormatted)}
        `)}
        
        <p>Please be available at the scheduled time.</p>
        
        <div style="text-align: center;">
            <a href="${process.env.FRONTEND_URL}/freelancer/orders/all" class="button">View Orders</a>
        </div>
        
        <div class="divider"></div>
        <p style="font-size: 12px; text-align: center;">For any questions, contact <a href="mailto:admin@partcer.com">admin@partcer.com</a></p>
    `;

    const html = baseTemplate(content, 'New Session Booking');

    try {
        const info = await transporter.sendMail({
            from: `"Partcer" <${process.env.EMAIL_USER}>`,
            to: mentor.email,
            subject: `New session booking - ${student.firstName} ${student.lastName}`,
            html
        });
        return !!info;
    } catch (error) {
        throw new Error(`Failed to send mentor order confirmation email: ${error.message}`);
    }
};

// 11. Order Delivered Notification for Student
export const orderDeliveredEmail = async (transporter, student, order, mentor, deliveryDetails) => {
    const deliveredAtFormatted = new Date(deliveryDetails.deliveredAt).toLocaleString();
    
    const content = `
        <h2>Your order has been delivered</h2>
        <p>Hello ${student.firstName},</p>
        <p><strong>${mentor.firstName} ${mentor.lastName}</strong> has marked your order as delivered.</p>
        
        ${createInfoCard(`
            <p style="margin: 0 0 12px 0;"><strong>Order Details</strong></p>
            ${createSummaryRow('Service: ', order.serviceType)}
            ${createSummaryRow('Duration: ', order.durationDetails || order.duration)}
            ${createSummaryRow('Delivered On: ', deliveredAtFormatted)}
            ${deliveryDetails.notes ? createSummaryRow('Notes from mentor: ', deliveryDetails.notes) : ''}
        `)}
        
        ${deliveryDetails.attachments && deliveryDetails.attachments.length > 0 ? `
            <p style="margin: 10px 0 4px 0;"><strong>Attachments included:</strong> ${deliveryDetails.attachments.length} file(s)</p>
            <p style="font-size: 13px; color: ${BRAND_COLORS.textLight};">Log in to your account to view or download the files.</p>
        ` : ''}
        
        <p>Please log in to review the delivery. If everything was satisfactory, you can mark the order as completed. If you have any concerns, you may contact the mentor or our support team.</p>
        
        <div style="text-align: center;">
            <a href="${process.env.FRONTEND_URL}/buyer/orders/${order._id}" class="button">View Order Details</a>
        </div>
        
        <div class="divider"></div>
        <p style="font-size: 12px; text-align: center;">Need help? Visit our <a href="${process.env.FRONTEND_URL}/contact">Help Center</a> or email <a href="mailto:admin@partcer.com">admin@partcer.com</a></p>
    `;

    const html = baseTemplate(content, 'Order Delivered');

    try {
        const info = await transporter.sendMail({
            from: `"Partcer" <admin@partcer.com>`,
            to: student.email,
            subject: `Your Partcer order has been delivered by ${mentor.firstName} ${mentor.lastName}`,
            html
        });
        return !!info;
    } catch (error) {
        throw new Error(`Failed to send order delivered email: ${error.message}`);
    }
};

// 12. Order Completed Notification for Mentor
export const orderCompletedEmail = async (transporter, mentor, order, student, completionDetails) => {
    const completedAtFormatted = new Date(completionDetails.completedAt).toLocaleString();
    
    const content = `
        <h2>Order completed by student</h2>
        <p>Hello ${mentor.firstName},</p>
        <p><strong>${student.firstName} ${student.lastName}</strong> has marked the order as completed.</p>
        
        ${createInfoCard(`
            <p style="margin: 0 0 12px 0;"><strong>Order Summary</strong></p>
            ${createSummaryRow('Service: ', order.serviceType)}
            ${createSummaryRow('Duration: ', order.durationDetails || order.duration)}
            ${createSummaryRow('Completed On: ', completedAtFormatted)}
        `)}
        
        <p>The student has confirmed that they are satisfied with the delivery.</p>
        
        <div style="text-align: center;">
            <a href="${process.env.FRONTEND_URL}/freelancer/orders/${order._id}" class="button">View Order Details</a>
        </div>
        
        <div class="divider"></div>
        <p style="font-size: 12px; text-align: center;">Need help? Visit our <a href="${process.env.FRONTEND_URL}/contact">Help Center</a> or email <a href="mailto:admin@partcer.com">admin@partcer.com</a></p>
    `;

    const html = baseTemplate(content, 'Order Completed');

    try {
        const info = await transporter.sendMail({
            from: `"Partcer" <admin@partcer.com>`,
            to: mentor.email,
            subject: `Order completed by student: ${order.serviceType}`,
            html
        });
        return !!info;
    } catch (error) {
        throw new Error(`Failed to send order completed email: ${error.message}`);
    }
};

// 13. Review Received Notification (for reviewee)
export const reviewReceivedEmail = async (transporter, reviewee, reviewer, order, reviewDetails) => {
    const { rating, comment, reviewerRole, revieweeRole } = reviewDetails;
    
    // Format rating as stars (text representation)
    const ratingStars = '★'.repeat(rating) + '☆'.repeat(5 - rating);
    
    // Determine subject based on roles
    const subject = `${reviewer.firstName} ${reviewer.lastName} left a ${rating}-star review for your ${revieweeRole === 'buyer' ? 'mentorship' : 'session'}`;
    
    const content = `
        <h2>You have received a new review</h2>
        <p>Hello ${reviewee.firstName},</p>
        <p><strong>${reviewer.firstName} ${reviewer.lastName}</strong> (${reviewerRole}) has left a review for your ${revieweeRole === 'buyer' ? 'service as a mentor' : 'session as a student'}.</p>
        
        ${createInfoCard(`
            <p style="margin: 0 0 12px 0;"><strong>Review Details</strong></p>
            ${createSummaryRow('Rating: ', `${rating} / 5 (${ratingStars})`)}
            ${createSummaryRow('Comment: ', comment)}
            ${createSummaryRow('Order: ', order.serviceType + ' - ' + (order.durationDetails || order.duration))}
        `)}
        
        <p>Reviews help build trust within the Partcer community. Thank you for your contribution.</p>
        
        <div class="divider"></div>
        <p style="font-size: 12px; text-align: center;">Need help? Visit our <a href="${process.env.FRONTEND_URL}/contact">Help Center</a> or email <a href="mailto:admin@partcer.com">admin@partcer.com</a></p>
    `;

    const html = baseTemplate(content, 'New Review Received');

    try {
        const info = await transporter.sendMail({
            from: `"Partcer" <admin@partcer.com>`,
            to: reviewee.email,
            subject: subject,
            html
        });
        return !!info;
    } catch (error) {
        throw new Error(`Failed to send review notification email: ${error.message}`);
    }
};

// 14. Admin Complaint Notification
export const complaintNotificationForAdmin = async (transporter, resolution, order, student, mentor) => {
    const content = `
        <h2>New Complaint Submitted</h2>
        <p>A new complaint has been submitted by <strong>${student.firstName} ${student.lastName}</strong> for order <strong>${order.orderId}</strong>.</p>
        
        ${createInfoCard(`
            <p style="margin: 0 0 12px 0;"><strong>Complaint Details</strong></p>
            ${createSummaryRow('Student: ', `${student.firstName} ${student.lastName} (${student.email})`)}
            ${createSummaryRow('Mentor: ', `${mentor.firstName} ${mentor.lastName} (${mentor.email})`)}
            ${createSummaryRow('Issue Type: ', resolution.issueTypeDisplay)}
            ${createSummaryRow('Complaint: ', resolution.complaint)}
            ${createSummaryRow('Submitted At: ', new Date(resolution.createdAt).toLocaleString())}
        `)}
        
        <div style="text-align: center;">
            <a href="${process.env.FRONTEND_URL}/admin/resolutions" class="button">View in Admin Panel</a>
        </div>
        
        <div class="divider"></div>
        <p style="font-size: 12px; text-align: center;">This is an automated notification from Partcer.</p>
    `;

    const html = baseTemplate(content, 'New Complaint - Action Required');

    try {
        const info = await transporter.sendMail({
            from: `"Partcer Support" <admin@partcer.com>`,
            to: process.env.EMAIL_USER, // or a dedicated admin email address
            subject: `New Complaint: ${resolution.issueTypeDisplay} (Order ${order.orderId})`,
            html
        });
        return !!info;
    } catch (error) {
        throw new Error(`Failed to send admin complaint email: ${error.message}`);
    }
};

// 15. Mentor Complaint Notification
export const complaintNotificationForMentor = async (transporter, mentor, order, student, resolution) => {
    const content = `
        <h2>Complaint Raised on Your Order</h2>
        <p>Hello ${mentor.firstName},</p>
        <p><strong>${student.firstName} ${student.lastName}</strong> has raised a complaint regarding order <strong>${order.orderId}</strong>.</p>
        
        ${createInfoCard(`
            <p style="margin: 0 0 12px 0;"><strong>Complaint Details</strong></p>
            ${createSummaryRow('Issue Type: ', resolution.issueTypeDisplay)}
            ${createSummaryRow('Complaint: ', resolution.complaint)}
            ${createSummaryRow('Order: ', `${order.serviceType} - ${order.durationDetails || order.duration}`)}
            ${createSummaryRow('Submitted On: ', new Date(resolution.createdAt).toLocaleString())}
        `)}
        
        <p>Our support team has been notified and will review the matter. You may be contacted for additional information. Please cooperate to help resolve the issue fairly.</p>
        
        <div style="text-align: center;">
            <a href="${process.env.FRONTEND_URL}/freelancer/orders/${order._id}" class="button">View Order</a>
        </div>
        
        <div class="divider"></div>
        <p style="font-size: 12px; text-align: center;">Need help? Visit our <a href="${process.env.FRONTEND_URL}/contact">Help Center</a> or email <a href="mailto:admin@partcer.com">admin@partcer.com</a></p>
    `;

    const html = baseTemplate(content, 'Complaint Raised');

    try {
        const info = await transporter.sendMail({
            from: `"Partcer Support" <admin@partcer.com>`,
            to: mentor.email,
            subject: `Complaint Raised on Your Order (Order ${order.orderId})`,
            html
        });
        return !!info;
    } catch (error) {
        throw new Error(`Failed to send mentor complaint email: ${error.message}`);
    }
};

// 16. Resolution Status Update Notification (for student and mentor)
export const resolutionStatusUpdateEmail = async (transporter, recipient, resolution, order, updateDetails) => {
    const {
        newStatus,
        adminNotes,
        resolutionText,
        refundAmount,
        orderPaymentStatus,
        orderStatus,
        isRefunded
    } = updateDetails;

    const statusDisplay = {
        pending: 'Pending Review',
        in_review: 'Under Review',
        resolved: 'Resolved',
        rejected: 'Rejected'
    }[newStatus] || newStatus;

    const content = `
        <h2>Complaint Status Update</h2>
        <p>Hello ${recipient.firstName},</p>
        <p>Your complaint regarding order <strong>${order.orderId}</strong> has been updated.</p>
        
        ${createInfoCard(`
            <p style="margin: 0 0 12px 0;"><strong>Update Details</strong></p>
            ${createSummaryRow('Current Status: ', statusDisplay)}
            ${adminNotes ? createSummaryRow('Admin Notes: ', adminNotes) : ''}
            ${resolutionText ? createSummaryRow('Resolution: ', resolutionText) : ''}
            ${refundAmount ? createSummaryRow('Refund Amount: ', new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(refundAmount)) : ''}
            ${orderPaymentStatus ? createSummaryRow('Order Payment Status: ', orderPaymentStatus) : ''}
            ${orderStatus ? createSummaryRow('Order Status: ', orderStatus) : ''}
            ${isRefunded ? createSummaryRow('Refund Processed: ', 'Yes') : ''}
        `)}
        
        ${newStatus === 'resolved' ? `
            <p>This complaint has been resolved. If you have any further questions, please contact our support team.</p>
        ` : newStatus === 'rejected' ? `
            <p>After review, this complaint could not be upheld. If you disagree, you may reply to this email for further clarification.</p>
        ` : `
            <p>Our team is actively working on your case. You will receive another notification when there is an update.</p>
        `}
        
        <div style="text-align: center;">
            <a href="${process.env.FRONTEND_URL}/contact" class="button">Contact Support</a>
        </div>
        
        <div class="divider"></div>
        <p style="font-size: 12px; text-align: center;">Need help? Visit our <a href="${process.env.FRONTEND_URL}/contact">Help Center</a> or email <a href="mailto:admin@partcer.com">admin@partcer.com</a></p>
    `;

    const html = baseTemplate(content, 'Complaint Updated');

    try {
        const info = await transporter.sendMail({
            from: `"Partcer Support" <admin@partcer.com>`,
            to: recipient.email,
            subject: `Complaint ${statusDisplay}: Order ${order.orderId}`,
            html
        });
        return !!info;
    } catch (error) {
        throw new Error(`Failed to send resolution status email: ${error.message}`);
    }
};

// 17. Meeting Notification for Student (created or updated by mentor)
export const meetingNotificationForStudent = async (transporter, student, mentor, meeting, type = 'created') => {
    const isCreated = type === 'created';
    const actionText = isCreated ? 'created' : 'updated';
    const subject = isCreated 
        ? `Meeting scheduled for your session with ${mentor.firstName} ${mentor.lastName}`
        : `Meeting details updated by ${mentor.firstName} ${mentor.lastName}`;
    
    // Format meeting details
    const meetingDetailsHtml = `
        ${createSummaryRow('Meeting Link: ', `<a href="${meeting.meetingLink}" style="color: ${BRAND_COLORS.primary};">Join Meeting</a>`)}
        ${meeting.meetingId ? createSummaryRow('Meeting ID: ', meeting.meetingId) : ''}
        ${meeting.passcode ? createSummaryRow('Passcode: ', meeting.passcode) : ''}
        ${meeting.platform ? createSummaryRow('Platform: ', meeting.platform) : ''}
        ${createSummaryRow('Last Updated: ', new Date(meeting.lastUpdated).toLocaleString())}
    `;

    const content = `
        <h2>Meeting ${isCreated ? 'Scheduled' : 'Details Updated'}</h2>
        <p>Hello ${student.firstName},</p>
        <p><strong>${mentor.firstName} ${mentor.lastName}</strong> has ${actionText} the meeting details for your session.</p>
        
        ${createInfoCard(`
            <p style="margin: 0 0 12px 0;"><strong>Meeting Information</strong></p>
            ${meetingDetailsHtml}
        `)}
        
        <p>Please use the meeting link at the scheduled time. If you have any questions, reply to this email or contact the mentor directly through the Partcer messaging system.</p>
        
        <div style="text-align: center;">
            <a href="${process.env.FRONTEND_URL}/buyer/orders" class="button">View My Orders</a>
        </div>
        
        <div class="divider"></div>
        <p style="font-size: 12px; text-align: center;">Need help? Visit our <a href="${process.env.FRONTEND_URL}/contact">Help Center</a> or email <a href="mailto:admin@partcer.com">admin@partcer.com</a></p>
    `;

    const html = baseTemplate(content, `Meeting ${isCreated ? 'Scheduled' : 'Updated'}`);

    try {
        const info = await transporter.sendMail({
            from: `"Partcer" <admin@partcer.com>`,
            to: student.email,
            subject: subject,
            html
        });
        return !!info;
    } catch (error) {
        throw new Error(`Failed to send meeting notification email: ${error.message}`);
    }
};

// 18. Admin Notification for Withdrawal Request
export const withdrawalRequestAdminNotification = async (transporter, adminEmail, withdrawal, mentor, paymentMethodDetails) => {
    const content = `
        <h2>New Withdrawal Request</h2>
        <p>A mentor has requested a withdrawal. Please review the details below.</p>
        
        ${createInfoCard(`
            <p style="margin: 0 0 12px 0;"><strong>Withdrawal Details</strong></p>
            ${createSummaryRow('Withdrawal ID: ', withdrawal.withdrawalId)}
            ${createSummaryRow('Mentor Name: ', `${mentor.firstName} ${mentor.lastName}`)}
            ${createSummaryRow('Mentor Email: ', mentor.email)}
            ${createSummaryRow('Amount: ', new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(withdrawal.amount))}
            ${createSummaryRow('Method: ', withdrawal.method)}
            ${createSummaryRow('Payment Details: ', paymentMethodDetails)}
            ${withdrawal.notes ? createSummaryRow('Notes: ', withdrawal.notes) : ''}
            ${createSummaryRow('Requested On: ', new Date(withdrawal.createdAt).toLocaleString())}
            ${createSummaryRow('Status: ', 'Pending')}
        `)}
        
        <div style="text-align: center;">
            <a href="${process.env.FRONTEND_URL}/admin/withdrawals" class="button">Review Withdrawal</a>
        </div>
        
        <div class="divider"></div>
        <p style="font-size: 12px; text-align: center;">This is an automated notification from Partcer.</p>
    `;

    const html = baseTemplate(content, 'Withdrawal Request');

    try {
        const info = await transporter.sendMail({
            from: `"Partcer" <admin@partcer.com>`,
            to: adminEmail,
            subject: `New Withdrawal Request - ${mentor.firstName} ${mentor.lastName} (${withdrawal.withdrawalId})`,
            html
        });
        return !!info;
    } catch (error) {
        throw new Error(`Failed to send withdrawal request email: ${error.message}`);
    }
};

// 19. Admin Notification for Withdrawal Cancellation
export const withdrawalCancellationAdminNotification = async (transporter, adminEmail, withdrawal, mentor, cancellationReason) => {
    const content = `
        <h2>Withdrawal Request Cancelled</h2>
        <p>A mentor has cancelled their withdrawal request. Details are below.</p>
        
        ${createInfoCard(`
            <p style="margin: 0 0 12px 0;"><strong>Cancelled Withdrawal Details</strong></p>
            ${createSummaryRow('Withdrawal ID: ', withdrawal.withdrawalId)}
            ${createSummaryRow('Mentor Name: ', `${mentor.firstName} ${mentor.lastName}`)}
            ${createSummaryRow('Mentor Email: ', mentor.email)}
            ${createSummaryRow('Amount: ', new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(withdrawal.amount))}
            ${createSummaryRow('Method: ', withdrawal.method)}
            ${createSummaryRow('Original Request Date: ', new Date(withdrawal.createdAt).toLocaleString())}
            ${createSummaryRow('Cancelled On: ', new Date().toLocaleString())}
            ${createSummaryRow('Cancellation Reason: ', cancellationReason)}
        `)}
        
        <p>No further action is required from admin side for this withdrawal request.</p>
        
        <div class="divider"></div>
        <p style="font-size: 12px; text-align: center;">This is an automated notification from Partcer.</p>
    `;

    const html = baseTemplate(content, 'Withdrawal Cancelled');

    try {
        const info = await transporter.sendMail({
            from: `"Partcer" <admin@partcer.com>`,
            to: adminEmail,
            subject: `Withdrawal Cancelled - ${mentor.firstName} ${mentor.lastName} (${withdrawal.withdrawalId})`,
            html
        });
        return !!info;
    } catch (error) {
        throw new Error(`Failed to send withdrawal cancellation email: ${error.message}`);
    }
};

// 20. Withdrawal Status Update for Mentor
export const withdrawalStatusUpdateEmail = async (transporter, mentor, withdrawal, updateDetails) => {
    const { status, transactionId, notes, processedBy } = updateDetails;
    
    let statusTitle = '';
    let statusMessage = '';
    let statusColor = '';
    
    if (status === 'clearing') {
        statusTitle = 'Withdrawal Processing';
        statusMessage = 'Your withdrawal request is now being processed. The amount will be transferred to your registered payment method shortly.';
        statusColor = BRAND_COLORS.warning;
    } else if (status === 'completed') {
        statusTitle = 'Withdrawal Completed';
        statusMessage = 'Your withdrawal has been successfully processed and the amount has been transferred to your registered payment method.';
        statusColor = BRAND_COLORS.success;
    } else if (status === 'cancelled') {
        statusTitle = 'Withdrawal Cancelled';
        statusMessage = 'Your withdrawal request has been cancelled by the admin. The amount has been credited back to your Partcer wallet balance.';
        statusColor = BRAND_COLORS.danger;
    }
    
    const statusDisplay = {
        clearing: 'Processing',
        completed: 'Completed',
        cancelled: 'Cancelled'
    }[status] || status;
    
    const content = `
        <h2>${statusTitle}</h2>
        <p>Hello ${mentor.firstName},</p>
        <p>Your withdrawal request <strong>${withdrawal.withdrawalId}</strong> has been updated to <strong>${statusDisplay}</strong>.</p>
        
        ${createInfoCard(`
            <p style="margin: 0 0 12px 0;"><strong>Withdrawal Details</strong></p>
            ${createSummaryRow('Withdrawal ID: ', withdrawal.withdrawalId)}
            ${createSummaryRow('Amount: ', new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(withdrawal.amount))}
            ${createSummaryRow('Status: ', statusDisplay)}
            ${transactionId ? createSummaryRow('Transaction ID: ', transactionId) : ''}
            ${notes ? createSummaryRow('Admin Notes: ', notes) : ''}
            ${withdrawal.processedDate ? createSummaryRow('Processed On: ', new Date(withdrawal.processedDate).toLocaleString()) : ''}
        `)}
        
        <p>${statusMessage}</p>
        
        ${status === 'cancelled' ? `
            <p>If you have questions about why your withdrawal was cancelled, please contact our support team.</p>
        ` : status === 'completed' ? `
            <p>The funds should reflect in your account within 2-5 business days depending on your payment provider.</p>
        ` : `
            <p>Once the transfer is complete, you will receive another notification.</p>
        `}
        
        <div style="text-align: center;">
            <a href="${process.env.FRONTEND_URL}/freelancer/finance/withdrawals" class="button">View Withdrawals</a>
        </div>
        
        <div class="divider"></div>
        <p style="font-size: 12px; text-align: center;">Need help? Visit our <a href="${process.env.FRONTEND_URL}/contact">Help Center</a> or email <a href="mailto:admin@partcer.com">admin@partcer.com</a></p>
    `;

    const html = baseTemplate(content, statusTitle);

    try {
        const info = await transporter.sendMail({
            from: `"Partcer" <admin@partcer.com>`,
            to: mentor.email,
            subject: `Withdrawal ${statusDisplay}: ${withdrawal.withdrawalId}`,
            html
        });
        return !!info;
    } catch (error) {
        throw new Error(`Failed to send withdrawal status update email: ${error.message}`);
    }
};

// 21. Admin Notification for Contact Query
export const contactEmail = async (transporter, name, email, phone, userType, message) => {
    const content = `
        <h2>New Contact Query</h2>
        <p>A new contact query has been submitted. Please review the details below.</p>
        
        ${createInfoCard(`
            <p style="margin: 0 0 12px 0;"><strong>Query Details</strong></p>
            ${createSummaryRow('Name: ', name)}
            ${createSummaryRow('Email: ', email)}
            ${createSummaryRow('Phone: ', phone || 'Not provided')}
            ${createSummaryRow('User Type: ', userType === 'freelancer' ? 'Mentor' : 'Student')}
            ${createSummaryRow('Message: ', message)}
        `)}
        
        <p>Please respond to the user within 24 hours.</p>
        
        <div style="text-align: center;">
            <a href="mailto:${email}" class="button">Reply to User</a>
        </div>
        
        <div class="divider"></div>
        <p style="font-size: 12px; text-align: center;">This is an automated notification from Partcer.</p>
    `;

    const html = baseTemplate(content, 'New Contact Query');

    try {
        const info = await transporter.sendMail({
            from: `"Partcer Support" <admin@partcer.com>`,
            to: process.env.EMAIL_USER,
            subject: `New Contact Query from ${name}`,
            html
        });
        return !!info;
    } catch (error) {
        console.error('Admin contact email failed:', error.message);
        return false;
    }
};

// 22. User Confirmation for Contact Query
export const contactConfirmationEmail = async (transporter, name, email) => {
    const content = `
        <h2>We've received your query</h2>
        <p>Hello ${name},</p>
        <p>Thank you for reaching out to Partcer. We have received your query and our support team will respond within 24 hours.</p>
        
        ${createInfoCard(`
            <p style="margin: 0 0 8px 0;"><strong>What happens next?</strong></p>
            <p style="margin: 4px 0;">1. Our team will review your query</p>
            <p style="margin: 4px 0;">2. We will respond to your email address</p>
            <p style="margin: 4px 0;">3. If urgent, you may also reach us at admin@partcer.com</p>
        `)}
        
        <p>In the meantime, you may find answers to common questions in our Help Center.</p>
        
        <div style="text-align: center;">
            <a href="${process.env.FRONTEND_URL}/contact" class="button">Visit Help Center</a>
        </div>
        
        <div class="divider"></div>
        <p style="font-size: 12px; text-align: center;">We appreciate your patience and will get back to you shortly.</p>
    `;

    const html = baseTemplate(content, 'Query Received');

    try {
        const info = await transporter.sendMail({
            from: `"Partcer Support" <admin@partcer.com>`,
            to: email,
            subject: `We've received your query - Partcer Support`,
            html
        });
        return !!info;
    } catch (error) {
        console.error('User confirmation email failed:', error.message);
        return false;
    }
};

// 23. Project Created Confirmation for Student
export const projectCreatedConfirmation = async (transporter, student, project) => {
    const content = `
        <h2>Your project has been posted</h2>
        <p>Hello ${student.firstName},</p>
        <p>Your project <strong>${project.title}</strong> has been successfully posted on Partcer. Mentors with matching skills will be notified, and you can start receiving proposals.</p>
        
        ${createInfoCard(`
            <p style="margin: 0 0 12px 0;"><strong>Project Details</strong></p>
            ${createSummaryRow('Title: ', project.title)}
            ${createSummaryRow('Category: ', project.category?.name || project.category)}
            ${project.subCategory ? createSummaryRow('Sub-Category: ', project.subCategory?.name || project.subCategory) : ''}
            ${createSummaryRow('Service Type: ', project.service)}
            ${createSummaryRow('Period: ', project.period === 'one_time' ? 'One-time' : 'Recurring')}
            ${createSummaryRow('Duration: ', project.duration)}
            ${createSummaryRow('Skills Required: ', project.skills?.join(', ') || 'None specified')}
            ${createSummaryRow('Status: ', 'Active')}
        `)}
        
        <p>You can view your project, edit it, or track proposals from your dashboard.</p>
        
        <div style="text-align: center;">
            <a href="${process.env.FRONTEND_URL}/project/${project?._id}" class="button">View Project</a>
        </div>
        
        <div class="divider"></div>
        <p style="font-size: 12px; text-align: center;">Need help? Visit our <a href="${process.env.FRONTEND_URL}/contact">Help Center</a> or email <a href="mailto:admin@partcer.com">admin@partcer.com</a></p>
    `;

    const html = baseTemplate(content, 'Project Posted');

    try {
        const info = await transporter.sendMail({
            from: `"Partcer" <admin@partcer.com>`,
            to: student.email,
            subject: `Your project "${project.title}" has been posted`,
            html
        });
        return !!info;
    } catch (error) {
        throw new Error(`Failed to send project creation email: ${error.message}`);
    }
};

// 24. Project Matching Notification for Mentor
export const projectMatchingNotification = async (transporter, mentor, project) => {
    const content = `
        <h2>New project matching your skills</h2>
        <p>Hello ${mentor.firstName},</p>
        <p>A new project has been posted that matches your skills and categories.</p>
        
        ${createInfoCard(`
            <p style="margin: 0 0 12px 0;"><strong>Project Details</strong></p>
            ${createSummaryRow('Title: ', project.title)}
            ${createSummaryRow('Category: ', project.category?.name || project.category)}
            ${project.subCategory ? createSummaryRow('Sub-Category: ', project.subCategory?.name || project.subCategory) : ''}
            ${createSummaryRow('Service Type: ', project.service)}
            ${createSummaryRow('Period: ', project.period === 'one_time' ? 'One-time' : 'Recurring')}
            ${createSummaryRow('Duration: ', project.duration)}
            ${createSummaryRow('Skills Required: ', project.skills?.join(', ') || 'None specified')}
        `)}
        
        <p>If you are interested, you can submit a proposal for this project. Early applicants often have a higher chance of being selected.</p>
        
        <div style="text-align: center;">
            <a href="${process.env.FRONTEND_URL}/project/${project?._id}" class="button">View Project & Apply</a>
        </div>
    `;

    const html = baseTemplate(content, 'New Matching Project');

    try {
        const info = await transporter.sendMail({
            from: `"Partcer" <admin@partcer.com>`,
            to: mentor.email,
            subject: `New project: ${project.title} (matches your skills)`,
            html
        });
        return !!info;
    } catch (error) {
        throw new Error(`Failed to send project matching email: ${error.message}`);
    }
};

// 25. New Proposal Notification for Student (Project Owner)
export const newProposalNotification = async (transporter, student, project, freelancer, proposal) => {
    const proposalPreview = proposal.length > 200 ? proposal.substring(0, 200) + '...' : proposal;
    
    const content = `
        <h2>New proposal received for your project</h2>
        <p>Hello ${student.firstName},</p>
        <p><strong>${freelancer.firstName} ${freelancer.lastName}</strong> has submitted a proposal for your project <strong>${project.title}</strong>.</p>
        
        ${createInfoCard(`
            <p style="margin: 0 0 12px 0;"><strong>Proposal Details</strong></p>
            ${createSummaryRow('Mentor: ', `${freelancer.firstName} ${freelancer.lastName}`)}
            ${createSummaryRow('Project: ', project.title)}
            ${createSummaryRow('Proposal Preview: ', proposalPreview)}
        `)}
        
        <p>Log in to your dashboard to review the full proposal, view the mentor's profile, and decide whether to accept or decline.</p>
        
        <div style="text-align: center;">
            <a href="${process.env.FRONTEND_URL}/buyer/projects/all" class="button">View Proposals</a>
        </div>
        
        <div class="divider"></div>
        <p style="font-size: 12px; text-align: center;">Need help? Visit our <a href="${process.env.FRONTEND_URL}/contact">Help Center</a> or email <a href="mailto:admin@partcer.com">admin@partcer.com</a></p>
    `;

    const html = baseTemplate(content, 'New Proposal');

    try {
        const info = await transporter.sendMail({
            from: `"Partcer" <admin@partcer.com>`,
            to: student.email,
            subject: `New proposal for "${project.title}" from ${freelancer.firstName} ${freelancer.lastName}`,
            html
        });
        return !!info;
    } catch (error) {
        throw new Error(`Failed to send new proposal email: ${error.message}`);
    }
};

// 26. Proposal Status Update for Mentor (Freelancer)
export const proposalStatusUpdateEmail = async (transporter, mentor, project, proposal, status) => {
    const isAccepted = status === 'accepted';
    const statusTitle = isAccepted ? 'Proposal Accepted' : 'Proposal Update';
    const statusMessage = isAccepted 
        ? `Congratulations! Your proposal for project "${project.title}" has been accepted by the student.`
        : `Thank you for your interest in project "${project.title}". The student has decided not to move forward with your proposal at this time.`;
    
    const content = `
        <h2>${statusTitle}</h2>
        <p>Hello ${mentor.firstName},</p>
        <p>${statusMessage}</p>
        
        ${createInfoCard(`
            <p style="margin: 0 0 12px 0;"><strong>Proposal Details</strong></p>
            ${createSummaryRow('Project Title: ', project.title)}
            ${createSummaryRow('Project ID: ', project._id.toString())}
            ${createSummaryRow('Your Proposal: ', proposal.proposal.length > 150 ? proposal.proposal.substring(0, 150) + '...' : proposal.proposal)}
            ${createSummaryRow('Status: ', isAccepted ? 'Accepted' : 'Declined')}
            ${isAccepted ? createSummaryRow('Next Steps: ', 'The student has been notified. You will receive further instructions regarding project delivery.') : ''}
        `)}
        
        ${isAccepted ? `
            <p>Please check your dashboard for more details and to coordinate with the student. You can now begin working on the project as per the agreed terms.</p>
            
            <div style="text-align: center;">
                <a href="${process.env.FRONTEND_URL}/freelancer/projects/applied" class="button">View Project</a>
            </div>
        ` : `
            <p>We encourage you to continue exploring other projects that match your skills. Your next opportunity is just around the corner.</p>
            
            <div style="text-align: center;">
                <a href="${process.env.FRONTEND_URL}/projects" class="button">Browse More Projects</a>
            </div>
        `}
        
        <div class="divider"></div>
        <p style="font-size: 12px; text-align: center;">Need help? Visit our <a href="${process.env.FRONTEND_URL}/contact">Help Center</a> or email <a href="mailto:admin@partcer.com">admin@partcer.com</a></p>
    `;

    const html = baseTemplate(content, statusTitle);

    try {
        const info = await transporter.sendMail({
            from: `"Partcer" <admin@partcer.com>`,
            to: mentor.email,
            subject: isAccepted 
                ? `Your proposal for "${project.title}" has been accepted` 
                : `Update on your proposal for "${project.title}"`,
            html
        });
        return !!info;
    } catch (error) {
        throw new Error(`Failed to send proposal status update email: ${error.message}`);
    }
};

// 27. Project Updated by Admin - Notification to Student
export const projectUpdatedByAdminNotification = async (transporter, student, project) => {
    const content = `
        <h2>Your project has been updated by admin</h2>
        <p>Hello ${student.firstName},</p>
        <p>An administrator has made changes to your project <strong>${project.title}</strong>. The updates may include title, description, category, skills, attachments, or other details.</p>
        
        ${createInfoCard(`
            <p style="margin: 0 0 8px 0;"><strong>Project Details</strong></p>
            ${createSummaryRow('Project ID: ', project._id.toString())}
            ${createSummaryRow('Title: ', project.title)}
            ${createSummaryRow('Status: ', project.status)}
        `)}
        
        <p>Please review the updated project to ensure everything is correct. If you have any questions or disagree with the changes, please contact our support team.</p>
        
        <div style="text-align: center;">
            <a href="${process.env.FRONTEND_URL}/project/${project?._id}" class="button">View Updated Project</a>
        </div>
        
        <div class="divider"></div>
        <p style="font-size: 12px; text-align: center;">Need help? Visit our <a href="${process.env.FRONTEND_URL}/contact">Help Center</a> or email <a href="mailto:admin@partcer.com">admin@partcer.com</a></p>
    `;

    const html = baseTemplate(content, 'Project Updated by Admin');

    try {
        const info = await transporter.sendMail({
            from: `"Partcer Support" <admin@partcer.com>`,
            to: student.email,
            subject: `Admin updated your project: ${project.title}`,
            html
        });
        return !!info;
    } catch (error) {
        throw new Error(`Failed to send project update notification: ${error.message}`);
    }
};