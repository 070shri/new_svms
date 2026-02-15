using Microsoft.Extensions.Options;
using MongoDB.Driver;
using SVMS.Api.Models;

namespace SVMS.Api.Services
{
    public class AuthService
    {
        private readonly IMongoCollection<User> _usersCollection;

        public AuthService(IOptions<MongoDbSettings> mongoDbSettings)
        {
            var mongoClient = new MongoClient(mongoDbSettings.Value.ConnectionString);
            var mongoDatabase = mongoClient.GetDatabase(mongoDbSettings.Value.DatabaseName);
            _usersCollection = mongoDatabase.GetCollection<User>("User");
        }

        public User? Authenticate(string email, string password, string role)
        {
            return _usersCollection.Find(u =>
                u.Email == email &&
                u.Password == password
            ).FirstOrDefault();
        }

        public async Task<List<User>> GetAllUsersAsync()
        {
            return await _usersCollection.Find(_ => true).ToListAsync();
        }

        public async Task CreateUserAsync(User user)
        {
            await _usersCollection.InsertOneAsync(user);
        }
    }
}