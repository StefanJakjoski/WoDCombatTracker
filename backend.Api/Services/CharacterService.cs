using Backend.Api.Data;
using Backend.Api.Guards;
using Backend.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http.HttpResults;
using MongoDB.Bson;
using MongoDB.Bson.Serialization;
using MongoDB.Driver;

namespace Backend.Api.Services;

public class CharacterService(MongoContext context, IUserContext uContext)
{
    private readonly MongoContext _context = context;
    private readonly IUserContext _userContext = uContext;

    public async Task DebugCharacter(string id)
    {
        var single = await _context.Characters
            .Find(c => c.Id == id)
            .FirstOrDefaultAsync();

        var all = await _context.Characters
            .Find(_ => true)
            .ToListAsync();

        var fromList = all.First(c => c.Id == id);

        Console.WriteLine(
            $"Single type: {single?.GetType().FullName}"
        );

        Console.WriteLine(
            $"List type:   {fromList.GetType().FullName}"
        );

        if (single is WerewolfCharacter singleWolf &&
            fromList is WerewolfCharacter listWolf)
        {
            Console.WriteLine(
                $"Single Breed: {singleWolf.Breed}"
            );

            Console.WriteLine(
                $"List Breed:   {listWolf.Breed}"
            );

            Console.WriteLine(
                $"Single Rage: {singleWolf.Rage.Current}/{singleWolf.Rage.Maximum}"
            );

            Console.WriteLine(
                $"List Rage:   {listWolf.Rage.Current}/{listWolf.Rage.Maximum}"
            );
        }
    }

    public async Task<List<Character>> GetAllAsync() =>
        await _context.Characters.Find(_ => true).ToListAsync();


/*
    public async Task<List<Character>> GetAllAsync()
    {
        var response = await _context.Characters.Find(_ => true).ToListAsync();
        response.ForEach(c =>
        {
           Console.WriteLine(c.GetType().Name); 
        });

        return response;
    }
*/

    public async Task<Character?> GetAsync(string id) =>
        await _context.Characters.Find(c => c.Id == id).FirstOrDefaultAsync();

    public async Task<List<Character>> GetAllFromSessionIdAsync(string sessionId) =>
        await _context.Characters.Find(c => c.SessionId == sessionId).ToListAsync();

    public async Task<WerewolfCharacter?> CreateWerewolfAsync(WerewolfCharacterCreateDto character, string userId)
    {
        var sessionId = character.SessionId;
        var session = await _context.Sessions.Find(s => s.Id == sessionId).FirstOrDefaultAsync();
        if(session is null)
            return null;

        if(!_userContext.InSessionOnly(session))
            return null;

        var newChar = new WerewolfCharacter
        {
            UserId = userId,
            SessionId = sessionId,
            Name = character.Name,
            Category = character.Category,
            Health = new HealthTrack(),
            //CharacterType = CharacterTypes.werewolf.ToString(),
            Willpower = new ResourceTrack(character.Willpower),
            CombatStats = new CombatStats(character.Soak, character.Initiative, character.Dodge),
            Rage = new ResourceTrack(character.Rage),
            Gnosis = new ResourceTrack(character.Gnosis),
            Breed = character.Breed,
            Auspice = character.Auspice,
            Tribe = character.Tribe,
            Gifts = character.Gifts,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };


        await _context.Characters.InsertOneAsync(newChar);


        return newChar;
    }

    public async Task<Character?> CreateMortalAsync(CharacterCreateDto character, string userId)
    {
        var sessionId = character.SessionId;
        var session = await _context.Sessions.Find(s => s.Id == sessionId).FirstOrDefaultAsync();
        if(session is null)
            return null;

        if(!_userContext.InSessionOnly(session))
            return null;

        var newChar = new Character
        {
            UserId = userId,
            SessionId = sessionId,
            Name = character.Name,
            Category = character.Category,
            Health = new HealthTrack(),
            Willpower = new ResourceTrack(character.Willpower),
            CombatStats = new CombatStats(),
            //CharacterType = CharacterTypes.mortal.ToString(),
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };

        await _context.Characters.InsertOneAsync(newChar);

        return newChar;
    }

