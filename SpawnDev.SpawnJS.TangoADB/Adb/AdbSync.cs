using System.Numerics;
using System.Text.Json.Serialization;

using SpawnDev.SpawnJS;
using SpawnDev.SpawnJS.JSObjects;

namespace SpawnDev.SpawnJS.TangoADB
{
    /// <summary>Linux file type codes used by the sync stat results.</summary>
    public enum LinuxFileType
    {
        /// <summary>Directory.</summary>
        Directory = 4,
        /// <summary>Regular file.</summary>
        File = 8,
        /// <summary>Symbolic link.</summary>
        Link = 10,
    }

    /// <summary>
    /// Metadata for a file or directory on the device. Wraps the <c>AdbSyncStat</c> shape.
    /// Note: <see cref="Size"/>/<see cref="Mtime"/> are 64-bit (the v2 stat returns BigInt).
    /// </summary>
    public class AdbSyncStat : SpawnJSObject
    {
        /// <summary>Deserialization constructor.</summary>
        public AdbSyncStat(SpawnJSObjectReference _ref) : base(_ref) { }
        /// <summary>The raw mode bits.</summary>
        public int Mode => JSRef!.Get<int>("mode");
        /// <summary>The file size in bytes. The v2 stat (Android 11+) returns a JS BigInt and the v1 stat a number;
        /// both read through <see cref="BigInteger"/>, which the runtime takes from the value's decimal string.</summary>
        public long Size => (long)JSRef!.Get<BigInteger>("size");
        /// <summary>The modification time (unix seconds). A JS BigInt on the v2 stat, a number on v1.</summary>
        public long Mtime => (long)JSRef!.Get<BigInteger>("mtime");
        /// <summary>The file type.</summary>
        public LinuxFileType Type => (LinuxFileType)JSRef!.Get<int>("type");
        /// <summary>The permission bits.</summary>
        public int Permission => JSRef!.Get<int>("permission");
    }

    /// <summary>An entry returned by <see cref="AdbSync.Readdir"/> - a stat plus a name.</summary>
    public class AdbSyncEntry : AdbSyncStat
    {
        /// <summary>Deserialization constructor.</summary>
        public AdbSyncEntry(SpawnJSObjectReference _ref) : base(_ref) { }
        /// <summary>The entry name (not the full path).</summary>
        public string Name => JSRef!.Get<string>("name");
    }

    /// <summary>Options for <see cref="AdbSync.Write"/>. <c>File</c> is a live readable byte stream.</summary>
    public class AdbSyncWriteOptions
    {
        /// <summary>The full destination path on the device.</summary>
        [JsonPropertyName("filename")]
        public string Filename { get; set; } = "";
        /// <summary>The file content (a <c>ReadableStream&lt;Uint8Array&gt;</c>).</summary>
        [JsonPropertyName("file")]
        public SpawnJSObject? File { get; set; }
        /// <summary>The Linux file type (defaults to a regular file).</summary>
        [JsonPropertyName("type")]
        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        public int? Type { get; set; }
        /// <summary>The permission bits (e.g. 0o644).</summary>
        [JsonPropertyName("permission")]
        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        public int? Permission { get; set; }
        /// <summary>The modification time (unix seconds).</summary>
        [JsonPropertyName("mtime")]
        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        public long? Mtime { get; set; }
        /// <summary>When true, do not actually write (dry run).</summary>
        [JsonPropertyName("dryRun")]
        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        public bool? DryRun { get; set; }
    }

    /// <summary>
    /// File transfer over the ADB sync service (push/pull/list/stat). Obtain via <see cref="Adb.Sync"/>;
    /// call <see cref="Release"/> when finished. Wraps <c>AdbSync</c> from @yume-chan/adb.
    /// </summary>
    public class AdbSync : SpawnJSObject
    {
        /// <summary>Deserialization constructor.</summary>
        public AdbSync(SpawnJSObjectReference _ref) : base(_ref) { }
        /// <summary>True if the device supports the v2 stat (full metadata).</summary>
        public bool SupportsStat => JSRef!.Get<bool>("supportsStat");
        /// <summary>True if the device supports the v2 directory listing.</summary>
        public bool SupportsListV2 => JSRef!.Get<bool>("supportsListV2");
        /// <summary>True if push creates parent directories.</summary>
        public bool FixedPushMkdir => JSRef!.Get<bool>("fixedPushMkdir");
        /// <summary>True if the device supports the v2 send/receive.</summary>
        public bool SupportsSendReceiveV2 => JSRef!.Get<bool>("supportsSendReceiveV2");
        /// <summary>Stats a path without following symlinks.</summary>
        public Task<AdbSyncStat> Lstat(string path) => JSRef!.CallAsync<string, AdbSyncStat>("lstat", path);
        /// <summary>Stats a path, following symlinks.</summary>
        public Task<AdbSyncStat> Stat(string path) => JSRef!.CallAsync<string, AdbSyncStat>("stat", path);
        /// <summary>Returns true if the path is (or links to) a directory.</summary>
        public Task<bool> IsDirectory(string path) => JSRef!.CallAsync<string, bool>("isDirectory", path);
        /// <summary>Lists the entries of a directory.</summary>
        public Task<AdbSyncEntry[]> Readdir(string path) => JSRef!.CallAsync<string, AdbSyncEntry[]>("readdir", path);
        /// <summary>Opens a readable byte stream of a file on the device (pull).</summary>
        public ReadableStream Read(string filename) => JSRef!.Call<string, ReadableStream>("read", filename);
        /// <summary>Writes a file to the device (push), overwriting if it exists.</summary>
        public Task Write(AdbSyncWriteOptions options) => JSRef!.CallVoidAsync("write", options);
        /// <summary>Releases the sync session on the device (the JS <c>dispose()</c>; distinct from <see cref="SpawnJSObject.Dispose()"/>).</summary>
        public Task Release() => JSRef!.CallVoidAsync("dispose");
    }
}
