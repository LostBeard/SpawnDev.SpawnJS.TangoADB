
using SpawnDev.SpawnJS;
using SpawnDev.SpawnJS.JSObjects;

namespace SpawnDev.SpawnJS.TangoADB
{
    /// <summary>
    /// Serializes scrcpy control messages to their on-wire byte form. Mirrors
    /// <c>ScrcpyControlMessageSerializer</c>. Construct from a <see cref="ScrcpyOptionsLatest"/> when
    /// you need the raw bytes; to actually send them over a session use
    /// <see cref="ScrcpyControlMessageWriter"/> instead.
    /// </summary>
    public class ScrcpyControlMessageSerializer : SpawnJSObject
    {
        /// <summary>Deserialization constructor.</summary>
        public ScrcpyControlMessageSerializer(SpawnJSObjectReference _ref) : base(_ref) { }
        /// <summary>Creates a serializer for the given option set.</summary>
        public ScrcpyControlMessageSerializer(ScrcpyOptionsLatest options) : base(JS.New("TangoADB.Scrcpy.ScrcpyControlMessageSerializer", options)) { }

        /// <summary>Serializes a key event.</summary>
        public Uint8Array InjectKeyCode(ScrcpyInjectKeyCodeControlMessage message) => JSRef!.Call<ScrcpyInjectKeyCodeControlMessage, Uint8Array>("injectKeyCode", message);
        /// <summary>Serializes a UTF-8 text injection.</summary>
        public Uint8Array InjectText(string text) => JSRef!.Call<string, Uint8Array>("injectText", text);
        /// <summary>Serializes a touch event.</summary>
        public Uint8Array InjectTouch(ScrcpyInjectTouchControlMessage message) => JSRef!.Call<ScrcpyInjectTouchControlMessage, Uint8Array>("injectTouch", message);
        /// <summary>Serializes a scroll event, or null if the option set does not support it.</summary>
        public Uint8Array? InjectScroll(ScrcpyInjectScrollControlMessage message) => JSRef!.Call<ScrcpyInjectScrollControlMessage, Uint8Array?>("injectScroll", message);
        /// <summary>Serializes a BACK / screen-on event, or null if unsupported.</summary>
        public Uint8Array? BackOrScreenOn(AndroidKeyEventAction action) => JSRef!.Call<int, Uint8Array?>("backOrScreenOn", (int)action);
        /// <summary>Serializes a set-display-power event.</summary>
        public Uint8Array SetDisplayPower(AndroidScreenPowerMode mode) => JSRef!.Call<int, Uint8Array>("setDisplayPower", (int)mode);
        /// <summary>Serializes an "expand notification panel" event.</summary>
        public Uint8Array ExpandNotificationPanel() => JSRef!.Call<Uint8Array>("expandNotificationPanel");
        /// <summary>Serializes an "expand settings panel" event.</summary>
        public Uint8Array ExpandSettingPanel() => JSRef!.Call<Uint8Array>("expandSettingPanel");
        /// <summary>Serializes a "collapse notification panel" event.</summary>
        public Uint8Array CollapseNotificationPanel() => JSRef!.Call<Uint8Array>("collapseNotificationPanel");
        /// <summary>Serializes a rotate-device event.</summary>
        public Uint8Array RotateDevice() => JSRef!.Call<Uint8Array>("rotateDevice");
        /// <summary>Serializes a create-UHID event.</summary>
        public Uint8Array UHidCreate(ScrcpyUHidCreateControlMessage message) => JSRef!.Call<ScrcpyUHidCreateControlMessage, Uint8Array>("uHidCreate", message);
        /// <summary>Serializes a UHID input event.</summary>
        public Uint8Array UHidInput(ScrcpyUHidInputControlMessage message) => JSRef!.Call<ScrcpyUHidInputControlMessage, Uint8Array>("uHidInput", message);
        /// <summary>Serializes a destroy-UHID event.</summary>
        public Uint8Array UHidDestroy(int id) => JSRef!.Call<int, Uint8Array>("uHidDestroy", id);
        /// <summary>Serializes a start-app event.</summary>
        public Uint8Array StartApp(string name, ScrcpyStartAppOptions? options = null)
            => options == null ? JSRef!.Call<string, Uint8Array>("startApp", name) : JSRef!.Call<string, ScrcpyStartAppOptions, Uint8Array>("startApp", name, options);
        /// <summary>Serializes a reset-video event.</summary>
        public Uint8Array ResetVideo() => JSRef!.Call<Uint8Array>("resetVideo");

