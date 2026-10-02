# Shell & subprocess

`adb.Subprocess` exposes two protocols:

- `NoneProtocol` - the legacy protocol; stdout and stderr are merged. Always available.
- `ShellProtocol` - shell v2 (separate streams, exit codes). `null` if the device lacks `shell_v2`.

## Run a command and get the output as text

The simplest case - run to completion, get merged output:

```csharp
string model = await adb.Subprocess.NoneProtocol.SpawnWaitText("getprop ro.product.model");
string pkgs  = await adb.Subprocess.NoneProtocol.SpawnWaitText("pm list packages -3");
```

`SpawnWait` returns the raw bytes (`Uint8Array`) instead of text if you need them.

## A simple terminal panel

```razor
<input @bind="cmd" />
<button @onclick="Run">Run</button>
<pre>@output</pre>

@code {
    string cmd = "getprop ro.product.model";
    string output = "";

    async Task Run()
    {
        output += $"$ {cmd}\n";
        try   { output += (await adb.Subprocess.NoneProtocol.SpawnWaitText(cmd)).TrimEnd() + "\n"; }
        catch (Exception ex) { output += $"[error] {ex.Message}\n"; }
    }
}
```

## Streaming a long-running process

`Spawn` returns a live process - stream `Output` and write to `Stdin`:

```csharp
var proc = await adb.Subprocess.NoneProtocol.Spawn("logcat");
// proc.Output  -> ReadableStream (merged stdout/stderr)
// proc.Stdin   -> WritableStream
// proc.Exited  -> Task that completes when it ends
await proc.Kill();          // stop it
```

Read `proc.Output` with SpawnDev.SpawnJS's `ReadableStream` reader APIs (the same stream wrappers
you use elsewhere in SpawnDev.SpawnJS). For one-shot commands prefer `SpawnWaitText`.

## Shell v2

```csharp
var shell = adb.Subprocess.ShellProtocol;     // may be null
if (shell?.IsSupported == true)
{
    string outText = await shell.SpawnWaitText("echo hi");
}
```
