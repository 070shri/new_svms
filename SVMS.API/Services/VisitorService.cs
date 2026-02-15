using Microsoft.Extensions.Options;
using MongoDB.Driver;
using SVMS.Api.Models;

namespace SVMS.Api.Services
{
    public class VisitorService
    {
        private readonly IMongoCollection<Visitor> _visitorsCollection;

        public VisitorService(IOptions<MongoDbSettings> mongoDbSettings)
        {
            var mongoClient = new MongoClient(mongoDbSettings.Value.ConnectionString);
            var mongoDatabase = mongoClient.GetDatabase(mongoDbSettings.Value.DatabaseName);
            _visitorsCollection = mongoDatabase.GetCollection<Visitor>("Visitor");
        }

        public async Task<List<Visitor>> GetAsync() =>
            await _visitorsCollection.Find(_ => true).ToListAsync();

        public async Task CreateAsync(Visitor newVisitor) =>
            await _visitorsCollection.InsertOneAsync(newVisitor);

        public async Task<List<Visitor>> GetByHostEmailAsync(string email) =>
            await _visitorsCollection.Find(x => x.HostEmail == email).ToListAsync();

        public async Task UpdateStatusAsync(string id, string status)
        {
            var filter = Builders<Visitor>.Filter.Eq(v => v.Id, id);
            var update = Builders<Visitor>.Update.Set(v => v.Status, status);
            await _visitorsCollection.UpdateOneAsync(filter, update);
        }

        public async Task<object> GetDashboardStatsAsync()
        {
            var total = await _visitorsCollection.CountDocumentsAsync(_ => true);
            var pending = await _visitorsCollection.CountDocumentsAsync(v => v.Status == "Pending Approval");
            var approved = await _visitorsCollection.CountDocumentsAsync(v => v.Status == "Approved");
            return new { total, pending, approved };
        }
    }
}