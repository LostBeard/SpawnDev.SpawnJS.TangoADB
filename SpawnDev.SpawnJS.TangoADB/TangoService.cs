using SpawnDev.SpawnJS;

namespace SpawnDev.SpawnJS.TangoADB
{
    /// <summary>
    /// Optional high-level helper that manages the WebUSB connect/authenticate lifecycle and
    /// holds the currently connected <see cref="Adb"/>. Register with <c>AddTangoADB()</c> and
    /// inject where needed, or use the static <see cref="Tango"/> APIs directly.
    /// </summary>
    public class TangoService
    {
        /// <summary>The default app name used for the credential store / RSA key prompt.</summary>
        public string AppName { get; set; } = "SpawnDev.SpawnJS.TangoADB";

        /// <summary>The currently connected device client, or null if not connected.</summary>
        public Adb? Adb { get; private set; }

        /// <summary>True when a device is connected.</summary>
        public bool IsConnected => Adb != null;

        /// <summary>True when the browser supports WebUSB (passthrough to <see cref="Tango.IsWebUsbSupported"/>).</summary>
        public bool IsWebUsbSupported => Tango.IsWebUsbSupported;

        /// <summary>Raised whenever <see cref="Adb"/> changes (connect or disconnect).</summary>
        public event Action? ConnectionChanged;

        /// <summary>Imports the Tango bundle (idempotent).</summary>
        public Task EnsureInitialized() => Tango.Init();

        /// <summary>
        /// Prompts the user to pick a device (the browser USB chooser), then authenticates and
        /// connects to it. Returns null if the user cancels the chooser.
        /// </summary>
        public async Task<Adb?> RequestAndConnect(string? appName = null)
        {
            await Tango.Init();
            var manager = AdbDaemonWebUsbDeviceManager.Browser
                ?? throw new InvalidOperationException("WebUSB is not supported in this browser (requires a Chromium browser over HTTPS).");
            var device = await manager.RequestDevice();
            if (device == null) return null; // user cancelled the chooser
            return await Connect(device, appName);
        }

        /// <summary>Authenticates and connects to an already-chosen device.</summary>
        public async Task<Adb> Connect(AdbDaemonWebUsbDevice device, string? appName = null)
        {
            await Tango.Init();
            var connection = await device.Connect();
            var credentialStore = new AdbWebCredentialStore(appName ?? AppName);
            var transport = await AdbDaemonTransport.Authenticate(new AdbDaemonAuthenticationOptions
            {
                Serial = device.Serial,
                Connection = connection,
                CredentialStore = credentialStore,
            });
            var adb = new Adb(transport);
            Adb = adb;
            ConnectionChanged?.Invoke();
            _ = WatchDisconnect(adb);
            return adb;
        }

        async Task WatchDisconnect(Adb adb)
        {
            try { await adb.Disconnected; } catch { /* ignore */ }
            if (ReferenceEquals(Adb, adb))
            {
                Adb = null;
                ConnectionChanged?.Invoke();
            }
        }

        /// <summary>Closes the current connection, if any.</summary>
        public async Task Disconnect()
        {
            var adb = Adb;
            if (adb == null) return;
            Adb = null;
            try { await adb.Close(); } catch { /* ignore */ }
            ConnectionChanged?.Invoke();
        }
    }
}
