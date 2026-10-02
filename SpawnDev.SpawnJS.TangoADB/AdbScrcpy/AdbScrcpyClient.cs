
using SpawnDev.SpawnJS;
using SpawnDev.SpawnJS.JSObjects;

namespace SpawnDev.SpawnJS.TangoADB
{
    /// <summary>
    /// Drives a scrcpy server process over an authenticated <see cref="Adb"/> connection: pushes
    /// the server, starts it, and exposes the resulting video / audio / control streams.
    /// Wraps <c>AdbScrcpyClient</c> from @yume-chan/adb-scrcpy.
    /// </summary>
    public class AdbScrcpyClient : SpawnJSObject
    {
        /// <summary>Deserialization constructor.</summary>
        public AdbScrcpyClient(SpawnJSObjectReference _ref) : base(_ref) { }

        /// <summary>
        /// Pushes the scrcpy server binary to the device at the default path
        /// (<c>/data/local/tmp/scrcpy-server.jar</c> unless <paramref name="filename"/> is given).
        /// <paramref name="file"/> is a <c>ReadableStream</c> of the server jar bytes.
        /// </summary>
        public static Task PushServer(Adb adb, ReadableStream file, string? filename = null)
            => filename == null
                ? JS.CallVoidAsync("TangoADB.AdbScrcpy.AdbScrcpyClient.pushServer", adb, file)
                : JS.CallVoidAsync("TangoADB.AdbScrcpy.AdbScrcpyClient.pushServer", adb, file, filename);

        /// <summary>
        /// Starts the scrcpy server on the device and returns a connected client.
        /// <para>
        /// JS signature: <c>static start(adb: Adb, path: string, options: AdbScrcpyOptions): Promise&lt;AdbScrcpyClient&gt;</c>
        /// </para>
        /// </summary>
        /// <param name="adb">The authenticated ADB client.</param>
        /// <param name="path">The on-device path to the pushed scrcpy server jar.</param>
        /// <param name="options">The scrcpy options (e.g. <see cref="AdbScrcpyOptionsLatest"/>).</param>
        public static Task<AdbScrcpyClient> Start(Adb adb, string path, AdbScrcpyOptionsLatest options)
            => JS.CallAsync<Adb, string, AdbScrcpyOptionsLatest, AdbScrcpyClient>("TangoADB.AdbScrcpy.AdbScrcpyClient.start", adb, path, options);

        /// <summary>
        /// Starts the server in "list encoders" mode and returns the available <c>ScrcpyEncoder</c>s.
        /// Note: this modifies the given <paramref name="options"/> - do not reuse them.
        /// </summary>
        public static Task<ScrcpyEncoder[]> GetEncoders(Adb adb, string path, AdbScrcpyOptionsLatest options)
            => JS.CallAsync<Adb, string, AdbScrcpyOptionsLatest, ScrcpyEncoder[]>("TangoADB.AdbScrcpy.AdbScrcpyClient.getEncoders", adb, path, options);

        /// <summary>
        /// Starts the server in "list displays" mode and returns the available <c>ScrcpyDisplay</c>s.
        /// Note: this modifies the given <paramref name="options"/> - do not reuse them.
        /// </summary>
        public static Task<ScrcpyDisplay[]> GetDisplays(Adb adb, string path, AdbScrcpyOptionsLatest options)
            => JS.CallAsync<Adb, string, AdbScrcpyOptionsLatest, ScrcpyDisplay[]>("TangoADB.AdbScrcpy.AdbScrcpyClient.getDisplays", adb, path, options);

        /// <summary>The scrcpy server's stdout/stderr as a stream of text lines.</summary>
        public ReadableStream Output => JSRef!.Get<ReadableStream>("output");

        /// <summary>A task that completes when the scrcpy server process exits.</summary>
        public Task Exited => JSRef!.GetVoidAsync("exited");

        /// <summary>
        /// Resolves to the parsed video stream. On server version 2.1+ this is absent (the
        /// underlying getter is <c>undefined</c>) when video is disabled via <c>options.video: false</c>;
        /// check <see cref="HasVideoStream"/> first. Must be consumed to avoid blocking the connection.
        /// </summary>
        public Task<AdbScrcpyVideoStream> VideoStream => JSRef!.GetAsync<AdbScrcpyVideoStream>("videoStream");

        /// <summary>True if a video stream is present (false when video was disabled).</summary>
        public bool HasVideoStream => JSRef!.TypeOf("videoStream") != "undefined";

        /// <summary>
        /// Resolves to the audio stream metadata (disabled / errored / success with a packet stream).
        /// Absent on server versions before 2.0, or when audio is disabled. Uses the
        /// <see cref="ScrcpyAudioStreamMetadata"/> wrapper from the Scrcpy lane. Check
        /// <see cref="HasAudioStream"/> first.
        /// </summary>
        public Task<ScrcpyAudioStreamMetadata> AudioStream => JSRef!.GetAsync<ScrcpyAudioStreamMetadata>("audioStream");

        /// <summary>True if an audio stream is present.</summary>
        public bool HasAudioStream => JSRef!.TypeOf("audioStream") != "undefined";

        /// <summary>
        /// The control message writer for injecting input events. Absent (server 1.22+) when control
        /// is disabled via <c>options.control: false</c>. Uses the <see cref="ScrcpyControlMessageWriter"/>
        /// wrapper from the Scrcpy lane. Check <see cref="HasController"/> first.
        /// </summary>
        public ScrcpyControlMessageWriter? Controller => JSRef!.TypeOf("controller") == "undefined" ? null : JSRef!.Get<ScrcpyControlMessageWriter>("controller");

        /// <summary>True if a control writer is present.</summary>
        public bool HasController => JSRef!.TypeOf("controller") != "undefined";

        /// <summary>The device clipboard contents as a stream of strings (when available).</summary>
        public ReadableStream? Clipboard => JSRef!.TypeOf("clipboard") == "undefined" ? null : JSRef!.Get<ReadableStream>("clipboard");

        /// <summary>Stops the scrcpy server and releases the streams.</summary>
        public Task Close() => JSRef!.CallVoidAsync("close");
    }
}
