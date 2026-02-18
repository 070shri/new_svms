using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace SVMS.Api.Models
{
    [BsonIgnoreExtraElements]
    public class Visitor
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        [BsonElement("fullName")]
        public string FullName { get; set; } = string.Empty;

        [BsonElement("email")]
        public string Email { get; set; } = string.Empty;

        [BsonElement("phone")]
        public string Phone { get; set; } = string.Empty;

        [BsonElement("company")]
        public string Company { get; set; } = string.Empty;

        [BsonElement("purpose")]
        public string Purpose { get; set; } = string.Empty;

        [BsonElement("host")]
        public string Host { get; set; } = string.Empty;

        [BsonElement("hostEmail")]
        public string HostEmail { get; set; } = string.Empty;

        [BsonElement("date")]
        public string Date { get; set; } = string.Empty;

        [BsonElement("time")]
        public string Time { get; set; } = string.Empty;

        [BsonElement("idType")]
        public string IdType { get; set; } = string.Empty;

        [BsonElement("idNumber")]
        public string IdNumber { get; set; } = string.Empty;

        [BsonElement("photo")]
        public string? Photo { get; set; }

        // "Pending Approval" | "Approved" | "Rejected" | "Checked In" | "Checked Out"
        [BsonElement("status")]
        public string Status { get; set; } = "Pending Approval";

        [BsonElement("registeredBy")]
        public string RegisteredBy { get; set; } = string.Empty;

        [BsonElement("createdAt")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // NEW: Check-in / Check-out tracking
        [BsonElement("checkedInAt")]
        public DateTime? CheckedInAt { get; set; }

        [BsonElement("checkedOutAt")]
        public DateTime? CheckedOutAt { get; set; }

        // Who performed the approval/rejection (Admin or Employee email)
        [BsonElement("actionBy")]
        public string? ActionBy { get; set; }
    }
}