    public async Task<Character?> CreateFomorAsync(FomorCharacterCreateDto character, string userId)
    {
        var sessionId = character.SessionId;
        var session = await _context.Sessions.Find(s => s.Id == sessionId).FirstOrDefaultAsync();
        if(session is null)
            return null;

        if(!_userContext.InSessionOnly(session))
            return null;

        var newChar = new FomorCharacter
        {
            UserId = userId,
            SessionId = sessionId,
            Name = character.Name,
            Category = character.Category,
            Health = new HealthTrack(),
            Willpower = new ResourceTrack(character.Willpower),
            //CharacterType = CharacterTypes.fomor.ToString(),
            CombatStats = new CombatStats(),
            Bane = character.Bane,
            Powers = character.Powers,
            Corruption = character.Corruption,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };

        await _context.Characters.InsertOneAsync(newChar);

        return newChar;
    }

    public async Task<Character?> CreateVampireAsync(VampireCharacterCreateDto character, string userId)
    {
        var sessionId = character.SessionId;
        var session = await _context.Sessions.Find(s => s.Id == sessionId).FirstOrDefaultAsync();
        if(session is null)
            return null;

        if(!_userContext.InSessionOnly(session))
            return null;

        var newChar = new VampireCharacter
        {
            UserId = userId,
            SessionId = sessionId,
            Name = character.Name,
            Category = character.Category,
            Health = new HealthTrack(),
            Willpower = new ResourceTrack(character.Willpower),
            //CharacterType = CharacterTypes.vampire.ToString(),
            CombatStats = new CombatStats(),
            BloodPool = new ResourceTrack(character.BloodPool),
            Powers = character.Powers,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };

        await _context.Characters.InsertOneAsync(newChar);

        return newChar;
    }

    public async Task<bool> UpdateAsync(string id, Character character)
    {
        if(!_userContext.SelfOrAdminOnly(character.UserId))
            return false;

        character.Id = id;
        character.UpdatedAt = DateTime.UtcNow;

        var result = await _context.Characters.ReplaceOneAsync(c => c.Id == id, character);
        return result.ModifiedCount > 0;
    }

    public async Task<Character?> ApplyDamageAsync(string id, DamageType type, int amount)
    {
        var character = await GetAsync(id);
        if(character is null)
            return null;

        if(!_userContext.SelfOrAdminOnly(character.UserId))
            return null;
            
        if(character.Health.IsDead)
            return character;

        character.Health.ApplyDamage(type, amount);
        character.UpdatedAt = DateTime.UtcNow;

        var result = await _context.Characters.ReplaceOneAsync(c => c.Id == id, character);
        return character;
    }

    public async Task<Character?> HealDamageAsync(string id, DamageType type, int amount)
    {
        var character = await GetAsync(id);
        if(character is null)
            return null;

        if(!_userContext.SelfOrAdminOnly(character.UserId))
            return null;

        character.Health.Heal(type, amount);
        character.UpdatedAt = DateTime.UtcNow;

        var result = await _context.Characters.ReplaceOneAsync(c => c.Id == id, character);
        return character;
    }

    public async Task<int> DeleteAsync(string id){
        var character = await GetAsync(id);
        if(character == null)
            return -1;
        
        if(!_userContext.SelfOrAdminOnly(character.UserId))
            return -2;
        
        var result = await _context.Characters.DeleteOneAsync(c => c.Id == id);
        return (int) result.DeletedCount;
    }

    public async Task<int> DeleteBySessionIdAsync(string sessionId){
        var session = await _context.Sessions.Find(s => s.Id == sessionId).FirstOrDefaultAsync();
        if(session is null)
            return -1;

        if(!_userContext.SelfOrAdminOnly(session.UserId))
            return -2;

        var result = await _context.Characters.DeleteManyAsync(c => c.SessionId == sessionId);
        return (int) result.DeletedCount;
    }
}