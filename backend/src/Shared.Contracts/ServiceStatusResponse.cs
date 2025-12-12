namespace Jhm.LogisticsSafetyPlatform.Shared.Contracts;

public sealed record ServiceStatusResponse(
    string Service,
    string Status,
    string Environment,
    string Version,
    DateTimeOffset UtcTime);
