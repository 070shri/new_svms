using Microsoft.Extensions.Options;
using MongoDB.Driver;
using SVMS.Api.Models;

namespace SVMS.Api.Services
{
    public class VisitorService
    {
        private readonly IMongoCollection<Visitor> _visitorsCollection;
        private readonly NotificationService _notificationService;

        public VisitorService(
            IOptions<MongoDbSettings> mongoDbSettings,
            NotificationService notificationService)
        {
            var mongoClient = new MongoClient(mongoDbSettings.Value.ConnectionString);
            var mongoDatabase = mongoClient.GetDatabase(mongoDbSettings.Value.DatabaseName);
            _visitorsCollection = mongoDatabase.GetCollection<Visitor>("Visitor");
            _notificationService = notificationService;
        }

        public async Task<List<Visitor>> GetAsync() =>
            await _visitorsCollection.Find(_ => true).ToListAsync();

        public async Task<Visitor?> GetByIdAsync(string id) =>
            await _visitorsCollection.Find(v => v.Id == id).FirstOrDefaultAsync();

        public async Task CreateAsync(Visitor newVisitor)
        {
            await _visitorsCollection.InsertOneAsync(newVisitor);

            // Notify the host employee — one notification per visitor, no duplicates
            if (newVisitor.Status == "Pending Approval" && !string.IsNullOrEmpty(newVisitor.HostEmail))
            {
                await _notificationService.CreateIfNotExistsAsync(new Notification
                {
                    TargetEmail  = newVisitor.HostEmail,
                    TargetRole   = "",
                    Message      = $"{newVisitor.FullName} from {newVisitor.Company} wants to meet you on {newVisitor.Date} at {newVisitor.Time}. Please approve or reject.",
                    VisitorId    = newVisitor.Id ?? "",
                    VisitorName  = newVisitor.FullName,
                    Type         = "pending_approval",
                    IsRead       = false,
                    CreatedAt    = DateTime.UtcNow
                });
            }
        }

        public async Task<List<Visitor>> GetByHostEmailAsync(string email) =>
            await _visitorsCollection.Find(x => x.HostEmail == email).ToListAsync();

        // Update status — uses CreateIfNotExistsAsync so Security never gets
        // the same approved/rejected notification twice for the same visitor
        public async Task UpdateStatusAsync(string id, string status, string actionBy = "")
        {
            var visitor = await GetByIdAsync(id);
            if (visitor == null) return;

            var filter = Builders<Visitor>.Filter.Eq(v => v.Id, id);
            var update = Builders<Visitor>.Update
                .Set(v => v.Status, status)
                .Set(v => v.ActionBy, actionBy);

            await _visitorsCollection.UpdateOneAsync(filter, update);

            if (status == "Approved")
            {
                await _notificationService.CreateIfNotExistsAsync(new Notification
                {
                    TargetEmail  = "",
                    TargetRole   = "Security",
                    Message      = $"Visitor {visitor.FullName} has been APPROVED by {actionBy}. You may now check them in.",
                    VisitorId    = id,
                    VisitorName  = visitor.FullName,
                    Type         = "approved",
                    IsRead       = false,
                    CreatedAt    = DateTime.UtcNow
                });
            }
            else if (status == "Rejected")
            {
                await _notificationService.CreateIfNotExistsAsync(new Notification
                {
                    TargetEmail  = "",
                    TargetRole   = "Security",
                    Message      = $"Visitor {visitor.FullName} has been REJECTED by {actionBy}.",
                    VisitorId    = id,
                    VisitorName  = visitor.FullName,
                    Type         = "rejected",
                    IsRead       = false,
                    CreatedAt    = DateTime.UtcNow
                });
            }
        }

        // Security checks visitor IN — only if status is "Approved"
        public async Task<bool> CheckInAsync(string id)
        {
            var visitor = await GetByIdAsync(id);
            if (visitor == null || visitor.Status != "Approved") return false;

            var filter = Builders<Visitor>.Filter.Eq(v => v.Id, id);
            var update = Builders<Visitor>.Update
                .Set(v => v.Status, "Checked In")
                .Set(v => v.CheckedInAt, DateTime.UtcNow);

            await _visitorsCollection.UpdateOneAsync(filter, update);
            return true;
        }

        // Security checks visitor OUT — only if status is "Checked In"
        public async Task<bool> CheckOutAsync(string id)
        {
            var visitor = await GetByIdAsync(id);
            if (visitor == null || visitor.Status != "Checked In") return false;

            var filter = Builders<Visitor>.Filter.Eq(v => v.Id, id);
            var update = Builders<Visitor>.Update
                .Set(v => v.Status, "Checked Out")
                .Set(v => v.CheckedOutAt, DateTime.UtcNow);

            await _visitorsCollection.UpdateOneAsync(filter, update);
            return true;
        }

        public async Task<object> GetDashboardStatsAsync()
        {
            var total     = await _visitorsCollection.CountDocumentsAsync(_ => true);
            var pending   = await _visitorsCollection.CountDocumentsAsync(v => v.Status == "Pending Approval");
            var approved  = await _visitorsCollection.CountDocumentsAsync(v => v.Status == "Approved");
            var checkedIn = await _visitorsCollection.CountDocumentsAsync(v => v.Status == "Checked In");
            var rejected  = await _visitorsCollection.CountDocumentsAsync(v => v.Status == "Rejected");
            return new { total, pending, approved, checkedIn, rejected };
        }
    }
}