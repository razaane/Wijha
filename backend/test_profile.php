<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);

$user = App\Models\User::find(2);

// Mock acting as
\Illuminate\Support\Facades\Auth::guard('api')->setUser($user);

$request = Illuminate\Http\Request::create(
    '/api/v1/auth/profile',
    'PUT',
    [
        'name' => 'Mohamed Elkerymy',
        'ui_preferences' => [
            'dark_mode' => false,
            'compact_density' => false
        ]
    ]
);
$request->headers->set('Accept', 'application/json');

$response = $kernel->handle($request);
echo "Status: " . $response->getStatusCode() . "\n";
echo "Content: " . $response->getContent() . "\n";

$user->refresh();
echo "\nDB dark_mode: " . ($user->ui_preferences['dark_mode'] ? 'true' : 'false') . "\n";
