using Jhm.LogisticsSafetyPlatform.Shared.ServiceDefaults;

var builder = WebApplication.CreateBuilder(args);

builder.AddServiceDefaults("AuthService");
builder.Services.AddControllers();

var app = builder.Build();

app.MapServiceDefaults();
app.MapControllers();

app.MapGet("/", () => Results.Ok(new { service = "AuthService", status = "ok" }));

app.Run();
