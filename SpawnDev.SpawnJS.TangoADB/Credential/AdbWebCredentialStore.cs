
using SpawnDev.SpawnJS;

namespace SpawnDev.SpawnJS.TangoADB
{
    /// <summary>
    /// An ADB credential store that generates an RSA private key with the Web Crypto API and
    /// persists it in IndexedDB. Pass an instance as
    /// <see cref="AdbDaemonAuthenticationOptions.CredentialStore"/>. Reusing the same store (and
    /// app name) means the device only has to approve "Allow USB debugging?" once.
    /// Wraps the default export of @yume-chan/adb-credential-web.
    /// </summary>
    public class AdbWebCredentialStore : SpawnJSObject
    {
        /// <summary>Deserialization constructor.</summary>
        public AdbWebCredentialStore(SpawnJSObjectReference _ref) : base(_ref) { }
        /// <summary>Creates a credential store. <paramref name="appName"/> is shown on the device's RSA key prompt.</summary>
        public AdbWebCredentialStore(string? appName = null)
            : base(appName == null ? JS.New("TangoADB.AdbWebCredentialStore") : JS.New("TangoADB.AdbWebCredentialStore", appName)) { }
        /// <summary>Generates a new RSA private key (overwrites any existing one) and returns it.</summary>
        public Task<SpawnJSObject> GenerateKey() => JSRef!.CallAsync<SpawnJSObject>("generateKey");
    }
}
