

namespace SpawnDev.SpawnJS.TangoADB
{
    /// <summary>
    /// Device power / reboot commands. Reached via <see cref="Adb.Power"/>.
    /// Wraps <c>AdbPower</c> from @yume-chan/adb.
    /// </summary>
    public class AdbPower : AdbServiceBase
    {
        /// <summary>Deserialization constructor.</summary>
        public AdbPower(SpawnJSObjectReference _ref) : base(_ref) { }
        /// <summary>Reboots the device. Optional <paramref name="mode"/> e.g. "recovery", "bootloader".</summary>
        public Task<string> Reboot(string? mode = null) => mode == null ? JSRef!.CallAsync<string>("reboot") : JSRef!.CallAsync<string, string>("reboot", mode);
        /// <summary>Reboots to the bootloader.</summary>
        public Task<string> Bootloader() => JSRef!.CallAsync<string>("bootloader");
        /// <summary>Reboots to fastboot.</summary>
        public Task<string> Fastboot() => JSRef!.CallAsync<string>("fastboot");
        /// <summary>Reboots to recovery.</summary>
        public Task<string> Recovery() => JSRef!.CallAsync<string>("recovery");
        /// <summary>Reboots to sideload.</summary>
        public Task<string> Sideload() => JSRef!.CallAsync<string>("sideload");
        /// <summary>Reboots to Qualcomm EDL mode (some Qualcomm devices only).</summary>
        public Task<string> QualcommEdlMode() => JSRef!.CallAsync<string>("qualcommEdlMode");
        /// <summary>Powers the device off.</summary>
        public Task<string> PowerOff() => JSRef!.CallAsync<string>("powerOff");
        /// <summary>Simulates a power button press. <paramref name="longPress"/> for a long press.</summary>
        public Task<string> PowerButton(bool longPress = false) => JSRef!.CallAsync<bool, string>("powerButton", longPress);
        /// <summary>Reboots to Samsung Odin download mode (Samsung devices only).</summary>
        public Task<string> SamsungOdin() => JSRef!.CallAsync<string>("samsungOdin");
    }
}
