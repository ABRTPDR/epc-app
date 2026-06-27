const { withAndroidManifest } = require('expo/config-plugins');

const withAndroidQueries = (config) => {
  return withAndroidManifest(config, (config) => {
    // Ensure that queries array exists
    config.modResults.manifest.queries = config.modResults.manifest.queries || [];
    
    // Inject mailto and tel intents
    config.modResults.manifest.queries.push({
      intent: [
        {
          action: [{ $: { "android:name": "android.intent.action.SENDTO" } }],
          data: [{ $: { "android:scheme": "mailto" } }]
        },
        {
          action: [{ $: { "android:name": "android.intent.action.DIAL" } }],
          data: [{ $: { "android:scheme": "tel" } }]
        }
      ]
    });
    
    return config;
  });
};

module.exports = withAndroidQueries;