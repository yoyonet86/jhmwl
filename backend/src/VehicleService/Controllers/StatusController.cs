using Jhm.LogisticsSafetyPlatform.Shared.Contracts;
using Jhm.LogisticsSafetyPlatform.Shared.ServiceDefaults;
using Microsoft.AspNetCore.Mvc;

namespace Jhm.LogisticsSafetyPlatform.VehicleService.Controllers;

[ApiController]
[Route("api/v1/status")]
public sealed class StatusController : ControllerBase
{
    private readonly IWebHostEnvironment _environment;

    public StatusController(IWebHostEnvironment environment)
    {
        _environment = environment;
    }

    [HttpGet]
    public ActionResult<ServiceStatusResponse> Get()
    {
        return Ok(new ServiceStatusResponse(
            Service: "VehicleService",
            Status: "ok",
            Environment: _environment.EnvironmentName,
            Version: ServiceDefaultsExtensions.GetAssemblyVersion(),
            UtcTime: DateTimeOffset.UtcNow));
    }
}
