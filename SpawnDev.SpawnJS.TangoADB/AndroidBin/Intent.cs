
using SpawnDev.SpawnJS;

namespace SpawnDev.SpawnJS.TangoADB
{
    /// <summary>
    /// Fluent builder for an Android <c>Intent</c> command line (the argv passed to <c>am</c>).
    /// Each setter mutates and returns the same builder. Wraps <c>IntentBuilder</c> from
    /// @yume-chan/android-bin. Namespaced under <c>TangoADB.AndroidBin</c>.
    /// </summary>
    public class IntentBuilder : SpawnJSObject
    {
        /// <summary>Deserialization constructor.</summary>
        public IntentBuilder(SpawnJSObjectReference _ref) : base(_ref) { }
        /// <summary>Creates a new, empty intent builder.</summary>
        public IntentBuilder() : base(JS.New("TangoADB.AndroidBin.IntentBuilder")) { }

        /// <summary>Sets the intent action (<c>-a</c>), e.g. <c>android.intent.action.VIEW</c>.</summary>
        public IntentBuilder SetAction(string action) { JSRef!.CallVoid("setAction", action); return this; }
        /// <summary>Adds an intent category (<c>-c</c>).</summary>
        public IntentBuilder AddCategory(string category) { JSRef!.CallVoid("addCategory", category); return this; }
        /// <summary>Restricts the intent to a single package (<c>-p</c>).</summary>
        public IntentBuilder SetPackage(string packageName) { JSRef!.CallVoid("setPackage", packageName); return this; }
        /// <summary>Sets the explicit component (<c>-n</c>), e.g. <c>pkg/.Activity</c>.</summary>
        public IntentBuilder SetComponent(string component) { JSRef!.CallVoid("setComponent", component); return this; }
        /// <summary>Sets the intent data URI (<c>-d</c>).</summary>
        public IntentBuilder SetData(string data) { JSRef!.CallVoid("setData", data); return this; }
        /// <summary>Adds a string extra (<c>--es</c>).</summary>
        public IntentBuilder AddStringExtra(string key, string value) { JSRef!.CallVoid("addStringExtra", key, value); return this; }
        /// <summary>Builds the intent into an argv array suitable for <c>am</c>.</summary>
        public string[] Build() => JSRef!.Call<string[]>("build");
    }
}
