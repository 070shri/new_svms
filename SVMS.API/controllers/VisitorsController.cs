using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.IO;
using System.Net.Http;
using System.Threading.Tasks;
using System.Linq;
using System.Collections.Generic;
using SVMS.Api.Models;    
using SVMS.Api.Services;  

namespace SVMS.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class VisitorsController : ControllerBase
    {
        private readonly VisitorService _visitorService;
        private readonly HttpClient _httpClient;
        private const string AI_SERVICE_URL = "http://localhost:8000";

        public VisitorsController(VisitorService visitorService, IHttpClientFactory httpClientFactory)
        {
            _visitorService = visitorService;
            _httpClient = httpClientFactory.CreateClient();
            _httpClient.Timeout = TimeSpan.FromSeconds(30);
        }

        // ── HYBRID REGISTRATION (Saves to MongoDB + Enrolls in AI) ──
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromForm] VisitorRegistrationRequest request)
        {
            try
            {
                if (request.Photo == null || request.Photo.Length == 0)
                    return BadRequest(new { error = "Photo is required for AI Enrollment." });

                string base64Photo;
                using (var ms = new MemoryStream())
                {
                    await request.Photo.CopyToAsync(ms);
                    base64Photo = $"data:{request.Photo.ContentType};base64,{Convert.ToBase64String(ms.ToArray())}";
                }

                var newVisitor = new Visitor
                {
                    FullName = request.FullName,
                    Email = request.Email,
                    Phone = request.Phone,
                    Company = request.Company,
                    Purpose = request.Purpose,
                    Host = request.Host,
                    HostEmail = request.HostEmail,
                    Date = request.Date,
                    Time = request.Time,
                    IdType = request.IdType,
                    IdNumber = request.IdNumber,
                    RegisteredBy = request.RegisteredBy,
                    Photo = base64Photo, 
                    Status = (request.RegisteredBy == "Admin") ? "Approved" : "Pending Approval",
                    CreatedAt = DateTime.UtcNow
                };

                await _visitorService.CreateAsync(newVisitor);

                var aiSuccess = await EnrollFaceInAI(newVisitor.Id, request.FullName, request.Photo);

                if (!aiSuccess) 
                {
                    Console.WriteLine("Warning: Saved to MongoDB, but AI enrollment failed.");
                }

                return Ok(new { 
                    success = true, 
                    message = "Registered successfully", 
                    status = newVisitor.Status,
                    visitorId = newVisitor.Id 
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Internal server error", details = ex.Message });
            }
        }

        private async Task<bool> EnrollFaceInAI(string visitorId, string fullName, IFormFile photo)
        {
            try
            {
                using var content = new MultipartFormDataContent();
                
                content.Add(new StringContent(visitorId ?? ""), "visitor_id");
                content.Add(new StringContent(fullName ?? ""), "name");
                content.Add(new StringContent("visitor"), "category");

                using var photoStream = photo.OpenReadStream();
                using var photoContent = new StreamContent(photoStream);
                photoContent.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue(photo.ContentType);
                content.Add(photoContent, "file", photo.FileName);

                var response = await _httpClient.PostAsync($"{AI_SERVICE_URL}/enroll", content);
                return response.IsSuccessStatusCode;
            }
            catch { return false; }
        }

        // ── CORE VMS ENDPOINTS ──
        [HttpGet]
        public async Task<ActionResult<List<Visitor>>> GetAll() => Ok(await _visitorService.GetAsync());

        [HttpGet("host/{email}")]
        public async Task<IActionResult> GetByHost(string email) => Ok(await _visitorService.GetByHostEmailAsync(email));

        [HttpPatch("{id}/status")]
        public async Task<IActionResult> UpdateStatus(string id, [FromBody] StatusUpdateRequest update)
        {
            if (update == null || string.IsNullOrEmpty(update.Status)) return BadRequest(new { message = "Status is required." });

            if (update.Status == "Checked In") return await _visitorService.CheckInAsync(id) ? Ok(new { message = "Checked in." }) : BadRequest();
            if (update.Status == "Checked Out") return await _visitorService.CheckOutAsync(id) ? Ok(new { message = "Checked out." }) : BadRequest();

            var allowedStatuses = new[] { "Approved", "Rejected", "Pending Approval" };
            if (!allowedStatuses.Contains(update.Status)) return BadRequest(new { message = "Invalid status." });

            await _visitorService.UpdateStatusAsync(id, update.Status, update.ActionBy);
            return Ok(new { message = $"Visitor status updated to {update.Status}." });
        }

        [HttpPatch("{id}/checkin")]
        public async Task<IActionResult> CheckIn(string id) => await _visitorService.CheckInAsync(id) ? Ok(new { message = "Checked in." }) : BadRequest();

        [HttpPatch("{id}/checkout")]
        public async Task<IActionResult> CheckOut(string id) => await _visitorService.CheckOutAsync(id) ? Ok(new { message = "Checked out." }) : BadRequest();

        [HttpGet("stats")]
        public async Task<IActionResult> GetDashboardStats() => Ok(await _visitorService.GetDashboardStatsAsync());

        // ── AI DASHBOARD ENDPOINTS ──
        [HttpGet("alerts")]
        public async Task<IActionResult> GetAlerts([FromQuery] int limit = 50)
        {
            try {
                var res = await _httpClient.GetAsync($"{AI_SERVICE_URL}/alerts?limit={limit}");
                return Content(await res.Content.ReadAsStringAsync(), "application/json");
            } catch { return StatusCode(500, new { error = "AI offline" }); }
        }

        [HttpGet("alerts/geofence")]
        public async Task<IActionResult> GetGeofenceAlerts([FromQuery] int limit = 50)
        {
            try {
                var res = await _httpClient.GetAsync($"{AI_SERVICE_URL}/alerts/geofence?limit={limit}");
                return Content(await res.Content.ReadAsStringAsync(), "application/json");
            } catch { return StatusCode(500, new { error = "AI offline" }); }
        }
    }
}