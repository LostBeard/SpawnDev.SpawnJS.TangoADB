using System.Text.Json.Serialization;

using SpawnDev.SpawnJS;
using SpawnDev.SpawnJS.JSObjects;

namespace SpawnDev.SpawnJS.TangoADB
{
    /// <summary>
    /// The orientation the captured video stream is locked to (does not rotate the device screen).
    /// Mirrors <c>VideoOrientation</c>. Used by <see cref="ScrcpyOptionsInit.LockVideoOrientation"/>.
    /// </summary>
    public enum ScrcpyVideoOrientation
    {
        /// <summary>Do not lock the video orientation.</summary>
        Unlocked = -1,
        /// <summary>Portrait.</summary>
        Portrait = 0,
        /// <summary>Landscape.</summary>
        Landscape = 1,
        /// <summary>Portrait, flipped 180 degrees.</summary>
        PortraitFlipped = 2,
        /// <summary>Landscape, flipped 180 degrees.</summary>
        LandscapeFlipped = 3,
    }

    /// <summary>How the capture orientation is locked. Mirrors <c>LockOrientation</c>.</summary>
    public enum ScrcpyLockOrientation
    {
        /// <summary>Capture orientation follows the device.</summary>
        Unlocked = 0,
        /// <summary>Lock to the orientation at capture start.</summary>
        LockedInitial = 1,
        /// <summary>Lock to a specific <see cref="ScrcpyOrientation"/> value.</summary>
        LockedValue = 2,
    }

    /// <summary>A specific capture orientation in degrees. Mirrors <c>Orientation</c>.</summary>
    public enum ScrcpyOrientation
    {
        /// <summary>0 degrees.</summary>
        Orient0 = 0,
        /// <summary>90 degrees.</summary>
        Orient90 = 90,
        /// <summary>180 degrees.</summary>
        Orient180 = 180,
        /// <summary>270 degrees.</summary>
        Orient270 = 270,
    }

    /// <summary>
    /// Plain-data initializer for <see cref="ScrcpyCodecOptions"/> - low-level encoder options.
    /// Mirrors <c>CodecOptionsInit</c>. Only set the members you need.
    /// </summary>
    public class ScrcpyCodecOptionsInit
    {
        /// <summary>Encoder profile.</summary>
        [JsonPropertyName("profile")]
        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        public int? Profile { get; set; }
        /// <summary>Encoder level.</summary>
        [JsonPropertyName("level")]
        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        public int? Level { get; set; }
        /// <summary>I-frame interval (seconds).</summary>
        [JsonPropertyName("iFrameInterval")]
        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        public int? IFrameInterval { get; set; }
        /// <summary>Maximum number of B-frames.</summary>
        [JsonPropertyName("maxBframes")]
        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        public int? MaxBframes { get; set; }
        /// <summary>Repeat previous frame after the given microseconds.</summary>
        [JsonPropertyName("repeatPreviousFrameAfter")]
        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        public int? RepeatPreviousFrameAfter { get; set; }
        /// <summary>Maximum PTS gap to the encoder.</summary>
        [JsonPropertyName("maxPtsGapToEncoder")]
        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        public int? MaxPtsGapToEncoder { get; set; }
        /// <summary>Intra refresh period.</summary>
        [JsonPropertyName("intraRefreshPeriod")]
        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        public int? IntraRefreshPeriod { get; set; }
    }

    /// <summary>
    /// A scrcpy option value (a class with a <see cref="ToOptionValue"/> that produces the
    /// command-line string scrcpy expects). Mirrors <c>ScrcpyOptionValue</c>.
    /// </summary>
    public class ScrcpyOptionValue : SpawnJSObject
    {
        /// <summary>Deserialization constructor.</summary>
        public ScrcpyOptionValue(SpawnJSObjectReference _ref) : base(_ref) { }
        /// <summary>Serializes this value to the string scrcpy expects, or null/empty when default.</summary>
        public string? ToOptionValue() => JSRef!.Call<string?>("toOptionValue");
    }

