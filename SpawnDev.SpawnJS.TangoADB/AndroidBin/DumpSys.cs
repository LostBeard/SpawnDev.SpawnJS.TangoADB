
using SpawnDev.SpawnJS;

namespace SpawnDev.SpawnJS.TangoADB
{
    /// <summary>Battery charging status (<c>dumpsys battery</c>).</summary>
    public enum DumpSysBatteryStatus
    {
        /// <summary>Unknown.</summary>
        Unknown = 1,
        /// <summary>Charging.</summary>
        Charging = 2,
        /// <summary>Discharging.</summary>
        Discharging = 3,
        /// <summary>Not charging.</summary>
        NotCharging = 4,
        /// <summary>Full.</summary>
        Full = 5,
    }

    /// <summary>Battery health (<c>dumpsys battery</c>).</summary>
    public enum DumpSysBatteryHealth
    {
        /// <summary>Unknown.</summary>
        Unknown = 1,
        /// <summary>Good.</summary>
        Good = 2,
        /// <summary>Overheated.</summary>
        Overheat = 3,
        /// <summary>Dead.</summary>
        Dead = 4,
        /// <summary>Over-voltage.</summary>
        OverVoltage = 5,
        /// <summary>Unspecified failure.</summary>
        UnspecifiedFailure = 6,
        /// <summary>Too cold.</summary>
        Cold = 7,
    }

    /// <summary>Disk usage totals returned by <see cref="DumpSys.DiskStats"/>. Each value may be undefined (null).</summary>
    public class DumpSysDiskStats : SpawnJSObject
    {
        /// <summary>Deserialization constructor.</summary>
        public DumpSysDiskStats(SpawnJSObjectReference _ref) : base(_ref) { }
        /// <summary>Free bytes on the data partition.</summary>
        public long? DataFree => JSRef!.Get<long?>("dataFree");
        /// <summary>Total bytes on the data partition.</summary>
        public long? DataTotal => JSRef!.Get<long?>("dataTotal");
        /// <summary>Free bytes on the cache partition.</summary>
        public long? CacheFree => JSRef!.Get<long?>("cacheFree");
        /// <summary>Total bytes on the cache partition.</summary>
        public long? CacheTotal => JSRef!.Get<long?>("cacheTotal");
        /// <summary>Free bytes on the system partition.</summary>
        public long? SystemFree => JSRef!.Get<long?>("systemFree");
        /// <summary>Total bytes on the system partition.</summary>
        public long? SystemTotal => JSRef!.Get<long?>("systemTotal");
    }

    /// <summary>Battery information returned by <see cref="DumpSys.Battery"/>.</summary>
    public class DumpSysBatteryInfo : SpawnJSObject
    {
        /// <summary>Deserialization constructor.</summary>
        public DumpSysBatteryInfo(SpawnJSObjectReference _ref) : base(_ref) { }
        /// <summary>Powered via AC.</summary>
        public bool AcPowered => JSRef!.Get<bool>("acPowered");
        /// <summary>Powered via USB.</summary>
        public bool UsbPowered => JSRef!.Get<bool>("usbPowered");
        /// <summary>Powered wirelessly.</summary>
        public bool WirelessPowered => JSRef!.Get<bool>("wirelessPowered");
        /// <summary>Powered via a dock.</summary>
        public bool DockPowered => JSRef!.Get<bool>("dockPowered");
        /// <summary>Maximum charging current (microamps), if reported.</summary>
        public long? MaxChargingCurrent => JSRef!.Get<long?>("maxChargingCurrent");
        /// <summary>Maximum charging voltage (microvolts), if reported.</summary>
        public long? MaxChargingVoltage => JSRef!.Get<long?>("maxChargingVoltage");
        /// <summary>Charge counter (microamp-hours), if reported.</summary>
        public long? ChargeCounter => JSRef!.Get<long?>("chargeCounter");
        /// <summary>Charging status.</summary>
        public DumpSysBatteryStatus Status => (DumpSysBatteryStatus)JSRef!.Get<int>("status");
        /// <summary>Battery health.</summary>
        public DumpSysBatteryHealth Health => (DumpSysBatteryHealth)JSRef!.Get<int>("health");
        /// <summary>Whether a battery is present, if reported.</summary>
        public bool? Present => JSRef!.Get<bool?>("present");
        /// <summary>Battery level (against <see cref="Scale"/>), if reported.</summary>
        public int? Level => JSRef!.Get<int?>("level");
        /// <summary>Battery level scale (e.g. 100), if reported.</summary>
        public int? Scale => JSRef!.Get<int?>("scale");
        /// <summary>Battery voltage (millivolts), if reported.</summary>
        public int? Voltage => JSRef!.Get<int?>("voltage");
        /// <summary>Battery temperature (tenths of a degree C), if reported.</summary>
        public int? Temperature => JSRef!.Get<int?>("temperature");
        /// <summary>Battery technology string, if reported.</summary>
        public string? Technology => JSRef!.Get<string?>("technology");
        /// <summary>Instantaneous current (microamps), if reported.</summary>
        public int? Current => JSRef!.Get<int?>("current");
    }

    /// <summary>
    /// Queries <c>dumpsys</c> services (battery, disk stats). Construct from an <see cref="Adb"/>.
    /// Wraps <c>DumpSys</c> from @yume-chan/android-bin. Namespaced under <c>TangoADB.AndroidBin</c>.
    /// </summary>
    public class DumpSys : AdbServiceBase
    {
        /// <summary>Deserialization constructor.</summary>
        public DumpSys(SpawnJSObjectReference _ref) : base(_ref) { }
        /// <summary>Creates a dumpsys service bound to the given device.</summary>
        public DumpSys(Adb adb) : base(JS.New("TangoADB.AndroidBin.DumpSys", adb)) { }

        /// <summary>Returns free/total bytes for the data, cache and system partitions.</summary>
        public Task<DumpSysDiskStats> DiskStats() => JSRef!.CallAsync<DumpSysDiskStats>("diskStats");
        /// <summary>Returns the device's battery information.</summary>
        public Task<DumpSysBatteryInfo> Battery() => JSRef!.CallAsync<DumpSysBatteryInfo>("battery");
    }
}
