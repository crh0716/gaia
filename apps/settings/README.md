# Settings

Settings app is a single place that
- Allows the user to configure device settings
- Responds to **incoming activities** ('configure'), which allows the user to navigate to a specific panel to configure from another app (eg. show the wifi settings panel if no data connection is available).

## Current Status

We are in the middle of the refactoring that targets on the following problem.

### The Problem

Currently basic settings services (mozSettings/UI bindings, panel navigation...) used across the app and root panel specific logic are defined together in a few modules (Settings, Connectivity). There are also cases that multiple panels are supported by a single script. These prevent settings app from being launched with only the necessary scripts and also imapct the perfrmance of loading panels.

### The Goal

The goal is to ensure that each panel loads only the necessary scripts. This could be done by breaking existing modules into smaller and reusable ones. Meanwhile, large scripts should also be splited into modules. By doing this we could achieve:

1. Module separation
2. Panel separation
3. Inline activities
4. View/logic separation

## Architecture

### Modules

We are using [AMD](http://en.wikipedia.org/wiki/Asynchronous_module_definition) modules, loaded using 'Alemeda' (a lighter version of [RequireJS](http://requirejs.org)) and building/optimizing using ['r.js'](http://requirejs.org/docs/optimization.html) (the RequireJS optimizer). We have dependencies on files (`shared/js`)  which aren't AMD modules. For those we use the ['shim'](http://requirejs.org/docs/api.html#config-shim) options in our [`requirejs_config.js`](js/config/require.js)

A few fundamental modules are listed below:

#### module/settings_service.js
`SettingsService` provides a navigate function for panel navigation. It gets the corresponding panel module from `PanelCache` and call to its show and hide functions when navigating (see the module/panel.js section).

#### module/panel_cache.js
`PanelCache` loads panel modules based on panel IDs and caches the loaded modules. If there is no corresponding panel module, it returns `SettingsPanel`.

#### module/panel.js
`Panel` is the base object of the panels in settings app. It defines six basic functions: show, hide, beforeShow, beforeHide, init, and uninit. These functions are called by `SettingsService` during the navigation.
- init:       called at the first time when the beforeShow function gets called
- uninit:     called when cleanup
- beforeShow: called when the panel is about to be navigated into the viewport
- beforeHide: called when the panel is about to be navigated out of the viewport
- show:       called when the panel is navigated into the viewport
- hide:       called when the panel is navigated out of the viewport

The internal functions, _onInit, _onBeforeShow, _onShow, _onBeforeHide, _onHide, and _onUninit, are called respectively in the basic functions. The syntax of the functions are:
```js
  function _onInit(panelElement [, initOptions])
  function _onBeforeShow(panelElement [, beforeShowOptions])
  function _onShow(panelElement [, showOptions])
  function _onBeforeHide()
  function _onHide()
  function _onUninit()
```

We are able to override the internal functions by passing an option object into the constructor of `Panel`. For example,
```js
  Panel({
    onInit: function(panelElement, initOptions) { //... },
    onBeforeShow: function(panelElement, beforeShowOptions) { //... },
    onShow: function(panelElement, showOptions) { //... },
    onBeforeHide: function() { //... },
    onHide: function() { //... },
    onUninit: function() { //... }
  })
```

Typically we can create DOM element references in onInit, update UI elements and add listeners in onShow or onBeforeShow, remove listeners in onHide, and do the cleanup in onUninit. The difference between onShow and onBeforeShow is that onBeforeShow is called before the transition, which makes updating the UI before displaying it to users possible. 

Note that the transition happens right after onBeforeShow, please avoid heavy things in onBeforeShow and onBeforeHide, or it may drag down the performance of the transition.

## module/settings_panel.js
`SettingsPanel` extends `Panel` with basic settings services. It presets the UI elements based on the values in mozSettings and add listeners responding to mozSettings changes in onBeforeShow. In onInit it parses the panel element for activating links. It also removes listeners in onHide so that we can avoid unwanted UI updates when the panel is outside of the viewport.

As we are using require.js for module management, scripts used in a panel should be wrapped in an AMD module or loaded from it, and which should extends from `SettingsPanel` to have basic settings services. Similar to `Panel`, we are able override onShow, onHide, onBeforeShow, onBeforeHide, onInit, and onUninit by passing an option object to the constructor of `SettingsPanel`.


## Build Steps

Settings app has it's own [`Makefile`](Makefile). A Makefile is similar to Grunt, but written in bash. It is essentially a list of tasks that can be run (via `make <task-name>`). When a Gaia application has its own `apps/<app-name>/Makefile`, it will be automatically run when Gaia builds.

Our `Makefile` has two tasks, one to **'build'** and one to **'clean'** (delete the build). The build steps are as follows:

1. Remove any previous settings build from the `build_stage/`
2. Create an new directory `build_stage/settings`
3. Run the `r.js` (RequireJS optimizer), pointing it at our `require_config.jslike` file (`.jslike` because we don't want Gaia builds to mess with it [I think]). This copies our entire application (JS and all) and bundles our JS (tracing `require()` calls) and CSS (tracing `@import`) in two single files.


## Implementation Guide
### How to create a new panel in Settings?
#### 1. Create an HTML template
Create the template with the following format and place it under `elements/`.
```html
  <element name="{panel_name}" extends="section">
    <template>
      <!-- UI elements -->
    </template>
  </element>
```

#### 2. Import the HTML template to index.html
Add the following `link` tag to the head element of index.html.
```html
  <link rel="import" href="{path_to_html_template}">
```

#### 3. Create the placeholder for populating the HTML template
Add the following `section` tag in the body element of index.html. Typically `panel_id` and `panel_name` is identical.
```html
  <section is="{panel_name}" role="region" id="{panel_id}"></section>
```

### How to load scripts for a panel?
#### 1. Define an AMD module for the panel
All dependent scripts should be loaded following the AMD pattern. Usually a panel module is extended from `SettingsPanel` to have the ability of automatic binding to the settings database. You can choose to extend from `Panel` if you would like to handing the binding by yourself or the panel does not need the database at all. Require other depedent modules in the modeul definition. A simple module looks like:
```js
  define(function(require) {
    var SettingsPanel = require('modules/SettingsPanel');
    var Module1 = require('modules/Module1');
    var Module2 = require('modules/Module2');

    return SettingsPanel({
      onInit: function(rootElement, initOptions) {
        // ...
      },
      onUninit: function() {
        // ...
      },
      onShow: function(rootElement, showOptions) {
        // ...
      },
      onHide: function() {
        // ...
      }
    });
  });
```

#### 2. Load the module in the HTML template
A panel module could be loaded by adding a <panel> tag with a `data-path` attrbute specifying the panel module in the end of the template. Then the template will look like:
```html
  <element name="{panel_name}" extends="section">
    <template>

      <!-- UI elements -->

      <panel data-path="{path_to_panel_module}"></panel>

    </template>
  </element>
```
Note that there should be only one panel module specified in the template. All other dependent modules should be required in the panel module. `SettingsPanel` is used by default if no panel module is specified.

All panels should be defined in the folder under `panels/` with the name identical to the panel's name. ex: battery panel should be defined in `panels/battery` folder.

###How to port an existing panel to follow the new architecture design?

#### 1. Edit the HTML template

Find the HTML template corresponding to the panel under `elements/`.
Replace the line in {element}.html from

```html
<script src="js/<panel name>.js"></script>
```
  to
```html
<panel data-path="panels/<panel name>/panel"></panel>
```

Make sure each html element id is start with panel-name prefix for better name spacing.
We will use `help` panel to demostrate following steps.

#### 3. Create/replace modules

Create `js/panels/<panel name>/<name>.js` to replace old `js/<name>.js`. For `help` panel, it denotes use `js/panels/help/support.js` to replace `js/support.js`. With following basis syntax:

```js
  define(function(require) {
    'use strict';

    var Support = {
      init: function support_init() {
        // do the initialization here
      }
    };

    return function ctor_support() {
      return new Support();
    };
  });
```

If the old module called Settings.mozSettings, Use SettingsCache.getSettings() instead. Ex:

```js
  var SettingsCache = require('modules/settings_cache');

  SettingsCache.getSettings(function(result) {
    var onlineSupportTitle = result['support.onlinesupport.title'];
  });
```

Note that the number of the modules supporting the panel is not limited to one. In many cases the original script might be large, we should examime the script carefully and convert them to smaller and reusable modules.

#### 4. Create new panel

Create `panels/<panel name>/panel.js` and use following syntax:

```js
  define(function(require) {
    'use strict';

    var SettingsPanel = require('modules/settings_panel');
    var Support = require('panels/help/support');

    return function ctor_support_panel() {
      return SettingsPanel({
        onInit: function(panelElement, options) {
          Support.init();
        }
      });
    };
  });
```

`panel.js` represents the placeholder of each panel and usually inherits from `modules/settings_panel`. The detail implementation could be separate into several modules. In example is `panels/help/support`.

Avoid naming the modules in source form, so no string ID as the first argument.

Use the [sugared](http://requirejs.org/docs/whyamd.html#sugar) syntax instead of passing dependency arrays.

####  5. Config `settings/js/config/require.js`, add correspondent configurations in `modules` section:

```js
  {
    name: 'panels/help/panel',
    exclude: ['main']
  }
```

Thus in production mode, build script and r.js could pack panel related modules into single js for speed.

#### 6. Test with command for integration test

    $ make test-integration APP=settings

