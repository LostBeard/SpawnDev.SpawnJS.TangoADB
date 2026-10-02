using System.Text.Json.Serialization;

using SpawnDev.SpawnJS;

namespace SpawnDev.SpawnJS.TangoADB
{
    /// <summary>Options for <see cref="ActivityManager.StartActivity"/>.</summary>
    public class ActivityManagerStartActivityOptions
    {
        /// <summary>The display to start the activity on (<c>--display</c>).</summary>
        [JsonPropertyName("displayId")] [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)] public int? DisplayId { get; set; }
        /// <summary>The windowing mode (<c>--windowingMode</c>).</summary>
        [JsonPropertyName("windowingMode")] [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)] public int? WindowingMode { get; set; }
        /// <summary>Force-stop the target app before starting (<c>-S</c>).</summary>
        [JsonPropertyName("forceStop")] [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)] public bool? ForceStop { get; set; }
        /// <summary>
        /// The user to start as (<c>--user</c>). A user id (<see cref="int"/>) or the string <c>"current"</c>
        /// (the JS <c>SingleUser</c> union).
        /// </summary>
        [JsonPropertyName("user")] [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)] public object? User { get; set; }
        /// <summary>The intent to start (required). Build one with <see cref="IntentBuilder"/>.</summary>
        [JsonPropertyName("intent")] public IntentBuilder? Intent { get; set; }
    }

    /// <summary>
    /// The Android activity manager (<c>am</c>) - start activities. Construct from an <see cref="Adb"/>.
    /// Wraps <c>ActivityManager</c> from @yume-chan/android-bin. Namespaced under <c>TangoADB.AndroidBin</c>.
    /// </summary>
    public class ActivityManager : AdbServiceBase
    {
        /// <summary>Deserialization constructor.</summary>
        public ActivityManager(SpawnJSObjectReference _ref) : base(_ref) { }
        /// <summary>Creates an activity manager bound to the given device.</summary>
        public ActivityManager(Adb adb) : base(JS.New("TangoADB.AndroidBin.ActivityManager", adb)) { }

        /// <summary>Starts an activity described by the given options (which must include an <see cref="IntentBuilder"/>).</summary>
        public Task StartActivity(ActivityManagerStartActivityOptions options) => JSRef!.CallVoidAsync("startActivity", options);
    }
}
