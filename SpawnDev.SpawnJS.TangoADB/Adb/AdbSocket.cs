
using SpawnDev.SpawnJS;
using SpawnDev.SpawnJS.JSObjects;

namespace SpawnDev.SpawnJS.TangoADB
{
    /// <summary>
    /// A multiplexed ADB socket to a device service. Implements the WHATWG
    /// <c>ReadableWritablePair&lt;Uint8Array, ...&gt;</c> shape plus <c>service</c>/<c>closed</c>.
    /// Wraps <c>AdbSocket</c> from @yume-chan/adb.
    /// </summary>
    public class AdbSocket : SpawnJSObject
    {
        /// <summary>Deserialization constructor.</summary>
        public AdbSocket(SpawnJSObjectReference _ref) : base(_ref) { }
        /// <summary>The service string this socket was opened for.</summary>
        public string Service => JSRef!.Get<string>("service");
        /// <summary>The readable half (device -&gt; client).</summary>
        public ReadableStream Readable => JSRef!.Get<ReadableStream>("readable");
        /// <summary>The writable half (client -&gt; device).</summary>
        public WritableStream Writable => JSRef!.Get<WritableStream>("writable");
        /// <summary>Closes the socket.</summary>
        public Task Close() => JSRef!.CallVoidAsync("close");
    }
}
