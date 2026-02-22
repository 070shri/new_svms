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

        // POST /api/visitors/register
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] Visitor visitor)
        {
            if (visitor == null) return BadRequest("Visitor data is required.");

            visitor.Status = (visitor.RegisteredBy == "Admin") ? "Approved" : "Pending Approval";
            visitor.CreatedAt = DateTime.UtcNow;

            await _visitorService.CreateAsync(visitor);
            return Ok(new { message = "Registered successfully", status = visitor.Status });
        }

        // GET /api/visitors
        [HttpGet]
        public async Task<ActionResult<List<Visitor>>> GetAll() =>
            Ok(await _visitorService.GetAsync());

        // GET /api/visitors/host/{email}
        [HttpGet("host/{email}")]
        public async Task<IActionResult> GetByHost(string email) =>
            Ok(await _visitorService.GetByHostEmailAsync(email));

        // GET /api/visitors/stats
        [HttpGet("stats")]
        public async Task<IActionResult> GetDashboardStats() =>
            Ok(await _visitorService.GetDashboardStatsAsync());

        // PATCH /api/visitors/{id}/status
        // SMART ROUTER: Handles generic status updates, plus Check-In/Check-Out redirects
        [HttpPatch("{id}/status")]
        public async Task<IActionResult> UpdateStatus(string id, [FromBody] StatusUpdateRequest update)
        {
            if (update == null || string.IsNullOrEmpty(update.Status))
                return BadRequest(new { message = "Status is required." });

            // Automatically route to proper Check-In logic
            if (update.Status == "Checked In")
            {
                var success = await _visitorService.CheckInAsync(id);
                return success ? Ok(new { message = "Visitor checked in successfully." }) 
                               : BadRequest(new { message = "Visitor must be approved to check in." });
            }

            // Automatically route to proper Check-Out logic
            if (update.Status == "Checked Out")
            {
                var success = await _visitorService.CheckOutAsync(id);
                return success ? Ok(new { message = "Visitor checked out successfully." }) 
                               : BadRequest(new { message = "Visitor must be checked in to check out." });
            }

            // Standard Approval/Rejection logic
            var allowedStatuses = new[] { "Approved", "Rejected", "Pending Approval" };
            if (!allowedStatuses.Contains(update.Status))
                return BadRequest(new { message = "Invalid status update." });

            await _visitorService.UpdateStatusAsync(id, update.Status, update.ActionBy);
            return Ok(new { message = $"Visitor status updated to {update.Status}." });
        }

        // PATCH /api/visitors/{id}/checkin
        // Dedicated endpoint
        [HttpPatch("{id}/checkin")]
        public async Task<IActionResult> CheckIn(string id)
        {
            var success = await _visitorService.CheckInAsync(id);
            if (!success)
                return BadRequest(new { message = "Visitor must be in 'Approved' status to check in." });

            return Ok(new { message = "Visitor checked in successfully." });
        }

        // PATCH /api/visitors/{id}/checkout
        // Dedicated endpoint
        [HttpPatch("{id}/checkout")]
        public async Task<IActionResult> CheckOut(string id)
        {
            var success = await _visitorService.CheckOutAsync(id);
            if (!success)
                return BadRequest(new { message = "Visitor must be in 'Checked In' status to check out." });

            return Ok(new { message = "Visitor checked out successfully." });
        }
    }

    public class StatusUpdateRequest
    {
        public string Status { get; set; } = string.Empty;
        public string ActionBy { get; set; } = string.Empty;
    }
}