# SpawnDev.SpawnJS.TangoADB

[![NuGet](https://img.shields.io/nuget/dt/SpawnDev.SpawnJS.TangoADB.svg?label=SpawnDev.SpawnJS.TangoADB)](https://www.nuget.org/packages/SpawnDev.SpawnJS.TangoADB)

A [SpawnDev.SpawnJS](https://github.com/LostBeard/SpawnDev.SpawnJS) wrapper around
**[Tango](https://github.com/yume-chan/ya-webadb)** (`@yume-chan/ya-webadb`) - the TypeScript
re-implementation of ADB that runs in the browser over **WebUSB**.

Drive Android devices (including a Meta Quest 3/3S in developer mode) directly from a .NET
browser app (Blazor WebAssembly or plain .NET WASM): connect, authenticate, run shell commands, push/pull files, install/uninstall
APKs, reboot, and mirror the screen (scrcpy) - no `adb.exe`, no drivers, no native code.

> Requires a Chromium-based browser (Chrome/Edge) served over HTTPS (WebUSB is a secure-context API).

This is the SpawnDev.SpawnJS edition of [SpawnDev.BlazorJS.TangoADB](https://github.com/LostBeard/SpawnDev.BlazorJS.TangoADB):
same API, built on SpawnDev.SpawnJS, net10.0, trim safe.

## Install

```
dotnet add package SpawnDev.SpawnJS.TangoADB
```

## Quick start

```csharp
await Tango.Init();

var manager = AdbDaemonWebUsbDeviceManager.Browser;
var device = await manager.RequestDevice();          // shows the browser USB chooser
var connection = await device.Connect();
var credentialStore = new AdbWebCredentialStore("MyApp");
var transport = await AdbDaemonTransport.Authenticate(new AdbDaemonAuthenticationOptions
{
    Serial = device.Serial,
    Connection = connection,
    CredentialStore = credentialStore,
});
var adb = new Adb(transport);

var model = await adb.GetProp("ro.product.model");
```

Prefer the managed helper? `AddTangoADB()` registers `TangoService`, whose `RequestAndConnect()`
does the whole flow above (and tracks the current connection).

## Documentation

C#-focused guides are in [`Docs/`](Docs/) (the API mirrors Tango's, but C# differs - `async`/`await`,
`SpawnJSObject` disposal, one `TangoADB` global):

- [Getting started](Docs/getting-started.md) &middot; [Connecting](Docs/connecting.md)
- [Shell](Docs/shell.md) &middot; [Files (sync)](Docs/files.md) &middot; [Packages & APKs](Docs/packages.md) &middot; [Power](Docs/power.md)
- [Screen mirroring (scrcpy)](Docs/screen-mirroring.md) &middot; [Events & object lifetime](Docs/events-and-lifetime.md)

See the demo project for full Connect / Shell / Files / Install APK / Packages / Power / Screen examples,
and [CHANGELOG.md](CHANGELOG.md) for release notes.

## What's wrapped

The whole Tango surface, organised by namespace:

- **Core ADB** (`@yume-chan/adb`): `Adb`, `AdbDaemonTransport` (authenticate), `AdbBanner`, `AdbSync` (push/pull/list/stat), `AdbSubprocessService` (shell), `AdbPower` (reboot/recovery/...), `AdbReverseService`, `AdbTcpIpService`, `AdbFrameBuffer`.
- **WebUSB** (`@yume-chan/adb-daemon-webusb`): `AdbDaemonWebUsbDeviceManager` (`.Browser`, `RequestDevice`), `AdbDaemonWebUsbDevice`, `AdbDaemonWebUsbConnection`, `AdbDaemonWebUsbDeviceObserver`.
- **Credential** (`@yume-chan/adb-credential-web`): `AdbWebCredentialStore` (WebCrypto + IndexedDB RSA key).
- **Android utilities** (`@yume-chan/android-bin`, `TangoADB.AndroidBin.*`): `PackageManager` (install/uninstall APKs), `Settings`, `ActivityManager`, `Cmd`, `DumpSys`, `Logcat`, `DemoMode`, `OverlayDisplay`, `IntentBuilder`, `AdbBackup`, `BugReport`.
- **scrcpy** (`TangoADB.Scrcpy.*` + `TangoADB.AdbScrcpy.*`): `AdbScrcpyClient` (push server, start), `AdbScrcpyOptionsLatest`, the control-message writer + full Android key/motion input enums, `WebCodecsVideoDecoder` and `TinyH264Decoder` with their frame renderers.

A small `TangoService` (`builder.Services.AddTangoADB()`) wraps the connect/authenticate/disconnect lifecycle.

## Updating the bundled Tango version

Tango is ESM-only across many `@yume-chan/*` packages, so it is bundled into a single committed
`wwwroot/tango-adb.js`. To refresh it to the latest upstream:

```
cd bundle
dotnet run rebundle.cs                 # npm install latest, esbuild, fetch scrcpy-server, regenerate TangoVersion.g.cs
dotnet run rebundle.cs -- --no-install # rebundle from the current node_modules only
```

`Tango.BundledLibraryVersion` (generated) reports the bundled `@yume-chan/adb` version.

## Demo and tests

`SpawnDev.SpawnJS.TangoADB.Demo` is a Radzen dark-theme app with a page per feature (Connect, Shell,
Files, Install APK, Packages, Power, Screen) plus a **Wrapper Verification** page that imports the
bundle and confirms every wrapped export resolves.

`SpawnDev.SpawnJS.TangoADB.Tests` is a Playwright + NUnit test that boots the demo, drives the
Verification page in real Chromium, and asserts all exports resolve - the no-device slice that can be
automated. Device-dependent flows (connect/shell/install/scrcpy) are exercised through the demo
against real hardware.

```
dotnet build
pwsh SpawnDev.SpawnJS.TangoADB.Tests/bin/Release/net10.0/playwright.ps1 install chromium   # once
dotnet test
```

### Screenshots
![Screen Copy scrcpy](https://raw.githubusercontent.com/LostBeard/SpawnDev.SpawnJS.TangoADB/master/SpawnDev.SpawnJS.TangoADB.Demo/wwwroot/screenshots/scrcpy-1.jpg)  
![Screen Copy scrcpy](https://raw.githubusercontent.com/LostBeard/SpawnDev.SpawnJS.TangoADB/master/SpawnDev.SpawnJS.TangoADB.Demo/wwwroot/screenshots/packages-list.jpg)  

## The SpawnDev Crew

- **LostBeard** (Todd Tanner) - Captain, library author, keeper of the vision
- **Riker** - First Officer, implementation lead on consuming projects
- **Data** - Operations Officer, deep-library work, test rigor, root-cause analysis
- **Tuvok** - Security/Research Officer, design planning, documentation, code review
- **Geordi** - Chief Engineer, library internals, GPU kernels, backend work
- **Seven** - Wasm backend, GPU kernels, fail-loud verification
