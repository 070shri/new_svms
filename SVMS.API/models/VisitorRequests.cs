using Microsoft.AspNetCore.Http; // Required for IFormFile

namespace SVMS.Api.Models
{
    // ==========================================
    // HTTP REQUEST MODELS (DTOs)
    // ==========================================

    public class StatusUpdateRequest
    {
        public string? Status { get; set; }
        public string? ActionBy { get; set; }
    }

    public class VisitorRegistrationRequest
    {
        public string? FullName { get; set; }
        public string? Email { get; set; }
        public string? Phone { get; set; }
        public string? Company { get; set; }
        public string? Purpose { get; set; }
        public string? Host { get; set; }
        public string? HostEmail { get; set; }
        public string? Date { get; set; }
        public string? Time { get; set; }
        public string? IdType { get; set; }
        public string? IdNumber { get; set; }
        public string? RegisteredBy { get; set; }
        
        // IFormFile is used here so the API can accept the uploaded image file
        public IFormFile? Photo { get; set; }
    }
}