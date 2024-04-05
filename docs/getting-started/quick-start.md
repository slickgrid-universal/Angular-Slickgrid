# Quick start

> **NOTE** these instructions are for the latest Angular-Slickgrid v7.x and might be different for earlier versions of the lib.

### 1. Install NPM Package
Install the `Angular-Slickgrid`, and other external packages like `Bootstrap` and `Font-Awesome`
(Bootstrap, Font-Awesome are optional, you can choose other lib if you wish)
```bash
npm install --save angular-slickgrid bootstrap font-awesome # the last deps are optional

# install required @types
npm install --save-dev @types/sortablejs @types/dompurify
```
#### Important note about `ngx-translate`
#### Now optional
`ngx-translate` is now optional as of version `2.10.0`, see more info below at [step 5](#5-installsetup-ngx-translate-for-localization-optional)
**NOTE** please note however that `@ngx-translate` will still be installed behind the scene to make DI (dependency injection) not complaining when using `@Optional()` but it should be removed by the build tree shaking process once you run a production build. See their version compatibility table below

| Angular Version     | @ngx-translate/core |
|---------------------|---------------------|
|  16+                |        15.x         |
|  13+ (**Ivy only**) |        14.x         |
|  10-13              |        13.x         |
|  8-9                |        12.x         |
|  7                  |        11.x         |

### 2. Modify the `angular.json` and `tsconfig.app.json` files
#### previous Angular versions were using `.angular-cli.json`
Then modify your `angular.json` file with the following Styles and Scripts:

```js
"styles": [
    "node_modules/bootstrap/dist/css/bootstrap.min.css",    // optional, install when you use Bootstrap
    "node_modules/font-awesome/css/font-awesome.min.css",   // optional, install when you use Font-Awesome
    "node_modules/flatpickr/dist/flatpickr.css",
    "styles.css"
],
"scripts": [
    "node_modules/bootstrap/dist/js/bootstrap.js",           // optional, install when you use Bootstrap
],
```

<a name="step3"></a>
### 3. CSS / SASS Styles
Load the default Bootstrap theme style and/or customize it to your taste (either by using SASS or CSS variables)

#### CSS
Default compiled `css` (if you use the plain Bootstrap Theme CSS, you could simply add it to your `.angular-cli.json` file and be done with it).

**Note:** If you are also using `Bootstrap-SASS`, then there is no need to include the `bootstrap.css` in the `styles: []` section.

```json
"styles": [
    "node_modules/bootstrap/dist/css/bootstrap.css",
    "node_modules/font-awesome/css/font-awesome.css",
    "styles.css",
    "node_modules/@slickgrid-universal/common/dist/styles/css/slickgrid-theme-bootstrap.css"
],
```

#### SASS (scss)
You could also compile the SASS files with your own customization, for that simply take any of the [_variables.scss](https://github.com/ghiscoding/slickgrid-universal/blob/master/packages/common/src/styles/_variables.scss) (without the `!default` flag) variable file and make sure to import the Bootstrap Theme afterward. For example, you could modify your `style.scss` with the following changes:

```scss
/* for example, let's change the mouse hover color */
$cell-odd-background-color: lightyellow;
$row-mouse-hover-color: lightgreen;

/* make sure to add the @import the SlickGrid Bootstrap Theme AFTER the variables changes */
@import '@slickgrid-universal/common/dist/styles/sass/slickgrid-theme-bootstrap.scss';
```

### 4. Include it in your App Module

Include `AngularSlickgridModule` in your App Module (app.module.ts)
**Note**
Make sure to add the `forRoot` since it will throw an error in the console when not provided.

```typescript
import { AngularSlickgridModule } from 'angular-slickgrid';

@NgModule({
  declarations: [AppComponent],
  imports: [ AngularSlickgridModule.forRoot() ], // forRoot() is required, it won't work without it
  bootstrap: [AppComponent]
})
export class AppModule { }
```

#### Angular 7+
The new updated version of `ng-packagr` use strict metadata and you might get errors about `Lambda not supported`, to bypass this problem you can add the `@dynamic` comment over the `@NgModule` as shown below:
```ts
// @dynamic
@NgModule({
  ...
})
```

### 5. Install/Setup `ngx-translate` for Localization (optional)
#### If you don't want to use any Translate Service and use only 1 Locale then take a look at this [demo](https://github.com/ghiscoding/angular-slickgrid-demos/tree/master/bootstrap4-demo-with-locales)
To provide locales other than English (default locale), you have 2 options that you can go with. If you only use English, there is nothing to do (you can still change some of the texts in the grid via option 1.)
1. Using [Custom Locale](../localization/Localization-with-Custom-Locales.md), that is when you use **only 1** locale (other thank English)... this is a new feature starting from version `2.10.0` and up.
2. Using [Localization with I18N](../localization/Localization-with-ngx-translate.md), that is when you want to use multiple locales dynamically.
3. **NOTE** you still need to install `@ngx-translate` (since it is a peer dependency) but it should be removed after doing a production build since it's optional.

##### Translation Keys
Also note that every time you want to use a translation key, you simply have to use a property with the `Key` suffix. For example if you wish to have a column definition `name` with a translation, just use the `nameKey: 'TRANSLATE_KEY'` instead of `name`. Below is a list of keys that can be used in the lib

| without Translate | with Translate |
| ----------------- | -------------- |
| name              | nameKey        |
| label             | labelKey       |
| title             | titleKey       |
| columnGroup       | columnGroupKey |
| optionTitle       | optionTitleKey |

##### Date Picker - Flatpickr Localization
If you use multiple locale, you will also need to define which Flatpickr Locale to import, for more info on how to do that then take a look at the [Flatpickr Localization Docs](../column-functionalities/filters/Compound-Filters.md#date-picker---flatpickr-localization)

### 6. Create a basic grid
And finally, you are now ready to use it in your project, for example let's create both html/ts files for a `grid-basic.component` example, configure the Column Definitions, Grid Options and pass a Dataset to the grid:
```ts
import { Column, GridOption } from 'angular-slickgrid';

export class GridBasicComponent {
  columnDefinitions: Column[] = [];
  gridOptions: GridOption = {};
  dataset: any[] = [];

  constructor() {
    this.prepareGrid();
  }

  prepareGrid() {
    this.columnDefinitions = [
      { id: 'title', name: 'Title', field: 'title', sortable: true },
      { id: 'duration', name: 'Duration (days)', field: 'duration', sortable: true },
      { id: '%', name: '% Complete', field: 'percentComplete', sortable: true },
      { id: 'start', name: 'Start', field: 'start' },
      { id: 'finish', name: 'Finish', field: 'finish' },
    ];

    this.gridOptions = {
      enableAutoResize: true,
      enableSorting: true
    };

    // fill the dataset with your data (or read it from the DB)
    this.dataset = [
      { id: 0, title: 'Task 1', duration: 45, percentComplete: 5, start: '2001-01-01', finish: '2001-01-31' },
      { id: 1, title: 'Task 2', duration: 33, percentComplete: 34, start: '2001-01-11', finish: '2001-02-04' },
    ];
  }
}
```

define Angular-Slickgrid in your View
```html
<div class="container">
  <angular-slickgrid gridId="grid1"
            [columnDefinitions]="columnDefinitions"
            [gridOptions]="gridOptions"
            [dataset]="dataset">
  </angular-slickgrid>
</div>
```

### 7. Explore the Documentation
The last step is really to explore all the pages that are available in this documentation website, all the documentation will be place in here and so you should visit it often. For example a good starter is to look at the following
- all the `Grid Options` you can take a look at, [Slickgrid-Universal - Grid Options](https://github.com/ghiscoding/angular-slickgrid/blob/master/src/app/modules/angular-slickgrid/models/gridOption.interface.ts) interface
- [Formatters](../column-functionalities/Formatters.md)
- [Editors](../column-functionalities/Editors.md)
- [Filters](../column-functionalities/filters/Select-Filter.md)
- [Grid Menu](../grid-functionalities/Grid-Menu.md)
... and much more, just explorer the Documentation through the table of content (on your left)

### 8. How to load data with `HttpClient`?
You might notice that all demos are made with mocked dataset that are embedded in each examples, that is mainly for demo purposes, but you might be wondering how to connect this with an `HttpClient`? Easy... just replace the mocked data, assigned to the `dataset` property, by your `HttpClient` call and that's it. The `dataset` property can be changed at any time, which is why you can use local data and/or connect it to a `Promise` or an `Observable` with `HttpClient` (internally it's just a SETTER that refreshes the grid). See [Example 24](https://ghiscoding.github.io/Angular-Slickgrid/#/gridtabs) for a demo showing how to load a JSON file with `HttpClient`.

### 9. Get Started
The best way to get started is to clone the [Angular-Slickgrid-demos](https://github.com/ghiscoding/angular-slickgrid-demos), it has multiple examples and it is also updated frequently since it is used for the GitHub Bootstrap 4 demo page. `Angular-Slickgrid` has 3 `Bootstrap` repos, you can see a demo of each ones below.
- [Bootstrap 4 demo](https://ghiscoding.github.io/angular-slickgrid-bs4-demo) / [examples repo](https://github.com/ghiscoding/angular-slickgrid-demos/tree/master/bootstrap4-demo-with-translate) (using `ngx-translate`)
  - [Bootstrap 4 - examples repo](https://github.com/ghiscoding/angular-slickgrid-demos/tree/master/bootstrap4-demo-with-locales) (single Locale, without using `ngx-translate`)
- [Bootstrap 5 demo](https://ghiscoding.github.io/Angular-Slickgrid/#/basic) / [examples repo](https://github.com/ghiscoding/angular-slickgrid-demos/tree/master/bootstrap5-demo-with-translate)

##### All Live Demo Examples have links to the actual code
Like to see the code to a particular Example? Just click on the "see code" that is available in every live examples.

### 10. Missing Features? (fear not)
What if `Angular-Slickgrid` is missing feature(s) versus the original `SlickGrid`? Fear not and directly use the `SlickGrid` and `DataView` objects that are expose from the start through Custom Events. For more info continue reading on [Docs - SlickGrid & DataView objects](../slick-grid-dataview-objects/SlickGrid-&-DataView-Objects.md)

### 11. Build Errors/Warnings
You might also get warnings about SlickGrid while doing a production build, most of them are fine and the best way to fix them, is to simply remove/ignore the warnings, all you have to do is to add a file named `ngcc.config.js` (for Angular 8 to 15) in your project root (same location as the `angular.json` file) with the following content (you can also see this [commit](https://github.com/ghiscoding/angular-slickgrid-demos/commit/1fe8092bcd2e99ede5ab048f4a7ebe6254e4bee0) which fixes the Angular-Slickgrid-Demos prod build):
```js
// for Angular 8 to 15 (removed in Angular 16)
module.exports = {
  packages: {
    'angular-slickgrid': {
      ignorableDeepImportMatchers: [
        /slickgrid\//,
        /flatpickr/,
      ]
    },
  }
};
```
You should also add `Angular-Slickgrid` and any dependency that Angular shows a CommonJS warning, add them as allowed CommonJS dependencies to your `angular.json` file to silence these warnings.
```json
"options": {
  "allowedCommonJsDependencies": [
    "isomorphic-dompurify",
    "flatpickr",
    "stream"
  ],
}
```

### 12. Angular 12 with WebPack 5 - how to fix polyfill error
Since Angular 12 switched to WebPack 5, you might get some new errors and you will need to add some polyfills manually to get the Excel Builder (Excel Export) to work.

#### The error you might get

```shell
BREAKING CHANGE: webpack < 5 used to include polyfills for node.js core modules by default.
This is no longer the case. Verify if you need this module and configure a polyfill for it.
```

#### Steps to fix it
1. `npm install stream-browserify`
2. Add a path mapping in `tsconfig.app.json`:
```
{
  ...
  "compilerOptions": {
    "paths": {
      "stream": [ "./node_modules/stream-browserify" ]
    },
```
3. Add `stream` (and any other CJS deps) to `allowedCommonJsDependencies` in `angular.json`:
```
"options": {
  "allowedCommonJsDependencies": [
    "autocompleter",
    "dompurify",
    "flatpickr",
    "stream"
  ],
},
```

... and that should cover it, now let's code!