<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Reset Your Password</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #f9fafb; padding: 40px 0; margin: 0; text-align: center;">
    <div style="max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
        
        <h1 style="color: #111827; margin-bottom: 24px; font-size: 24px;">Reset Your Wijha Password 🌍</h1>
        
        <p style="color: #4b5563; font-size: 16px; line-height: 1.5; margin-bottom: 32px; text-align: left;">
            Hello Explorer,<br><br>
            You are receiving this email because we received a password reset request for your Wijha account. Click the button below to choose a new password and get back to your adventures!
        </p>
        
        <a href="{{ $url }}" style="display: inline-block; background-color: #f59e0b; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; margin-bottom: 32px; box-shadow: 0 4px 6px rgba(245, 158, 11, 0.2);">
            Reset Password
        </a>

        <p style="color: #6b7280; font-size: 14px; margin-bottom: 24px; text-align: left;">
            If you did not request a password reset, you can safely ignore this email. No further action is required.
        </p>
        
        <p style="color: #6b7280; font-size: 14px; margin-bottom: 24px; text-align: left;">
            Safe travels,<br>
            <strong>The Wijha Team</strong>
        </p>

        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">
        
        <p style="color: #9ca3af; font-size: 12px;">
            If you're having trouble clicking the "Reset Password" button, copy and paste the URL below into your web browser:<br>
            <a href="{{ $url }}" style="color: #f59e0b; word-break: break-all;">{{ $url }}</a>
        </p>
        
        <p style="color: #9ca3af; font-size: 12px; margin-top: 24px;">
            &copy; {{ date('Y') }} Wijha Platform. All rights reserved.
        </p>
    </div>
</body>
</html>
