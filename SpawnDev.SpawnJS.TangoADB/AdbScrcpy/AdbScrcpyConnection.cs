using System.Text.Json.Serialization;

using SpawnDev.SpawnJS;
using SpawnDev.SpawnJS.JSObjects;

namespace SpawnDev.SpawnJS.TangoADB
{
    /// <summary>
    /// Options that describe how a scrcpy connection should be established. Mirrors
    /// <c>AdbScrcpyConnectionOptions</c>. Normally built internally by the options'
    /// <c>createConnection</c>; exposed here for completeness.
    /// </summary>
    public class AdbScrcpyConnectionOptions
    {
        /// <summary>The scrcpy instance id, or null.</summary>
        [JsonPropertyName("scid")]
        public string? Scid { get; set; }
        /// <summary>Whether a video stream is requested.</summary>
        [JsonPropertyName("video")]
        public bool Video { get; set; }
        /// <summary>Whether an audio stream is requested.</summary>
        [JsonPropertyName("audio")]
        public bool Audio { get; set; }
        /// <summary>Whether a control stream is requested.</summary>
        [JsonPropertyName("control")]
        public bool Control { get; set; }
        /// <summary>In forward-tunnel mode, read a byte from the video socket on start to detect connection issues.</summary>
        [JsonPropertyName("sendDummyByte")]
        public bool SendDummyByte { get; set; }
    }

    /// <summary>
    /// The set of streams produced by an <see cref="AdbScrcpyConnection"/>: an optional video and
    /// audio <c>ReadableStream</c> and an optional control read/write pair. Wraps
    /// <c>AdbScrcpyConnectionStreams</c> from @yume-chan/adb-scrcpy.
    /// </summary>
    public class AdbScrcpyConnectionStreams : SpawnJSObject
    {
        /// <summary>Deserialization constructor.</summary>
        public AdbScrcpyConnectionStreams(SpawnJSObjectReference _ref) : base(_ref) { }
        /// <summary>The raw video byte stream, or null.</summary>
        public ReadableStream? Video => JSRef!.TypeOf("video") == "undefined" ? null : JSRef!.Get<ReadableStream>("video");
        /// <summary>The raw audio byte stream, or null.</summary>
        public ReadableStream? Audio => JSRef!.TypeOf("audio") == "undefined" ? null : JSRef!.Get<ReadableStream>("audio");
        /// <summary>The control read/write pair (a <c>ReadableWritablePair</c>), or null. Raw JS reference.</summary>
        public SpawnJSObject? Control => JSRef!.TypeOf("control") == "undefined" ? null : JSRef!.Get<SpawnJSObject>("control");
    }

    /// <summary>
    /// Base class for a scrcpy server connection. Produced by an options object's
    /// <c>createConnection(adb)</c> and consumed by <see cref="AdbScrcpyClient"/>. Wraps the
    /// abstract <c>AdbScrcpyConnection</c> from @yume-chan/adb-scrcpy.
    /// </summary>
    public class AdbScrcpyConnection : SpawnJSObject
    {
        /// <summary>Deserialization constructor.</summary>
        public AdbScrcpyConnection(SpawnJSObjectReference _ref) : base(_ref) { }
        /// <summary>Performs any one-time setup before sockets are opened.</summary>
        public Task Initialize() => JSRef!.CallVoidAsync("initialize");
        /// <summary>Opens the requested sockets and returns the resulting streams.</summary>
        public Task<AdbScrcpyConnectionStreams> GetStreams() => JSRef!.CallAsync<AdbScrcpyConnectionStreams>("getStreams");
        /// <summary>Disposes the connection (the JS <c>dispose()</c>; distinct from <see cref="SpawnJSObject.Dispose()"/>).</summary>
        public void Release() => JSRef!.CallVoid("dispose");
    }

    /// <summary>
    /// A scrcpy connection using an ADB forward tunnel (host connects to the device socket).
    /// Wraps <c>AdbScrcpyForwardConnection</c> from @yume-chan/adb-scrcpy.
    /// </summary>
    public class AdbScrcpyForwardConnection : AdbScrcpyConnection
    {
        /// <summary>Deserialization constructor.</summary>
        public AdbScrcpyForwardConnection(SpawnJSObjectReference _ref) : base(_ref) { }
    }

    /// <summary>
    /// A scrcpy connection using an ADB reverse tunnel (device connects back to the host).
    /// Wraps <c>AdbScrcpyReverseConnection</c> from @yume-chan/adb-scrcpy.
    /// </summary>
    public class AdbScrcpyReverseConnection : AdbScrcpyConnection
    {
        /// <summary>Deserialization constructor.</summary>
        public AdbScrcpyReverseConnection(SpawnJSObjectReference _ref) : base(_ref) { }
    }
}
