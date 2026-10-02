# Packages & APKs

The package manager wraps `pm` / `cmd package`. Construct it from an `Adb`:

```csharp
var pm = new PackageManager(adb);
```

## Install an APK the user picked (the common case)

`PushAndInstallStream` streams the APK's bytes to the device and installs it - ideal for a file the
user chose in the browser. Turn the picked file into a `ReadableStream` and pass it:

```razor
<InputFile OnChange="OnFile" accept=".apk" />
<button @onclick="Install" disabled="@(selected is null)">Install</button>

@code {
    IBrowserFile? selected;
    void OnFile(InputFileChangeEventArgs e) => selected = e.File;

    async Task Install()
    {
        using var ms = new MemoryStream();
        await selected!.OpenReadStream(maxAllowedSize: 1024L * 1024 * 1024).CopyToAsync(ms);

        using var blob   = new Blob(new[] { ms.ToArray() },
                                    new BlobOptions { Type = "application/vnd.android.package-archive" });
        using var stream = blob.Stream();

        var pm = new PackageManager(adb);
        string result = await pm.PushAndInstallStream(stream);   // pm output, e.g. "Success"
    }
}
```

You can also fetch the APK from your own server and pipe its response body straight through (no copy
into .NET):

```csharp
using var response = await JS.Fetch("api/my-app.apk");   // same-origin
using var body     = response.Body!;                      // ReadableStream
var result = await pm.PushAndInstallStream(body);
```

Install options (all optional):

```csharp
await pm.PushAndInstallStream(stream, new PackageManagerInstallOptions
{
    SkipExisting = false,
    AllowTest = true,
    GrantRuntimePermissions = true,
    RequestDowngrade = true,
    BypassLowTargetSdkBlock = true,
});
```

Other install entry points: `Install(string[] apkPathsOnDevice, options?)` for APKs already on the
device, and the split-install session API (`SessionCreate` / `SessionAddSplitStream` /
`SessionCommit` / `SessionAbandon`).

## List installed packages

The JS `listPackages` is an async generator (not wrapped as a `Task`). The simplest list is a shell
call:

```csharp
string text = await adb.Subprocess.NoneProtocol.SpawnWaitText("pm list packages -3");  // -3 = 3rd-party
var packages = text.Split('\n', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
                   .Select(l => l.StartsWith("package:") ? l["package:".Length..] : l)
                   .ToList();
```

## Uninstall

```csharp
await pm.Uninstall("com.example.app");
await pm.Uninstall("com.example.app", new PackageManagerUninstallOptions { KeepData = true });
```

## Grant a runtime permission

Useful right after installing (e.g. enabling a mic):

```csharp
await adb.Subprocess.NoneProtocol.SpawnWaitText("pm grant com.example.app android.permission.RECORD_AUDIO");
```
