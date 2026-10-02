# Getting started

## 1. Install

```
dotnet add package SpawnDev.SpawnJS.TangoADB
```

The package brings in `SpawnDev.SpawnJS`. It ships the Tango JS bundle as a static web asset, so
there is nothing to copy or configure.

## 2. Register services (`Program.cs`)

```csharp
using SpawnDev.SpawnJS;
using SpawnDev.SpawnJS.TangoADB;

var builder = WebAssemblyHostBuilder.CreateDefault(args);

builder.Services.AddSpawnJSRuntime(out var JS);
builder.Services.AddTangoADB();           // optional: registers TangoService (the managed helper)

if (JS.IsWindow)
{
    builder.RootComponents.Add<App>("#app");
    builder.RootComponents.Add<HeadOutlet>("head::after");
}

await builder.Build().SpawnJSRunAsync();   // SpawnDev.SpawnJS.Blazor
```

`AddTangoADB()` is optional - it registers [`TangoService`](connecting.md#tangoservice). You can also
use the static `Tango` and the wrapper classes directly without it.

## 3. Load the bundle

Tango is loaded on demand by `Tango.Init()`. It is idempotent (safe to call repeatedly) and returns
when the bundle is ready:

```csharp
await Tango.Init();
```

Call it before you use any wrapper. If you use `TangoService`, its `RequestAndConnect()` /
`Connect()` call `Tango.Init()` for you.

Useful static checks:

```csharp
bool ready      = Tango.IsInit;             // bundle imported?
bool webusbOk   = Tango.IsWebUsbSupported;  // Chromium + secure context?
string version  = Tango.BundledLibraryVersion;  // bundled @yume-chan/adb version
```

## 4. Connect and read a property

```razor
@page "/"
@inject TangoService Tango

@if (!Tango.IsWebUsbSupported)
{
    <p>Use Chrome or Edge over HTTPS (or localhost).</p>
}
<button @onclick="Connect" disabled="@busy">Connect device</button>
<p>@status</p>

@code {
    bool busy;
    string status = "";

    async Task Connect()
    {
        busy = true;
        try
        {
            var adb = await Tango.RequestAndConnect("MyApp");  // chooser + "Allow USB debugging?"
            if (adb == null) { status = "Cancelled."; return; }
            status = await adb.GetProp("ro.product.model");
        }
        catch (Exception ex) { status = ex.Message; }
        finally { busy = false; }
    }
}
```

`RequestDevice()` must be triggered by a **user gesture** (a click) - the browser will not show the
USB chooser otherwise. The first time a device connects it shows "Allow USB debugging?"; the RSA key
is persisted (IndexedDB), so subsequent connections are silent.

## Next

- [Connecting](connecting.md) - reconnecting without the chooser, device info, `TangoService` details.
- [Shell](shell.md), [Files](files.md), [Packages](packages.md), [Power](power.md),
  [Screen mirroring](screen-mirroring.md).
