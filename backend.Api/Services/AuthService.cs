using Backend.Api.Controllers;
using Backend.Api.Models;
using Microsoft.AspNetCore.Identity;

namespace Backend.Api.Services;

public class AuthService(
    UserService userService,
    JwtService jwtService)
{
    private readonly UserService _userService = userService;
    private readonly JwtService _jwtService = jwtService;

    private readonly PasswordHasher<User> _hasher = new();

    public async Task<UserDto?> RegisterAsync(RegisterRequest request)
    {
        var existing =
            await _userService.GetByEmailAsync(request.Email);

        if (existing is not null)
            return null;

        var user = new User
        {
            Username = request.Username,
            Email = request.Email,
            Role = Role.Default,
            IsVerified = false
        };

        user.PasswordHash =
            _hasher.HashPassword(user, request.Password);

        await _userService.CreateAsync(user);

        return new UserDto(
            user.Id!,
            user.Username,
            user.Email,
            user.Role,
            user.IsVerified);
    }

    public async Task<LoginResponse?> LoginAsync(LoginRequest request)
    {
        var user =
            await _userService.GetByEmailAsync(request.Email);

        if (user is null)
            return null;

        var result =
            _hasher.VerifyHashedPassword(
                user,
                user.PasswordHash,
                request.Password);

        if (result == PasswordVerificationResult.Failed)
            return null;

        var token = _jwtService.GenerateToken(user);

        return new LoginResponse(
            token,
            new UserDto(
                user.Id!,
                user.Username,
                user.Email,
                user.Role,
                user.IsVerified));
    }
}