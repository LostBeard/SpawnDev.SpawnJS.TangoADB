using System.Numerics;
using System.Text.Json.Serialization;

using SpawnDev.SpawnJS;
using SpawnDev.SpawnJS.JSObjects;

namespace SpawnDev.SpawnJS.TangoADB
{
    /// <summary>
    /// The scrcpy control message types (their canonical numeric ids; the on-wire value can differ
    /// per server version - see <c>ScrcpyControlMessageTypeMap</c>). Mirrors <c>ScrcpyControlMessageType</c>.
    /// </summary>
    public enum ScrcpyControlMessageType
    {
        /// <summary>Inject a key event.</summary>
        InjectKeyCode = 0,
        /// <summary>Inject UTF-8 text.</summary>
        InjectText = 1,
        /// <summary>Inject a touch event.</summary>
        InjectTouch = 2,
        /// <summary>Inject a scroll event.</summary>
        InjectScroll = 3,
        /// <summary>Press BACK, or turn the screen on.</summary>
        BackOrScreenOn = 4,
        /// <summary>Expand the notification panel.</summary>
        ExpandNotificationPanel = 5,
        /// <summary>Expand the settings panel.</summary>
        ExpandSettingPanel = 6,
        /// <summary>Collapse the notification panel.</summary>
        CollapseNotificationPanel = 7,
        /// <summary>Request the device clipboard.</summary>
        GetClipboard = 8,
        /// <summary>Set the device clipboard.</summary>
        SetClipboard = 9,
        /// <summary>Set the display power state.</summary>
        SetDisplayPower = 10,
        /// <summary>Rotate the device.</summary>
        RotateDevice = 11,
        /// <summary>Create a UHID (virtual HID) device.</summary>
        UHidCreate = 12,
        /// <summary>Send UHID input.</summary>
        UHidInput = 13,
        /// <summary>Destroy a UHID device.</summary>
        UHidDestroy = 14,
        /// <summary>Open the hardware keyboard settings.</summary>
        OpenHardKeyboardSettings = 15,
        /// <summary>Start an app.</summary>
        StartApp = 16,
        /// <summary>Reset the video stream.</summary>
        ResetVideo = 17,
    }

    /// <summary>
    /// A key event to inject (the <c>type</c> field is filled in by the writer). Mirrors
    /// <c>Omit&lt;ScrcpyInjectKeyCodeControlMessage, "type"&gt;</c>.
    /// </summary>
    public class ScrcpyInjectKeyCodeControlMessage
    {
        /// <summary>Down or up.</summary>
        [JsonPropertyName("action")]
        public AndroidKeyEventAction Action { get; set; }
        /// <summary>The Android key code.</summary>
        [JsonPropertyName("keyCode")]
        public AndroidKeyCode KeyCode { get; set; }
        /// <summary>The repeat count (0 for the first event).</summary>
        [JsonPropertyName("repeat")]
        public int Repeat { get; set; }
        /// <summary>The modifier/meta state.</summary>
        [JsonPropertyName("metaState")]
        public AndroidKeyEventMeta MetaState { get; set; }
    }

    /// <summary>
    /// A touch event to inject (the <c>type</c> field is filled in by the writer). Mirrors
    /// <c>Omit&lt;ScrcpyInjectTouchControlMessage, "type"&gt;</c>.<br/>
    /// Note: <see cref="PointerId"/> is a 64-bit value (the JS field is a <c>BigInt</c>). It is a <see cref="BigInteger"/>
    /// so it crosses as a JS BigInt: Tango writes it with <c>setUint64</c> (<c>value &amp; 0xffn</c>), which throws
    /// "Cannot mix BigInt and other types" for a JS number. A <c>long</c> converts implicitly.
    /// </summary>
    public class ScrcpyInjectTouchControlMessage
    {
        /// <summary>The motion action.</summary>
        [JsonPropertyName("action")]
        public AndroidMotionEventAction Action { get; set; }
        /// <summary>The pointer id (64-bit; JS <c>BigInt</c>).</summary>
        [JsonPropertyName("pointerId")]
        public BigInteger PointerId { get; set; }
        /// <summary>The pointer X in device pixels.</summary>
        [JsonPropertyName("pointerX")]
        public int PointerX { get; set; }
        /// <summary>The pointer Y in device pixels.</summary>
        [JsonPropertyName("pointerY")]
        public int PointerY { get; set; }
        /// <summary>The width of the video frame the coordinates are relative to.</summary>
        [JsonPropertyName("videoWidth")]
        public int VideoWidth { get; set; }
        /// <summary>The height of the video frame the coordinates are relative to.</summary>
        [JsonPropertyName("videoHeight")]
        public int VideoHeight { get; set; }
        /// <summary>The pressure, a float between 0 and 1.</summary>
        [JsonPropertyName("pressure")]
        public double Pressure { get; set; }
        /// <summary>The button that triggered this action (see <see cref="AndroidMotionEventButton"/>).</summary>
        [JsonPropertyName("actionButton")]
        public int ActionButton { get; set; }
        /// <summary>The currently pressed buttons (see <see cref="AndroidMotionEventButton"/>).</summary>
        [JsonPropertyName("buttons")]
        public int Buttons { get; set; }
    }

