using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using DayhomeFlowApi.Data;
using DayhomeFlowApi.Dtos;
using DayhomeFlowApi.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.AspNetCore.RateLimiting;
namespace DayhomeFlowApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly DayhomeFlowContext _context;
    private readonly IConfiguration _configuration;

    public AuthController(DayhomeFlowContext context, IConfiguration configuration)
    {
        _context = context;
        _configuration = configuration;
    }


    [EnableRateLimiting("auth")]
    [HttpPost("register")]
    public async Task<ActionResult<AuthResponseDto>> Register(RegisterUserDto registerDto)
    {
        var emailExists = await _context.Users
            .AnyAsync(u => u.Email.ToLower() == registerDto.Email.ToLower());

        if (emailExists)
        {
            return BadRequest(new { message = "Email is already registered." });
        }

        var user = new User
        {
            Email = registerDto.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(registerDto.Password)
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        var profile = new ProviderProfile
        {
            UserId = user.Id,
            BusinessName = registerDto.BusinessName,
            ProviderName = registerDto.ProviderName,
            Email = registerDto.Email,
            Phone = registerDto.Phone
        };

        _context.ProviderProfiles.Add(profile);
        await _context.SaveChangesAsync();

        var token = GenerateJwtToken(user);

        return Ok(new AuthResponseDto
        {
            Token = token,
            Email = user.Email,
            BusinessName = profile.BusinessName,
            ProviderName = profile.ProviderName
        });
    }

    [EnableRateLimiting("auth")]
    [HttpPost("login")]
    public async Task<ActionResult<AuthResponseDto>> Login(LoginUserDto loginDto)
    {
        var user = await _context.Users
            .Include(u => u.ProviderProfile)
            .FirstOrDefaultAsync(u => u.Email.ToLower() == loginDto.Email.ToLower());

        if (user == null)
        {
            return Unauthorized(new { message = "Invalid email or password." });
        }

        var passwordIsValid = BCrypt.Net.BCrypt.Verify(loginDto.Password, user.PasswordHash);

        if (!passwordIsValid)
        {
            return Unauthorized(new { message = "Invalid email or password." });
        }

        var token = GenerateJwtToken(user);

        return Ok(new AuthResponseDto
        {
            Token = token,
            Email = user.Email,
            BusinessName = user.ProviderProfile?.BusinessName,
            ProviderName = user.ProviderProfile?.ProviderName
        });
    }

    private string GenerateJwtToken(User user)
    {
        var jwtKey = _configuration["Jwt:Key"];
        var jwtIssuer = _configuration["Jwt:Issuer"];
        var jwtAudience = _configuration["Jwt:Audience"];

        if (string.IsNullOrWhiteSpace(jwtKey))
        {
            throw new InvalidOperationException("JWT key is missing.");
        }

        var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
        var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Email, user.Email)
        };

        var token = new JwtSecurityToken(
            issuer: jwtIssuer,
            audience: jwtAudience,
            claims: claims,
            expires: DateTime.UtcNow.AddHours(2),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}