
using SpawnDev.SpawnJS;

namespace SpawnDev.SpawnJS.TangoADB
{
    /// <summary>
    /// Base wrapper for an ADB transport (the connection an <see cref="Adb"/> instance runs on).
    /// Concrete implementations: <see cref="AdbDaemonTransport"/> (direct daemon, used for WebUSB).
    /// Mirrors the <c>AdbTransport</c> interface from @yume-chan/adb.
    /// </summary>
    public class AdbTransport : SpawnJSObject
    {
        /// <summary>Deserialization constructor.</summary>
        public AdbTransport(SpawnJSObjectReference _ref) : base(_ref) { }
        /// <summary>The device serial number.</summary>
        public string Serial => JSRef!.Get<string>("serial");
        /// <summary>The maximum payload size negotiated with the device.</summary>
        public long MaxPayloadSize => JSRef!.Get<long>("maxPayloadSize");
        /// <summary>The parsed connection banner.</summary>
        public AdbBanner Banner => JSRef!.Get<AdbBanner>("banner");
        /// <summary>A task that completes when the transport disconnects.</summary>
        public Task Disconnected => JSRef!.GetVoidAsync("disconnected");
        /// <summary>The feature flags the client supports.</summary>
        public string[] ClientFeatures => JSRef!.Get<string[]>("clientFeatures") ?? Array.Empty<string>();
        /// <summary>Opens a new ADB socket to the given service.</summary>
        public Task<AdbSocket> Connect(string service) => JSRef!.CallAsync<string, AdbSocket>("connect", service);
        /// <summary>Removes a reverse tunnel.</summary>
        public Task RemoveReverseTunnel(string address) => JSRef!.CallVoidAsync("removeReverseTunnel", address);
        /// <summary>Clears all reverse tunnels.</summary>
        public Task ClearReverseTunnels() => JSRef!.CallVoidAsync("clearReverseTunnels");
        /// <summary>Closes the transport.</summary>
        public Task Close() => JSRef!.CallVoidAsync("close");
    }
}
