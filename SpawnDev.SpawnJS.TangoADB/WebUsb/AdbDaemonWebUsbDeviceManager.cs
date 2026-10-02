using System.Text.Json.Serialization;

using SpawnDev.SpawnJS;

namespace SpawnDev.SpawnJS.TangoADB
{
    /// <summary>Options for the WebUSB device chooser / enumeration. Filters are WebUSB
    /// <c>USBDeviceFilter</c> objects (e.g. <c>new { vendorId = 0x18d1 }</c>).</summary>
    public class AdbDaemonWebUsbRequestDeviceOptions
    {
        /// <summary>Device filters. Tango always also applies the default ADB interface filter.</summary>
        [JsonPropertyName("filters")]
        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        public object[]? Filters { get; set; }
        /// <summary>Filters of devices to exclude from the chooser.</summary>
        [JsonPropertyName("exclusionFilters")]
        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        public object[]? ExclusionFilters { get; set; }
    }

    /// <summary>
    /// Enumerates and requests ADB devices over WebUSB. Get the browser-backed instance from
    /// <see cref="Browser"/>. Wraps <c>AdbDaemonWebUsbDeviceManager</c> from @yume-chan/adb-daemon-webusb.
    /// </summary>
    public class AdbDaemonWebUsbDeviceManager : SpawnJSObject
    {
        /// <summary>Deserialization constructor.</summary>
        public AdbDaemonWebUsbDeviceManager(SpawnJSObjectReference _ref) : base(_ref) { }

        /// <summary>
        /// The browser WebUSB-backed manager, or null if the current runtime has no WebUSB.
        /// Requires <see cref="Tango.Init"/> to have run.
        /// </summary>
        public static AdbDaemonWebUsbDeviceManager? Browser
            => JS.TypeOf("TangoADB.AdbDaemonWebUsbDeviceManager.BROWSER") == "undefined"
                ? null
                : JS.Get<AdbDaemonWebUsbDeviceManager>("TangoADB.AdbDaemonWebUsbDeviceManager.BROWSER");

        /// <summary>Prompts the user to pick a device (the browser USB chooser). Returns null if cancelled.</summary>
        public Task<AdbDaemonWebUsbDevice?> RequestDevice(AdbDaemonWebUsbRequestDeviceOptions? options = null)
            => options == null
                ? JSRef!.CallAsync<AdbDaemonWebUsbDevice?>("requestDevice")
                : JSRef!.CallAsync<AdbDaemonWebUsbRequestDeviceOptions, AdbDaemonWebUsbDevice?>("requestDevice", options);

        /// <summary>Returns the already-permitted devices matching the filters.</summary>
        public Task<AdbDaemonWebUsbDevice[]> GetDevices(AdbDaemonWebUsbRequestDeviceOptions? options = null)
            => options == null
                ? JSRef!.CallAsync<AdbDaemonWebUsbDevice[]>("getDevices")
                : JSRef!.CallAsync<AdbDaemonWebUsbRequestDeviceOptions, AdbDaemonWebUsbDevice[]>("getDevices", options);

        /// <summary>Starts watching for devices connecting/disconnecting.</summary>
        public Task<AdbDaemonWebUsbDeviceObserver> TrackDevices(AdbDaemonWebUsbRequestDeviceOptions? options = null)
            => options == null
                ? JSRef!.CallAsync<AdbDaemonWebUsbDeviceObserver>("trackDevices")
                : JSRef!.CallAsync<AdbDaemonWebUsbRequestDeviceOptions, AdbDaemonWebUsbDeviceObserver>("trackDevices", options);
    }
}
