
using SpawnDev.SpawnJS;
using SpawnDev.SpawnJS.JSObjects;

namespace SpawnDev.SpawnJS.TangoADB
{
    /// <summary>
    /// A running subprocess started with the "none" (legacy) protocol - stdout and stderr are merged.
    /// Wraps <c>AdbNoneProtocolProcess</c> from @yume-chan/adb.
    /// </summary>
    public class AdbNoneProtocolProcess : SpawnJSObject
    {
        /// <summary>Deserialization constructor.</summary>
        public AdbNoneProtocolProcess(SpawnJSObjectReference _ref) : base(_ref) { }
        /// <summary>The process stdin (client -&gt; process).</summary>
        public WritableStream Stdin => JSRef!.Get<WritableStream>("stdin");
        /// <summary>Merged stdout + stderr (process -&gt; client).</summary>
        public ReadableStream Output => JSRef!.Get<ReadableStream>("output");
        /// <summary>A task that completes when the process exits.</summary>
        public Task Exited => JSRef!.GetVoidAsync("exited");
        /// <summary>Kills the process.</summary>
        public Task Kill() => JSRef!.CallVoidAsync("kill");
    }

    /// <summary>
    /// Spawns subprocesses using the "none" (legacy) protocol. Reached via
    /// <see cref="AdbSubprocessService.NoneProtocol"/>. Wraps <c>AdbNoneProtocolSubprocessService</c>.
    /// </summary>
    public class AdbNoneProtocolSubprocessService : SpawnJSObject
    {
        /// <summary>Deserialization constructor.</summary>
        public AdbNoneProtocolSubprocessService(SpawnJSObjectReference _ref) : base(_ref) { }
        /// <summary>Spawns a command (as a single command line).</summary>
        public Task<AdbNoneProtocolProcess> Spawn(string command) => JSRef!.CallAsync<string, AdbNoneProtocolProcess>("spawn", command);
        /// <summary>Spawns a command (as argv).</summary>
        public Task<AdbNoneProtocolProcess> Spawn(string[] command) => JSRef!.CallAsync<string[], AdbNoneProtocolProcess>("spawn", command);
        /// <summary>Runs a command to completion and returns the merged output bytes.</summary>
        public Task<Uint8Array> SpawnWait(string command) => JSRef!.CallAsync<string, Uint8Array>("spawnWait", command);
        /// <summary>Runs a command to completion and returns the merged output as text.</summary>
        public Task<string> SpawnWaitText(string command) => JSRef!.CallAsync<string, string>("spawnWaitText", command);
        /// <summary>Opens an interactive pseudo-terminal.</summary>
        public Task<SpawnJSObject> Pty(string? command = null) => command == null ? JSRef!.CallAsync<SpawnJSObject>("pty") : JSRef!.CallAsync<string, SpawnJSObject>("pty", command);
    }

    /// <summary>
    /// Spawns subprocesses using the shell v2 protocol (separate stdout/stderr, exit codes).
    /// Reached via <see cref="AdbSubprocessService.ShellProtocol"/> when supported.
    /// Wraps <c>AdbShellProtocolSubprocessService</c>.
    /// </summary>
    public class AdbShellProtocolSubprocessService : SpawnJSObject
    {
        /// <summary>Deserialization constructor.</summary>
        public AdbShellProtocolSubprocessService(SpawnJSObjectReference _ref) : base(_ref) { }
        /// <summary>True if the device supports the shell v2 protocol.</summary>
        public bool IsSupported => JSRef!.Get<bool>("isSupported");
        /// <summary>Spawns a command (as a single command line).</summary>
        public Task<SpawnJSObject> Spawn(string command) => JSRef!.CallAsync<string, SpawnJSObject>("spawn", command);
        /// <summary>Spawns a command (as argv).</summary>
        public Task<SpawnJSObject> Spawn(string[] command) => JSRef!.CallAsync<string[], SpawnJSObject>("spawn", command);
        /// <summary>Runs a command to completion and returns the output bytes.</summary>
        public Task<Uint8Array> SpawnWait(string command) => JSRef!.CallAsync<string, Uint8Array>("spawnWait", command);
        /// <summary>Runs a command to completion and returns the output as text.</summary>
        public Task<string> SpawnWaitText(string command) => JSRef!.CallAsync<string, string>("spawnWaitText", command);
    }

    /// <summary>
    /// Subprocess service. Reached via <see cref="Adb.Subprocess"/>. Exposes the legacy
    /// (<see cref="NoneProtocol"/>) and shell v2 (<see cref="ShellProtocol"/>) spawners.
    /// Wraps <c>AdbSubprocessService</c> from @yume-chan/adb.
    /// </summary>
    public class AdbSubprocessService : SpawnJSObject
    {
        /// <summary>Deserialization constructor.</summary>
        public AdbSubprocessService(SpawnJSObjectReference _ref) : base(_ref) { }
        /// <summary>The legacy "none" protocol spawner (always available).</summary>
        public AdbNoneProtocolSubprocessService NoneProtocol => JSRef!.Get<AdbNoneProtocolSubprocessService>("noneProtocol");
        /// <summary>The shell v2 protocol spawner, or null if the device doesn't support it.</summary>
        public AdbShellProtocolSubprocessService? ShellProtocol => JSRef!.Get<AdbShellProtocolSubprocessService?>("shellProtocol");
    }
}
