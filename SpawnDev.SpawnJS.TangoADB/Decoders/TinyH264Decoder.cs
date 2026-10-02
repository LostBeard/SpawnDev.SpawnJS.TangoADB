using System.Text.Json.Serialization;

using SpawnDev.SpawnJS;
using SpawnDev.SpawnJS.JSObjects;

namespace SpawnDev.SpawnJS.TangoADB
{
    /// <summary>
    /// Options for constructing a <see cref="TinyH264Decoder"/>. Mirrors <c>TinyH264Decoder.Options</c>.
    /// </summary>
    public class TinyH264DecoderOptions
    {
        /// <summary>
        /// Optional render target (<c>HTMLCanvasElement</c> or <c>OffscreenCanvas</c>). If omitted a
        /// new <c>&lt;canvas&gt;</c> (when DOM is available) or an <c>OffscreenCanvas</c> is created.
        /// </summary>
        [JsonPropertyName("canvas")]
        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        public SpawnJSObject? Canvas { get; set; }
    }

    /// <summary>
    /// A software H.264 scrcpy video decoder built on the TinyH264 WASM decoder. H.264 only.
    /// Pipe an <see cref="AdbScrcpyVideoStream.Stream"/> into <see cref="Writable"/> to decode;
    /// frames are drawn onto <see cref="Renderer"/> (a canvas). Wraps <c>TinyH264Decoder</c> from
    /// @yume-chan/scrcpy-decoder-tinyh264.
    /// <para>
    /// Runtime requirement: TinyH264 spins up a dedicated Web Worker and loads a TinyH264 WASM
    /// asset. Those assets must be served alongside the app (asset wiring is handled elsewhere);
    /// this wrapper only covers the class API.
    /// </para>
    /// </summary>
    public class TinyH264Decoder : SpawnJSObject
    {
        /// <summary>Deserialization constructor.</summary>
        public TinyH264Decoder(SpawnJSObjectReference _ref) : base(_ref) { }

        /// <summary>Creates a decoder that allocates its own canvas / offscreen canvas.</summary>
        public TinyH264Decoder() : base(JS.New("TangoADB.TinyH264Decoder")) { }

        /// <summary>Creates a decoder with the given options (e.g. a target canvas).</summary>
        public TinyH264Decoder(TinyH264DecoderOptions options) : base(JS.New("TangoADB.TinyH264Decoder", options)) { }

        /// <summary>Creates a decoder rendering into the given canvas element.</summary>
        public TinyH264Decoder(HTMLCanvasElement canvas)
            : base(JS.New("TangoADB.TinyH264Decoder", new TinyH264DecoderOptions { Canvas = canvas })) { }

        /// <summary>
        /// The render target canvas (an <c>HTMLCanvasElement</c> or <c>OffscreenCanvas</c>). Raw JS
        /// reference. Attach it to the DOM to display the decoded video.
        /// </summary>
        public SpawnJSObject Renderer => JSRef!.Get<SpawnJSObject>("renderer");
        /// <summary>The writable end - pipe the scrcpy media packet stream into it to decode.</summary>
        public WritableStream Writable => JSRef!.Get<WritableStream>("writable");
        /// <summary>The current video width in pixels.</summary>
        public int Width => JSRef!.Get<int>("width");
        /// <summary>The current video height in pixels.</summary>
        public int Height => JSRef!.Get<int>("height");
        /// <summary>The number of frames rendered so far.</summary>
        public int FramesRendered => JSRef!.Get<int>("framesRendered");
        /// <summary>The number of frames skipped so far.</summary>
        public int FramesSkipped => JSRef!.Get<int>("framesSkipped");

        /// <summary>Subscribes to the <c>sizeChanged</c> event. Dispose to unsubscribe.</summary>
        public TangoSubscription OnSizeChanged(Action<ScrcpyVideoSize> handler)
            => TangoEvents.Subscribe(this, "sizeChanged", handler);

        /// <summary>Releases the decoder, its worker and resources (the JS <c>dispose()</c>; distinct from <see cref="SpawnJSObject.Dispose()"/>).</summary>
        public void Release() => JSRef!.CallVoid("dispose");
    }
}
