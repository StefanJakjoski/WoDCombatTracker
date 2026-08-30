using Backend.Api.Data;
using Backend.Api.Models;
using MongoDB.Driver;

namespace Backend.Api.Services;

public class UserService(MongoContext context)
{
    private readonly MongoContext _context = context;

    public async Task<List<User>> GetAllAsync() =>
        await _context.Users.Find(_ => true).ToListAsync();

    public async Task<User?> GetAsync(string id) =>
        await _context.Users.Find(u => u.Id == id).FirstOrDefaultAsync();

    public async Task<User?> GetByEmailAsync(string email) => 
        await _context.Users.Find(u => u.Email == email).FirstOrDefaultAsync();

    public async Task<User> CreateAsync(User user)
    {
        user.CreatedAt = DateTime.UtcNow;
        user.UpdatedAt = DateTime.UtcNow;

        await _context.Users.InsertOneAsync(user);
        return user;
    }

    public async Task<bool> DeleteAsync(string id)
    {
        var result = await _context.Users.DeleteOneAsync(u => u.Id == id);
        return result.DeletedCount > 0;
    }

    public async Task<User?> VerifyAsync(string id)
    {
        var update = Builders<User>.Update
            .Set(u => u.IsVerified, true)
            .Set(u => u.UpdatedAt, DateTime.UtcNow);

        var options = new FindOneAndUpdateOptions<User>{ ReturnDocument = ReturnDocument.After };

        return await _context.Users.FindOneAndUpdateAsync(u => u.Id == id, update, options);
    }
    
}