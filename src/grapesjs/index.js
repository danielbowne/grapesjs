import { isUndefined, defaults } from 'underscore';

module.exports = (() => {
  const defaultConfig = require('./config/config');
  const Editor = require('editor');
  const PluginManager = require('plugin_manager');
  const plugins = new PluginManager();
  const editors = [];

  return {

    editors,

    plugins,

    /**
     * Initializes an editor based on passed options
     * @param {Object} config Configuration object
     * @param {string|HTMLElement} config.container Selector which indicates where render the editor
     * @param {Object|string} config.components='' HTML string or Component model in JSON format
     * @param {Object|string} config.style='' CSS string or CSS model in JSON format
     * @param {Boolean} [config.fromElement=false] If true, will fetch HTML and CSS from selected container
     * @param {Boolean} [config.copyPaste=true] Enable/Disable the possibility to copy(ctrl+c) & paste(ctrl+v) components
     * @param {Boolean} [config.undoManager=true] Enable/Disable undo manager
     * @param {Array} [config.plugins=[]] Array of plugins to execute on start
     * @return {grapesjs.Editor} GrapesJS editor instance
     * @example
     * var editor = grapesjs.init({
     *   container: '#myeditor',
     *   components: '<article class="hello">Hello world</article>',
     *   style: '.hello{color: red}',
     * })
     */
    init(config = {}) {
      const els = config.container;

      // Make a missing $ more verbose
      if (isUndefined($)) {
        throw 'jQuery not found';
      }

      if (!els) {
        throw new Error("'container' is required");
      }

      defaults(config, defaultConfig);
      config.el = els instanceof window.HTMLElement ? els : document.querySelector(els);
      const editor = new Editor(config).init();

      // Load plugins
      config.plugins.forEach(pluginId => {
        const plugin = plugins.get(pluginId);

        if (plugin) {
          plugin(editor, config.pluginsOpts[pluginId] || {});
        } else {
          console.warn(`Plugin ${pluginId} not found`);
        }
      });

      // Execute `onLoad` on modules once all plugins are initialized.
      // A plugin might have extended/added some custom type so this
      // is a good point to load stuff like components, css rules, etc.
      editor.getModel().loadOnStart();

      config.autorender && editor.render();

      editors.push(editor);
      return editor;
    },

  };

})();