        // Note: setClipboard returns either bytes or a [bytes, Promise] tuple depending on autosync;
        // prefer ScrcpyControlMessageWriter.SetClipboard, which handles both forms.
    }

    /// <summary>
    /// Writes scrcpy control messages (keyboard / mouse / touch / clipboard / UHID injection) to the
    /// device control stream. Mirrors <c>ScrcpyControlMessageWriter</c>. Obtain one from the
    /// adb-scrcpy client's controller rather than constructing it directly.
    /// </summary>
    public class ScrcpyControlMessageWriter : SpawnJSObject
    {
        /// <summary>Deserialization constructor.</summary>
        public ScrcpyControlMessageWriter(SpawnJSObjectReference _ref) : base(_ref) { }

        /// <summary>Writes already-serialized control bytes.</summary>
        public Task Write(Uint8Array message) => JSRef!.CallVoidAsync("write", message);
        /// <summary>Injects a key event.</summary>
        public Task InjectKeyCode(ScrcpyInjectKeyCodeControlMessage message) => JSRef!.CallVoidAsync("injectKeyCode", message);
        /// <summary>Injects UTF-8 text.</summary>
        public Task InjectText(string text) => JSRef!.CallVoidAsync("injectText", text);
        /// <summary>Injects a touch event. <c>pressure</c> is a float between 0 and 1.</summary>
        public Task InjectTouch(ScrcpyInjectTouchControlMessage message) => JSRef!.CallVoidAsync("injectTouch", message);
        /// <summary>Injects a scroll event. <c>scrollX</c>/<c>scrollY</c> are floats between -1 and 1.</summary>
        public Task InjectScroll(ScrcpyInjectScrollControlMessage message) => JSRef!.CallVoidAsync("injectScroll", message);
        /// <summary>Presses BACK, or turns the screen on if it is off.</summary>
        public Task BackOrScreenOn(AndroidKeyEventAction action) => JSRef!.CallVoidAsync("backOrScreenOn", (int)action);
        /// <summary>Sets the display power mode (e.g. turn the device screen off while mirroring).</summary>
        public Task SetScreenPowerMode(AndroidScreenPowerMode mode) => JSRef!.CallVoidAsync("setScreenPowerMode", (int)mode);
        /// <summary>Expands the notification panel.</summary>
        public Task ExpandNotificationPanel() => JSRef!.CallVoidAsync("expandNotificationPanel");
        /// <summary>Expands the settings panel.</summary>
        public Task ExpandSettingPanel() => JSRef!.CallVoidAsync("expandSettingPanel");
        /// <summary>Collapses the notification panel.</summary>
        public Task CollapseNotificationPanel() => JSRef!.CallVoidAsync("collapseNotificationPanel");
        /// <summary>Rotates the device.</summary>
        public Task RotateDevice() => JSRef!.CallVoidAsync("rotateDevice");
        /// <summary>Sets the device clipboard.</summary>
        public Task SetClipboard(ScrcpySetClipboardControlMessage message) => JSRef!.CallVoidAsync("setClipboard", message);
        /// <summary>Creates a UHID (virtual HID) device.</summary>
        public Task UHidCreate(ScrcpyUHidCreateControlMessage message) => JSRef!.CallVoidAsync("uHidCreate", message);
        /// <summary>Sends a UHID input report.</summary>
        public Task UHidInput(ScrcpyUHidInputControlMessage message) => JSRef!.CallVoidAsync("uHidInput", message);
        /// <summary>Destroys a UHID device.</summary>
        public Task UHidDestroy(int id) => JSRef!.CallVoidAsync("uHidDestroy", id);
        /// <summary>Starts an app on the device.</summary>
        public Task StartApp(string name, ScrcpyStartAppOptions? options = null)
            => options == null ? JSRef!.CallVoidAsync("startApp", name) : JSRef!.CallVoidAsync("startApp", name, options);
        /// <summary>Resets the video stream.</summary>
        public Task ResetVideo() => JSRef!.CallVoidAsync("resetVideo");
        /// <summary>Releases the underlying stream writer lock (synchronous).</summary>
        public void ReleaseLock() => JSRef!.CallVoid("releaseLock");
        /// <summary>Closes the control stream.</summary>
        public Task Close() => JSRef!.CallVoidAsync("close");
    }
}
