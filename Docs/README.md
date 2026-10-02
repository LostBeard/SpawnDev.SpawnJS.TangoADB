# SpawnDev.SpawnJS.TangoADB - Documentation

A C# wrapper around [Tango](https://github.com/yume-chan/ya-webadb) (`@yume-chan/ya-webadb`) that
lets a Blazor WebAssembly app drive Android devices over **WebUSB** - connect, run shell commands,
push/pull files, install APKs, reboot, and mirror the screen (scrcpy).

## Guides

1. [Getting started](getting-started.md) - install, `Program.cs`, `Tango.Init()`, your first connection
2. [Connecting to a device](connecting.md) - the WebUSB chooser, authentication, `TangoService`
3. [Shell & subprocess](shell.md) - run commands, stream output
4. [Files (sync)](files.md) - list, pull, push
5. [Packages & APKs](packages.md) - install (including a browser file), uninstall
6. [Power & reboot](power.md)
7. [Screen mirroring (scrcpy)](screen-mirroring.md) - decode video to a canvas, inject input
8. [Events & object lifetime](events-and-lifetime.md) - subscriptions and disposing `SpawnJSObject`s

## How it maps from JavaScript to C#

The API mirrors Tango's, but a few things differ in C#:

- **Everything is `async`.** Tango's promises become `Task`/`Task<T>` - `await` them. Methods that
  return a value end in the awaited type (e.g. `Task<string> GetProp(...)`).
- **Wrapped objects are `SpawnJSObject`s.** Each wrapper (e.g. `Adb`, `AdbSync`) holds a reference to the
  underlying JS object. They implement `IDisposable` - dispose ones you create when you're done, so
  the JS reference is released. See [object lifetime](events-and-lifetime.md).
- **One JS global, dotted names.** `Tango.Init()` imports the bundle and assigns it to the JS global
  `TangoADB`. You never touch that directly - you use the C# wrappers - but it's why construction
  looks like `new Adb(transport)` (which calls `new TangoADB.Adb(...)` under the hood).
- **Namespaced areas.** The Android command-line tools live under `TangoADB.AndroidBin.*` and scrcpy
  under `TangoADB.Scrcpy.*` / `TangoADB.AdbScrcpy.*`, but in C# they are all in the one namespace
  `SpawnDev.SpawnJS.TangoADB` - e.g. `new PackageManager(adb)`, `AdbScrcpyClient.Start(...)`.
- **Streams** are SpawnDev.SpawnJS's `ReadableStream` / `WritableStream` (`SpawnDev.SpawnJS.JSObjects`),
  the same wrappers you use elsewhere in SpawnDev.SpawnJS.

## Requirements

- A **Chromium** browser (Chrome / Edge / Opera). WebUSB is not in Firefox/Safari.
- A **secure context**: HTTPS, or `http://localhost` (localhost counts as secure). On the device,
  enable Developer Options + USB debugging.
- `SpawnDev.SpawnJS` 3.0.0+; net10.0. Trim safe (IsTrimmable, analyzers enforced).

## The connection in one snippet

```csharp
await Tango.Init();                                   // load the bundle once

var manager = AdbDaemonWebUsbDeviceManager.Browser;   // null if no WebUSB
var device  = await manager!.RequestDevice();         // shows the USB chooser (needs a user gesture)
if (device == null) return;                            // user cancelled

var connection = await device.Connect();
var credentials = new AdbWebCredentialStore("MyApp");  // persists the RSA key in IndexedDB
var transport = await AdbDaemonTransport.Authenticate(new AdbDaemonAuthenticationOptions
{
    Serial = device.Serial,
    Connection = connection,
    CredentialStore = credentials,
});

var adb = new Adb(transport);                          // the ADB client - shell, sync, packages, ...
var model = await adb.GetProp("ro.product.model");
```

Prefer the managed helper? [`TangoService`](connecting.md#tangoservice) wraps all of that into
`RequestAndConnect()`.