    /// <summary>
    /// Low-level video/audio encoder options. Mirrors <c>CodecOptions</c> (<c>ScrcpyCodecOptions</c>).
    /// Build one then assign its <see cref="ScrcpyOptionValue.ToOptionValue"/> string to
    /// <see cref="ScrcpyOptionsInit.VideoCodecOptions"/> / <see cref="ScrcpyOptionsInit.AudioCodecOptions"/>.
    /// </summary>
    public class ScrcpyCodecOptions : ScrcpyOptionValue
    {
        /// <summary>Deserialization constructor.</summary>
        public ScrcpyCodecOptions(SpawnJSObjectReference _ref) : base(_ref) { }
        /// <summary>Creates codec options from the given initializer.</summary>
        public ScrcpyCodecOptions(ScrcpyCodecOptionsInit options) : base(JS.New("TangoADB.Scrcpy.ScrcpyCodecOptions", options)) { }
        /// <summary>Creates empty (default) codec options.</summary>
        public ScrcpyCodecOptions() : base(JS.New("TangoADB.Scrcpy.ScrcpyCodecOptions")) { }
    }

    /// <summary>
    /// A crop region (width:height:x:y) applied to the captured video. Mirrors <c>Crop</c>
    /// (<c>ScrcpyCrop</c>). Build one and assign its <see cref="ScrcpyOptionValue.ToOptionValue"/>
    /// string to <see cref="ScrcpyOptionsInit.Crop"/>.
    /// </summary>
    public class ScrcpyCrop : ScrcpyOptionValue
    {
        /// <summary>Deserialization constructor.</summary>
        public ScrcpyCrop(SpawnJSObjectReference _ref) : base(_ref) { }
        /// <summary>Creates a crop region.</summary>
        public ScrcpyCrop(int width, int height, int x, int y) : base(JS.New("TangoADB.Scrcpy.ScrcpyCrop", width, height, x, y)) { }
        /// <summary>The crop width.</summary>
        public int Width { get => JSRef!.Get<int>("width"); set => JSRef!.Set("width", value); }
        /// <summary>The crop height.</summary>
        public int Height { get => JSRef!.Get<int>("height"); set => JSRef!.Set("height", value); }
        /// <summary>The crop X offset.</summary>
        public int X { get => JSRef!.Get<int>("x"); set => JSRef!.Set("x", value); }
        /// <summary>The crop Y offset.</summary>
        public int Y { get => JSRef!.Get<int>("y"); set => JSRef!.Set("y", value); }
    }

    /// <summary>
    /// A locked capture orientation. Mirrors <c>CaptureOrientation</c> (<c>ScrcpyCaptureOrientation</c>).
    /// Assign its <see cref="ScrcpyOptionValue.ToOptionValue"/> string to
    /// <see cref="ScrcpyOptionsInit.CaptureOrientation"/>.
    /// </summary>
    public class ScrcpyCaptureOrientation : ScrcpyOptionValue
    {
        /// <summary>Deserialization constructor.</summary>
        public ScrcpyCaptureOrientation(SpawnJSObjectReference _ref) : base(_ref) { }
        /// <summary>Creates a capture orientation lock.</summary>
        public ScrcpyCaptureOrientation(ScrcpyLockOrientation lockMode, ScrcpyOrientation orientation, bool flip = false)
            : base(JS.New("TangoADB.Scrcpy.ScrcpyCaptureOrientation", (int)lockMode, (int)orientation, flip)) { }
        /// <summary>The lock mode.</summary>
        public ScrcpyLockOrientation Lock => (ScrcpyLockOrientation)JSRef!.Get<int>("lock");
        /// <summary>The orientation.</summary>
        public ScrcpyOrientation Orientation => (ScrcpyOrientation)JSRef!.Get<int>("orientation");
        /// <summary>Whether the orientation is flipped.</summary>
        public bool Flip => JSRef!.Get<bool>("flip");
    }

