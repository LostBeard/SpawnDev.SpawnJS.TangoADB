
using SpawnDev.SpawnJS;

namespace SpawnDev.SpawnJS.TangoADB
{
    /// <summary>
    /// Entry point for the Tango (ya-webadb) ADB-over-WebUSB library.<br/>
    /// Wraps the bundled ESM module exposing the @yume-chan/* packages. Call <see cref="Init"/>
    /// once before using any wrapped class; it dynamically imports the bundle and assigns it to
    /// the JavaScript global <c>TangoADB</c>, after which wrapper classes construct via
    /// <c>JS.New("TangoADB.Adb", ...)</c> etc.
    /// </summary>
    public partial class Tango : SpawnJSObject
    {
        /// <summary>
        /// The JavaScript global variable name the imported bundle is saved as.
        /// All wrapped classes live under this namespace, e.g. <c>TangoADB.Adb</c>.
        /// </summary>
        public const string GlobalModuleName = "TangoADB";

        /// <summary>
        /// The bundled Tango ESM module, shipped with this library as a static web asset.<br/>
        /// Produced by <c>bundle/update.cs</c> from the @yume-chan npm packages.
        /// </summary>
        public static string LatestBundledVersionSrc { get; } = $"./_content/SpawnDev.SpawnJS.TangoADB/tango-adb.js";

        /// <summary>
        /// Deserialization constructor.
        /// </summary>
        public Tango(SpawnJSObjectReference _ref) : base(_ref) { }

        /// <summary>
        /// Returns true once <see cref="Init"/> has successfully imported the bundle.
        /// </summary>
        public static bool IsInit => JS.TypeOf(GlobalModuleName) != "undefined";

        static Task<Tango>? _Init = null;

        /// <summary>
        /// Imports the Tango bundle (a dynamic <c>import()</c>) and assigns it to the
        /// <c>TangoADB</c> global. Idempotent - subsequent calls return the same Task.
        /// </summary>
        /// <param name="srcUrl">Optional override for the bundle URL (defaults to the bundled asset).</param>
        public static Task<Tango> Init(string? srcUrl = null)
        {
            return _Init ??= InitOnce(srcUrl);
        }

        static async Task<Tango> InitOnce(string? srcUrl)
        {
            srcUrl ??= LatestBundledVersionSrc;
            var tango = await JS.Import<Tango>(GlobalModuleName, srcUrl);
            if (tango == null) throw new Exception("TangoADB could not be initialized.");
            return tango;
        }

        /// <summary>
        /// True when the browser supports WebUSB (required to connect to devices).
        /// </summary>
        public static bool IsWebUsbSupported => JS.TypeOf("navigator") != "undefined" && JS.TypeOf("navigator.usb") != "undefined";
    }
}
