using System.Net.Mime;
using System.Reflection;
using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Diagnostics.HealthChecks;

namespace Jhm.LogisticsSafetyPlatform.Shared.ServiceDefaults;

public static class ServiceDefaultsExtensions
{
    public static WebApplicationBuilder AddServiceDefaults(
        this WebApplicationBuilder builder,
        string serviceName,
        bool addSwagger = true)
    {
        builder.Services.AddRouting(options => options.LowercaseUrls = true);

        builder.Services.ConfigureHttpJsonOptions(options =>
        {
            options.SerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
        });

        builder.Services.AddProblemDetails();

        var healthChecks = builder.Services
            .AddHealthChecks()
            .AddCheck("self", () => HealthCheckResult.Healthy());

        var mysqlConnectionString = builder.Configuration.GetConnectionString("Default");
        if (!string.IsNullOrWhiteSpace(mysqlConnectionString))
        {
            healthChecks.AddMySql(mysqlConnectionString, name: "mysql");
        }

        if (addSwagger)
        {
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen(options =>
            {
                options.SwaggerDoc("v1", new() { Title = serviceName, Version = "v1" });
            });
        }

        return builder;
    }

    public static WebApplication MapServiceDefaults(this WebApplication app, bool useSwagger = true)
    {
        if (app.Environment.IsDevelopment() && useSwagger)
        {
            var swaggerProvider = app.Services.GetService<Swashbuckle.AspNetCore.Swagger.ISwaggerProvider>();
            if (swaggerProvider is not null)
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }
        }

        app.MapHealthChecks("/health", new HealthCheckOptions
        {
            ResponseWriter = WriteHealthResponse
        });

        return app;
    }

    public static string GetAssemblyVersion() =>
        Assembly.GetEntryAssembly()?.GetName().Version?.ToString() ?? "unknown";

    private static Task WriteHealthResponse(HttpContext context, HealthReport report)
    {
        context.Response.ContentType = MediaTypeNames.Application.Json;

        var payload = new
        {
            status = report.Status.ToString(),
            duration = report.TotalDuration,
            checks = report.Entries.Select(e => new
            {
                name = e.Key,
                status = e.Value.Status.ToString(),
                duration = e.Value.Duration,
                description = e.Value.Description
            })
        };

        return context.Response.WriteAsync(JsonSerializer.Serialize(payload));
    }
}
