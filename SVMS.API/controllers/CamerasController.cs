using Microsoft.AspNetCore.Mvc;
using System.Net.Http;
using System.Threading.Tasks;

namespace SVMS.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CamerasController : ControllerBase
    {
        private readonly HttpClient _httpClient;
        private const string AI_SERVICE_URL = "http://localhost:8000";

        public CamerasController(IHttpClientFactory httpClientFactory)
        {
            _httpClient = httpClientFactory.CreateClient();
        }

        [HttpPost("register")]
        public async Task<IActionResult> RegisterCamera([FromBody] object request)
        {
            try {
                var content = new StringContent(request.ToString() ?? "", System.Text.Encoding.UTF8, "application/json");
                var res = await _httpClient.PostAsync($"{AI_SERVICE_URL}/cameras/register", content);
                return Content(await res.Content.ReadAsStringAsync(), "application/json");
            } catch { return StatusCode(500, new { error = "AI offline" }); }
        }

        // ✅ Matches React's fetch call and routes to Python's /start
        [HttpPost("{cameraId}/start-processing")]
        public async Task<IActionResult> StartCamera(string cameraId)
        {
            try {
                var res = await _httpClient.PostAsync($"{AI_SERVICE_URL}/cameras/{cameraId}/start", null);
                return Content(await res.Content.ReadAsStringAsync(), "application/json");
            } catch { return StatusCode(500, new { error = "AI offline" }); }
        }

        // ✅ Matches React's fetch call and routes to Python's /stop
        [HttpPost("{cameraId}/stop-processing")]
        public async Task<IActionResult> StopCamera(string cameraId)
        {
            try {
                var res = await _httpClient.PostAsync($"{AI_SERVICE_URL}/cameras/{cameraId}/stop", null);
                return Content(await res.Content.ReadAsStringAsync(), "application/json");
            } catch { return StatusCode(500, new { error = "AI offline" }); }
        }

        [HttpGet("list")]
        public async Task<IActionResult> ListCameras()
        {
            try {
                var res = await _httpClient.GetAsync($"{AI_SERVICE_URL}/cameras");
                return Content(await res.Content.ReadAsStringAsync(), "application/json");
            } catch { return StatusCode(500, new { error = "AI offline" }); }
        }

        // ✅ Passes the exact success or error message from Python back to React
        [HttpDelete("{cameraId}")]
        public async Task<IActionResult> DeleteCamera(string cameraId)
        {
            try {
                var res = await _httpClient.DeleteAsync($"{AI_SERVICE_URL}/cameras/{cameraId}");
                var content = await res.Content.ReadAsStringAsync();

                if (res.IsSuccessStatusCode) {
                    return Content(content, "application/json");
                } else {
                    return StatusCode((int)res.StatusCode, content);
                }
            } catch { return StatusCode(500, new { error = "AI offline or not reachable" }); }
        }

        // ✅ The bridge that tells Python to pop up the desktop drawing window
        [HttpPost("{cameraId}/launch-boundary-setup")]
        public async Task<IActionResult> LaunchBoundarySetup(string cameraId, [FromQuery] string source)
        {
            try {
                var res = await _httpClient.PostAsync($"{AI_SERVICE_URL}/cameras/{cameraId}/launch-boundary-setup?source={source}", null);
                return Content(await res.Content.ReadAsStringAsync(), "application/json");
            } catch { return StatusCode(500, new { error = "AI offline" }); }
        }
    }
}