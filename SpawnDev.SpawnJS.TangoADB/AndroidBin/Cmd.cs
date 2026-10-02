
using SpawnDev.SpawnJS;

namespace SpawnDev.SpawnJS.TangoADB
{
    /// <summary>
    /// The "none" (legacy) protocol variant of the <c>cmd</c> / <c>abb_exec</c> runner. Reached via
    /// <see cref="Cmd.NoneProtocol"/>. Wraps <c>CmdNoneProtocolService</c> (an <c>AdbNoneProtocolSpawner</c>)
    /// from @yume-chan/android-bin.
    /// </summary>
    public class CmdNoneProtocolService : SpawnJSObject
    {
        /// <summary>Deserialization constructor.</summary>
        public CmdNoneProtocolService(SpawnJSObjectReference _ref) : base(_ref) { }
        /// <summary>True if the device supports <c>abb_exec</c>.</summary>
        public bool SupportsAbbExec => JSRef!.Get<bool>("supportsAbbExec");
        /// <summary>True if the device supports the <c>cmd</c> binary.</summary>
        public bool SupportsCmd => JSRef!.Get<bool>("supportsCmd");
        /// <summary>True if any backing mechanism is supported.</summary>
        public bool IsSupported => JSRef!.Get<bool>("isSupported");
    }

    /// <summary>
    /// The shell v2 protocol variant of the <c>cmd</c> / <c>abb</c> runner. Reached via
    /// <see cref="Cmd.ShellProtocol"/>. Wraps <c>CmdShellProtocolService</c> (an <c>AdbShellProtocolSpawner</c>)
    /// from @yume-chan/android-bin.
    /// </summary>
    public class CmdShellProtocolService : SpawnJSObject
    {
        /// <summary>Deserialization constructor.</summary>
        public CmdShellProtocolService(SpawnJSObjectReference _ref) : base(_ref) { }
        /// <summary>True if the device supports the <c>cmd</c> binary.</summary>
        public bool SupportsCmd => JSRef!.Get<bool>("supportsCmd");
        /// <summary>True if the device supports <c>abb</c>.</summary>
        public bool SupportsAbb => JSRef!.Get<bool>("supportsAbb");
        /// <summary>True if any backing mechanism is supported.</summary>
        public bool IsSupported => JSRef!.Get<bool>("isSupported");
    }

    /// <summary>
    /// Runs framework commands via <c>cmd</c> / <c>abb</c> / <c>abb_exec</c> (faster than spawning a full
    /// shell). Construct from an <see cref="Adb"/>. Wraps <c>Cmd</c> from @yume-chan/android-bin.
    /// Namespaced under <c>TangoADB.AndroidBin</c>.
    /// </summary>
    public class Cmd : AdbServiceBase
    {
        /// <summary>Deserialization constructor.</summary>
        public Cmd(SpawnJSObjectReference _ref) : base(_ref) { }
        /// <summary>Creates a cmd runner bound to the given device.</summary>
        public Cmd(Adb adb) : base(JS.New("TangoADB.AndroidBin.Cmd", adb)) { }
        /// <summary>Creates a cmd runner bound to the given device, with a fallback shell-command prefix.</summary>
        public Cmd(Adb adb, string fallback) : base(JS.New("TangoADB.AndroidBin.Cmd", adb, fallback)) { }

        /// <summary>The "none" (legacy) protocol runner, or null if unavailable.</summary>
        public CmdNoneProtocolService? NoneProtocol => JSRef!.Get<CmdNoneProtocolService?>("noneProtocol");
        /// <summary>The shell v2 protocol runner, or null if unavailable.</summary>
        public CmdShellProtocolService? ShellProtocol => JSRef!.Get<CmdShellProtocolService?>("shellProtocol");
    }
}
