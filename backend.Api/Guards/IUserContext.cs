

using System.Security.Claims;
using Backend.Api.Models;

namespace Backend.Api.Guards;

public class IUserContext(IHttpContextAccessor accessor)
{
    private readonly IHttpContextAccessor _accessor = accessor;
    
    public bool SelfOrAdminOnly(string registeredOwnerId)
    {
        var userId = _accessor.HttpContext!.User.FindFirstValue(ClaimTypes.NameIdentifier);
        if(userId is null)
            return false;

        string userRole = _accessor.HttpContext!.User.FindFirstValue(ClaimTypes.Role)!; 
        Console.WriteLine("Accessed by " + userRole);
        if(userId != registeredOwnerId && userRole != Role.Admin.ToString())
            return false;
        
        return true;
    }

    public string UserId() =>
        _accessor.HttpContext!.User.FindFirstValue(ClaimTypes.NameIdentifier)!;

    public string UserRole() =>
        _accessor.HttpContext!.User.FindFirstValue(ClaimTypes.Role)!; 
    
    public bool InSessionOnly(Session session)
    {
        if(UserRole() == Role.Admin.ToString())
            return true;
        
        string senderId = UserId();

        List<string> allowed = session.AllowedUserIds;
        allowed.Add(session.UserId);

        if(allowed.Find(x => x == senderId) is null)
            return false;

        return true;
    }
}