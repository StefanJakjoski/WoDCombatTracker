using Backend.Api.Controllers;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Backend.Api.Models;

public enum Role
{
    Default,
    Admin
}

public class User
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }

    public string Username { get; set; } = "";

    public string Email { get; set; } = "";

    public string PasswordHash { get; set; } = "";

    public Role Role { get; set; } = Role.Default;

    public bool IsVerified { get; set; } = false;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}

public record RegisterRequest(
    string Username,
    string Email,
    string Password
);

public record LoginRequest(
    string Email,
    string Password
);


public record LoginResponse(
    string Token,
    UserDto User
);