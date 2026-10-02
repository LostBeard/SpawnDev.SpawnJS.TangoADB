using System.Collections.Generic;
using System.Text.Json.Serialization;

using SpawnDev.SpawnJS;

namespace SpawnDev.SpawnJS.TangoADB
{
    /// <summary>
    /// The settings namespace argument (the JS <c>SettingsNamespace</c> string union). Pass one of these
    /// constants to the <see cref="Settings"/> methods.
    /// </summary>
    public static class SettingsNamespace
    {
        /// <summary>The <c>system</c> namespace.</summary>
        public const string System = "system";
        /// <summary>The <c>secure</c> namespace.</summary>
        public const string Secure = "secure";
        /// <summary>The <c>global</c> namespace.</summary>
        public const string Global = "global";
    }

    /// <summary>
    /// Reset modes for <see cref="Settings.Reset(string, string, SettingsOptions?)"/> (the JS
    /// <c>SettingsResetMode</c> string union). Pass one of these constants.
    /// </summary>
    public static class SettingsResetMode
    {
        /// <summary>Reset untrusted settings to their defaults.</summary>
        public const string UntrustedDefaults = "untrusted_defaults";
        /// <summary>Clear untrusted settings.</summary>
        public const string UntrustedClear = "untrusted_clear";
        /// <summary>Reset trusted settings to their defaults.</summary>
        public const string TrustedDefaults = "trusted_defaults";
    }

    /// <summary>Common options for the <see cref="Settings"/> commands.</summary>
    public class SettingsOptions
    {
        /// <summary>
        /// The target user (<c>--user</c>). A user id (<see cref="int"/>) or the string <c>"current"</c>
        /// (the JS <c>SingleUser</c> union).
        /// </summary>
        [JsonPropertyName("user")] [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)] public object? User { get; set; }
    }

    /// <summary>Options for <see cref="Settings.Put"/>.</summary>
    public class SettingsPutOptions : SettingsOptions
    {
        /// <summary>An optional tag to associate with the setting.</summary>
        [JsonPropertyName("tag")] [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)] public string? Tag { get; set; }
        /// <summary>Make this the default value (<c>--default</c>).</summary>
        [JsonPropertyName("makeDefault")] [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)] public bool? MakeDefault { get; set; }
    }

    /// <summary>
    /// Reads and writes Android settings (<c>settings</c>). Construct from an <see cref="Adb"/>. Use the
    /// <see cref="SettingsNamespace"/> constants for the namespace argument. Wraps <c>Settings</c> from
    /// @yume-chan/android-bin. Namespaced under <c>TangoADB.AndroidBin</c>.
    /// </summary>
    public class Settings : AdbServiceBase
    {
        /// <summary>Deserialization constructor.</summary>
        public Settings(SpawnJSObjectReference _ref) : base(_ref) { }
        /// <summary>Creates a settings service bound to the given device.</summary>
        public Settings(Adb adb) : base(JS.New("TangoADB.AndroidBin.Settings", adb)) { }

        /// <summary>
        /// Runs a low-level <c>settings</c> verb with arbitrary trailing arguments and returns the output.
        /// </summary>
        public Task<string> Base(string verb, string ns, SettingsOptions? options, params string[] args)
        {
            var all = new List<object?> { verb, ns, options };
            foreach (var a in args) all.Add(a);
            return JSRef!.CallApplyAsync<string>("base", all.ToArray());
        }
        /// <summary>Gets a setting value.</summary>
        public Task<string> Get(string ns, string key, SettingsOptions? options = null)
            => options == null ? JSRef!.CallAsync<string, string, string>("get", ns, key) : JSRef!.CallAsync<string, string, SettingsOptions, string>("get", ns, key, options);
        /// <summary>Deletes a setting.</summary>
        public Task Delete(string ns, string key, SettingsOptions? options = null)
            => options == null ? JSRef!.CallVoidAsync("delete", ns, key) : JSRef!.CallVoidAsync("delete", ns, key, options);
        /// <summary>Sets a setting value.</summary>
        public Task Put(string ns, string key, string value, SettingsPutOptions? options = null)
            => options == null ? JSRef!.CallVoidAsync("put", ns, key, value) : JSRef!.CallVoidAsync("put", ns, key, value, options);
        /// <summary>Resets settings using a <see cref="SettingsResetMode"/> constant.</summary>
        public Task Reset(string ns, string mode, SettingsOptions? options = null)
            => options == null ? JSRef!.CallVoidAsync("reset", ns, mode) : JSRef!.CallVoidAsync("reset", ns, mode, options);
        /// <summary>Resets settings owned by a specific package (optionally a single tag).</summary>
        public Task Reset(string ns, string packageName, string? tag, SettingsOptions? options = null)
            => options == null ? JSRef!.CallVoidAsync("reset", ns, packageName, tag!) : JSRef!.CallVoidAsync("reset", ns, packageName, tag!, options);
    }
}
