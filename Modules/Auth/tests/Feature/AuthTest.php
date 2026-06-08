<?php

namespace Modules\Auth\Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Modules\Auth\Models\RefreshToken;
use Tests\TestCase;
use Tymon\JWTAuth\Facades\JWTAuth;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    private string $apiPrefix = '/api/v1/auth';

    /**
     * Test user registration with valid data.
     */
    public function test_user_can_register_with_valid_data(): void
    {
        $response = $this->postJson("{$this->apiPrefix}/register", [
            'name' => 'Test User',
            'email' => 'test@wijha.ma',
            'password' => 'SecureP@ss1',
            'password_confirmation' => 'SecureP@ss1',
            'locale' => 'fr',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'status',
                'message',
                'data' => [
                    'access_token',
                    'refresh_token',
                    'token_type',
                    'expires_in',
                    'user' => ['id', 'name', 'email', 'role', 'locale'],
                ],
            ])
            ->assertJson([
                'status' => 'success',
                'data' => [
                    'token_type' => 'bearer',
                    'user' => [
                        'name' => 'Test User',
                        'email' => 'test@wijha.ma',
                        'role' => 'user',
                        'locale' => 'fr',
                    ],
                ],
            ]);

        $this->assertDatabaseHas('users', [
            'email' => 'test@wijha.ma',
            'role' => 'user',
        ]);

        $this->assertDatabaseCount('refresh_tokens', 1);
    }

    /**
     * Test registration fails with weak password.
     */
    public function test_registration_fails_with_weak_password(): void
    {
        $response = $this->postJson("{$this->apiPrefix}/register", [
            'name' => 'Test User',
            'email' => 'test@wijha.ma',
            'password' => 'weak',
            'password_confirmation' => 'weak',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['password']);
    }

    /**
     * Test registration fails with duplicate email.
     */
    public function test_registration_fails_with_duplicate_email(): void
    {
        User::factory()->create(['email' => 'taken@wijha.ma']);

        $response = $this->postJson("{$this->apiPrefix}/register", [
            'name' => 'Test User',
            'email' => 'taken@wijha.ma',
            'password' => 'SecureP@ss1',
            'password_confirmation' => 'SecureP@ss1',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }

    /**
     * Test user can login with valid credentials.
     */
    public function test_user_can_login_with_valid_credentials(): void
    {
        User::factory()->create([
            'email' => 'test@wijha.ma',
            'password' => 'SecureP@ss1',
        ]);

        $response = $this->postJson("{$this->apiPrefix}/login", [
            'email' => 'test@wijha.ma',
            'password' => 'SecureP@ss1',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'status',
                'data' => [
                    'access_token',
                    'refresh_token',
                    'token_type',
                    'expires_in',
                    'user',
                ],
            ])
            ->assertJson(['status' => 'success']);
    }

    /**
     * Test login fails with invalid credentials.
     */
    public function test_login_fails_with_invalid_credentials(): void
    {
        User::factory()->create([
            'email' => 'test@wijha.ma',
            'password' => 'SecureP@ss1',
        ]);

        $response = $this->postJson("{$this->apiPrefix}/login", [
            'email' => 'test@wijha.ma',
            'password' => 'WrongPassword1!',
        ]);

        $response->assertStatus(401)
            ->assertJson([
                'status' => 'error',
                'error' => 'INVALID_CREDENTIALS',
            ]);
    }

    /**
     * Test authenticated user can access /me endpoint.
     */
    public function test_authenticated_user_can_access_profile(): void
    {
        $user = User::factory()->create();
        $token = JWTAuth::fromUser($user);

        $response = $this->getJson("{$this->apiPrefix}/me", [
            'Authorization' => "Bearer {$token}",
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'status' => 'success',
                'data' => [
                    'id' => $user->id,
                    'email' => $user->email,
                ],
            ]);
    }

    /**
     * Test unauthenticated user cannot access /me endpoint.
     */
    public function test_unauthenticated_user_cannot_access_profile(): void
    {
        $response = $this->getJson("{$this->apiPrefix}/me");

        $response->assertStatus(401);
    }

    /**
     * Test user can logout.
     */
    public function test_user_can_logout(): void
    {
        $user = User::factory()->create();
        $token = JWTAuth::fromUser($user);

        // Create a refresh token
        RefreshToken::create([
            'user_id' => $user->id,
            'token' => hash('sha256', 'test-refresh-token'),
            'expires_at' => now()->addDays(30),
        ]);

        $response = $this->postJson("{$this->apiPrefix}/logout", [], [
            'Authorization' => "Bearer {$token}",
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'status' => 'success',
                'message' => 'Successfully logged out.',
            ]);

        // Verify refresh token was revoked
        $this->assertNotNull(
            RefreshToken::where('user_id', $user->id)->first()->revoked_at
        );

        // Verify access token is blacklisted
        $this->getJson("{$this->apiPrefix}/me", [
            'Authorization' => "Bearer {$token}",
        ])->assertStatus(401);
    }

    /**
     * Test token refresh with valid refresh token.
     */
    public function test_user_can_refresh_tokens(): void
    {
        $user = User::factory()->create();
        $plainToken = 'valid-refresh-token-string-that-is-long-enough-to-be-valid-yes';

        RefreshToken::create([
            'user_id' => $user->id,
            'token' => hash('sha256', $plainToken),
            'expires_at' => now()->addDays(30),
        ]);

        $response = $this->postJson("{$this->apiPrefix}/refresh", [
            'refresh_token' => $plainToken,
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'status',
                'data' => [
                    'access_token',
                    'refresh_token',
                    'token_type',
                    'expires_in',
                ],
            ]);

        // Old refresh token should be revoked
        $this->assertNotNull(
            RefreshToken::where('token', hash('sha256', $plainToken))->first()->revoked_at
        );

        // New refresh token should exist
        $this->assertEquals(2, RefreshToken::where('user_id', $user->id)->count());
    }

    /**
     * Test refresh fails with expired refresh token.
     */
    public function test_refresh_fails_with_expired_token(): void
    {
        $user = User::factory()->create();
        $plainToken = 'expired-refresh-token-string-thats-long-enough-for-valid-test';

        RefreshToken::create([
            'user_id' => $user->id,
            'token' => hash('sha256', $plainToken),
            'expires_at' => now()->subDay(), // expired
        ]);

        $response = $this->postJson("{$this->apiPrefix}/refresh", [
            'refresh_token' => $plainToken,
        ]);

        $response->assertStatus(401)
            ->assertJson([
                'status' => 'error',
                'error' => 'INVALID_REFRESH_TOKEN',
            ]);
    }

    /**
     * Test refresh with revoked token revokes ALL user tokens (theft detection).
     */
    public function test_reusing_revoked_refresh_token_revokes_all_tokens(): void
    {
        $user = User::factory()->create();
        $stolenToken = 'stolen-refresh-token-string-thats-long-enough-for-this-test';
        $activeToken = 'active-refresh-token-string-thats-long-enough-for-this-test';

        // Create a revoked token (simulates stolen token reuse)
        RefreshToken::create([
            'user_id' => $user->id,
            'token' => hash('sha256', $stolenToken),
            'expires_at' => now()->addDays(30),
            'revoked_at' => now()->subHour(), // already revoked
        ]);

        // Create an active token
        RefreshToken::create([
            'user_id' => $user->id,
            'token' => hash('sha256', $activeToken),
            'expires_at' => now()->addDays(30),
        ]);

        // Try to use the stolen token
        $response = $this->postJson("{$this->apiPrefix}/refresh", [
            'refresh_token' => $stolenToken,
        ]);

        $response->assertStatus(401);

        // ALL tokens should now be revoked (security measure)
        $activeTokens = RefreshToken::where('user_id', $user->id)
            ->whereNull('revoked_at')
            ->count();

        $this->assertEquals(0, $activeTokens);
    }

    /**
     * Test forgot password endpoint always returns success (prevents email enumeration).
     */
    public function test_forgot_password_always_returns_success(): void
    {
        // With non-existent email
        $response = $this->postJson("{$this->apiPrefix}/forgot-password", [
            'email' => 'nonexistent@wijha.ma',
        ]);

        $response->assertStatus(200)
            ->assertJson(['status' => 'success']);

        // With existing email
        User::factory()->create(['email' => 'exists@wijha.ma']);

        $response = $this->postJson("{$this->apiPrefix}/forgot-password", [
            'email' => 'exists@wijha.ma',
        ]);

        $response->assertStatus(200)
            ->assertJson(['status' => 'success']);
    }

    /**
     * Test password field is never exposed in responses.
     */
    public function test_password_is_hidden_in_responses(): void
    {
        $response = $this->postJson("{$this->apiPrefix}/register", [
            'name' => 'Test User',
            'email' => 'test@wijha.ma',
            'password' => 'SecureP@ss1',
            'password_confirmation' => 'SecureP@ss1',
        ]);

        $response->assertStatus(200);
        $this->assertArrayNotHasKey('password', $response->json('data.user'));
    }

    /**
     * Test user role defaults to 'user' on registration.
     */
    public function test_user_role_defaults_to_user(): void
    {
        $response = $this->postJson("{$this->apiPrefix}/register", [
            'name' => 'Test User',
            'email' => 'test@wijha.ma',
            'password' => 'SecureP@ss1',
            'password_confirmation' => 'SecureP@ss1',
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'data' => [
                    'user' => ['role' => 'user'],
                ],
            ]);
    }
}
