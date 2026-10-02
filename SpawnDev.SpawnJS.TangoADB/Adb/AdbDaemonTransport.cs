using System.Text.Json.Serialization;

using SpawnDev.SpawnJS;

namespace SpawnDev.SpawnJS.TangoADB
{
    /// <summary>
    /// Options for <see cref="AdbDaemonTransport.Authenticate"/>. Carries the live device
    /// <c>connection</c> and a <c>credentialStore</c> (both JS object references).
    /// Mirrors <c>AdbDaemonAuthenticationOptions</c>.
    /// </summary>
    public class AdbDaemonAuthenticationOptions
    {
        /// <summary>The device serial number.</summary>
        [JsonPropertyName("serial")]
        public string Serial { get; set; } = "";
        /// <summary>The transport connection (e.g. an <c>AdbDaemonWebUsbConnection</c> from <c>device.Connect()</c>).</summary>
        [JsonPropertyName("connection")]
        public SpawnJSObject? Connection { get; set; }
        /// <summary>The credential store providing the RSA key (e.g. <see cref="AdbWebCredentialStore"/>).</summary>
        [JsonPropertyName("credentialStore")]
        public SpawnJSObject? CredentialStore { get; set; }
        /// <summary>Delayed-ack byte budget (Android 14+). 0 or negative disables it.</summary>
        [JsonPropertyName("initialDelayedAckBytes")]
        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        public int? InitialDelayedAckBytes { get; set; }
        /// <summary>Keep the underlying connection open when the transport is closed.</summary>
        [JsonPropertyName("preserveConnection")]
        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        public bool? PreserveConnection { get; set; }
    }

    /// <summary>
    /// An ADB transport that connects to an ADB daemon directly - the transport used for WebUSB.
    /// Wraps <c>AdbDaemonTransport</c> from @yume-chan/adb.
    /// </summary>
    public class AdbDaemonTransport : AdbTransport
    {
        /// <summary>Deserialization constructor.</summary>
        public AdbDaemonTransport(SpawnJSObjectReference _ref) : base(_ref) { }
        /// <summary>
        /// Authenticates with the ADB daemon over the given connection and creates a transport.
        /// On the device this triggers the "Allow USB debugging?" prompt the first time.
        /// </summary>
        public static Task<AdbDaemonTransport> Authenticate(AdbDaemonAuthenticationOptions options)
            => JS.CallAsync<AdbDaemonAuthenticationOptions, AdbDaemonTransport>("TangoADB.AdbDaemonTransport.authenticate", options);
        /// <summary>The negotiated ADB protocol version.</summary>
        public int ProtocolVersion => JSRef!.Get<int>("protocolVersion");
    }
}
