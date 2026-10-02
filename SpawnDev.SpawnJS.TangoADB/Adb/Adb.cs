using System.Text.Json.Serialization;

using SpawnDev.SpawnJS;

namespace SpawnDev.SpawnJS.TangoADB
{
    /// <summary>Options for <see cref="Adb.Rm(string, AdbRmOptions?)"/> and <see cref="Adb.Rm(string[], AdbRmOptions?)"/>.</summary>
    public class AdbRmOptions
    {
        /// <summary>Remove directories and their contents recursively.</summary>
        [JsonPropertyName("recursive")]
        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        public bool? Recursive { get; set; }
        /// <summary>Ignore nonexistent files; never prompt.</summary>
        [JsonPropertyName("force")]
        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        public bool? Force { get; set; }
    }

    /// <summary>
    /// The main ADB client - the high-level entry point for talking to a connected device.
    /// Construct from an <see cref="AdbTransport"/> (typically an authenticated
    /// <see cref="AdbDaemonTransport"/>). Wraps <c>Adb</c> from @yume-chan/adb.
    /// </summary>
    public class Adb : SpawnJSObject
    {
        /// <summary>Deserialization constructor.</summary>
        public Adb(SpawnJSObjectReference _ref) : base(_ref) { }
        /// <summary>Creates an ADB client over the given (authenticated) transport.</summary>
        public Adb(AdbTransport transport) : base(JS.New("TangoADB.Adb", transport)) { }

        /// <summary>The underlying transport.</summary>
        public AdbTransport Transport => JSRef!.Get<AdbTransport>("transport");
        /// <summary>The device serial number.</summary>
        public string Serial => JSRef!.Get<string>("serial");
        /// <summary>The maximum payload size negotiated with the device.</summary>
        public long MaxPayloadSize => JSRef!.Get<long>("maxPayloadSize");
        /// <summary>The parsed connection banner (product/model/device/features).</summary>
        public AdbBanner Banner => JSRef!.Get<AdbBanner>("banner");
        /// <summary>A task that completes when the device disconnects.</summary>
        public Task Disconnected => JSRef!.GetVoidAsync("disconnected");
        /// <summary>The feature flags the client supports.</summary>
        public string[] ClientFeatures => JSRef!.Get<string[]>("clientFeatures") ?? Array.Empty<string>();
        /// <summary>The feature flags the device supports (see <see cref="AdbFeature"/>).</summary>
        public string[] DeviceFeatures => JSRef!.Get<string[]>("deviceFeatures") ?? Array.Empty<string>();

        /// <summary>The subprocess/shell service.</summary>
        public AdbSubprocessService Subprocess => JSRef!.Get<AdbSubprocessService>("subprocess");
        /// <summary>The power/reboot service.</summary>
        public AdbPower Power => JSRef!.Get<AdbPower>("power");
        /// <summary>The reverse port-forwarding service.</summary>
        public AdbReverseService Reverse => JSRef!.Get<AdbReverseService>("reverse");
        /// <summary>The ADB-over-WiFi (TCP/IP) service.</summary>
        public AdbTcpIpService TcpIp => JSRef!.Get<AdbTcpIpService>("tcpip");

        /// <summary>Returns true if the device advertises the given feature (see <see cref="AdbFeature"/>).</summary>
        public bool CanUseFeature(string feature) => JSRef!.Call<string, bool>("canUseFeature", feature);
        /// <summary>Opens a new ADB socket to the given service or socket address.</summary>
        public Task<AdbSocket> CreateSocket(string service) => JSRef!.CallAsync<string, AdbSocket>("createSocket", service);
        /// <summary>Opens a socket and waits for the device to accept it, returning its response.</summary>
        public Task<string> CreateSocketAndWait(string service) => JSRef!.CallAsync<string, string>("createSocketAndWait", service);
        /// <summary>Reads a device property (e.g. <c>ro.product.model</c>).</summary>
        public Task<string> GetProp(string key) => JSRef!.CallAsync<string, string>("getProp", key);
        /// <summary>Removes a file on the device.</summary>
        public Task<string> Rm(string filename, AdbRmOptions? options = null)
            => options == null ? JSRef!.CallAsync<string, string>("rm", filename) : JSRef!.CallAsync<string, AdbRmOptions, string>("rm", filename, options);
        /// <summary>Removes multiple files on the device.</summary>
        public Task<string> Rm(string[] filenames, AdbRmOptions? options = null)
            => options == null ? JSRef!.CallAsync<string[], string>("rm", filenames) : JSRef!.CallAsync<string[], AdbRmOptions, string>("rm", filenames, options);
        /// <summary>Opens a sync session for file transfer (remember to <see cref="AdbSync.Release"/> it).</summary>
        public Task<AdbSync> Sync() => JSRef!.CallAsync<AdbSync>("sync");
        /// <summary>Captures the device screen as a raw framebuffer.</summary>
        public Task<AdbFrameBuffer> Framebuffer() => JSRef!.CallAsync<AdbFrameBuffer>("framebuffer");
        /// <summary>Closes the ADB client (and its transport).</summary>
        public Task Close() => JSRef!.CallVoidAsync("close");
    }
}
