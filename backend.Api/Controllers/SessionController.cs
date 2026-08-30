using System.Runtime.CompilerServices;
using Backend.Api.Models;
using Backend.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;

namespace Backend.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class SessionController(SessionService service) : ControllerBase
{
    private readonly SessionService _service = service;

    [HttpGet]
    public async Task<ActionResult<List<Session>>> GetAll()
    {
        var sessions = await _service.GetAllAsync();

        return Ok(sessions);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Session>> Get(string id)
    {
        var session = await _service.GetAsync(id);
        if(session is null)
            return NotFound();

        return Ok(session);
    }

    [HttpPost]
    public async Task<ActionResult<Session?>> Create(SessionRequestDto request)
    {
        var session = await _service.CreateAsync(request);
        if(session is null)
            return Unauthorized();

        return CreatedAtAction(nameof(Get), new { id = session.Id }, session);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<Session?>> Update(string id, SessionRequestDto session)
    {
        var updatedSession = await _service.UpdateAsync(id, session);
        if(updatedSession is null)
            return Unauthorized();

        return Ok(updatedSession);
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(string id)
    {
        var deleted = await _service.DeleteAsync(id);
        if(deleted == -1)
            return NotFound();
        
        if(deleted == -2)
            return Unauthorized();

        return Ok(); 
    }
}