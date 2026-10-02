
using SpawnDev.SpawnJS;
using SpawnDev.SpawnJS.JSObjects;

namespace SpawnDev.SpawnJS.TangoADB
{
    /// <summary>
    /// A WebUSB-connected ADB device returned by <see cref="AdbDaemonWebUsbDeviceManager"/>.
    /// Call <see cref="Connect"/> to open a connection, then authenticate it into a transport.
    /// Wraps <c>AdbDaemonWebUsbDevice</c> from @yume-chan/adb-daemon-webusb.
    /// </summary>
    public class AdbDaemonWebUsbDevice : SpawnJSObject
    {
        /// <summary>Deserialization constructor.</summary>
        public AdbDaemonWebUsbDevice(SpawnJSObjectReference _ref) : base(_ref) { }
        /// <summary>The underlying WebUSB <c>USBDevice</c>.</summary>
        public USBDevice Raw => JSRef!.Get<USBDevice>("raw");
        /// <summary>The device serial number.</summary>
        public string Serial => JSRef!.Get<string>("serial");
        /// <summary>A human-readable device name.</summary>
        public string Name => JSRef!.Get<string>("name");
        /// <summary>Opens the device and creates a connection to the ADB daemon.</summary>
        public Task<AdbDaemonWebUsbConnection> Connect() => JSRef!.CallAsync<AdbDaemonWebUsbConnection>("connect");
    }

    /// <summary>
    /// An open WebUSB connection to a device's ADB daemon. Pass it as
    /// <see cref="AdbDaemonAuthenticationOptions.Connection"/>.
    /// Wraps <c>AdbDaemonWebUsbConnection</c> from @yume-chan/adb-daemon-webusb.
    /// </summary>
    public class AdbDaemonWebUsbConnection : SpawnJSObject
    {
        /// <summary>Deserialization constructor.</summary>
        public AdbDaemonWebUsbConnection(SpawnJSObjectReference _ref) : base(_ref) { }
        /// <summary>The device this connection belongs to.</summary>
        public AdbDaemonWebUsbDevice Device => JSRef!.Get<AdbDaemonWebUsbDevice>("device");
        /// <summary>The USB IN endpoint (device -&gt; host).</summary>
        public USBEndpoint InEndpoint => JSRef!.Get<USBEndpoint>("inEndpoint");
        /// <summary>The USB OUT endpoint (host -&gt; device).</summary>
        public USBEndpoint OutEndpoint => JSRef!.Get<USBEndpoint>("outEndpoint");
        /// <summary>The readable half (incoming ADB packets).</summary>
        public ReadableStream Readable => JSRef!.Get<ReadableStream>("readable");
        /// <summary>The writable half (outgoing ADB packets).</summary>
        public WritableStream Writable => JSRef!.Get<WritableStream>("writable");
    }
}
