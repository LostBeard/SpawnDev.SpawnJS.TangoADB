
using SpawnDev.SpawnJS;
using SpawnDev.SpawnJS.JSObjects;

namespace SpawnDev.SpawnJS.TangoADB
{
    /// <summary>
    /// The scrcpy video codec id (the FourCC-style numeric id sent in the stream metadata).
    /// Mirrors <c>ScrcpyVideoCodecId</c>.
    /// </summary>
    public enum ScrcpyVideoCodecId
    {
        /// <summary>H.264 / AVC.</summary>
        H264 = 1748121140,
        /// <summary>H.265 / HEVC.</summary>
        H265 = 1748121141,
        /// <summary>AV1.</summary>
        AV1 = 6387249,
    }

    /// <summary>
    /// A scrcpy audio codec descriptor (one of the static <see cref="Opus"/>/<see cref="Aac"/>/
    /// <see cref="Flac"/>/<see cref="Raw"/> instances). Mirrors <c>ScrcpyAudioCodec</c>.
    /// </summary>
    public class ScrcpyAudioCodec : SpawnJSObject
    {
        /// <summary>Deserialization constructor.</summary>
        public ScrcpyAudioCodec(SpawnJSObjectReference _ref) : base(_ref) { }
        /// <summary>The scrcpy option value string for this codec.</summary>
        public string OptionValue => JSRef!.Get<string>("optionValue");
        /// <summary>The numeric id sent in the stream metadata.</summary>
        public int MetadataValue => JSRef!.Get<int>("metadataValue");
        /// <summary>The MIME type.</summary>
        public string MimeType => JSRef!.Get<string>("mimeType");
        /// <summary>The WebCodecs codec id.</summary>
        public string WebCodecId => JSRef!.Get<string>("webCodecId");
        /// <summary>Serializes this codec to its scrcpy option value string.</summary>
        public string ToOptionValue() => JSRef!.Call<string>("toOptionValue");

        /// <summary>The Opus codec.</summary>
        public static ScrcpyAudioCodec Opus => JS.Get<ScrcpyAudioCodec>("TangoADB.Scrcpy.ScrcpyAudioCodec.Opus");
        /// <summary>The AAC codec.</summary>
        public static ScrcpyAudioCodec Aac => JS.Get<ScrcpyAudioCodec>("TangoADB.Scrcpy.ScrcpyAudioCodec.Aac");
        /// <summary>The FLAC codec.</summary>
        public static ScrcpyAudioCodec Flac => JS.Get<ScrcpyAudioCodec>("TangoADB.Scrcpy.ScrcpyAudioCodec.Flac");
        /// <summary>The raw (uncompressed) codec.</summary>
        public static ScrcpyAudioCodec Raw => JS.Get<ScrcpyAudioCodec>("TangoADB.Scrcpy.ScrcpyAudioCodec.Raw");
    }

    /// <summary>
    /// Metadata describing a scrcpy video stream. Read-only. Mirrors <c>ScrcpyVideoStreamMetadata</c>.
    /// </summary>
    public class ScrcpyVideoStreamMetadata : SpawnJSObject
    {
        /// <summary>Deserialization constructor.</summary>
        public ScrcpyVideoStreamMetadata(SpawnJSObjectReference _ref) : base(_ref) { }
        /// <summary>The device name, if sent.</summary>
        public string? DeviceName => JSRef!.Get<string?>("deviceName");
        /// <summary>The video width, if sent.</summary>
        public int? Width => JSRef!.Get<int?>("width");
        /// <summary>The video height, if sent.</summary>
        public int? Height => JSRef!.Get<int?>("height");
        /// <summary>The video codec id.</summary>
        public ScrcpyVideoCodecId Codec => (ScrcpyVideoCodecId)JSRef!.Get<long>("codec");
    }

    /// <summary>
    /// A scrcpy video stream: the raw byte stream plus its <see cref="Metadata"/>. Read-only.
    /// Mirrors <c>ScrcpyVideoStream</c>.
    /// </summary>
    public class ScrcpyVideoStream : SpawnJSObject
    {
        /// <summary>Deserialization constructor.</summary>
        public ScrcpyVideoStream(SpawnJSObjectReference _ref) : base(_ref) { }
        /// <summary>The encoded video byte stream.</summary>
        public ReadableStream Stream => JSRef!.Get<ReadableStream>("stream");
        /// <summary>The stream metadata.</summary>
        public ScrcpyVideoStreamMetadata Metadata => JSRef!.Get<ScrcpyVideoStreamMetadata>("metadata");
    }

