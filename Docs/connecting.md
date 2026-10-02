# Connecting to a device

## The full flow (no helper)

```csharp
await Tango.Init();

var manager = AdbDaemonWebUsbDeviceManager.Browser;   // static singleton; null if no WebUSB
if (manager == null) { /* not a Chromium/secure context */ return; }

var device = await manager.RequestDevice();            // USB chooser (requires a user gesture)
if (device == null) return;                            // user cancelled

var connection = await device.Connect();               // opens the USB interface
var credentials = new AdbWebCredentialStore("MyApp");  // RSA key store (WebCrypto + IndexedDB)
var transport = await AdbDaemonTransport.Authenticate(new AdbDaemonAuthenticationOptions
{
    Serial = device.Serial,
    Connection = connection,
    CredentialStore = credentials,
});

var adb = new Adb(transport);
```

`adb` is your handle for everything else: `adb.Subprocess`, `adb.Sync()`, `adb.Power`, `adb.Reverse`,
`adb.TcpIp`, plus `new PackageManager(adb)` and `AdbScrcpyClient`.

### Device info

```csharp
string serial   = adb.Serial;
AdbBanner banner = adb.Banner;                 // banner.Product / .Model / .Device / .Features
string model    = await adb.GetProp("ro.product.model");
string android  = await adb.GetProp("ro.build.version.release");
string[] features = adb.DeviceFeatures;        // e.g. shell_v2, cmd, stat_v2, fixed_push_mkdir, ...
bool canShellV2 = adb.CanUseFeature(AdbFeature.ShellV2);
```

### Disconnect

`Adb.Disconnected` is a `Task` that completes when the device drops:

```csharp
_ = adb.Disconnected.ContinueWith(_ => { /* device unplugged */ });
await adb.Close();   // close the client + transport yourself
```

## Reconnecting without the chooser

The browser remembers a granted device per origin, and the device remembers your RSA key (if the
user picked "Always allow"). So a returning user can reconnect with no prompts:

```csharp
var manager = AdbDaemonWebUsbDeviceManager.Browser!;
var devices = await manager.GetDevices();      // already-permitted devices, no chooser
var device  = devices.FirstOrDefault();
if (device != null)
{
    var connection = await device.Connect();
    var transport  = await AdbDaemonTransport.Authenticate(new()
    {
        Serial = device.Serial, Connection = connection,
        CredentialStore = new AdbWebCredentialStore("MyApp"),  // same app name -> same key
    });
    var adb = new Adb(transport);
}
```

Use the same `appName` in `AdbWebCredentialStore` to reuse the stored key.

### Watching for plug/unplug

```csharp
var observer = await manager.TrackDevices();
using var sub = observer.OnListChange(devices => { /* update UI */ });
// ... later: sub.Dispose(); observer.Stop();
```

(`OnListChange`/`OnDeviceAdd`/`OnDeviceRemove` return a `TangoSubscription` - dispose to unsubscribe;
see [events](events-and-lifetime.md).)

## TangoService

`AddTangoADB()` registers `TangoService`, a singleton that wraps the lifecycle and tracks the current
connection. Inject it and use:

```csharp
@inject TangoService Tango
@implements IDisposable

@code {
    protected override void OnInitialized() => Tango.ConnectionChanged += StateHasChanged;
    public void Dispose() => Tango.ConnectionChanged -= StateHasChanged;

    async Task Connect()
    {
        var adb = await Tango.RequestAndConnect("MyApp");   // Init + chooser + authenticate
        // adb == null means the user cancelled the chooser
    }

    void Show()
    {
        if (Tango.IsConnected)
            Console.WriteLine(Tango.Adb!.Serial);
    }

    Task Bye() => Tango.Disconnect();
}
```

`TangoService` members:

| Member | Purpose |
|---|---|
| `Task<Adb?> RequestAndConnect(appName?)` | `Init` + chooser + authenticate; null if cancelled |
| `Task<Adb> Connect(device, appName?)` | authenticate an already-chosen `AdbDaemonWebUsbDevice` |
| `Adb? Adb` / `bool IsConnected` | the live client |
| `event Action ConnectionChanged` | raised on connect and on disconnect |
| `Task Disconnect()` | close the current connection |
| `bool IsWebUsbSupported` | pass-through to `Tango.IsWebUsbSupported` |

It also watches `Adb.Disconnected` for you and clears `Adb` (raising `ConnectionChanged`) when the
device drops.
