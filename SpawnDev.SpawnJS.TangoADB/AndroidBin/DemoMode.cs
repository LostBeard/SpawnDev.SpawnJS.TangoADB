using System.Collections.Generic;

using SpawnDev.SpawnJS;

namespace SpawnDev.SpawnJS.TangoADB
{
    /// <summary>
    /// Allowed values for the WiFi / mobile signal strength demo-mode commands (the JS
    /// <c>DemoModeSignalStrength</c> string enum). Pass one of these constants.
    /// </summary>
    public static class DemoModeSignalStrength
    {
        /// <summary>Hide the icon ("null").</summary>
        public const string Hidden = "null";
        /// <summary>Strength level 0.</summary>
        public const string Level0 = "0";
        /// <summary>Strength level 1.</summary>
        public const string Level1 = "1";
        /// <summary>Strength level 2.</summary>
        public const string Level2 = "2";
        /// <summary>Strength level 3.</summary>
        public const string Level3 = "3";
        /// <summary>Strength level 4.</summary>
        public const string Level4 = "4";
    }

    /// <summary>
    /// Allowed values for <see cref="DemoMode.SetMobileDataType"/> (the JS <c>DemoModeMobileDataType</c>
    /// string union). Pass one of these constants.
    /// </summary>
    public static class DemoModeMobileDataType
    {
        /// <summary>All recognized mobile data type strings.</summary>
        public static readonly string[] All = { "1x", "3g", "4g", "4g+", "5g", "5ge", "5g+", "e", "g", "h", "h+", "lte", "lte+", "dis", "not", "null" };
    }

    /// <summary>
    /// Allowed values for <see cref="DemoMode.SetStatusBarMode"/> (the JS <c>DemoModeStatusBarMode</c>
    /// string union). Pass one of these constants.
    /// </summary>
    public static class DemoModeStatusBarMode
    {
        /// <summary>Opaque status bar.</summary>
        public const string Opaque = "opaque";
        /// <summary>Translucent status bar.</summary>
        public const string Translucent = "translucent";
        /// <summary>Semi-transparent status bar.</summary>
        public const string SemiTransparent = "semi-transparent";
        /// <summary>Transparent status bar.</summary>
        public const string Transparent = "transparent";
        /// <summary>Warning status bar.</summary>
        public const string Warning = "warning";
    }

    /// <summary>
    /// Drives the SystemUI demo mode (fixes the status bar to known values for screenshots). Construct
    /// from an <see cref="Adb"/>. Wraps <c>DemoMode</c> from @yume-chan/android-bin. Namespaced under
    /// <c>TangoADB.AndroidBin</c>.
    /// </summary>
    public class DemoMode : AdbServiceBase
    {
        /// <summary>The settings key that gates whether demo mode is allowed.</summary>
        public const string AllowedSettingKey = "sysui_demo_allowed";
        /// <summary>The settings key that toggles demo mode on/off.</summary>
        public const string EnabledSettingKey = "sysui_tuner_demo_on";

        /// <summary>Deserialization constructor.</summary>
        public DemoMode(SpawnJSObjectReference _ref) : base(_ref) { }
        /// <summary>Creates a demo-mode controller bound to the given device.</summary>
        public DemoMode(Adb adb) : base(JS.New("TangoADB.AndroidBin.DemoMode", adb)) { }

