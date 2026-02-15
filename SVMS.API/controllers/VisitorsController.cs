using Microsoft.AspNetCore.Mvc;
using SVMS.Api.Models;
using SVMS.Api.Services;

namespace SVMS.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class VisitorsController : ControllerBase
    {
        private readonly VisitorService _visitorService;

        public VisitorsController(VisitorService visitorService)
        {
            _visitorService = visitorService;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] Visitor visitor)
        {
            if (visitor == null) return BadRequest("Visitor data is required.");
            
            // Set status based on who is registering
            visitor.Status = (visitor.RegisteredBy == "Admin") ? "Approved" : "Pending Approval";
            visitor.CreatedAt = DateTime.UtcNow;

            await _visitorService.CreateAsync(visitor);
            return Ok(new { message = "Registered successfully", status = visitor.Status });
        }

        [HttpGet("host/{email}")]
        public async Task<IActionResult> GetByHost(string email) =>
            Ok(await _visitorService.GetByHostEmailAsync(email));

        [HttpPatch("{id}/status")]
        public async Task<IActionResult> UpdateStatus(string id, [FromBody] StatusUpdateRequest update)
        {
            // FIX: This calls the service to update the "Pending" status in the DB
            await _visitorService.UpdateStatusAsync(id, update.Status);
            return Ok(new { message = "Status updated" });
        }

        [HttpGet]
        public async Task<ActionResult<List<Visitor>>> GetAll() => 
            Ok(await _visitorService.GetAsync());

        [HttpGet("stats")]
        public async Task<IActionResult> GetDashboardStats() => 
            Ok(await _visitorService.GetDashboardStatsAsync());
    }

    public class StatusUpdateRequest { public string Status { get; set; } = string.Empty; }
}