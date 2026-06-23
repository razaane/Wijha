<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .btn { display: inline-block; padding: 10px 20px; background-color: #f59e0b; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; }
        .footer { margin-top: 30px; font-size: 0.8em; color: #777; }
    </style>
</head>
<body>
    <div class="container">
        <h2>Great news, {{ $waitlist->user->name }}!</h2>
        
        <p>A ticket has just become available for <strong>{{ $waitlist->listing->title }}</strong>!</p>
        
        <p>Because you are on the waitlist, we have reserved this ticket exclusively for you. However, you must claim it within the next <strong>24 hours</strong>.</p>
        
        <p>This reservation expires at: <strong>{{ $waitlist->expires_at->format('Y-m-d H:i:s') }} UTC</strong></p>
        
        <p style="margin: 30px 0;">
            <a href="{{ config('app.frontend_url') }}/trips/{{ $waitlist->listing->id }}/ticket" class="btn">Claim Your Ticket Now</a>
        </p>
        
        <p>If you no longer wish to attend, you can safely ignore this email and the ticket will be offered to the next person in line.</p>
        
        <div class="footer">
            <p>Thank you for using Wijha.</p>
        </div>
    </div>
</body>
</html>
