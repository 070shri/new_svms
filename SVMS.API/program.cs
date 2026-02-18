using Swagger = Microsoft.OpenApi.Models;
using SVMS.Api.Services;
using System.Text.Json;

var builder = WebApplication.CreateBuilder(args);

// Controllers with JSON formatting fix
builder.Services.AddControllers()
    .AddJsonOptions(options => {
        options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
    });

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new Swagger.OpenApiInfo { Title = "SVMS API", Version = "v1" });
});

builder.Services.Configure<SVMS.Api.Models.MongoDbSettings>(
    builder.Configuration.GetSection("MongoDbSettings"));

// REGISTER SERVICES
// NOTE: NotificationService must be registered BEFORE VisitorService
// because VisitorService depends on NotificationService
builder.Services.AddSingleton<NotificationService>();
builder.Services.AddSingleton<VisitorService>();
builder.Services.AddSingleton<AuthService>();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:3000", "http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowFrontend");
app.UseAuthorization();
app.MapControllers();
app.MapGet("/", () => "SVMS Backend is Running!");

app.Run();