    /// <summary>
    /// Description of a new virtual display to create. Mirrors <c>NewDisplay</c>
    /// (<c>ScrcpyNewDisplay</c>). Assign its <see cref="ScrcpyOptionValue.ToOptionValue"/> string
    /// to <see cref="ScrcpyOptionsInit.NewDisplay"/>.
    /// </summary>
    public class ScrcpyNewDisplay : ScrcpyOptionValue
    {
        /// <summary>Deserialization constructor.</summary>
        public ScrcpyNewDisplay(SpawnJSObjectReference _ref) : base(_ref) { }
        /// <summary>Creates a default new display.</summary>
        public ScrcpyNewDisplay() : base(JS.New("TangoADB.Scrcpy.ScrcpyNewDisplay")) { }
        /// <summary>Creates a new display with the given pixel size.</summary>
        public ScrcpyNewDisplay(int width, int height) : base(JS.New("TangoADB.Scrcpy.ScrcpyNewDisplay", width, height)) { }
        /// <summary>Creates a new display with the given pixel size and DPI.</summary>
        public ScrcpyNewDisplay(int width, int height, int dpi) : base(JS.New("TangoADB.Scrcpy.ScrcpyNewDisplay", width, height, dpi)) { }
        /// <summary>The display width, if set.</summary>
        public int? Width => JSRef!.Get<int?>("width");
        /// <summary>The display height, if set.</summary>
        public int? Height => JSRef!.Get<int?>("height");
        /// <summary>The display DPI, if set.</summary>
        public int? Dpi => JSRef!.Get<int?>("dpi");
    }

    /// <summary>
    /// A scrcpy server instance id (scid). Mirrors <c>InstanceId</c> (<c>ScrcpyInstanceId</c>).
    /// Assign its <see cref="ScrcpyOptionValue.ToOptionValue"/> string to <see cref="ScrcpyOptionsInit.Scid"/>.
    /// </summary>
    public class ScrcpyInstanceId : ScrcpyOptionValue
    {
        /// <summary>Deserialization constructor.</summary>
        public ScrcpyInstanceId(SpawnJSObjectReference _ref) : base(_ref) { }
        /// <summary>Creates an instance id from a raw value.</summary>
        public ScrcpyInstanceId(int value) : base(JS.New("TangoADB.Scrcpy.ScrcpyInstanceId", value)) { }
        /// <summary>The raw instance id value.</summary>
        public int Value { get => JSRef!.Get<int>("value"); set => JSRef!.Set("value", value); }
        /// <summary>The "no instance id" sentinel.</summary>
        public static ScrcpyInstanceId None => JS.Get<ScrcpyInstanceId>("TangoADB.Scrcpy.ScrcpyInstanceId.NONE");
        /// <summary>Creates a random instance id.</summary>
        public static ScrcpyInstanceId Random() => JS.Call<ScrcpyInstanceId>("TangoADB.Scrcpy.ScrcpyInstanceId.random");
    }

