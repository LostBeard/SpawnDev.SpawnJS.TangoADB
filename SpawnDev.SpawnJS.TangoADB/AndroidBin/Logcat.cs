using System.Text.Json.Serialization;

using SpawnDev.SpawnJS;
using SpawnDev.SpawnJS.JSObjects;

namespace SpawnDev.SpawnJS.TangoADB
{
    /// <summary>Android log buffer ids (<c>logcat -b</c>).</summary>
    public enum LogId
    {
        /// <summary>All buffers.</summary>
        All = -1,
        /// <summary>Main buffer.</summary>
        Main = 0,
        /// <summary>Radio buffer.</summary>
        Radio = 1,
        /// <summary>Events buffer.</summary>
        Events = 2,
        /// <summary>System buffer.</summary>
        System = 3,
        /// <summary>Crash buffer.</summary>
        Crash = 4,
        /// <summary>Stats buffer.</summary>
        Stats = 5,
        /// <summary>Security buffer.</summary>
        Security = 6,
        /// <summary>Kernel buffer.</summary>
        Kernel = 7,
    }

    /// <summary>Android log priority levels.</summary>
    public enum AndroidLogPriority
    {
        /// <summary>Unknown.</summary>
        Unknown = 0,
        /// <summary>Default.</summary>
        Default = 1,
        /// <summary>Verbose.</summary>
        Verbose = 2,
        /// <summary>Debug.</summary>
        Debug = 3,
        /// <summary>Info.</summary>
        Info = 4,
        /// <summary>Warn.</summary>
        Warn = 5,
        /// <summary>Error.</summary>
        Error = 6,
        /// <summary>Fatal.</summary>
        Fatal = 7,
        /// <summary>Silent.</summary>
        Silent = 8,
    }

    /// <summary>Logcat output formats (<c>logcat -v</c>).</summary>
    public enum LogcatFormat
    {
        /// <summary>Brief.</summary>
        Brief = 0,
        /// <summary>Process.</summary>
        Process = 1,
        /// <summary>Tag.</summary>
        Tag = 2,
        /// <summary>Thread.</summary>
        Thread = 3,
        /// <summary>Raw.</summary>
        Raw = 4,
        /// <summary>Time.</summary>
        Time = 5,
        /// <summary>ThreadTime.</summary>
        ThreadTime = 6,
        /// <summary>Long.</summary>
        Long = 7,
    }

