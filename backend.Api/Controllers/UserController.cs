

using Backend.Api.Models;
using Backend.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UserController(UserService service) : ControllerBase
{
    private readonly UserService _service = service;

    [HttpGet]
    public async Task<ActionResult<List<UserDto>>> Get()
    {
        var users = await _service.GetAllAsync();

        var dtos = users.Select(user => new UserDto(
            user.Id!,
            user.Username,
            user.Email,
            user.Role,
            user.IsVerified))
            .ToList();

        return Ok(dtos);
    }
    
    [HttpGet("{id}")]
    public async Task<ActionResult<UserDto>> Get(string id)
    {
        var user = await _service.GetAsync(id);
        if(user is null)
            return NotFound();

        return Ok(new UserDto(
            user.Id!,
            user.Username,
            user.Email,
            user.Role,
            user.IsVerified));
    }

    [Authorize(Roles = "Admin")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(string id)
    {
        var deleted = await _service.DeleteAsync(id);

        if (!deleted)
            return NotFound();

        return Ok();
    }

    [Authorize(Roles = "Admin")]
    [HttpPost("{id}/verify")]
    public async Task<ActionResult<UserDto>> Verify(string id)
    {
        var user = await _service.VerifyAsync(id);

        if (user is null)
            return NotFound();

        return Ok(new UserDto(
            user.Id!,
            user.Username,
            user.Email,
            user.Role,
            user.IsVerified));
    }
}

public record UserDto(
    string Id,
    string Username,
    string Email,
    Role Role,
    bool IsVerified);