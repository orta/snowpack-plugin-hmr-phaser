const assert = require('assert').strict;
const plugin = require("./")

/** Watch mode:
    npx nodemon test.js

    Run tests
    node test.js
 */

 console.clear()


describe(plugin.shouldAddSceneHMR, () => {
  it("only works with js files", () => {
    const notJS = [".ts", ".jsx", ".css"]
    for (const file of notJS) {
      assert.equal(plugin.shouldAddSceneHMR({ fileExt: file }), false)
    }
  })

  it("only works with js files where a class extends StateScene", () => {
    /** @type {Opts} */
    const input = { fileExt: ".js", contents: "" }
    assert.equal(plugin.shouldAddSceneHMR(input), false)

    /** @type {Opts} */
    const input2 = { fileExt: ".js", contents: "class ExampleScene extends StateScene<State>" }
    assert.equal(plugin.shouldAddSceneHMR(input2), true)
  })
})

describe(plugin.addHMRToScene, () => {
  it("bails when a buffer is passed", () => {
    assert.throws(() => plugin.addHMRToScene({ contents: Buffer.from("123") }))
  })

  it("adds an error message when a malformed file is passed in", () => {
    /** @type {Opts} */
    const input = { 
      id: "path/to/file.js",
      contents: "export class ExampleScene2 extends StateScene2" 
    }

    const result = plugin.addHMRToScene(input)

    assert.match(result, /did not conform to the pattern/)
  })

  it("adds the HMR prefix", () => {
    /** @type {Opts} */
    const input = { 
      id: "path/to/file.js",
      contents: "export let ExampleScene = class ExampleScene2 extends StateScene2" 
    }

    const result = plugin.addHMRToScene(input)

    assert.match(result, /if \(import\.meta\.hot/)
  })
})

// Simple no-deps test runner

/** @typedef {import("./example/node_modules/snowpack").PluginTransformOptions} Opts */

function describe(f, ctx) {
  process.stdout.write(`# \x1b[1m${f.name}\x1b[0m\n`);
  ctx()
}

function it(name, ctx) {
  try {
    ctx()
    process.stdout.write(" - " + name)
    process.stdout.write(' \x1b[32m✓\x1b[0m\n');
  } catch (error) {
    process.stdout.write(" - \x1b[1m" + name)
    process.stdout.write(' \x1b[31m✖\x1b[0m\n\n');
    console.error(error.message.split("\n").map(r => "     " + r).join("\n"))
    process.exitCode = 1
  }
}

