
using SpawnDev.SpawnJS;

namespace SpawnDev.SpawnJS.TangoADB
{
    /// <summary>Result of <see cref="AdbTcpIpService.GetListenAddresses"/>.</summary>
    public class AdbTcpIpListenAddresses : SpawnJSObject
    {
        /// <summary>Deserialization constructor.</summary>
        public AdbTcpIpListenAddresses(SpawnJSObjectReference _ref) : base(_ref) { }
        /// <summary><c>service.adb.listen_addrs</c> values.</summary>
        public string[] ServiceListenAddresses => JSRef!.Get<string[]>("serviceListenAddresses") ?? Array.Empty<string>();
        /// <summary><c>service.adb.tcp.port</c>, if set.</summary>
        public int? ServicePort => JSRef!.Get<int?>("servicePort");
        /// <summary><c>persist.adb.tcp.port</c>, if set.</summary>
        public int? PersistPort => JSRef!.Get<int?>("persistPort");
    }

    /// <summary>
    /// ADB-over-WiFi (TCP/IP) configuration. Reached via <see cref="Adb.TcpIp"/>.
    /// Wraps <c>AdbTcpIpService</c> from @yume-chan/adb.
    /// </summary>
    public class AdbTcpIpService : AdbServiceBase
    {
        /// <summary>Deserialization constructor.</summary>
        public AdbTcpIpService(SpawnJSObjectReference _ref) : base(_ref) { }
        /// <summary>Reads the device's current ADB listen addresses/ports.</summary>
        public Task<AdbTcpIpListenAddresses> GetListenAddresses() => JSRef!.CallAsync<AdbTcpIpListenAddresses>("getListenAddresses");
        /// <summary>Enables ADB over WiFi on the given TCP port.</summary>
        public Task<string> SetPort(int port) => JSRef!.CallAsync<int, string>("setPort", port);
        /// <summary>Disables ADB over WiFi.</summary>
        public Task<string> Disable() => JSRef!.CallAsync<string>("disable");
    }
}
