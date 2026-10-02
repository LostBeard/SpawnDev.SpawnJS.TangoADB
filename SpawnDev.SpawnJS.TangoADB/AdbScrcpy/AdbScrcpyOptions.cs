using System.Text.Json.Serialization;

using SpawnDev.SpawnJS;

namespace SpawnDev.SpawnJS.TangoADB
{
    /// <summary>
    /// Client-side options for an <see cref="AdbScrcpyOptionsLatest"/> (the scrcpy server version
    /// to target and an optional process spawner). Mirrors <c>AdbScrcpyClientOptions</c>.
    /// </summary>
    public class AdbScrcpyClientOptions
    {
        /// <summary>The scrcpy server version string (must match the pushed server jar).</summary>
        [JsonPropertyName("version")]
        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        public string? Version { get; set; }
        /// <summary>An optional <c>AdbNoneProtocolSpawner</c> used to launch the server process.</summary>
        [JsonPropertyName("spawner")]
        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        public SpawnJSObject? Spawner { get; set; }
    }

    /// <summary>
    /// The latest adb-scrcpy options (currently the 3.3.3 server protocol) - the friendly alias from
    /// adb-scrcpy's <c>latest.js</c>. Prefer this over the version-pinned option classes.
    /// Pass the resulting instance to <see cref="AdbScrcpyClient.Start"/>.
    /// <para>
    /// The init bag is the shared scrcpy <see cref="ScrcpyOptionsInit"/> (adb-scrcpy's latest options
    /// extend the scrcpy 3.3.3 options). Value-object fields (crop / codec options / capture
    /// orientation / new display / scid) take their string form there.
    /// </para>
    /// Wraps <c>AdbScrcpyOptionsLatest</c> from @yume-chan/adb-scrcpy.
    /// </summary>
    public class AdbScrcpyOptionsLatest : SpawnJSObject
    {
        /// <summary>Deserialization constructor.</summary>
        public AdbScrcpyOptionsLatest(SpawnJSObjectReference _ref) : base(_ref) { }

        /// <summary>Creates the options from a scrcpy init bag.</summary>
        public AdbScrcpyOptionsLatest(ScrcpyOptionsInit init)
            : base(JS.New("TangoADB.AdbScrcpy.AdbScrcpyOptionsLatest", init)) { }

        /// <summary>Creates the options from a scrcpy init bag plus client options (server version etc.).</summary>
        public AdbScrcpyOptionsLatest(ScrcpyOptionsInit init, AdbScrcpyClientOptions clientOptions)
            : base(JS.New("TangoADB.AdbScrcpy.AdbScrcpyOptionsLatest", init, clientOptions)) { }

        /// <summary>The scrcpy server version these options target.</summary>
        public string Version => JSRef!.Get<string>("version");
    }
}
