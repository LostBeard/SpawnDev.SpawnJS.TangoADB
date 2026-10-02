using System.Text.Json.Serialization;

using SpawnDev.SpawnJS;
using SpawnDev.SpawnJS.JSObjects;

namespace SpawnDev.SpawnJS.TangoADB
{
    /// <summary>Options for <see cref="AdbBackup.Backup"/> (<c>bu backup</c>).</summary>
    public class AdbBackupOptions
    {
        /// <summary>The user to back up.</summary>
        [JsonPropertyName("user")] public int User { get; set; }
        /// <summary>Include shared/external storage (<c>-shared</c>).</summary>
        [JsonPropertyName("saveSharedStorage")] [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)] public bool? SaveSharedStorage { get; set; }
        /// <summary>Include app widgets.</summary>
        [JsonPropertyName("saveWidgets")] [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)] public bool? SaveWidgets { get; set; }
        /// <summary>
        /// Which packages to back up: a package-name array, or the string <c>"user"</c> (all user apps)
        /// or <c>"all"</c> (every app). Pass a <see cref="string"/>[] or a <see cref="string"/>.
        /// </summary>
        [JsonPropertyName("packages")] public object? Packages { get; set; }
        /// <summary>Include each package's APK (<c>-apk</c>).</summary>
        [JsonPropertyName("savePackageApk")] public bool SavePackageApk { get; set; }
        /// <summary>Include each package's OBB files (<c>-obb</c>).</summary>
        [JsonPropertyName("savePackageObb")] public bool SavePackageObb { get; set; }
        /// <summary>Include each package's key/value data.</summary>
        [JsonPropertyName("savePackageKeyValue")] public bool SavePackageKeyValue { get; set; }
        /// <summary>Compress the backup archive (<c>-compress</c>).</summary>
        [JsonPropertyName("compress")] public bool Compress { get; set; }
    }

    /// <summary>Options for <see cref="AdbBackup.Restore"/> (<c>bu restore</c>).</summary>
    public class AdbRestoreOptions
    {
        /// <summary>The user to restore into.</summary>
        [JsonPropertyName("user")] public int User { get; set; }
        /// <summary>The backup archive bytes (a <c>ReadableStream&lt;Uint8Array&gt;</c>).</summary>
        [JsonPropertyName("file")] public ReadableStream? File { get; set; }
    }

    /// <summary>
    /// Device backup / restore (<c>bu</c>). Construct from an <see cref="Adb"/>. The user must confirm
    /// the operation on the device within 60 seconds. Wraps <c>AdbBackup</c> from @yume-chan/android-bin.
    /// Namespaced under <c>TangoADB.AndroidBin</c>.
    /// </summary>
    public class AdbBackup : AdbServiceBase
    {
        /// <summary>Deserialization constructor.</summary>
        public AdbBackup(SpawnJSObjectReference _ref) : base(_ref) { }
        /// <summary>Creates a backup service bound to the given device.</summary>
        public AdbBackup(Adb adb) : base(JS.New("TangoADB.AndroidBin.AdbBackup", adb)) { }

        /// <summary>
        /// Starts a backup. The user must confirm on the device within 60 seconds. Returns a readable
        /// byte stream of the backup archive.
        /// </summary>
        public Task<ReadableStream> Backup(AdbBackupOptions options) => JSRef!.CallAsync<AdbBackupOptions, ReadableStream>("backup", options);
        /// <summary>
        /// Restores a backup archive. The user must enter the password (if any) and confirm on the
        /// device within 60 seconds. Returns the command output.
        /// </summary>
        public Task<string> Restore(AdbRestoreOptions options) => JSRef!.CallAsync<AdbRestoreOptions, string>("restore", options);
    }
}
