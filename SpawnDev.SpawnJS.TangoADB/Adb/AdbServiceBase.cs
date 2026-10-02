
using SpawnDev.SpawnJS;

namespace SpawnDev.SpawnJS.TangoADB
{
    /// <summary>
    /// Base for ADB command services that hold a reference to their owning <see cref="Adb"/>.
    /// Wraps <c>AdbServiceBase</c> from @yume-chan/adb.
    /// </summary>
    public class AdbServiceBase : SpawnJSObject
    {
        /// <summary>Deserialization constructor.</summary>
        public AdbServiceBase(SpawnJSObjectReference _ref) : base(_ref) { }
    }
}
