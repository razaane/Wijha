<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Verify Your Email</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #f9fafb; padding: 40px 0; margin: 0; text-align: center;">
    <div style="max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
        <h1 style="color: #111827; margin-bottom: 24px; font-size: 24px;">Welcome to Wijha! 🌍</h1>
        <p style="color: #4b5563; font-size: 16px; line-height: 1.5; margin-bottom: 32px;">
            Hello {{ $name }},<br><br>
            We're thrilled to have you! Before you can start exploring, please verify your email address by entering the code below:
        </p>
        
        <div style="background-color: #f3f4f6; border-radius: 8px; padding: 24px; margin-bottom: 32px;">
            <div style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #f59e0b;">
                {{ $otp }}
            </div>
        </div>

        <p style="color: #6b7280; font-size: 14px; margin-bottom: 24px;">
            This code will expire in 10 minutes. If you did not sign up for an account, you can safely ignore this email.
        </p>
        
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">
        
        <p style="color: #9ca3af; font-size: 12px;">
            &copy; {{ date('Y') }} Wijha Platform. All rights reserved.
        </p>
    </div>
</body>
</html>
