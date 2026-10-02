using System.Text.Json.Serialization;

using SpawnDev.SpawnJS;
using SpawnDev.SpawnJS.JSObjects;

namespace SpawnDev.SpawnJS.TangoADB
{
    /// <summary>Where an installed package may live (<c>--install-location</c>).</summary>
    public enum PackageManagerInstallLocation
    {
        /// <summary>Let the system decide.</summary>
        Auto = 0,
        /// <summary>Internal storage only.</summary>
        InternalOnly = 1,
        /// <summary>Prefer external storage.</summary>
        PreferExternal = 2,
    }

    /// <summary>Why a package is being installed (<c>--install-reason</c>).</summary>
    public enum PackageManagerInstallReason
    {
        /// <summary>No reason given.</summary>
        Unknown = 0,
        /// <summary>Installed by an admin policy.</summary>
        AdminPolicy = 1,
        /// <summary>Restored from a device backup.</summary>
        DeviceRestore = 2,
        /// <summary>Installed during device setup.</summary>
        DeviceSetup = 3,
        /// <summary>Installed at the user's request.</summary>
        UserRequest = 4,
    }

    /// <summary>
    /// A subset of <c>pm install</c> flags. All optional; only set ones are sent. Property names
    /// match the JS option keys. (The full flag set is large - the common flags are exposed here.)
    /// </summary>
    public class PackageManagerInstallOptions
    {
        /// <summary><c>-R</c> skip if already installed.</summary>
        [JsonPropertyName("skipExisting")] [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)] public bool? SkipExisting { get; set; }
        /// <summary><c>-t</c> allow test APKs.</summary>
        [JsonPropertyName("allowTest")] [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)] public bool? AllowTest { get; set; }
        /// <summary><c>-d</c> allow version downgrade.</summary>
        [JsonPropertyName("requestDowngrade")] [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)] public bool? RequestDowngrade { get; set; }
        /// <summary><c>-g</c> grant all runtime permissions.</summary>
        [JsonPropertyName("grantRuntimePermissions")] [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)] public bool? GrantRuntimePermissions { get; set; }
        /// <summary><c>-f</c> install to internal storage.</summary>
        [JsonPropertyName("internalStorage")] [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)] public bool? InternalStorage { get; set; }
        /// <summary><c>-i</c> the installer package name to record.</summary>
        [JsonPropertyName("installerPackageName")] [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)] public string? InstallerPackageName { get; set; }
        /// <summary><c>--pkg</c> expected package name.</summary>
        [JsonPropertyName("packageName")] [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)] public string? PackageName { get; set; }
        /// <summary><c>--bypass-low-target-sdk-block</c>.</summary>
        [JsonPropertyName("bypassLowTargetSdkBlock")] [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)] public bool? BypassLowTargetSdkBlock { get; set; }
    }

    /// <summary>Options for <see cref="PackageManager.Uninstall"/>.</summary>
    public class PackageManagerUninstallOptions
    {
        /// <summary><c>-k</c> keep the data and cache directories.</summary>
        [JsonPropertyName("keepData")] [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)] public bool? KeepData { get; set; }
        /// <summary>Specific version code to remove.</summary>
        [JsonPropertyName("versionCode")] [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)] public int? VersionCode { get; set; }
    }

    /// <summary>
    /// The Android package manager (<c>pm</c> / <c>cmd package</c>) - install and uninstall apps.
    /// Construct from an <see cref="Adb"/>. Namespaced under <c>TangoADB.AndroidBin</c>.
    /// Wraps <c>PackageManager</c> from @yume-chan/android-bin.
    /// </summary>
    public class PackageManager : AdbServiceBase
    {
        /// <summary>Deserialization constructor.</summary>
        public PackageManager(SpawnJSObjectReference _ref) : base(_ref) { }
        /// <summary>Creates a package manager bound to the given device.</summary>
        public PackageManager(Adb adb) : base(JS.New("TangoADB.AndroidBin.PackageManager", adb)) { }

        /// <summary>Installs one or more APK files that already exist on the device. Returns the pm output.</summary>
        public Task<string> Install(string[] apks, PackageManagerInstallOptions? options = null)
            => options == null ? JSRef!.CallAsync<string[], string>("install", apks) : JSRef!.CallAsync<string[], PackageManagerInstallOptions, string>("install", apks, options);

        /// <summary>
        /// Streams an APK's bytes to the device and installs it - the path for installing a
        /// browser-side file (e.g. <c>file.stream()</c>). Returns the pm output.
        /// </summary>
        public Task<string> PushAndInstallStream(ReadableStream stream, PackageManagerInstallOptions? options = null)
            => options == null ? JSRef!.CallAsync<ReadableStream, string>("pushAndInstallStream", stream) : JSRef!.CallAsync<ReadableStream, PackageManagerInstallOptions, string>("pushAndInstallStream", stream, options);

        /// <summary>Installs a single APK from a sized byte stream (lower-level than <see cref="PushAndInstallStream"/>).</summary>
        public Task InstallStream(long size, ReadableStream stream, PackageManagerInstallOptions? options = null)
            => options == null ? JSRef!.CallVoidAsync("installStream", size, stream) : JSRef!.CallVoidAsync("installStream", size, stream, options);

        /// <summary>Returns the on-device source APK paths for a package.</summary>
        public Task<string[]> GetPackageSources(string packageName) => JSRef!.CallAsync<string, string[]>("getPackageSources", packageName);

        /// <summary>Uninstalls a package.</summary>
        public Task Uninstall(string packageName, PackageManagerUninstallOptions? options = null)
            => options == null ? JSRef!.CallVoidAsync("uninstall", packageName) : JSRef!.CallVoidAsync("uninstall", packageName, options);

        /// <summary>Creates a new multi-split install session and returns its id.</summary>
        public Task<int> SessionCreate(PackageManagerInstallOptions? options = null)
            => options == null ? JSRef!.CallAsync<int>("sessionCreate") : JSRef!.CallAsync<PackageManagerInstallOptions, int>("sessionCreate", options);
        /// <summary>Adds a split APK (already on device) to an install session.</summary>
        public Task SessionAddSplit(int sessionId, string splitName, string path) => JSRef!.CallVoidAsync("sessionAddSplit", sessionId, splitName, path);
        /// <summary>Adds a split APK from a sized byte stream to an install session.</summary>
        public Task SessionAddSplitStream(int sessionId, string splitName, long size, ReadableStream stream) => JSRef!.CallVoidAsync("sessionAddSplitStream", sessionId, splitName, size, stream);
        /// <summary>Commits (finalizes) an install session.</summary>
        public Task SessionCommit(int sessionId) => JSRef!.CallVoidAsync("sessionCommit", sessionId);
        /// <summary>Abandons an install session.</summary>
        public Task SessionAbandon(int sessionId) => JSRef!.CallVoidAsync("sessionAbandon", sessionId);

        // Note: the JS listPackages(options) returns an AsyncGenerator. To list packages from C#,
        // run `adb.Subprocess.NoneProtocol.SpawnWaitText("pm list packages -3")` and split lines,
        // or use the session/install APIs above. A generator wrapper may be added later.
    }
}
