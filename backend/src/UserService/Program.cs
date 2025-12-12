using Jhm.LogisticsSafetyPlatform.Shared.ServiceDefaults;

var builder = WebApplication.CreateBuilder(args);

builder.AddServiceDefaults("UserService");
builder.Services.AddControllers();

var app = builder.Build();

app.MapServiceDefaults();
app.MapControllers();

app.MapGet("/", () => Results.Ok(new { service = "UserService", status = "ok" }));

app.Run();
