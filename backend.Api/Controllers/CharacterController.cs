using Backend.Api.Models;
using Backend.Api.Data;
using Backend.Api.Services;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Bson;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using System.IdentityModel.Tokens.Jwt;

namespace Backend.Api.Controllers;

public record DamageRequest(DamageType Type, int Amount);

[ApiController]
[Route("/api/[controller]")]
[Authorize]
public class CharacterController(CharacterService service) : ControllerBase
{
    private readonly CharacterService _service = service;

    [HttpGet("debug/{id}")]
    public async Task Debug(string id)
    {
        await _service.DebugCharacter(id);

        return;
    }

    [HttpGet]
    public async Task<ActionResult<List<Character>>> Get()
    {
        return await _service.GetAllAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Character>> Get(string id)
    {
        var character = await _service.GetAsync(id);

        if(character == null)
            return NotFound();

        return Ok(character);
    }

    [HttpGet("session/{id}")]
    public async Task<ActionResult<List<Character>>> GetFromSessionId(string id)
    {
        var characters = await _service.GetAllFromSessionIdAsync(id);

        if(characters == null)
            return NoContent();

        return Ok(characters);
    }

    [HttpPost("werewolf")]
    public async Task<IActionResult> CreateWerewolf(WerewolfCharacterCreateDto request)
    {
        Console.WriteLine(request);
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if(userId is null)
            return Unauthorized();

        var character = await _service.CreateWerewolfAsync(request, userId);
        if(character is null)
            return Unauthorized();


        Console.WriteLine(character.CombatStats.ToJson());

        return CreatedAtAction(nameof(Get), new { id = character.Id}, character);
    }

    [HttpPost("mortal")]
    public async Task<IActionResult> CreateMortal(CharacterCreateDto request)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if(userId is null)
            return Unauthorized();
        
        var character = await _service.CreateMortalAsync(request, userId);
        if(character is null)
            return Unauthorized();

        return CreatedAtAction(nameof(Get), new { id = character.Id }, character);
    }

    [HttpPost("fomor")]
    public async Task<IActionResult> CreateFomor(FomorCharacterCreateDto request)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if(userId is null)
            return Unauthorized();
        
        var character = await _service.CreateFomorAsync(request, userId);
        if(character is null)
            return Unauthorized();

        return CreatedAtAction(nameof(Get), new { id = character.Id }, character);
    }

    [HttpPost("vampire")]
    public async Task<IActionResult> CreateVampire(VampireCharacterCreateDto request)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if(userId is null)
            return Unauthorized();
        
        var character = await _service.CreateVampireAsync(request, userId);
        if(character is null)
            return Unauthorized();

        return CreatedAtAction(nameof(Get), new { id = character.Id }, character);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(string id, Character character)
    {
        var updated = await _service.UpdateAsync(id, character);

        if(!updated)
            return NotFound();

        return Ok();
    }

    [HttpPost("{id}/damage")]
    public async Task<ActionResult<Character>> ApplyDamage(string id, [FromBody] DamageRequest dr)
    {
        var character = await _service.ApplyDamageAsync(id, dr.Type, dr.Amount);
        if(character is null)
            return NotFound();

        return Ok(character);
    }

    [HttpPost("{id}/heal")]
    public async Task<ActionResult<Character>> Heal(string id, [FromBody] DamageRequest dr)
    {
        var character = await _service.HealDamageAsync(id, dr.Type, dr.Amount);
        if(character is null)
            return NotFound();

        return Ok(character);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(string id)
    {
        var deleted = await _service.DeleteAsync(id);

        if(deleted == -1)
            return NotFound();

        if(deleted == -2)
            return Unauthorized();
        
        return Ok();
    }

    [HttpDelete("session/{id}")]
    public async Task<IActionResult> DeleteAllBySessionId(string id)
    {
        var deleted = await _service.DeleteBySessionIdAsync(id);

        if(deleted == -1)
            return NotFound();

        if(deleted == -2)
            return Unauthorized();

        if(deleted == 0)
            return NoContent();
        
        return Ok();
    }
}