    /// <summary>Format modifiers for <see cref="LogcatFormat"/> rendering.</summary>
    public class LogcatFormatModifiers
    {
        /// <summary>Show microseconds.</summary>
        [JsonPropertyName("microseconds")] [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)] public bool? Microseconds { get; set; }
        /// <summary>Show nanoseconds.</summary>
        [JsonPropertyName("nanoseconds")] [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)] public bool? Nanoseconds { get; set; }
        /// <summary>Show the year.</summary>
        [JsonPropertyName("year")] [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)] public bool? Year { get; set; }
        /// <summary>Show the timezone.</summary>
        [JsonPropertyName("timezone")] [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)] public bool? Timezone { get; set; }
        /// <summary>Show epoch time.</summary>
        [JsonPropertyName("epoch")] [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)] public bool? Epoch { get; set; }
        /// <summary>Show monotonic time.</summary>
        [JsonPropertyName("monotonic")] [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)] public bool? Monotonic { get; set; }
        /// <summary>Show the uid.</summary>
        [JsonPropertyName("uid")] [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)] public bool? Uid { get; set; }
    }

    /// <summary>Options for <see cref="Logcat.Binary"/>.</summary>
    public class LogcatOptions
    {
        /// <summary>Dump the log and exit (<c>-d</c>) rather than streaming.</summary>
        [JsonPropertyName("dump")] [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)] public bool? Dump { get; set; }
        /// <summary>Only show logs from this pid.</summary>
        [JsonPropertyName("pid")] [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)] public int? Pid { get; set; }
        /// <summary>The buffers to read (defaults to the device default).</summary>
        [JsonPropertyName("ids")] [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)] public LogId[]? Ids { get; set; }
        /// <summary>
        /// Start point: a line count (<see cref="int"/>) or a <c>Date</c> (the JS <c>number | Date</c>
        /// union). Pass an <see cref="int"/> for a tail count.
        /// </summary>
        [JsonPropertyName("tail")] [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)] public object? Tail { get; set; }
    }

    /// <summary>A single buffer's size info returned by <see cref="Logcat.GetLogSize"/>.</summary>
    public class LogSize : SpawnJSObject
    {
        /// <summary>Deserialization constructor.</summary>
        public LogSize(SpawnJSObjectReference _ref) : base(_ref) { }
        /// <summary>The buffer id.</summary>
        public LogId Id => (LogId)JSRef!.Get<int>("id");
        /// <summary>The buffer size in bytes.</summary>
        public long Size => JSRef!.Get<long>("size");
        /// <summary>Readable bytes, if reported.</summary>
        public long? Readable => JSRef!.Get<long?>("readable");
        /// <summary>Bytes consumed.</summary>
        public long Consumed => JSRef!.Get<long>("consumed");
        /// <summary>Maximum entry size.</summary>
        public long MaxEntrySize => JSRef!.Get<long>("maxEntrySize");
        /// <summary>Maximum payload size.</summary>
        public long MaxPayloadSize => JSRef!.Get<long>("maxPayloadSize");
    }

    /// <summary>
    /// Reads the device log (<c>logcat</c>). Construct from an <see cref="Adb"/>. Wraps <c>Logcat</c>
    /// from @yume-chan/android-bin. Namespaced under <c>TangoADB.AndroidBin</c>.
    /// </summary>
    public class Logcat : AdbServiceBase
    {
        /// <summary>Deserialization constructor.</summary>
        public Logcat(SpawnJSObjectReference _ref) : base(_ref) { }
        /// <summary>Creates a logcat reader bound to the given device.</summary>
        public Logcat(Adb adb) : base(JS.New("TangoADB.AndroidBin.Logcat", adb)) { }

        // LogId crosses as its numeric value, which is what logcat's helpers take.
        static int[] ToInts(LogId[] ids)
        {
            var ret = new int[ids.Length];
            for (var i = 0; i < ids.Length; i++) ret[i] = (int)ids[i];
            return ret;
        }

        /// <summary>Returns the buffer name for a log id.</summary>
        public static string LogIdToName(LogId id) => JS.Call<int, string>("TangoADB.AndroidBin.Logcat.logIdToName", (int)id);
        /// <summary>Returns the log id for a buffer name.</summary>
        public static LogId LogNameToId(string name) => (LogId)JS.Call<string, int>("TangoADB.AndroidBin.Logcat.logNameToId", name);
        /// <summary>Joins multiple log ids into the comma-separated form logcat expects.</summary>
        public static string JoinLogId(LogId[] ids) => JS.Call<int[], string>("TangoADB.AndroidBin.Logcat.joinLogId", ToInts(ids));
        /// <summary>Parses a size value with its unit multiplier into bytes.</summary>
        public static long ParseSize(long value, string multiplier) => JS.Call<long, string, long>("TangoADB.AndroidBin.Logcat.parseSize", value, multiplier);

        /// <summary>Returns the size info for the given buffers (or all by default).</summary>
        public Task<LogSize[]> GetLogSize(LogId[]? ids = null)
            => ids == null ? JSRef!.CallAsync<LogSize[]>("getLogSize") : JSRef!.CallAsync<int[], LogSize[]>("getLogSize", ToInts(ids));
        /// <summary>Clears the given buffers (or all by default).</summary>
        public Task Clear(LogId[]? ids = null)
            => ids == null ? JSRef!.CallVoidAsync("clear") : JSRef!.CallVoidAsync("clear", ToInts(ids));
        /// <summary>
        /// Opens the binary log stream. Returns a <c>ReadableStream</c> of <c>AndroidLogEntry</c> struct
        /// values (the entry struct itself is not wrapped - read the stream and parse on the JS side, or
        /// consume the raw chunks).
        /// </summary>
        public ReadableStream Binary(LogcatOptions? options = null)
            => options == null ? JSRef!.Call<ReadableStream>("binary") : JSRef!.Call<LogcatOptions, ReadableStream>("binary", options);

        // Note: the free function deserializeAndroidLogEntry(stream) and the AndroidLogEntry / LoggerEntry
        // shapes come from @yume-chan/struct (internal Struct<>/NumberField<> types) and are not wrapped.
    }
}
