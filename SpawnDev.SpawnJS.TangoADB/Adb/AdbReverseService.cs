
using SpawnDev.SpawnJS;

namespace SpawnDev.SpawnJS.TangoADB
{
    /// <summary>A single reverse port-forward entry returned by <see cref="AdbReverseService.List"/>.</summary>
    public class AdbForwardListener : SpawnJSObject
    {
        /// <summary>Deserialization constructor.</summary>
        public AdbForwardListener(SpawnJSObjectReference _ref) : base(_ref) { }
        /// <summary>The device serial.</summary>
        public string DeviceSerial => JSRef!.Get<string>("deviceSerial");
        /// <summary>The local (client) address.</summary>
        public string LocalName => JSRef!.Get<string>("localName");
        /// <summary>The remote (device) address.</summary>
        public string RemoteName => JSRef!.Get<string>("remoteName");
    }

    /// <summary>
    /// Reverse port forwarding (device -&gt; client). Reached via <see cref="Adb.Reverse"/>.
    /// Wraps <c>AdbReverseService</c> from @yume-chan/adb.
    /// </summary>
    public class AdbReverseService : AdbServiceBase
    {
        /// <summary>Deserialization constructor.</summary>
        public AdbReverseService(SpawnJSObjectReference _ref) : base(_ref) { }
        /// <summary>Lists all reverse port forwards on the device.</summary>
        public Task<AdbForwardListener[]> List() => JSRef!.CallAsync<AdbForwardListener[]>("list");
        /// <summary>Adds a reverse forward for a program already listening on a port.</summary>
        public Task<string> AddExternal(string deviceAddress, string localAddress) => JSRef!.CallAsync<string, string, string>("addExternal", deviceAddress, localAddress);
        /// <summary>Removes a reverse port forward.</summary>
        public Task Remove(string deviceAddress) => JSRef!.CallVoidAsync("remove", deviceAddress);
        /// <summary>Removes all reverse port forwards (including those added by other programs).</summary>
        public Task RemoveAll() => JSRef!.CallVoidAsync("removeAll");
    }
}