    /// <summary>
    /// A single packet from a scrcpy media (video/audio) stream. Read-only. Mirrors
    /// <c>ScrcpyMediaStreamPacket</c> - a "configuration" or "data" packet.
    /// </summary>
    public class ScrcpyMediaStreamPacket : SpawnJSObject
    {
        /// <summary>Deserialization constructor.</summary>
        public ScrcpyMediaStreamPacket(SpawnJSObjectReference _ref) : base(_ref) { }
        /// <summary>The packet type: "configuration" or "data".</summary>
        public string Type => JSRef!.Get<string>("type");
        /// <summary>For "data" packets, whether this is a keyframe (may be undefined).</summary>
        public bool? Keyframe => JSRef!.Get<bool?>("keyframe");
        /// <summary>For "data" packets, the presentation timestamp (64-bit; JS <c>BigInt</c>), if present.</summary>
        public long? Pts => JSRef!.Get<long?>("pts");
        /// <summary>The packet payload bytes.</summary>
        public Uint8Array Data => JSRef!.Get<Uint8Array>("data");
    }

    /// <summary>
    /// Metadata describing a scrcpy audio stream. Read-only. Mirrors <c>ScrcpyAudioStreamMetadata</c>.
    /// When <see cref="Type"/> is "success", <see cref="Codec"/> and <see cref="Stream"/> are present;
    /// otherwise the type is "disabled" or "errored".
    /// </summary>
    public class ScrcpyAudioStreamMetadata : SpawnJSObject
    {
        /// <summary>Deserialization constructor.</summary>
        public ScrcpyAudioStreamMetadata(SpawnJSObjectReference _ref) : base(_ref) { }
        /// <summary>The metadata type: "success", "disabled" or "errored".</summary>
        public string Type => JSRef!.Get<string>("type");
        /// <summary>The audio codec (only when <see cref="Type"/> is "success").</summary>
        public ScrcpyAudioCodec? Codec => JSRef!.Get<ScrcpyAudioCodec?>("codec");
        /// <summary>The encoded audio byte stream (only when <see cref="Type"/> is "success").</summary>
        public ReadableStream? Stream => JSRef!.Get<ReadableStream?>("stream");
    }

    /// <summary>
    /// A display reported by scrcpy's "list displays" output. Read-only. Mirrors <c>ScrcpyDisplay</c>.
    /// </summary>
    public class ScrcpyDisplay : SpawnJSObject
    {
        /// <summary>Deserialization constructor.</summary>
        public ScrcpyDisplay(SpawnJSObjectReference _ref) : base(_ref) { }
        /// <summary>The display id.</summary>
        public int Id => JSRef!.Get<int>("id");
        /// <summary>The display resolution string, if reported.</summary>
        public string? Resolution => JSRef!.Get<string?>("resolution");
    }

    /// <summary>
    /// An encoder reported by scrcpy's "list encoders" output. Read-only. Mirrors <c>ScrcpyEncoder</c>.
    /// </summary>
    public class ScrcpyEncoder : SpawnJSObject
    {
        /// <summary>Deserialization constructor.</summary>
        public ScrcpyEncoder(SpawnJSObjectReference _ref) : base(_ref) { }
        /// <summary>The encoder type: "video" or "audio".</summary>
        public string Type => JSRef!.Get<string>("type");
        /// <summary>The encoder name.</summary>
        public string Name => JSRef!.Get<string>("name");
        /// <summary>The codec the encoder handles, if reported.</summary>
        public string? Codec => JSRef!.Get<string?>("codec");
        /// <summary>The hardware type: "hardware", "software" or "hybrid", if reported.</summary>
        public string? HardwareType => JSRef!.Get<string?>("hardwareType");
        /// <summary>Whether this is a vendor encoder, if reported.</summary>
        public bool? Vendor => JSRef!.Get<bool?>("vendor");
        /// <summary>The encoder this one is an alias for, if reported.</summary>
        public string? AliasFor => JSRef!.Get<string?>("aliasFor");
    }
}
