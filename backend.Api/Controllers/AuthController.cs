

using Backend.Api.Models;
using Backend.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController(AuthService service) : ControllerBase
{
    private readonly AuthService _service = service;

    [HttpPost("register")]
    public async Task<ActionResult<UserDto>> Register(RegisterRequest request)
    {
        var user = await _service.RegisterAsync(request);
        if(user is null)
            return Conflict(new { message = "A user with the same email already exists." });

        return CreatedAtAction(nameof(Register), new { id = user.Id }, user);
    }

    [HttpPost("login")]
    public async Task<ActionResult<LoginResponse>> Login(LoginRequest request)
    {
        var response = await _service.LoginAsync(request);
        if(response is null)
            return Unauthorized(new { message = "Login failed." });

        return Ok(response);
    }
}