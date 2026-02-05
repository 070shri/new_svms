using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace SVMS.Api.Models
{
    public class Visitor
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        public string FullName { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string Purpose { get; set; } = null!;
        public string Host { get; set; } = null!;
        
        // Status: "Pre-Registered", "Pending", "Approved", "Checked In", etc.
        public string Status { get; set; } = "Pending"; 

        // Source: "Admin" or "Security"
        public string RegisteredBy { get; set; } = null!; 

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}