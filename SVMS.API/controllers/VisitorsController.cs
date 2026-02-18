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
        // Used by Security (status = Pending Approval) and Admin (status = Approved)
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
        // Admin & Security see all visitors
        [HttpGet]
        public async Task<ActionResult<List<Visitor>>> GetAll() =>
            Ok(await _visitorService.GetAsync());

        // GET /api/visitors/host/{email}
        // Employee sees only their own visitors
        [HttpGet("host/{email}")]
        public async Task<IActionResult> GetByHost(string email) =>
            Ok(await _visitorService.GetByHostEmailAsync(email));

        // GET /api/visitors/stats
        [HttpGet("stats")]
        public async Task<IActionResult> GetDashboardStats() =>
            Ok(await _visitorService.GetDashboardStatsAsync());

        // PATCH /api/visitors/{id}/status
        // Used by Employee (approve/reject their own visitor)
        // Used by Admin (approve/reject any visitor)
        // Body: { "status": "Approved", "actionBy": "employee@email.com" }
        [HttpPatch("{id}/status")]
        public async Task<IActionResult> UpdateStatus(string id, [FromBody] StatusUpdateRequest update)
        {
            var allowedStatuses = new[] { "Approved", "Rejected" };
            if (!allowedStatuses.Contains(update.Status))
                return BadRequest(new { message = "Status must be 'Approved' or 'Rejected'." });

            await _visitorService.UpdateStatusAsync(id, update.Status, update.ActionBy);
            return Ok(new { message = $"Visitor status updated to {update.Status}." });
        }

        // PATCH /api/visitors/{id}/checkin
        // Security ONLY — check in an approved visitor
        [HttpPatch("{id}/checkin")]
        public async Task<IActionResult> CheckIn(string id)
        {
            var success = await _visitorService.CheckInAsync(id);
            if (!success)
                return BadRequest(new { message = "Visitor must be in 'Approved' status to check in." });

            return Ok(new { message = "Visitor checked in successfully." });
        }

        // PATCH /api/visitors/{id}/checkout
        // Security ONLY — check out a checked-in visitor
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

        // The email of whoever performed this action (employee email or "Admin")
        public string ActionBy { get; set; } = string.Empty;
    }
}