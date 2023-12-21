import packageJson from './package.json' assert { type: 'json' };

/**
 * After changing, please reload the extension at `chrome://extensions`
 * @type {chrome.runtime.ManifestV3}
 */
const manifest = {
  manifest_version: 3,
  name: "UT Course Finder",
  version: packageJson.version,
  description: packageJson.description,
  permissions: ['storage'],
  // side_panel: {
  //   default_path: 'src/pages/sidepanel/index.html',
  // },
  options_page: 'src/pages/options/index.html',
  background: {
    service_worker: 'src/pages/background/index.js',
    type: 'module',
  },
  action: {
    default_popup: 'src/pages/popup/index.html',
    default_icon: 'icon-32.png',
  },
  // chrome_url_overrides: {
  //   newtab: 'src/pages/newtab/index.html',
  // },
  icons: {
    128: 'icon-128.png',
    48: 'icon-48.png',
    32: 'icon-32.png',
    16: 'icon-16.png',

  },
  content_scripts: [
    // {
    //   matches: ['http://*/*', 'https://*/*', '<all_urls>'],
    //   js: ['src/pages/content/index.js'],
    //   // KEY for cache invalidation
    //   css: ['assets/css/contentStyle<KEY>.chunk.css'],
    // },
  ],
  // devtools_page: 'src/pages/devtools/index.html',
  web_accessible_resources: [
    {
      resources: ['assets/js/*.js', 'assets/css/*.css', 'icon-128.png', 'icon-34.png'],
      matches: ['*://*/*'],
    },
  ],
};

export default manifest;