    /// <summary>
    /// A scroll event to inject (the <c>type</c> field is filled in by the writer). Mirrors
    /// <c>Omit&lt;ScrcpyInjectScrollControlMessage, "type"&gt;</c>.
    /// </summary>
    public class ScrcpyInjectScrollControlMessage
    {
        /// <summary>The pointer X in device pixels.</summary>
        [JsonPropertyName("pointerX")]
        public int PointerX { get; set; }
        /// <summary>The pointer Y in device pixels.</summary>
        [JsonPropertyName("pointerY")]
        public int PointerY { get; set; }
        /// <summary>The width of the video frame the coordinates are relative to.</summary>
        [JsonPropertyName("videoWidth")]
        public int VideoWidth { get; set; }
        /// <summary>The height of the video frame the coordinates are relative to.</summary>
        [JsonPropertyName("videoHeight")]
        public int VideoHeight { get; set; }
        /// <summary>The horizontal scroll amount, a float between -1 and 1.</summary>
        [JsonPropertyName("scrollX")]
        public double ScrollX { get; set; }
        /// <summary>The vertical scroll amount, a float between -1 and 1.</summary>
        [JsonPropertyName("scrollY")]
        public double ScrollY { get; set; }
        /// <summary>The currently pressed buttons (see <see cref="AndroidMotionEventButton"/>).</summary>
        [JsonPropertyName("buttons")]
        public int Buttons { get; set; }
    }

    /// <summary>
    /// A "set device clipboard" message (the <c>type</c> field is filled in by the writer). Mirrors
    /// <c>Omit&lt;ScrcpySetClipboardControlMessage, "type"&gt;</c>.<br/>
    /// Note: <see cref="Sequence"/> is a 64-bit value (the JS field is a <c>BigInt</c>), so it is a <see cref="BigInteger"/>
    /// (see <see cref="ScrcpyInjectTouchControlMessage.PointerId"/>). A <c>long</c> converts implicitly.
    /// </summary>
    public class ScrcpySetClipboardControlMessage
    {
        /// <summary>A sequence number to correlate the device acknowledgement (64-bit; JS <c>BigInt</c>).</summary>
        [JsonPropertyName("sequence")]
        public BigInteger Sequence { get; set; }
        /// <summary>When true, also paste the clipboard into the focused field.</summary>
        [JsonPropertyName("paste")]
        public bool Paste { get; set; }
        /// <summary>The clipboard text.</summary>
        [JsonPropertyName("content")]
        public string Content { get; set; } = "";
    }

    /// <summary>
    /// A "create UHID device" message (the <c>type</c> field is filled in by the writer). Mirrors
    /// <c>Omit&lt;ScrcpyUHidCreateControlMessage, "type"&gt;</c>.
    /// </summary>
    public class ScrcpyUHidCreateControlMessage
    {
        /// <summary>The UHID device id.</summary>
        [JsonPropertyName("id")]
        public int Id { get; set; }
        /// <summary>The USB vendor id.</summary>
        [JsonPropertyName("vendorId")]
        public int VendorId { get; set; }
        /// <summary>The USB product id.</summary>
        [JsonPropertyName("productId")]
        public int ProductId { get; set; }
        /// <summary>The device name.</summary>
        [JsonPropertyName("name")]
        public string Name { get; set; } = "";
        /// <summary>The HID report descriptor bytes.</summary>
        [JsonPropertyName("data")]
        public byte[] Data { get; set; } = System.Array.Empty<byte>();
    }

    /// <summary>
    /// A "UHID input" message (the <c>type</c> field is filled in by the writer). Mirrors
    /// <c>Omit&lt;ScrcpyUHidInputControlMessage, "type"&gt;</c>.
    /// </summary>
    public class ScrcpyUHidInputControlMessage
    {
        /// <summary>The UHID device id.</summary>
        [JsonPropertyName("id")]
        public int Id { get; set; }
        /// <summary>The HID report bytes.</summary>
        [JsonPropertyName("data")]
        public byte[] Data { get; set; } = System.Array.Empty<byte>();
    }

    /// <summary>Options for <see cref="ScrcpyControlMessageWriter.StartApp"/>. Mirrors the scrcpy startApp options.</summary>
    public class ScrcpyStartAppOptions
    {
        /// <summary>Force-stop the app before starting it.</summary>
        [JsonPropertyName("forceStop")]
        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        public bool? ForceStop { get; set; }
        /// <summary>Treat the name as a search term rather than an exact package name.</summary>
        [JsonPropertyName("searchByName")]
        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        public bool? SearchByName { get; set; }
    }

    /// <summary>
    /// A UHID output report sent from the device. Read-only. Mirrors <c>UHidOutputDeviceMessage</c>
    /// (<c>ScrcpyUHidOutputDeviceMessage</c>).
    /// </summary>
    public class ScrcpyUHidOutputDeviceMessage : SpawnJSObject
    {
        /// <summary>Deserialization constructor.</summary>
        public ScrcpyUHidOutputDeviceMessage(SpawnJSObjectReference _ref) : base(_ref) { }
        /// <summary>The UHID device id.</summary>
        public int Id => JSRef!.Get<int>("id");
        /// <summary>The output report bytes.</summary>
        public Uint8Array Data => JSRef!.Get<Uint8Array>("data");
    }
}
