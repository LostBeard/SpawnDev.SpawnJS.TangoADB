
using SpawnDev.SpawnJS;
using SpawnDev.SpawnJS.JSObjects;

namespace SpawnDev.SpawnJS.TangoADB
{
    /// <summary>
    /// A raw screen capture from <see cref="Adb.Framebuffer"/> - RGBA pixel data plus geometry.
    /// Wraps the <c>AdbFrameBuffer</c> (V1/V2) result from @yume-chan/adb.
    /// </summary>
    public class AdbFrameBuffer : SpawnJSObject
    {
        /// <summary>Deserialization constructor.</summary>
        public AdbFrameBuffer(SpawnJSObjectReference _ref) : base(_ref) { }
        /// <summary>Bits per pixel.</summary>
        public int Bpp => JSRef!.Get<int>("bpp");
        /// <summary>The size of <see cref="Data"/> in bytes.</summary>
        public int Size => JSRef!.Get<int>("size");
        /// <summary>The image width in pixels.</summary>
        public int Width => JSRef!.Get<int>("width");
        /// <summary>The image height in pixels.</summary>
        public int Height => JSRef!.Get<int>("height");
        /// <summary>The color space (V2 framebuffers only; null on V1).</summary>
        public int? ColorSpace => JSRef!.Get<int?>("colorSpace");
        /// <summary>Red channel bit offset.</summary>
        public int RedOffset => JSRef!.Get<int>("red_offset");
        /// <summary>Green channel bit offset.</summary>
        public int GreenOffset => JSRef!.Get<int>("green_offset");
        /// <summary>Blue channel bit offset.</summary>
        public int BlueOffset => JSRef!.Get<int>("blue_offset");
        /// <summary>Alpha channel bit offset.</summary>
        public int AlphaOffset => JSRef!.Get<int>("alpha_offset");
        /// <summary>The raw pixel bytes.</summary>
        public Uint8Array Data => JSRef!.Get<Uint8Array>("data");
    }
}
