using Backend.Api.Data;
using Backend.Api.Guards;
using Backend.Api.Models;
using MongoDB.Driver;

namespace Backend.Api.Services;

public class SessionService(MongoContext context, IUserContext uContext)
{
    private readonly MongoContext _context = context;
    private readonly IUserContext _userContext = uContext;

    public async Task<List<Session>> GetAllAsync() =>
        await _context.Sessions.Find(_ => true).ToListAsync();

    public async Task<Session?> GetAsync(string id) =>
        await _context.Sessions.Find(s => s.Id == id).FirstOrDefaultAsync();

    public async Task<Session> CreateAsync(SessionRequestDto request)
    {
        var newSession = new Session
        {
            UserId = _userContext.UserId(),
            Name = request.Name,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _context.Sessions.InsertOneAsync(newSession);

        return newSession;
    }

    public async Task<Session?> UpdateAsync(string id, SessionRequestDto session)
    {
        var sessionActual = await GetAsync(id);
        if(sessionActual is null)
            return null;
        
        if(!_userContext.SelfOrAdminOnly(sessionActual.UserId))
            return null;

        var update = Builders<Session>.Update
            .Set(s => s.AllowedUserIds, session.AllowedUserIds)
            .Set(s => s.Name, session.Name)
            .Set(s => s.ImageName, session.ImageName)
            .Set(s => s.UpdatedAt, DateTime.UtcNow);

        var options = new FindOneAndUpdateOptions<Session>{ ReturnDocument = ReturnDocument.After };
        return await _context.Sessions.FindOneAndUpdateAsync(s => s.Id == id, update, options);
    }

    public async Task<int> DeleteAsync(string id)
    {
        var session = await GetAsync(id);
        if(session == null)
            return -1;
        
        if(!_userContext.SelfOrAdminOnly(session.UserId))
            return -2;

        var result = await _context.Sessions.DeleteOneAsync(s => s.Id == id);
        return (int) result.DeletedCount;
    }
}