        /// <summary>Gets whether demo mode is allowed.</summary>
        public Task<bool> GetAllowed() => JSRef!.CallAsync<bool>("getAllowed");
        /// <summary>Sets whether demo mode is allowed.</summary>
        public Task SetAllowed(bool value) => JSRef!.CallVoidAsync("setAllowed", value);
        /// <summary>Gets whether demo mode is enabled.</summary>
        public Task<bool> GetEnabled() => JSRef!.CallAsync<bool>("getEnabled");
        /// <summary>Sets whether demo mode is enabled.</summary>
        public Task SetEnabled(bool value) => JSRef!.CallVoidAsync("setEnabled", value);
        /// <summary>Sends a raw demo-mode broadcast command with optional extras.</summary>
        public Task Broadcast(string command, Dictionary<string, string>? extra = null)
            => extra == null ? JSRef!.CallVoidAsync("broadcast", command) : JSRef!.CallVoidAsync("broadcast", command, extra);
        /// <summary>Sets the displayed battery level (0-100).</summary>
        public Task SetBatteryLevel(int level) => JSRef!.CallVoidAsync("setBatteryLevel", level);
        /// <summary>Sets whether the battery shows as charging.</summary>
        public Task SetBatteryCharging(bool value) => JSRef!.CallVoidAsync("setBatteryCharging", value);
        /// <summary>Sets whether power-save mode is shown.</summary>
        public Task SetPowerSaveMode(bool value) => JSRef!.CallVoidAsync("setPowerSaveMode", value);
        /// <summary>Sets whether the airplane-mode icon is shown.</summary>
        public Task SetAirplaneMode(bool show) => JSRef!.CallVoidAsync("setAirplaneMode", show);
        /// <summary>Sets the WiFi signal strength (see <see cref="DemoModeSignalStrength"/>).</summary>
        public Task SetWifiSignalStrength(string value) => JSRef!.CallVoidAsync("setWifiSignalStrength", value);
        /// <summary>Sets the mobile data type (see <see cref="DemoModeMobileDataType"/>).</summary>
        public Task SetMobileDataType(string value) => JSRef!.CallVoidAsync("setMobileDataType", value);
        /// <summary>Sets the mobile signal strength (see <see cref="DemoModeSignalStrength"/>).</summary>
        public Task SetMobileSignalStrength(string value) => JSRef!.CallVoidAsync("setMobileSignalStrength", value);
        /// <summary>Sets whether the "no SIM card" icon is shown.</summary>
        public Task SetNoSimCardIcon(bool show) => JSRef!.CallVoidAsync("setNoSimCardIcon", show);
        /// <summary>Sets the status bar mode (see <see cref="DemoModeStatusBarMode"/>).</summary>
        public Task SetStatusBarMode(string mode) => JSRef!.CallVoidAsync("setStatusBarMode", mode);
        /// <summary>Sets whether vibrate mode is shown.</summary>
        public Task SetVibrateModeEnabled(bool value) => JSRef!.CallVoidAsync("setVibrateModeEnabled", value);
        /// <summary>Sets whether Bluetooth shows as connected.</summary>
        public Task SetBluetoothConnected(bool value) => JSRef!.CallVoidAsync("setBluetoothConnected", value);
        /// <summary>Sets whether the locating (GPS) icon is shown.</summary>
        public Task SetLocatingIcon(bool show) => JSRef!.CallVoidAsync("setLocatingIcon", show);
        /// <summary>Sets whether the alarm icon is shown.</summary>
        public Task SetAlarmIcon(bool show) => JSRef!.CallVoidAsync("setAlarmIcon", show);
        /// <summary>Sets whether the syncing icon is shown.</summary>
        public Task SetSyncingIcon(bool show) => JSRef!.CallVoidAsync("setSyncingIcon", show);
        /// <summary>Sets whether the mute icon is shown.</summary>
        public Task SetMuteIcon(bool show) => JSRef!.CallVoidAsync("setMuteIcon", show);
        /// <summary>Sets whether the speakerphone icon is shown.</summary>
        public Task SetSpeakerPhoneIcon(bool show) => JSRef!.CallVoidAsync("setSpeakerPhoneIcon", show);
        /// <summary>Sets whether notification icons are shown.</summary>
        public Task SetNotificationsVisibility(bool show) => JSRef!.CallVoidAsync("setNotificationsVisibility", show);
        /// <summary>Sets the displayed clock time.</summary>
        public Task SetTime(int hour, int minute) => JSRef!.CallVoidAsync("setTime", hour, minute);
    }
}
