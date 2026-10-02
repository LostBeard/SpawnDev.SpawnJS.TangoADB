
using SpawnDev.SpawnJS;

namespace SpawnDev.SpawnJS.TangoADB
{
    /// <summary>
    /// Watches for ADB devices connecting and disconnecting over WebUSB (from
    /// <see cref="AdbDaemonWebUsbDeviceManager.TrackDevices"/>). Subscribe to the events;
    /// dispose the returned <see cref="TangoSubscription"/> to unsubscribe, and call
    /// <see cref="Stop"/> when done. Wraps <c>AdbDaemonWebUsbDeviceObserver</c>.
    /// </summary>
    public class AdbDaemonWebUsbDeviceObserver : SpawnJSObject
    {
        /// <summary>Deserialization constructor.</summary>
        public AdbDaemonWebUsbDeviceObserver(SpawnJSObjectReference _ref) : base(_ref) { }
        /// <summary>The devices currently present.</summary>
        public AdbDaemonWebUsbDevice[] Current => JSRef!.Get<AdbDaemonWebUsbDevice[]>("current") ?? Array.Empty<AdbDaemonWebUsbDevice>();
        /// <summary>Fires with the newly added device(s).</summary>
        public TangoSubscription OnDeviceAdd(Action<AdbDaemonWebUsbDevice[]> handler) => TangoEvents.Subscribe(this, "onDeviceAdd", handler);
        /// <summary>Fires with the removed device(s).</summary>
        public TangoSubscription OnDeviceRemove(Action<AdbDaemonWebUsbDevice[]> handler) => TangoEvents.Subscribe(this, "onDeviceRemove", handler);
        /// <summary>Fires with the full current device list whenever it changes.</summary>
        public TangoSubscription OnListChange(Action<AdbDaemonWebUsbDevice[]> handler) => TangoEvents.Subscribe(this, "onListChange", handler);
        /// <summary>Stops watching.</summary>
        public void Stop() => JSRef!.CallVoid("stop");
    }
}