    /// <summary>
    /// Plain-data initializer for <see cref="ScrcpyOptionsLatest"/>. Mirrors the merged scrcpy
    /// option <c>Init</c> across versions (see <c>ScrcpyOptions3_3_1.Defaults</c>). Only set the
    /// members you need; unset members fall back to the server defaults.<br/>
    /// For the object-valued options (crop, codec options, capture orientation, new display, scid)
    /// build the matching wrapper (e.g. <see cref="ScrcpyCrop"/>) and assign its
    /// <see cref="ScrcpyOptionValue.ToOptionValue"/> string here.
    /// </summary>
    public class ScrcpyOptionsInit
    {
        /// <summary>Log level on the device: "debug", "info", "warn" or "error".</summary>
        [JsonPropertyName("logLevel")]
        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        public string? LogLevel { get; set; }
        /// <summary>The maximum value of both width and height (0 = unlimited).</summary>
        [JsonPropertyName("maxSize")]
        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        public int? MaxSize { get; set; }
        /// <summary>The video bit rate in bits per second (legacy alias of <see cref="VideoBitRate"/>).</summary>
        [JsonPropertyName("bitRate")]
        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        public int? BitRate { get; set; }
        /// <summary>Maximum frames per second (0 = unlimited).</summary>
        [JsonPropertyName("maxFps")]
        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        public int? MaxFps { get; set; }
        /// <summary>The locked video orientation (see <see cref="ScrcpyVideoOrientation"/>).</summary>
        [JsonPropertyName("lockVideoOrientation")]
        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        public int? LockVideoOrientation { get; set; }
        /// <summary>Use an ADB forward tunnel instead of a reverse tunnel.</summary>
        [JsonPropertyName("tunnelForward")]
        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        public bool? TunnelForward { get; set; }
        /// <summary>The crop region string (see <see cref="ScrcpyCrop"/>).</summary>
        [JsonPropertyName("crop")]
        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        public string? Crop { get; set; }
        /// <summary>Send PTS frame metadata so the client may record properly.</summary>
        [JsonPropertyName("sendFrameMeta")]
        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        public bool? SendFrameMeta { get; set; }
        /// <summary>Enable the control channel (input injection).</summary>
        [JsonPropertyName("control")]
        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        public bool? Control { get; set; }
        /// <summary>The display id to capture.</summary>
        [JsonPropertyName("displayId")]
        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        public int? DisplayId { get; set; }
        /// <summary>Show touch points on the device while mirroring.</summary>
        [JsonPropertyName("showTouches")]
        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        public bool? ShowTouches { get; set; }
        /// <summary>Keep the device awake while mirroring (when plugged in).</summary>
        [JsonPropertyName("stayAwake")]
        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        public bool? StayAwake { get; set; }
        /// <summary>Low-level codec options string (legacy alias; see <see cref="ScrcpyCodecOptions"/>).</summary>
        [JsonPropertyName("codecOptions")]
        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        public string? CodecOptions { get; set; }
        /// <summary>The encoder name (legacy alias of <see cref="VideoEncoder"/>).</summary>
        [JsonPropertyName("encoderName")]
        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        public string? EncoderName { get; set; }

