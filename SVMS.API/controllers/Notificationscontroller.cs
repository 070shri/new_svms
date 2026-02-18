using Microsoft.AspNetCore.Mvc;
using SVMS.Api.Models;
using SVMS.Api.Services;

namespace SVMS.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class NotificationsController : ControllerBase
    {
        private readonly NotificationService _notificationService;

        public NotificationsController(NotificationService notificationService)
        {
            _notificationService = notificationService;
        }

        // GET /api/notifications?email=x@x.com&role=Employee
        [HttpGet]
        public async Task<IActionResult> GetForUser([FromQuery] string email, [FromQuery] string role)
        {
            if (string.IsNullOrEmpty(email) || string.IsNullOrEmpty(role))
                return BadRequest(new { message = "email and role query params are required." });

            var notifications = await _notificationService.GetForUserAsync(email, role);
            return Ok(notifications);
        }

        // GET /api/notifications/unread-count?email=x@x.com&role=Security
        [HttpGet("unread-count")]
        public async Task<IActionResult> GetUnreadCount([FromQuery] string email, [FromQuery] string role)
        {
            if (string.IsNullOrEmpty(email) || string.IsNullOrEmpty(role))
                return BadRequest(new { message = "email and role query params are required." });

            var count = await _notificationService.GetUnreadCountAsync(email, role);
            return Ok(new { count });
        }

        // PATCH /api/notifications/{id}/read
        [HttpPatch("{id}/read")]
        public async Task<IActionResult> MarkAsRead(string id)
        {
            await _notificationService.MarkAsReadAsync(id);
            return Ok(new { message = "Notification marked as read." });
        }

        // PATCH /api/notifications/mark-all-read?email=x@x.com&role=Employee
        [HttpPatch("mark-all-read")]
        public async Task<IActionResult> MarkAllAsRead([FromQuery] string email, [FromQuery] string role)
        {
            if (string.IsNullOrEmpty(email) || string.IsNullOrEmpty(role))
                return BadRequest(new { message = "email and role query params are required." });

            await _notificationService.MarkAllAsReadAsync(email, role);
            return Ok(new { message = "All notifications marked as read." });
        }

        // DELETE /api/notifications/{id}
        // Called after employee approves or rejects — permanently removes the notification
        // so it never comes back on re-fetch/poll
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            await _notificationService.DeleteAsync(id);
            return Ok(new { message = "Notification deleted." });
        }

        // POST /api/notifications (internal/testing only)
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Notification notification)
        {
            notification.CreatedAt = DateTime.UtcNow;
            await _notificationService.CreateIfNotExistsAsync(notification);
            return Ok(new { message = "Notification created." });
        }
    }
}