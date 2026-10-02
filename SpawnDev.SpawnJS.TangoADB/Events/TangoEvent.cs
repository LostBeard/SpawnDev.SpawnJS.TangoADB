using System.Diagnostics.CodeAnalysis;
using SpawnDev.SpawnJS;
using SpawnDev.SpawnJS.JSObjects;

namespace SpawnDev.SpawnJS.TangoADB
{
    /// <summary>
    /// A live subscription to a Tango <c>@yume-chan/event</c> <c>Event&lt;T&gt;</c>.
    /// Dispose to unsubscribe (calls the disposer the event returned and releases the callback).
    /// </summary>
    public sealed class TangoSubscription : IDisposable
    {
        Function? _disposer;
        Callback? _callback;
        internal TangoSubscription(Function disposer, Callback callback)
        {
            _disposer = disposer;
            _callback = callback;
        }
        /// <inheritdoc/>
        public void Dispose()
        {
            try { _disposer?.ApplyVoid(null); } catch { /* event already torn down */ }
            _disposer?.Dispose();
            _disposer = null;
            _callback?.Dispose();
            _callback = null;
        }
    }

    /// <summary>
    /// Helpers for subscribing to Tango's callable <c>Event&lt;T&gt;</c> values.
    /// Tango events are functions: calling <c>event(listener)</c> registers the listener and
    /// returns a disposer function. Because the event is a callable property of its owner,
    /// <c>owner.eventName(listener)</c> is a normal method-style call.
    /// </summary>
    public static class TangoEvents
    {
        /// <summary>Subscribes <paramref name="handler"/> to the callable event property
        /// <paramref name="eventName"/> on <paramref name="owner"/>. Dispose the result to unsubscribe.</summary>
        public static TangoSubscription Subscribe<[DynamicallyAccessedMembers(DynamicallyAccessedMemberTypes.PublicConstructors)] T>(SpawnJSObject owner, string eventName, Action<T> handler)
        {
            var cb = Callback.Create(handler);
            var disposer = owner.JSRef!.Call<ActionCallback<T>, Function>(eventName, cb);
            return new TangoSubscription(disposer, cb);
        }

        /// <summary>Subscribes a no-argument <paramref name="handler"/> to the callable event property.</summary>
        public static TangoSubscription Subscribe(SpawnJSObject owner, string eventName, Action handler)
        {
            var cb = Callback.Create(handler);
            var disposer = owner.JSRef!.Call<ActionCallback, Function>(eventName, cb);
            return new TangoSubscription(disposer, cb);
        }
    }
}
