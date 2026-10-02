using Microsoft.Extensions.DependencyInjection;

namespace SpawnDev.SpawnJS.TangoADB
{
    /// <summary>DI helpers for SpawnDev.SpawnJS.TangoADB.</summary>
    public static class TangoServiceCollectionExtensions
    {
        /// <summary>
        /// Registers <see cref="TangoService"/> as a singleton - the optional high-level helper
        /// for managing the WebUSB connect/authenticate lifecycle. The Tango bundle is imported
        /// lazily on first use (or call <see cref="TangoService.EnsureInitialized"/> at startup).
        /// </summary>
        public static IServiceCollection AddTangoADB(this IServiceCollection services)
        {
            services.AddSingleton<TangoService>();
            return services;
        }
    }
}
