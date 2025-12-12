using Jhm.LogisticsSafetyPlatform.Shared.ServiceDefaults;

var builder = WebApplication.CreateBuilder(args);

builder.AddServiceDefaults("Gateway");

builder.Services.AddControllers();
builder.Services
    .AddReverseProxy()
    .LoadFromConfig(builder.Configuration.GetSection("ReverseProxy"));

var app = builder.Build();

app.MapServiceDefaults();
app.MapControllers();
app.MapReverseProxy();

app.MapGet("/", () => Results.Ok(new { service = "Gateway", status = "ok" }));

app.Run();
