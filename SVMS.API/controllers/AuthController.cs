using Microsoft.AspNetCore.Mvc;
using SVMS.Api.Models;
using SVMS.Api.Services;

namespace SVMS.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AuthService _authService;

        public AuthController(AuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("login")]
        public IActionResult Login([FromBody] LoginRequest request)
        {
            var user = _authService.Authenticate(request.Email, request.Password, request.Role);

            if (user == null)
                return Unauthorized(new { message = "Invalid email or password." });

            return Ok(new {
                fullName = user.FullName,
                role = user.Role,
                email = user.Email
            });
        }

        [HttpGet("employees")]
        public async Task<IActionResult> GetEmployees()
        {
            var users = await _authService.GetAllUsersAsync();
            var employees = users
                .Where(u => u.Role == "Employee")
                .Select(u => new { u.FullName, u.Email });
            return Ok(employees);
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] User user)
        {
            await _authService.CreateUserAsync(user);
            return Ok(new { message = "User registered successfully" });
        }
    }

    public class LoginRequest
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
    }
}