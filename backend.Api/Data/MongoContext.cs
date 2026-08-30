using Backend.Api.Models;
using MongoDB.Driver;

namespace Backend.Api.Data;

public class MongoContext
{
    private readonly IMongoDatabase _database;

    public MongoContext(IConfiguration config)
    {
        var client = new MongoClient(config["MongoDb:ConnectionString"]);
        _database = client.GetDatabase(config["MongoDb:DatabaseName"]);
    }

    public IMongoCollection<Character> Characters =>
        _database.GetCollection<Character>("characters");
    
    public IMongoCollection<Session> Sessions =>
        _database.GetCollection<Session>("sessions");

    public IMongoCollection<User> Users =>
        _database.GetCollection<User>("users");
}