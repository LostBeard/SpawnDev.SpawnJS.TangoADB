
using SpawnDev.SpawnJS;
using SpawnDev.SpawnJS.JSObjects;

namespace SpawnDev.SpawnJS.TangoADB
{
    // NOTE: The @yume-chan/scrcpy-decoder-webcodecs renderer classes below are required to
    // construct a WebCodecsVideoDecoder (its Options.renderer). They are re-exported by the
    // package's video/render/index.js, but the Tango bundle's index.ts currently only re-exports
    // `WebCodecsVideoDecoder` and `TinyH264Decoder` at the top level. For these renderer wrappers
    // to resolve at runtime, bundle/index.ts must also export the renderer classes
    // (BitmapVideoFrameRenderer, WebGLVideoFrameRenderer, InsertableStreamVideoFrameRenderer) so
    // they appear under TangoADB.<ClassName>. (Bundle wiring is owned elsewhere.)

    /// <summary>
    /// Base class for the canvas-backed video frame renderers. Holds the target canvas and the
    /// frame size. Wraps the abstract <c>CanvasVideoFrameRenderer</c> from
    /// @yume-chan/scrcpy-decoder-webcodecs.
    /// </summary>
    public class CanvasVideoFrameRenderer : SpawnJSObject
    {
        /// <summary>Deserialization constructor.</summary>
        public CanvasVideoFrameRenderer(SpawnJSObjectReference _ref) : base(_ref) { }
        /// <summary>The render target (an <c>HTMLCanvasElement</c> or <c>OffscreenCanvas</c>). Raw JS reference.</summary>
        public SpawnJSObject Canvas => JSRef!.Get<SpawnJSObject>("canvas");
        /// <summary>Sets the renderer's drawing surface size.</summary>
        public void SetSize(int width, int height) => JSRef!.CallVoid("setSize", width, height);
    }

    /// <summary>
    /// Renders decoded <c>VideoFrame</c>s to a canvas using <c>createImageBitmap</c> + 2D context.
    /// Wraps <c>BitmapVideoFrameRenderer</c> from @yume-chan/scrcpy-decoder-webcodecs.
    /// </summary>
    public class BitmapVideoFrameRenderer : CanvasVideoFrameRenderer
    {
        /// <summary>Deserialization constructor.</summary>
        public BitmapVideoFrameRenderer(SpawnJSObjectReference _ref) : base(_ref) { }
        /// <summary>Creates a renderer that allocates its own canvas (or <c>OffscreenCanvas</c>).</summary>
        public BitmapVideoFrameRenderer() : base(JS.New("TangoADB.BitmapVideoFrameRenderer")) { }
        /// <summary>Creates a renderer drawing into the given canvas element.</summary>
        public BitmapVideoFrameRenderer(HTMLCanvasElement canvas) : base(JS.New("TangoADB.BitmapVideoFrameRenderer", canvas)) { }
        /// <summary>Creates a renderer drawing into the given canvas (e.g. an <c>OffscreenCanvas</c>).</summary>
        public BitmapVideoFrameRenderer(SpawnJSObject canvas) : base(JS.New("TangoADB.BitmapVideoFrameRenderer", canvas)) { }
    }

    /// <summary>
    /// Renders decoded <c>VideoFrame</c>s to a canvas using WebGL (lower latency than the bitmap
    /// renderer). Wraps <c>WebGLVideoFrameRenderer</c> from @yume-chan/scrcpy-decoder-webcodecs.
    /// </summary>
    public class WebGLVideoFrameRenderer : CanvasVideoFrameRenderer
    {
        /// <summary>Deserialization constructor.</summary>
        public WebGLVideoFrameRenderer(SpawnJSObjectReference _ref) : base(_ref) { }
        /// <summary>Creates a renderer that allocates its own canvas (or <c>OffscreenCanvas</c>).</summary>
        public WebGLVideoFrameRenderer() : base(JS.New("TangoADB.WebGLVideoFrameRenderer")) { }
        /// <summary>Creates a renderer drawing into the given canvas element.</summary>
        /// <param name="canvas">The target canvas.</param>
        /// <param name="enableCapture">Allow reading the canvas back (readPixels/toDataURL); may reduce performance.</param>
        public WebGLVideoFrameRenderer(HTMLCanvasElement canvas, bool enableCapture = false)
            : base(JS.New("TangoADB.WebGLVideoFrameRenderer", canvas, enableCapture)) { }
        /// <summary>Creates a renderer drawing into the given canvas (e.g. an <c>OffscreenCanvas</c>).</summary>
        public WebGLVideoFrameRenderer(SpawnJSObject canvas, bool enableCapture = false)
            : base(JS.New("TangoADB.WebGLVideoFrameRenderer", canvas, enableCapture)) { }

        /// <summary>True if WebGL frame rendering is supported in this environment.</summary>
        public static bool IsSupported => JS.Get<bool>("TangoADB.WebGLVideoFrameRenderer.isSupported");
    }

    /// <summary>
    /// Renders decoded frames into an <c>HTMLVideoElement</c> via an insertable
    /// <c>MediaStreamTrackGenerator</c>. Wraps <c>InsertableStreamVideoFrameRenderer</c> from
    /// @yume-chan/scrcpy-decoder-webcodecs.
    /// </summary>
    public class InsertableStreamVideoFrameRenderer : SpawnJSObject
    {
        /// <summary>Deserialization constructor.</summary>
        public InsertableStreamVideoFrameRenderer(SpawnJSObjectReference _ref) : base(_ref) { }
        /// <summary>Creates a renderer that allocates its own <c>&lt;video&gt;</c> element.</summary>
        public InsertableStreamVideoFrameRenderer() : base(JS.New("TangoADB.InsertableStreamVideoFrameRenderer")) { }
        /// <summary>Creates a renderer targeting the given <c>&lt;video&gt;</c> element.</summary>
        public InsertableStreamVideoFrameRenderer(HTMLVideoElement element)
            : base(JS.New("TangoADB.InsertableStreamVideoFrameRenderer", element)) { }

        /// <summary>True if insertable-stream rendering is supported in this environment.</summary>
        public static bool IsSupported => JS.Get<bool>("TangoADB.InsertableStreamVideoFrameRenderer.isSupported");

        /// <summary>The <c>&lt;video&gt;</c> element frames are rendered into.</summary>
        public HTMLVideoElement Element => JSRef!.Get<HTMLVideoElement>("element");
        /// <summary>Sets the renderer size.</summary>
        public void SetSize(int width, int height) => JSRef!.CallVoid("setSize", width, height);
    }
}
