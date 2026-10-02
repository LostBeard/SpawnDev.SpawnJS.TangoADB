
using SpawnDev.SpawnJS;

namespace SpawnDev.SpawnJS.TangoADB
{
    /// <summary>
    /// Device information parsed from the ADB connection banner (product, model, device, features).
    /// Wraps <c>AdbBanner</c> from @yume-chan/adb.
    /// </summary>
    public class AdbBanner : SpawnJSObject
    {
        /// <summary>Deserialization constructor.</summary>
        public AdbBanner(SpawnJSObjectReference _ref) : base(_ref) { }
        /// <summary>Parses a banner string into an <see cref="AdbBanner"/>.</summary>
        public static AdbBanner Parse(string banner) => JS.Call<string, AdbBanner>("TangoADB.AdbBanner.parse", banner);
        /// <summary>The connection state, if known.</summary>
        public string? State => JSRef!.Get<string?>("state");
        /// <summary><c>ro.product.name</c>.</summary>
        public string? Product => JSRef!.Get<string?>("product");
        /// <summary><c>ro.product.model</c>.</summary>
        public string? Model => JSRef!.Get<string?>("model");
        /// <summary><c>ro.product.device</c>.</summary>
        public string? Device => JSRef!.Get<string?>("device");
        /// <summary>The feature flags the device advertised (see <see cref="AdbFeature"/>).</summary>
        public string[] Features => JSRef!.Get<string[]>("features") ?? Array.Empty<string>();
    }
}
