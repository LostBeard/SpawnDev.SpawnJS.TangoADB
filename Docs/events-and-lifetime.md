# Events & object lifetime

Two C# specifics worth knowing: how Tango's events map to C#, and when to dispose wrapper objects.

## Events

Tango uses `@yume-chan/event`'s callable events (call the event with a listener, get back a
disposer). In C# these are exposed as methods that take a handler and return a `TangoSubscription`.
**Dispose the subscription to unsubscribe.**

```csharp
var observer = await manager.TrackDevices();

TangoSubscription sub = observer.OnListChange(devices =>
{
    // runs whenever the device list changes
});

// later
sub.Dispose();     // unsubscribe
observer.Stop();   // stop watching
```

Other events follow the same shape, e.g. `decoder.OnSizeChanged(size => ...)` and
`videoStream.OnSizeChanged(size => ...)` (see [screen mirroring](screen-mirroring.md)).

In a component, dispose subscriptions in `Dispose`:

```csharp
@implements IDisposable
@code {
    TangoSubscription? _sub;
    protected override void OnInitialized() => _sub = observer.OnListChange(OnChange);
    public void Dispose() => _sub?.Dispose();
}
```

## Object lifetime (disposing `SpawnJSObject`s)

Every wrapper (`Adb`, `AdbSync`, `AdbScrcpyClient`, `AdbDaemonWebUsbDevice`, ...) is a
`SpawnJSObject` holding a reference to the underlying JS object, and implements `IDisposable`. Disposing a
wrapper releases the .NET-to-JS reference (it does not destroy the live JS object if something else
still holds it).

Rules of thumb:

- **Dispose short-lived objects you create**, especially streams and one-off handles:
  ```csharp
  using var response = await JS.Fetch(url);
  using var body = response.Body!;
  ```
- **Sessions: release then dispose.** `AdbSync` has a device-side `Release()` (ends the sync session)
  separate from `Dispose()` (releases the C# reference):
  ```csharp
  var sync = await adb.Sync();
  try { /* ... */ }
  finally { await sync.Release(); sync.Dispose(); }
  ```
- **Some wrappers expose `Release()` for the JS `dispose()`** (e.g. `WebCodecsVideoDecoder.Release()`)
  - that's distinct from C#'s `Dispose()`. Call `Release()` to free the device/JS resources, then
  `Dispose()` the wrapper.
- **The current `Adb`**: close it with `await adb.Close()` (closes transport + client). If you use
  `TangoService`, `Disconnect()` does this.
- **Don't dispose objects you don't own.** `AdbDaemonWebUsbDeviceManager.Browser` and service handles
  reached off `adb` (e.g. `adb.Power`, `adb.Subprocess`) are owned by their parent - let the parent
  manage them.

If you forget to dispose, the SpawnDev.SpawnJS runtime will still reclaim references eventually;
disposing just frees them promptly.
