using Microsoft.Extensions.Options;
using MongoDB.Driver;
using SVMS.Api.Models;

namespace SVMS.Api.Services
{
    public class NotificationService
    {
        private readonly IMongoCollection<Notification> _notificationsCollection;

        public NotificationService(IOptions<MongoDbSettings> mongoDbSettings)
        {
            var mongoClient = new MongoClient(mongoDbSettings.Value.ConnectionString);
            var mongoDatabase = mongoClient.GetDatabase(mongoDbSettings.Value.DatabaseName);
            _notificationsCollection = mongoDatabase.GetCollection<Notification>("Notification");
        }

        // Get notifications for a user: personal email + role-based broadcast
        public async Task<List<Notification>> GetForUserAsync(string email, string role)
        {
            var filter = Builders<Notification>.Filter.Or(
                Builders<Notification>.Filter.Eq(n => n.TargetEmail, email),
                Builders<Notification>.Filter.Eq(n => n.TargetRole, role)
            );

            return await _notificationsCollection
                .Find(filter)
                .SortByDescending(n => n.CreatedAt)
                .ToListAsync();
        }

        // Count unread notifications for a user
        public async Task<long> GetUnreadCountAsync(string email, string role)
        {
            var filter = Builders<Notification>.Filter.And(
                Builders<Notification>.Filter.Eq(n => n.IsRead, false),
                Builders<Notification>.Filter.Or(
                    Builders<Notification>.Filter.Eq(n => n.TargetEmail, email),
                    Builders<Notification>.Filter.Eq(n => n.TargetRole, role)
                )
            );
            return await _notificationsCollection.CountDocumentsAsync(filter);
        }

        // KEY FIX: Create notification only if one doesn't already exist
        // for this visitorId + type + target combination.
        // Prevents duplicate security notifications on repeated status updates.
        public async Task CreateIfNotExistsAsync(Notification notification)
        {
            FilterDefinition<Notification> existingFilter;

            if (!string.IsNullOrEmpty(notification.TargetEmail))
            {
                existingFilter = Builders<Notification>.Filter.And(
                    Builders<Notification>.Filter.Eq(n => n.VisitorId, notification.VisitorId),
                    Builders<Notification>.Filter.Eq(n => n.Type, notification.Type),
                    Builders<Notification>.Filter.Eq(n => n.TargetEmail, notification.TargetEmail)
                );
            }
            else
            {
                existingFilter = Builders<Notification>.Filter.And(
                    Builders<Notification>.Filter.Eq(n => n.VisitorId, notification.VisitorId),
                    Builders<Notification>.Filter.Eq(n => n.Type, notification.Type),
                    Builders<Notification>.Filter.Eq(n => n.TargetRole, notification.TargetRole)
                );
            }

            var existing = await _notificationsCollection
                .Find(existingFilter)
                .FirstOrDefaultAsync();

            if (existing != null)
            {
                // Already exists — just refresh it as unread with updated message
                var update = Builders<Notification>.Update
                    .Set(n => n.Message, notification.Message)
                    .Set(n => n.IsRead, false)
                    .Set(n => n.CreatedAt, DateTime.UtcNow);
                await _notificationsCollection.UpdateOneAsync(existingFilter, update);
            }
            else
            {
                await _notificationsCollection.InsertOneAsync(notification);
            }
        }

        // Mark a single notification as read
        public async Task MarkAsReadAsync(string id)
        {
            var filter = Builders<Notification>.Filter.Eq(n => n.Id, id);
            var update = Builders<Notification>.Update.Set(n => n.IsRead, true);
            await _notificationsCollection.UpdateOneAsync(filter, update);
        }

        // Mark ALL notifications as read for a user
        public async Task MarkAllAsReadAsync(string email, string role)
        {
            var filter = Builders<Notification>.Filter.And(
                Builders<Notification>.Filter.Eq(n => n.IsRead, false),
                Builders<Notification>.Filter.Or(
                    Builders<Notification>.Filter.Eq(n => n.TargetEmail, email),
                    Builders<Notification>.Filter.Eq(n => n.TargetRole, role)
                )
            );
            var update = Builders<Notification>.Update.Set(n => n.IsRead, true);
            await _notificationsCollection.UpdateManyAsync(filter, update);
        }

        // Delete a notification by id — called after employee acts on it
        public async Task DeleteAsync(string id)
        {
            await _notificationsCollection.DeleteOneAsync(n => n.Id == id);
        }
    }
}