# Files (sync)

File transfer uses the ADB **sync** service. Open a session with `adb.Sync()`, use it, then release
it with `Release()` (and dispose the wrapper):

```csharp
var sync = await adb.Sync();
try
{
    // ... list / read / write ...
}
finally
{
    await sync.Release();   // ends the sync session on the device
    sync.Dispose();         // releases the JS reference
}
```

## List a directory

```csharp
AdbSyncEntry[] entries = await sync.Readdir("/sdcard");
foreach (var e in entries)
{
    // e.Name, e.Type (LinuxFileType.Directory/File/Link), e.Size, e.Mtime, e.Permission
}
```

> `AdbSyncEntry.Size` / `.Mtime` come back as 64-bit values - on Android 11+ the device reports them
> as JS `BigInt` (older devices as a number); the wrapper reads either through `System.Numerics.BigInteger`
> and exposes it as `long`.

Stat a single path:

```csharp
AdbSyncStat stat = await sync.Lstat("/sdcard/Download");   // does not follow symlinks
bool isDir = await sync.IsDirectory("/sdcard/Download");
```

## Pull a file (device -> browser)

`Read` returns a `ReadableStream` of the file's bytes:

```csharp
using var stream = sync.Read("/sdcard/Download/log.txt");
// pipe/read 'stream' with SpawnDev.SpawnJS ReadableStream APIs, e.g. to a Blob for download
```

## Push a file (browser -> device)

`Write` takes a `ReadableStream` of bytes. To push a file the user picked, hand Tango the browser `File`'s own
stream - the bytes go from the file to the device without ever entering .NET:

```csharp
// file: a SpawnDev.SpawnJS.JSObjects.File, e.g. from an <input type="file"> element's Files
using var stream = file.Stream();
await sync.Write(new AdbSyncWriteOptions
{
    Filename = "/sdcard/Download/upload.bin",
    File     = stream,
    // optional: Permission = 0x1A4 /*0644*/, Mtime = ..., DryRun = false
});
```

### Note on Android scoped storage

Writing under `Android/data/<package>/...` works over ADB sync on devices that allow it (a Quest
does). If the parent directory doesn't exist, devices advertising the `fixed_push_mkdir` feature
(`adb.CanUseFeature(AdbFeature.FixedPushMkdir)`) create it automatically.