        // --- 2.0+ ---
        /// <summary>The scrcpy server instance id string (see <see cref="ScrcpyInstanceId"/>).</summary>
        [JsonPropertyName("scid")]
        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        public string? Scid { get; set; }
        /// <summary>The video codec: "h264", "h265" or "av1".</summary>
        [JsonPropertyName("videoCodec")]
        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        public string? VideoCodec { get; set; }
        /// <summary>The video bit rate in bits per second.</summary>
        [JsonPropertyName("videoBitRate")]
        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        public int? VideoBitRate { get; set; }
        /// <summary>The video codec options string (see <see cref="ScrcpyCodecOptions"/>).</summary>
        [JsonPropertyName("videoCodecOptions")]
        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        public string? VideoCodecOptions { get; set; }
        /// <summary>The video encoder name.</summary>
        [JsonPropertyName("videoEncoder")]
        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        public string? VideoEncoder { get; set; }
        /// <summary>Enable audio capture.</summary>
        [JsonPropertyName("audio")]
        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        public bool? Audio { get; set; }
        /// <summary>The audio codec: "raw", "opus" or "aac".</summary>
        [JsonPropertyName("audioCodec")]
        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        public string? AudioCodec { get; set; }
        /// <summary>The audio bit rate in bits per second.</summary>
        [JsonPropertyName("audioBitRate")]
        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        public int? AudioBitRate { get; set; }
        /// <summary>The audio codec options string (see <see cref="ScrcpyCodecOptions"/>).</summary>
        [JsonPropertyName("audioCodecOptions")]
        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        public string? AudioCodecOptions { get; set; }
        /// <summary>The audio encoder name.</summary>
        [JsonPropertyName("audioEncoder")]
        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        public string? AudioEncoder { get; set; }
        /// <summary>List the available encoders (instead of mirroring).</summary>
        [JsonPropertyName("listEncoders")]
        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        public bool? ListEncoders { get; set; }
        /// <summary>List the available displays (instead of mirroring).</summary>
        [JsonPropertyName("listDisplays")]
        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        public bool? ListDisplays { get; set; }
        /// <summary>Send codec metadata.</summary>
        [JsonPropertyName("sendCodecMeta")]
        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        public bool? SendCodecMeta { get; set; }
        /// <summary>The audio source: "output", "mic", etc.</summary>
        [JsonPropertyName("audioSource")]
        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        public string? AudioSource { get; set; }
        /// <summary>The video source: "display" or "camera".</summary>
        [JsonPropertyName("videoSource")]
        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        public string? VideoSource { get; set; }
        /// <summary>Enable video capture.</summary>
        [JsonPropertyName("video")]
        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        public bool? Video { get; set; }
        /// <summary>Duplicate audio output instead of capturing it exclusively.</summary>
        [JsonPropertyName("audioDup")]
        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        public bool? AudioDup { get; set; }
        /// <summary>The camera id (when <see cref="VideoSource"/> is "camera").</summary>
        [JsonPropertyName("cameraId")]
        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        public string? CameraId { get; set; }
        /// <summary>The camera capture size.</summary>
        [JsonPropertyName("cameraSize")]
        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        public string? CameraSize { get; set; }
        /// <summary>The camera facing: "front", "back" or "external".</summary>
        [JsonPropertyName("cameraFacing")]
        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        public string? CameraFacing { get; set; }
        /// <summary>The camera aspect ratio.</summary>
        [JsonPropertyName("cameraAr")]
        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        public string? CameraAr { get; set; }
        /// <summary>The camera frame rate.</summary>
        [JsonPropertyName("cameraFps")]
        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        public int? CameraFps { get; set; }
        /// <summary>Use the camera high speed capture mode.</summary>
        [JsonPropertyName("cameraHighSpeed")]
        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        public bool? CameraHighSpeed { get; set; }
        /// <summary>List the available cameras.</summary>
        [JsonPropertyName("listCameras")]
        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        public bool? ListCameras { get; set; }
        /// <summary>List the available camera sizes.</summary>
        [JsonPropertyName("listCameraSizes")]
        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        public bool? ListCameraSizes { get; set; }
        /// <summary>Turn the device screen on at startup.</summary>
        [JsonPropertyName("powerOn")]
        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        public bool? PowerOn { get; set; }
        /// <summary>Clean up the device side when the session ends.</summary>
        [JsonPropertyName("cleanup")]
        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        public bool? Cleanup { get; set; }
        /// <summary>Downsize the resolution automatically on encoder error.</summary>
        [JsonPropertyName("downsizeOnError")]
        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        public bool? DownsizeOnError { get; set; }
        /// <summary>Send device metadata.</summary>
        [JsonPropertyName("sendDeviceMeta")]
        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        public bool? SendDeviceMeta { get; set; }
        /// <summary>Send a dummy byte to trigger the connection.</summary>
        [JsonPropertyName("sendDummyByte")]
        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        public bool? SendDummyByte { get; set; }
        /// <summary>Automatically synchronize the clipboard.</summary>
        [JsonPropertyName("clipboardAutosync")]
        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        public bool? ClipboardAutosync { get; set; }
        /// <summary>Power the device off when the session closes.</summary>
        [JsonPropertyName("powerOffOnClose")]
        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        public bool? PowerOffOnClose { get; set; }

