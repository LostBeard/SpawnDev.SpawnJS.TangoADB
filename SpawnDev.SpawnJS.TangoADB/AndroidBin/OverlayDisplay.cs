using System.Text.Json.Serialization;

using SpawnDev.SpawnJS;

namespace SpawnDev.SpawnJS.TangoADB
{
    /// <summary>A single mode (resolution + density) of an overlay display device.</summary>
    public class OverlayDisplayDeviceMode
    {
        /// <summary>Width in pixels.</summary>
        [JsonPropertyName("width")] public int Width { get; set; }
        /// <summary>Height in pixels.</summary>
        [JsonPropertyName("height")] public int Height { get; set; }
        /// <summary>Display density (dpi).</summary>
        [JsonPropertyName("density")] public int Density { get; set; }
    }

    /// <summary>An overlay display device definition passed to <see cref="OverlayDisplay.Set"/>.</summary>
    public class OverlayDisplayDevice
    {
        /// <summary>The supported modes.</summary>
        [JsonPropertyName("modes")] public OverlayDisplayDeviceMode[] Modes { get; set; } = System.Array.Empty<OverlayDisplayDeviceMode>();
        /// <summary>Whether the display is secure.</summary>
        [JsonPropertyName("secure")] public bool Secure { get; set; }
        /// <summary>Whether the display shows only its own content.</summary>
        [JsonPropertyName("ownContentOnly")] public bool OwnContentOnly { get; set; }
        /// <summary>Whether system decorations (status/navigation bars) are shown.</summary>
        [JsonPropertyName("showSystemDecorations")] public bool ShowSystemDecorations { get; set; }
    }

    /// <summary>A mode entry within an <see cref="OverlayDisplayInfo"/> returned by <see cref="OverlayDisplay.Get"/>.</summary>
    public class OverlayDisplayModeInfo : SpawnJSObject
    {
        /// <summary>Deserialization constructor.</summary>
        public OverlayDisplayModeInfo(SpawnJSObjectReference _ref) : base(_ref) { }
        /// <summary>Width in pixels.</summary>
        public int Width => JSRef!.Get<int>("width");
        /// <summary>Height in pixels.</summary>
        public int Height => JSRef!.Get<int>("height");
        /// <summary>Display density (dpi).</summary>
        public int Density => JSRef!.Get<int>("density");
    }

    /// <summary>An overlay display device returned by <see cref="OverlayDisplay.Get"/>.</summary>
    public class OverlayDisplayInfo : SpawnJSObject
    {
        /// <summary>Deserialization constructor.</summary>
        public OverlayDisplayInfo(SpawnJSObjectReference _ref) : base(_ref) { }
        /// <summary>The supported modes.</summary>
        public OverlayDisplayModeInfo[] Modes => JSRef!.Get<OverlayDisplayModeInfo[]>("modes");
        /// <summary>Whether the display is secure.</summary>
        public bool Secure => JSRef!.Get<bool>("secure");
        /// <summary>Whether the display shows only its own content.</summary>
        public bool OwnContentOnly => JSRef!.Get<bool>("ownContentOnly");
        /// <summary>Whether system decorations are shown.</summary>
        public bool ShowSystemDecorations => JSRef!.Get<bool>("showSystemDecorations");
    }

    /// <summary>
    /// Manages emulated overlay display devices (the <c>overlay_display_devices</c> setting). Construct
    /// from an <see cref="Adb"/>. Wraps <c>OverlayDisplay</c> from @yume-chan/android-bin. Namespaced
    /// under <c>TangoADB.AndroidBin</c>.
    /// </summary>
    public class OverlayDisplay : AdbServiceBase
    {
        /// <summary>The settings key backing the overlay display configuration.</summary>
        public const string SettingKey = "overlay_display_devices";

        /// <summary>Deserialization constructor.</summary>
        public OverlayDisplay(SpawnJSObjectReference _ref) : base(_ref) { }
        /// <summary>Creates an overlay-display manager bound to the given device.</summary>
        public OverlayDisplay(Adb adb) : base(JS.New("TangoADB.AndroidBin.OverlayDisplay", adb)) { }

        /// <summary>Returns the currently configured overlay display devices.</summary>
        public Task<OverlayDisplayInfo[]> Get() => JSRef!.CallAsync<OverlayDisplayInfo[]>("get");
        /// <summary>Replaces the configured overlay display devices.</summary>
        public Task Set(OverlayDisplayDevice[] devices) => JSRef!.CallVoidAsync("set", devices);

        // Note: the static SETTING_FORMAT is an internal string-format Format<> parser and is not wrapped.
    }
}
