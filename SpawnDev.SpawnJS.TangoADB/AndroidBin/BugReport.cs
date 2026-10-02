using System.Text.Json.Serialization;

using SpawnDev.SpawnJS;
using SpawnDev.SpawnJS.JSObjects;

namespace SpawnDev.SpawnJS.TangoADB
{
    /// <summary>
    /// The device's bugreport capabilities. Passed to the <see cref="BugReport"/> constructor, or read
    /// from its properties (which mirror these fields).
    /// </summary>
    public class BugReportCapabilities
    {
        /// <summary>Whether the device supports flat (text file, non-zipped) bugreport (Android &lt;= 11).</summary>
        [JsonPropertyName("supportsBugReport")] public bool SupportsBugReport { get; set; }
        /// <summary>The BugReportZ version, or null if zipped bugreport is unsupported.</summary>
        [JsonPropertyName("bugReportZVersion")] [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)] public string? BugReportZVersion { get; set; }
        /// <summary>Whether the device supports zipped bugreport (Android &gt;= 7).</summary>
        [JsonPropertyName("supportsBugReportZ")] public bool SupportsBugReportZ { get; set; }
        /// <summary>Whether the device supports progress reporting for zipped bugreport (Android &gt;= 8).</summary>
        [JsonPropertyName("supportsBugReportZProgress")] public bool SupportsBugReportZProgress { get; set; }
        /// <summary>Whether the device supports streaming zipped bugreport (Android &gt;= 12).</summary>
        [JsonPropertyName("supportsBugReportZStream")] public bool SupportsBugReportZStream { get; set; }
    }

    /// <summary>
    /// Options for <see cref="BugReport.BugReportZ"/>.
    /// Note: the JS <c>onProgress</c> callback is not exposed here (a JS callback is not expressible in a
    /// plain-data options object). Specifying <c>onProgress</c> is only valid when
    /// <see cref="BugReport.SupportsBugReportZProgress"/> is true.
    /// </summary>
    public class BugReportZOptions
    {
        /// <summary>An optional <c>AbortSignal</c> to cancel the operation.</summary>
        [JsonPropertyName("signal")] [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)] public SpawnJSObject? Signal { get; set; }
    }

    /// <summary>The result of <see cref="BugReport.Automatic"/> - the chosen report type plus its byte stream.</summary>
    public class BugReportAutomaticResult : SpawnJSObject
    {
        /// <summary>Deserialization constructor.</summary>
        public BugReportAutomaticResult(SpawnJSObjectReference _ref) : base(_ref) { }
        /// <summary>Either <c>"bugreport"</c> (flat) or <c>"bugreportz"</c> (zipped).</summary>
        public string Type => JSRef!.Get<string>("type");
        /// <summary>The bugreport content as a readable byte stream.</summary>
        public ReadableStream Stream => JSRef!.Get<ReadableStream>("stream");
    }

    /// <summary>
    /// Device bug report (<c>bugreport</c> / <c>bugreportz</c>). Typically obtained via
    /// <see cref="QueryCapabilities"/>. Wraps <c>BugReport</c> from @yume-chan/android-bin.
    /// Namespaced under <c>TangoADB.AndroidBin</c>.
    /// </summary>
    public class BugReport : AdbServiceBase
    {
        /// <summary>Deserialization constructor.</summary>
        public BugReport(SpawnJSObjectReference _ref) : base(_ref) { }
        /// <summary>Creates a bug report service from already-queried capabilities (prefer <see cref="QueryCapabilities"/>).</summary>
        public BugReport(Adb adb, BugReportCapabilities capabilities) : base(JS.New("TangoADB.AndroidBin.BugReport", adb, capabilities)) { }

        /// <summary>Queries the device's bugreport capabilities and returns a ready-to-use <see cref="BugReport"/>.</summary>
        public static Task<BugReport> QueryCapabilities(Adb adb) => JS.CallAsync<Adb, BugReport>("TangoADB.AndroidBin.BugReport.queryCapabilities", adb);

        /// <summary>Whether the device supports flat (text file, non-zipped) bugreport (Android &lt;= 11).</summary>
        public bool SupportsBugReport => JSRef!.Get<bool>("supportsBugReport");
        /// <summary>The BugReportZ version, or null if zipped bugreport is unsupported.</summary>
        public string? BugReportZVersion => JSRef!.Get<string?>("bugReportZVersion");
        /// <summary>Whether the device supports zipped bugreport (Android &gt;= 7).</summary>
        public bool SupportsBugReportZ => JSRef!.Get<bool>("supportsBugReportZ");
        /// <summary>Whether the device supports progress reporting for zipped bugreport (Android &gt;= 8).</summary>
        public bool SupportsBugReportZProgress => JSRef!.Get<bool>("supportsBugReportZProgress");
        /// <summary>Whether the device supports streaming zipped bugreport (Android &gt;= 12).</summary>
        public bool SupportsBugReportZStream => JSRef!.Get<bool>("supportsBugReportZStream");

        /// <summary>
        /// Creates a flat (text file, non-zipped) bugreport, or throws if <see cref="SupportsBugReport"/> is false.
        /// Returns the report as a readable byte stream.
        /// </summary>
        public ReadableStream BugReportFlat() => JSRef!.Call<ReadableStream>("bugReport");
        /// <summary>
        /// Creates a zipped bugreport file on the device and returns its on-device path (pull it later via
        /// sync). Throws if <see cref="SupportsBugReportZ"/> is false.
        /// </summary>
        public Task<string> BugReportZ(BugReportZOptions? options = null)
            => options == null ? JSRef!.CallAsync<string>("bugReportZ") : JSRef!.CallAsync<BugReportZOptions, string>("bugReportZ", options);
        /// <summary>
        /// Creates a zipped bugreport and returns its content as a readable byte stream, or throws if
        /// <see cref="SupportsBugReportZStream"/> is false.
        /// </summary>
        public ReadableStream BugReportZStream() => JSRef!.Call<ReadableStream>("bugReportZStream");
        /// <summary>
        /// Automatically chooses the best available bugreport method and returns the type plus a byte stream.
        /// Note: the JS <c>onProgress</c> callback parameter is not exposed.
        /// </summary>
        public BugReportAutomaticResult Automatic() => JSRef!.Call<BugReportAutomaticResult>("automatic");
    }
}
