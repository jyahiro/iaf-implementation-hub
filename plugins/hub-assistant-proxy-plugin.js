/**
 * Dev-only: proxy Hub Assistant calls through the Docusaurus dev server (same origin → no CORS).
 * Maps `{baseUrl}__hub_platform_api/*` → `http://127.0.0.1:4100/*` (platform API default port).
 *
 * @param {import('@docusaurus/types').LoadContext} context
 */
module.exports = function hubAssistantProxyPlugin(context) {
  const trimmedBase = context.siteConfig.baseUrl.replace(/\/$/, '');
  const prefix = `${trimmedBase}/__hub_platform_api`.replace(/\/+/g, '/');

  return {
    name: 'hub-assistant-proxy-plugin',
    configureWebpack(_config, isServer) {
      if (isServer || process.env.NODE_ENV === 'production') {
        return {};
      }
      return {
        devServer: {
          proxy: [
            {
              context: (pathname) => pathname.startsWith(prefix),
              target: 'http://127.0.0.1:4100',
              changeOrigin: true,
              pathRewrite: (path) => {
                const stripped = path.startsWith(prefix) ? path.slice(prefix.length) : path;
                return stripped.startsWith('/') ? stripped : `/${stripped}`;
              },
            },
          ],
        },
      };
    },
  };
};
