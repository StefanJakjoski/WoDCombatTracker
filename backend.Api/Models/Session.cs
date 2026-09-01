using System.Security.Cryptography.X509Certificates;
using Microsoft.AspNetCore.SignalR;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Backend.Api.Models;

public class Session
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }

    [BsonRepresentation(BsonType.ObjectId)]
    public string UserId { get; set; } = "";

    [BsonRepresentation(BsonType.ObjectId)]
    public List<string> AllowedUserIds { get; set; } = [];

    public string Name { get; set; } = "Encounter";

    public string ImageName { get; set; } = "background2.jpg";

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}

public class SessionRequestDto{
    public string Name { get; set; } = "Encounter";
    public List<string> AllowedUserIds { get; set; } = [];
    public string ImageName { get; set; } = "background2.jpg";
}