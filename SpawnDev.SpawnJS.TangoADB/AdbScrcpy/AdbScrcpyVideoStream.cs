using System.Text.Json.Serialization;

using SpawnDev.SpawnJS;
using SpawnDev.SpawnJS.JSObjects;

namespace SpawnDev.SpawnJS.TangoADB
{
    /// <summary>
    /// A <c>{ width, height }</c> payload, used by the scrcpy video <c>sizeChanged</c> events
    /// (on <see cref="AdbScrcpyVideoStream"/> and the video decoders).
    /// </summary>
    public class ScrcpyVideoSize
    {
        /// <summary>The video width in pixels.</summary>
        [JsonPropertyName("width")]
        public int Width { get; set; }
        /// <summary>The video height in pixels.</summary>
        [JsonPropertyName("height")]
        public int Height { get; set; }
    }

    /// <summary>
    /// The parsed video stream produced by an <see cref="AdbScrcpyClient"/>. Exposes the raw
    /// metadata, the demuxed packet stream and the current dimensions.
    /// Wraps <c>AdbScrcpyVideoStream</c> from @yume-chan/adb-scrcpy.
    /// </summary>
    public class AdbScrcpyVideoStream : SpawnJSObject
    {
        /// <summary>Deserialization constructor.</summary>
        public AdbScrcpyVideoStream(SpawnJSObjectReference _ref) : base(_ref) { }

        /// <summary>
        /// The scrcpy video stream metadata (<c>deviceName</c>, <c>width</c>, <c>height</c>,
        /// <c>codec</c>). Uses the <see cref="ScrcpyVideoStreamMetadata"/> wrapper from the Scrcpy lane.
        /// </summary>
        public ScrcpyVideoStreamMetadata Metadata => JSRef!.Get<ScrcpyVideoStreamMetadata>("metadata");

        /// <summary>
        /// The demuxed video stream of <c>ScrcpyMediaStreamPacket</c>s. Must be consumed (e.g.
        /// piped into a decoder's <c>writable</c>) to keep the connection from blocking.
        /// </summary>
        public ReadableStream Stream => JSRef!.Get<ReadableStream>("stream");

        /// <summary>The current video width in pixels.</summary>
        public int Width => JSRef!.Get<int>("width");
        /// <summary>The current video height in pixels.</summary>
        public int Height => JSRef!.Get<int>("height");

        /// <summary>
        /// Subscribes to the <c>sizeChanged</c> event (raised when the device rotates / resizes
        /// the stream). Dispose the returned subscription to unsubscribe.
        /// </summary>
        public TangoSubscription OnSizeChanged(Action<ScrcpyVideoSize> handler)
            => TangoEvents.Subscribe(this, "sizeChanged", handler);
    }
}
