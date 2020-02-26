# Dice

**D**ynamic **I**nset **C**reation **E**quipment

## Table of Contents
* [Setup](#setup)
* [Viewing locally](#viewing-locally)
* [Installing libraries](#installing-libraries)
* [Deploying](#deploying)
* [How to embed in the mobile app](#how-to-embed-in-the-mobile-app)
* [Tracking](#tracking)
* [Contact](#contact)

## Setup

1. Clone a fresh copy (make sure to replace `NAME_OF_PROJECT`):

    ```sh
    git clone https://github.dowjones.net/skunkworks/dice.git NAME_OF_PROJECT
    ```

    Then `cd` into the new folder.

2. Make sure you have Node >= 8.0 installed ([Node installer is here](https://nodejs.org/)). Then install dependencies:

    ```sh
    npm install
    ```

3. Run a local server and compile the inset:

    ```sh
    npm start
    ```

    What this does:

    - starts `http-server` on port `8080` (or another port, if 8080 is unavailable)
    - watch `src/` and `inset/` for changes
    - builds `src/` to `dist/local/*`
    - builds `inset/` to `dist/local/inset.json`

## Viewing locally

Once you’re running `npm start`, preview your inset at the urls below:

- http://127.0.0.1:8080/article-standard.html
- http://127.0.0.1:8080/article-immersive.html

## Installing libraries

All libraries should be installed with NPM and bundled using Webpack. Make sure you have NPM version 5.7.1 or higher ([upgrade instructions here](https://docs.npmjs.com/getting-started/installing-node#2-update-npm)).

Here are a few examples:

### D3 and [d3wsj](https://github.dowjones.net/WSJNewsGraphics/d3wsj/)

On the command line:

```bash
npm install d3 --save
npm install git+https://github.dowjones.net/WSJNewsGraphics/d3-wsj.git --save
```

In your JavaScript:
```js
import * as d3 from 'd3';
import * as d3wsj from 'd3wsj';
```

### jQuery

On the command line:

```bash
npm install jquery --save
```

In your JavaScript:

```js
import $ from 'jquery';
```

### [Owl Carousel](https://owlcarousel2.github.io/OwlCarousel2/)

On the command line:

```bash
npm install owl.carousel --save
```

In your JavaScript:

```js
import 'owl.carousel/dist/assets/owl.carousel.css';
import 'owl.carousel';
```

### [Genericharts](https://github.dowjones.net/bentleye/genericharts)

On the command line:

```bash
npm install git+https://github.dowjones.net/bentleye/genericharts.git --save
```

In your Javascript:

```js
import * as WSJCharts from 'genericharts';
```

## Creating a dev link

1. Deploy the inset using the instructions below. _(Technically there is no 'dev environment' for insets.)_
2. Grab the inset URL from the response.
3. Add the inset URL to the end of this URL:
```http://graphicstools.dowjones.net/preview/?inset=```

## Deploying

Before deploying:

- Make sure that `slug` has been set in `inset/data.json`
  - The format should be `project-name-uuid` (for example, `brexit-explainer-eb0b4bea-c339-4c99-9682-487f76c2af0c`)
  - We add this UUID (universally unique identifier) to make sure slugs don't get repeated. Generate one at [uuidgenerator.net](https://www.uuidgenerator.net/)
- Check that preview pages look ok
- Push latest code to a GitHub repo

To deploy your inset to S3, run this:

```sh
npm run deploy
```

When done, the deploy script will show the production inset URL. It will always write to the same location (assuming the slug doesn’t change).

What this script does:

- cleans `dist/remote/*`
- builds `src/` to `dist/remote/*`
- builds `inset/` to `dist/remote/inset.json`
- deploy assets to s3: `https://asset.wsj.net/wsjnewsgraphics/dice/slug/*`

## How to embed in the mobile app

Dynamic insets are not rendered in the mobile app or on AMP or Apple News pages by default.

You can ✨automatically✨ create a fallback screenshot of your inset by setting `createFallbackImage` to `true` in `inset/data.json`. This screenshot will be created in `dist/local/fallback.png` when `npm start` is running or `dist/remote/fallback.png` when `npm run deploy` is executed. It will be automatically added to `inset.json` and deployed. No other steps are required.

If `createFallbackImage` is not appropriate for your interactive inset, here are other options:

### 1. Manually create and place a static image fallback

Show a static image fallback, as in ai2html and Chartlos. [Here’s an example fallback image](https://si.wsj.net/public/resources/images/OG-BC775_201701_4U_20180131192818.png). See below for more details.

Here are two possible methods for creating a fallback image:

- [Screenshot a DOM element in Chrome](https://developers.google.com/web/updates/2017/08/devtools-release-notes#node-screenshots) (on a high-dpi/retina screen)
- Create it in Illustrator using the ai2html template, and export the "4u fallback" artboard at 300dpi

Your fallback image should be at least 600px wide, and the type should be nice and sharp.

To get it in the article:

1. Upload fallback image through [the whopper](http://graphicsdev.dowjones.net/tools/whopper/uploader).
2. Take note of the GAMS number.
3. In Methode, add the image below the inset.
    - Check "Mobile app" but uncheck "Web".

Examples: 

- [U.S. Government Deficit Grew 17% in Fiscal 2018](https://www.wsj.com/articles/u-s-government-debt-rises-17-in-fiscal-2018-1539626598)

### 2. Add a link to a standalone page

Link out to a separate page (for the app only). This will make it behave like a Template Chameleon embed.

1. Generate a standalone URL using the template below by replacing `URL_GOES_HERE` with your inset link.
  ```https://graphics.wsj.com/dynamic-inset-iframer/?url=URL_GOES_HERE```
2. Create a promo image and upload it to the Whopper. It should be G or M size (G is OK, but M will look sharper), with the headline text on the image (because the app doesn't show a strap). The headline text should not be placed at the lower left corner, as the app overlays an icon in that position.
3. Create a new settings file using the [settings file tool](http://int.production.wsj-newsroom-tools.ohio.dj01.onservo.com/settings-file). If you don't add a promo image to the settings file, it will show up in the app as a mysterious gray box. The slug should be the story slug with a date, e.g. `fed-jobs-20181207` 
4. In Methode, add the settings file below the inset.
    - Check "Mobile app" but uncheck "Web".

Examples:

- [Wages Rise at Fastest Rate in Nearly a Decade as Hiring Jumps](https://www.wsj.com/articles/wages-rise-at-fastest-rate-in-nearly-a-decade-as-hiring-jumps-in-october-1541161920) 

#### Example instructions to send a story editor

- Specify whether the graphic is **inline** or **wrap**.
- You only need to send the slug of the Flash settings file (not `settings.js`).

```
Graphic preview: http://graphicstools.dowjones.net/preview/?inset=https://wsjnewsgraphics.s3.amazonaws.com/dice/fed-projections-a60e37b7-1d82-4c05-83e5-78f01545c0eb/inset.json&layout=inline

Instructions for Methode:

1. Place dynamic inset after 3rd paragraph as an INLINE graphic:
https://asset.wsj.net/wsjnewsgraphics/dice/fed-projections-a60e37b7-1d82-4c05-83e5-78f01545c0eb/inset.json

2. Below dynamic inset, add the Flash settings file below. (This allows the graphic to show up on our mobile app.) Then, check "Mobile app" but uncheck "Web".
Settings file: fed-jobs-20181207
```

### 3. Don’t show anything at all

Not ideal, but if the content isn't worth clicking through to a separate page for, and can't be represented with a static image, maybe we don't show it in the app.

## Tracking

Integrate tracking (of clicks and other interactions) using the snippet below. Be sure to replace `your-slug-here`. 

```js
function trackAction(action) {
	var additionalAttributes = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
	if (window && window.NREUM) {
		var data = Object.assign({}, {
			projectOwner: 'wsjGraphics',
			projectName: 'your-slug-here'
		}, additionalAttributes);
		window.NREUM.addPageAction(action, data);
	}
}
```

Use it like so:

```
trackAction('clickButton');
```

## Contact

Need Assistance? Email [tools@wsj.com](mailto:tools@wsj.com).
