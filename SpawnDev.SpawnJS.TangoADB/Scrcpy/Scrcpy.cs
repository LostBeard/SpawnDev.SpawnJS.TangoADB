using SpawnDev.SpawnJS;

namespace SpawnDev.SpawnJS.TangoADB
{
    /// <summary>
    /// Shared constants and helpers for the scrcpy package (<c>@yume-chan/scrcpy</c>, exposed as
    /// the JS namespace <c>TangoADB.Scrcpy</c>). The version-specific option classes are wrapped by
    /// <see cref="ScrcpyOptionsLatest"/>; input injection by <see cref="ScrcpyControlMessageWriter"/>.
    /// </summary>
    public static class Scrcpy
    {
        /// <summary>
        /// The default on-device path the scrcpy server jar is pushed to
        /// (<c>/data/local/tmp/scrcpy-server.jar</c>). Mirrors <c>DefaultServerPath</c>.
        /// </summary>
        public static string DefaultServerPath
            => SpawnJSRuntime.Instance.TypeOf("TangoADB.Scrcpy.DefaultServerPath") == "undefined"
                ? "/data/local/tmp/scrcpy-server.jar"
                : SpawnJSRuntime.Instance.Get<string>("TangoADB.Scrcpy.DefaultServerPath");
    }
}
