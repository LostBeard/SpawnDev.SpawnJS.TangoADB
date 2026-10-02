# CLAUDE.md - SpawnDev.SpawnJS.TangoADB

SpawnDev.SpawnJS wrapper for **Tango** (`@yume-chan/ya-webadb`) - ADB over WebUSB in the browser.
Connect to Android devices (e.g. Quest 3/3S in developer mode), authenticate, run shell,
push/pull files, install/uninstall APKs, reboot, and mirror the screen (scrcpy).

## Layout

- Repo root (this folder): `.sln`/`.slnx`, README, LICENSE, `_publish-*.bat`, `bundle/`.
- `SpawnDev.SpawnJS.TangoADB/` - the library (NuGet package).
- `SpawnDev.SpawnJS.TangoADB.Demo/` - professional Radzen dark-theme demo that tests + showcases the wrapper.
- `bundle/` - npm bundle source + `rebundle.cs` updater (Node only needed to refresh the bundle).

## How the JS is loaded

Tango is ESM-only across many `@yume-chan/*` packages with no UMD global. `bundle/rebundle.cs`
bundles them into one ESM file `wwwroot/tango-adb.js` (committed). `Tango.Init()` dynamic-imports
it and assigns it to the JS global `TangoADB`; wrappers then construct via `JS.New("TangoADB.Adb", ...)`.
Namespaced exports: `TangoADB.Scrcpy.*`, `TangoADB.AdbScrcpy.*`, `TangoADB.AndroidBin.*`.

## Updating the bundled Tango version

```
cd bundle
dotnet run rebundle.cs                 # install latest @yume-chan/*, rebundle, regenerate TangoVersion.g.cs
dotnet run rebundle.cs -- --no-install # rebundle from current node_modules only
```

`Tango.BundledLibraryVersion` (generated in `TangoVersion.g.cs`) surfaces the bundled version.

## Dependencies

- SpawnDev.SpawnJS **3.0.0** (demo: SpawnDev.SpawnJS.Blazor 3.0.1)
- Target framework: net10.0
- Trim safe, enforced (IsTrimmable + IL warnings as errors + embedded ILLink.Descriptors.xml).
- Sibling package: SpawnDev.BlazorJS.TangoADB (the BlazorJS edition, same API). Fix a wrapper bug in BOTH.

## Tests

`dotnet test SpawnDev.SpawnJS.TangoADB.Tests -c Release` boots the demo and runs its Verification page (exports +
marshalling round trips). For the trimmed proof: `dotnet publish SpawnDev.SpawnJS.TangoADB.Demo -c Release
-p:TrimMode=full -o <dir>`, static-serve `<dir>/wwwroot`, and run the tests with `TANGOADB_TEST_URL=<url>`.

<!-- TANGO-VERSIONS:START -->
## Bundled @yume-chan versions

| Package | Version |
|---|---|
| @yume-chan/adb | 2.6.0 |
| @yume-chan/adb-credential-web | 2.1.0 |
| @yume-chan/adb-daemon-webusb | 2.3.2 |
| @yume-chan/adb-scrcpy | 2.3.2 |
| @yume-chan/android-bin | 2.1.0 |
| @yume-chan/async | 4.1.3 |
| @yume-chan/event | 2.0.0 |
| @yume-chan/fetch-scrcpy-server | 1.0.0 |
| @yume-chan/no-data-view | 2.0.0 |
| @yume-chan/scrcpy | 2.3.0 |
| @yume-chan/scrcpy-decoder-tinyh264 | 2.1.0 |
| @yume-chan/scrcpy-decoder-webcodecs | 2.5.3 |
| @yume-chan/stream-extra | 2.6.1 |
| @yume-chan/struct | 2.3.2 |
<!-- TANGO-VERSIONS:END -->
