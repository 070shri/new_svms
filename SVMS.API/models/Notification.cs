using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace SVMS.Api.Models
{
    [BsonIgnoreExtraElements]
    public class Notification
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        // Who this notification is FOR (employee email, or "Security" for all security users)
        [BsonElement("targetEmail")]
        public string TargetEmail { get; set; } = string.Empty;

        // Role-based broadcast: "Security", "Employee", or specific email
        [BsonElement("targetRole")]
        public string TargetRole { get; set; } = string.Empty;

        [BsonElement("message")]
        public string Message { get; set; } = string.Empty;

        [BsonElement("visitorId")]
        public string VisitorId { get; set; } = string.Empty;

        [BsonElement("visitorName")]
        public string VisitorName { get; set; } = string.Empty;

        // "pending_approval" | "approved" | "rejected" | "checked_in" | "checked_out"
        [BsonElement("type")]
        public string Type { get; set; } = string.Empty;

        [BsonElement("isRead")]
        public bool IsRead { get; set; } = false;

        [BsonElement("createdAt")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}