# HTML5 Template + webpack + TypeScript + Less + PostCSS (Boilerplate + Build tool)

HTML5 template with webpack, TypeScript, Less, PostCSS boilerplate.
The build tool is included (CSS and JS optimization support).

## Included

- Less support
- PostCSS
- webpack
- TypeScript support
- JavaScript Support
- Fonts support
- Images support
- JS optimization
- CSS optimization
- Build tool  

## File structure

- src/less/styles.less - place your less code here,
- src/css/styles.css - auto-generated CSS by watch script (don't edit),
- src/js/script.js - auto-generated (don't edit),
- src/ts/script.ts - you can place your TypeScript here (optional),
- src/ts/index.ts - place your TypeScript here (recommended),
- src/fonts - place your fonts here,
- src/images - place your images here,
- src/index.html - place your HTML here,

## Prerequisites

- Node.js
- npm

## Installation

```npm install```

## Scripts

### Run project/server

``` npm run app ```

### Build project

Build project into the ```dist``` output directory.

``` npm run build ```

### Compile less file

``` npm run less-compile ```

### Compile TypeScript files

``` npm run tsc ```

### Watch less files

``` npm run less-watch ```

## Run build/production version

Run index.html file (dist/index.html).
You can use the Live server to run index.html.

## Configuration

### npm 
#### JavaScript entry point

Edit package.json file.

Change the entry point here.

``` "main": "src/js/script.js",```

### webpack
#### Output directory

Edit webpack.config.js file.

Change the output directory here.

```path: path.resolve(__dirname, "dist"),```