        // --- 3.x ---
        /// <summary>The display IME policy.</summary>
        [JsonPropertyName("displayImePolicy")]
        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        public string? DisplayImePolicy { get; set; }
        /// <summary>Destroy the virtual display content when the session ends.</summary>
        [JsonPropertyName("vdDestroyContent")]
        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        public bool? VdDestroyContent { get; set; }
        /// <summary>The locked capture orientation string (see <see cref="ScrcpyCaptureOrientation"/>).</summary>
        [JsonPropertyName("captureOrientation")]
        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        public string? CaptureOrientation { get; set; }
        /// <summary>A rotation angle (degrees) applied to the captured video.</summary>
        [JsonPropertyName("angle")]
        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        public int? Angle { get; set; }
        /// <summary>Turn the screen off after the given timeout (seconds).</summary>
        [JsonPropertyName("screenOffTimeout")]
        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        public int? ScreenOffTimeout { get; set; }
        /// <summary>List the installed apps (instead of mirroring).</summary>
        [JsonPropertyName("listApps")]
        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        public bool? ListApps { get; set; }
        /// <summary>Create a new virtual display string (see <see cref="ScrcpyNewDisplay"/>).</summary>
        [JsonPropertyName("newDisplay")]
        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        public string? NewDisplay { get; set; }
        /// <summary>Keep the virtual display system decorations.</summary>
        [JsonPropertyName("vdSystemDecorations")]
        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        public bool? VdSystemDecorations { get; set; }
    }

    /// <summary>
    /// The latest scrcpy option set (currently <c>ScrcpyOptions3_3_3</c> =&gt; <c>ScrcpyOptions3_3_1</c>).
    /// Mirrors <c>ScrcpyOptionsLatest</c>. Construct from a <see cref="ScrcpyOptionsInit"/> and pass it
    /// to the adb-scrcpy client to start a mirroring session.
    /// </summary>
    public class ScrcpyOptionsLatest : SpawnJSObject
    {
        /// <summary>Deserialization constructor.</summary>
        public ScrcpyOptionsLatest(SpawnJSObjectReference _ref) : base(_ref) { }
        /// <summary>Creates the latest scrcpy options from the given initializer.</summary>
        public ScrcpyOptionsLatest(ScrcpyOptionsInit init) : base(JS.New("TangoADB.Scrcpy.ScrcpyOptionsLatest", init)) { }

        /// <summary>The fully-resolved option values (defaults merged with the supplied init).</summary>
        public SpawnJSObject Value => JSRef!.Get<SpawnJSObject>("value");
        /// <summary>The control message types supported by this option set, in numeric form.</summary>
        public int[] ControlMessageTypes => JSRef!.Get<int[]>("controlMessageTypes") ?? System.Array.Empty<int>();
        /// <summary>A stream of clipboard contents from the device, when clipboard autosync is enabled.</summary>
        public ReadableStream? Clipboard => JSRef!.Get<ReadableStream?>("clipboard");

        /// <summary>Serializes the options to the scrcpy server command-line arguments.</summary>
        public string[] Serialize() => JSRef!.Call<string[]>("serialize") ?? System.Array.Empty<string>();
        /// <summary>Switches the options into "list displays" mode.</summary>
        public void SetListDisplays() => JSRef!.CallVoid("setListDisplays");
        /// <summary>Switches the options into "list encoders" mode.</summary>
        public void SetListEncoders() => JSRef!.CallVoid("setListEncoders");
        /// <summary>Parses a single "list displays" output line, or null if it is not a display line.</summary>
        public ScrcpyDisplay? ParseDisplay(string line) => JSRef!.Call<string, ScrcpyDisplay?>("parseDisplay", line);
        /// <summary>Parses a single "list encoders" output line, or null if it is not an encoder line.</summary>
        public ScrcpyEncoder? ParseEncoder(string line) => JSRef!.Call<string, ScrcpyEncoder?>("parseEncoder", line);

        // Note: serialize*ControlMessage / parse*StreamMetadata / createMediaStreamTransformer /
        // createScrollController operate on @yume-chan/struct internals and live streams and are
        // driven by the adb-scrcpy client; they are intentionally not wrapped here.
    }
}
