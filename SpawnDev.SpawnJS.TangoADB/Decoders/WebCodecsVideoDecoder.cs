using System.Text.Json.Serialization;

using SpawnDev.SpawnJS;
using SpawnDev.SpawnJS.JSObjects;

namespace SpawnDev.SpawnJS.TangoADB
{
    // Note: ScrcpyVideoCodecId is defined in the Scrcpy wrapper (Scrcpy/ScrcpyCodec.cs) and reused here.

    /// <summary>
    /// Options for constructing a <see cref="WebCodecsVideoDecoder"/>. Mirrors
    /// <c>WebCodecsVideoDecoder.Options</c>.
    /// </summary>
    public class WebCodecsVideoDecoderOptions
    {
        /// <summary>The video codec to decode (from the scrcpy video metadata).</summary>
        [JsonPropertyName("codec")]
        public ScrcpyVideoCodecId Codec { get; set; }
        /// <summary>
        /// The frame renderer the decoded <c>VideoFrame</c>s are drawn into - one of
        /// <see cref="BitmapVideoFrameRenderer"/>, <see cref="WebGLVideoFrameRenderer"/> or
        /// <see cref="InsertableStreamVideoFrameRenderer"/>.
        /// </summary>
        [JsonPropertyName("renderer")]
        public SpawnJSObject? Renderer { get; set; }
        /// <summary>
        /// WebCodecs hardware acceleration hint: "no-preference", "prefer-hardware" or
        /// "prefer-software". Leave null for the default.
        /// </summary>
        [JsonPropertyName("hardwareAcceleration")]
        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        public string? HardwareAcceleration { get; set; }
    }

    /// <summary>
    /// A scrcpy video decoder built on the browser <c>VideoDecoder</c> (WebCodecs) API. Decodes the
    /// scrcpy media stream into <c>VideoFrame</c>s and draws them through a
    /// video frame renderer (<see cref="CanvasVideoFrameRenderer"/>, <see cref="BitmapVideoFrameRenderer"/>,
    /// <see cref="WebGLVideoFrameRenderer"/> or <see cref="InsertableStreamVideoFrameRenderer"/>). Pipe an <see cref="AdbScrcpyVideoStream.Stream"/> into
    /// <see cref="Writable"/> to render. Wraps <c>WebCodecsVideoDecoder</c> from
    /// @yume-chan/scrcpy-decoder-webcodecs.
    /// </summary>
    public class WebCodecsVideoDecoder : SpawnJSObject
    {
        /// <summary>Deserialization constructor.</summary>
        public WebCodecsVideoDecoder(SpawnJSObjectReference _ref) : base(_ref) { }

        /// <summary>Creates a WebCodecs decoder with the given codec, renderer and options.</summary>
        public WebCodecsVideoDecoder(WebCodecsVideoDecoderOptions options)
            : base(JS.New("TangoADB.WebCodecsVideoDecoder", options)) { }

        /// <summary>True if the browser supports the WebCodecs <c>VideoDecoder</c> API.</summary>
        public static bool IsSupported => JS.Get<bool>("TangoADB.WebCodecsVideoDecoder.isSupported");

        /// <summary>The codec this decoder was created for.</summary>
        public ScrcpyVideoCodecId Codec => (ScrcpyVideoCodecId)JSRef!.Get<long>("codec");
        /// <summary>The frame renderer the decoded frames are drawn into. Raw JS reference.</summary>
        public SpawnJSObject Renderer => JSRef!.Get<SpawnJSObject>("renderer");
        /// <summary>The writable end - pipe the scrcpy media packet stream into it to decode.</summary>
        public WritableStream Writable => JSRef!.Get<WritableStream>("writable");
        /// <summary>The number of frames rendered so far.</summary>
        public int FramesRendered => JSRef!.Get<int>("framesRendered");
        /// <summary>The number of frames skipped so far.</summary>
        public int FramesSkipped => JSRef!.Get<int>("framesSkipped");
        /// <summary>The current video width in pixels.</summary>
        public int Width => JSRef!.Get<int>("width");
        /// <summary>The current video height in pixels.</summary>
        public int Height => JSRef!.Get<int>("height");

        /// <summary>Subscribes to the <c>sizeChanged</c> event. Dispose to unsubscribe.</summary>
        public TangoSubscription OnSizeChanged(Action<ScrcpyVideoSize> handler)
            => TangoEvents.Subscribe(this, "sizeChanged", handler);

        /// <summary>Captures the current frame as a PNG <c>Blob</c> (null if unavailable).</summary>
        public Task<Blob?> Snapshot() => JSRef!.CallAsync<Blob?>("snapshot");

        /// <summary>Releases the decoder and its resources (the JS <c>dispose()</c>; distinct from <see cref="SpawnJSObject.Dispose()"/>).</summary>
        public void Release() => JSRef!.CallVoid("dispose");
    }
}
