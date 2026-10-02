using System.Diagnostics;
using System.Text.RegularExpressions;
using NUnit.Framework;

namespace SpawnDev.SpawnJS.TangoADB.Tests;

/// <summary>
/// Starts the demo's Blazor WASM dev server once for the whole test run and discovers the URL it
/// listens on. WebUSB needs a secure context, but localhost/127.0.0.1 counts as secure, so plain
/// http on localhost is fine for the no-device checks the tests exercise.
/// </summary>
[SetUpFixture]
public class DemoServerFixture
{
    public static string BaseUrl { get; private set; } = "";
    Process? _process;

    [OneTimeSetUp]
    public async Task StartDemo()
    {
        // TANGOADB_TEST_URL points the tests at an already-running server instead - e.g. a static serve of a
        // TRIMMED publish, which `dotnet run` never produces (dotnet run does not trim).
        var external = Environment.GetEnvironmentVariable("TANGOADB_TEST_URL");
        if (!string.IsNullOrEmpty(external))
        {
            BaseUrl = external.TrimEnd('/');
            TestContext.Progress.WriteLine($"Using external server at {BaseUrl}");
            return;
        }
        // Test runs from <Tests>/bin/Release/net10.0 -> walk up to the repo root, then the Demo project.
        var demoDir = Path.GetFullPath(Path.Combine(
            TestContext.CurrentContext.TestDirectory, "..", "..", "..", "..",
            "SpawnDev.SpawnJS.TangoADB.Demo"));
        Assert.That(Directory.Exists(demoDir), $"Demo project not found at {demoDir}");

        _process = new Process
        {
            StartInfo = new ProcessStartInfo
            {
                FileName = "dotnet",
                Arguments = "run -c Release",
                WorkingDirectory = demoDir,
                UseShellExecute = false,
                RedirectStandardOutput = true,
                RedirectStandardError = true,
            }
        };

        var tcs = new TaskCompletionSource<string>();
        var listening = new Regex(@"Now listening on:\s*(http://\S+)", RegexOptions.IgnoreCase);
        _process.OutputDataReceived += (_, e) =>
        {
            if (e.Data == null) return;
            var m = listening.Match(e.Data);
            if (m.Success) tcs.TrySetResult(m.Groups[1].Value.TrimEnd('/'));
        };
        _process.Start();
        _process.BeginOutputReadLine();
        _process.BeginErrorReadLine();

        var completed = await Task.WhenAny(tcs.Task, Task.Delay(TimeSpan.FromSeconds(240)));
        Assert.That(completed, Is.EqualTo(tcs.Task), "Demo dev server did not report a listening URL within 240s.");
        BaseUrl = await tcs.Task;
        TestContext.Progress.WriteLine($"Demo server listening at {BaseUrl}");
    }

    [OneTimeTearDown]
    public void StopDemo()
    {
        try { _process?.Kill(entireProcessTree: true); } catch { /* best effort */ }
        _process?.Dispose();
    }
}
