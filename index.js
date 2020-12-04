// @ts-check

/** @type {import("./example/node_modules/snowpack").SnowpackPluginFactory} */
function plugin(_snowpackConfig, _pluginOptions) {
  return {
    name: 'snowpack-plugin-hrm-phaser',
    async transform(opts) {
      if (!opts.isDev) return 
      // if (!opts.isHmrEnabled) return

      if (opts.fileExt === '.js') {
        if (!shouldAddSceneHMR(opts)) return
        return addHMRToScene(opts)
      }
    },
  };
};

/** @type {(opts: import("./example/node_modules/snowpack").PluginTransformOptions) => boolean} */
const shouldAddSceneHMR = (opts) => {
  if (opts.fileExt === ".js" && opts.contents.includes("extends StateScene")) return true
  return false
}

/** @type {(opts: import("./example/node_modules/snowpack").PluginTransformOptions) => string} */
const addHMRToScene = (opts) => {
  // Mainly so flow analysis doesn't complain
  if (typeof opts.contents === "object") throw new Error("Got a binary file in addHMRToScene")

  // Simple regex instead of real parsing for now, will see how that works out in prod
  // https://regex101.com/r/yNq5fr/1
  const getModuleInfoRegex = new RegExp(/export let (.+) = (.+) StateScene/, "gm")
  const results = getModuleInfoRegex.exec(opts.contents)
  if (!results) {
    const filename = opts.id.split("/").pop()
    const msg = `Scene in file ${filename} did not conform to the pattern: "export let MyClass = class (Name) extends StateScene`
    return `${opts.contents}\n${badSceneJSSuffix(msg)}`
  }

  const exportName = results[1]
  return `${opts.contents}\n${sceneHMRSuffix(exportName)}`

}

const badSceneJSSuffix = (msg) => {
  return `
// From snowpack-plugin-hmr-phaser
let sceneBanner = document.getElementById("bad-scene-banner")
if (!sceneBanner) {
  const banner = document.createElement("div")
  banner.id = "bad-scene-banner"
  banner.innerText = '${msg}'
  document.body.appendChild(banner)
}
`
}

const sceneHMRSuffix = (moduleVarName) => {
  return `
// From snowpack-plugin-hmr-phaser

if (import.meta.hot) {
  // Receive any updates from the dev server, and update accordingly.
  import.meta.hot.accept(({ module }) => {
    try {
      if (!window.game) throw new Error("Could not access window.game for HMR, this needs to be set up in your game init code.")
      
      const game = window.game;
      const scenes = game.scene.getScenes();

      // Find any which match the current scene
      const theseScenes = scenes.filter((s) => s instanceof ${moduleVarName});

      // Change this module's version of the current scene class
      ${moduleVarName} = module.${moduleVarName};

      // Loop through all the known scenes and then delete and restart
      // the scene with the same state 
      theseScenes.forEach(s => {
        const config = s.state._config;
        const key = typeof config === 'string' ? config : config.key;
        const state = s.state;
        s.game.scene.remove(key);

        game.scene.add(key, new ${moduleVarName}(config, state), true);
      });

      let sceneBanner = document.getElementById("bad-scene-banner")
      if (sceneBanner) {
        sceneBanner.parentElement.removeChild(sceneBanner)
      }

    } catch (err) {
      // If you have trouble accepting an update, mark it as invalid (reload the page).
      console.error(err);
      import.meta.hot.invalidate();
    }
  });
}`
}

module.exports = plugin
plugin.shouldAddSceneHMR = shouldAddSceneHMR
plugin.addHMRToScene = addHMRToScene
