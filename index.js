const { resolve } = require('path');
const fs = require('fs');
const { promisify } = require('util');
const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);
const minify = require('html-minifier').minify;
const argv = require('yargs').argv;
const handlebars = require('handlebars');
const chokidar = require('chokidar');
const colors = require('colors');
const request = require('superagent');
const prettyjson = require('prettyjson');
const puppeteer = require('puppeteer');
const sizeOf = require('image-size');

const destinations = require('./utils/destinations');
const screenshotDOMElement = require('./utils/screencapture');

const DATA = require(resolve(__dirname, './inset/data.json'));

JSON.minify = require('node-json-minify');

async function generateInset(isProduction){
  const assets = isProduction ? destinations(DATA.slug).remote : destinations().local;
  const source = await readFileAsync(resolve(__dirname, './inset/template.html'), 'utf8');
  const template = handlebars.compile(source);
  const data = Object.assign({}, DATA, assets);
  const html = template(data);

  const inset = JSON.parse('{"status":"OK","type":"InsetDynamic","platforms":["desktop"],"serverside":{"data":{"data":{}},"template":{}}}');

  inset.serverside.template.template = minify(html, {
    removeComments: true,
    removeEmptyAttributes: true
  });

  const space = isProduction ? null : '\t';
  const filePath = isProduction ? 'dist/remote/inset.json' : 'dist/local/inset.json';

  try {
    const fileError = await writeFileAsync(filePath, JSON.stringify(inset, null, space), 'utf8');
    return;
  } catch(error) {
    console.log(error);
  }
}

async function generateFallback(isProduction, port = 3000){
  const filePath = isProduction ? 'dist/remote' : 'dist/local';
  const inset = JSON.parse(fs.readFileSync(`${filePath}/inset.json`, 'utf8'));
  const fallbackPath = isProduction ? destinations(DATA.slug).remote.fallbackUrl : destinations().local.fallbackUrl;

  return new Promise (async (resolve, reject) => {
    const browser = await puppeteer.launch();
      const page = await browser.newPage();
      await page.setViewport({width: 1000, height: 600, deviceScaleFactor: 2});
      await page.goto(`http://127.0.0.1:${port}/article-standard.html#wrap`, {waitUntil: 'networkidle2'});
      await screenshotDOMElement(`${filePath}/fallback.png`,page, '.wsjgraphics');
      await browser.close();

      const fallbackDimensions = sizeOf(`${filePath}/fallback.png`);

      inset.platforms.push('mobile');
      inset.alt = {
        render: { src: `https://graphics.wsj.com/dynamic-inset-iframer/?url=https://asset.wsj.net/wsjnewsgraphics/dice/${DATA.slug}/inset.json`},
        text: null,
        link: '#',
        picture: {
          sources: [{
            media: '4u',
            srcset: fallbackPath,
            width: fallbackDimensions.width/2,
            height: fallbackDimensions.height/2
          }],
          img: {
            src: fallbackPath,
            type: 'graphic',
            width: fallbackDimensions.width/2,
            height: fallbackDimensions.height/2
          }
        }
      };

      const space = isProduction ? null : '\t';

      fs.writeFile(`${filePath}/inset.json`, JSON.stringify(inset, null, space), 'utf8', err => {
        if(err) reject('error saving file');
        console.log(colors.green('Fallback image created and added to inset.'));
        resolve();
      });
  });
}

if (argv.buildInset) {
  console.log(colors.blue('Preparing inset build...'));
  generateInset(argv.production).then(() => console.log(colors.green('Inset build complete.')));
}

if (argv.buildFallback && DATA.createFallbackImage) {
  console.log(colors.blue('Preparing fallback image...'));
  //start up a fresh http server
  const { spawn } = require('child_process');
  const server = spawn('http-server -p 3001',{
    stdio: ['pipe', 'pipe', process.stderr],
    shell: true
  });
  server.stdout.on('data', (data) => {
    if(data.toString() === 'Starting up http-server, serving ./\nAvailable on:\n') {
      generateFallback(argv.production,'3001').then(() => {
        server.kill();
        console.log(colors.green('Fallback image preparation complete.'));
      });
    }
  });
}

if (argv.watch) {
  const watcher = chokidar.watch(['inset/'], {
    ignored: /[\/\\]\./, persistent: true
  });

  watcher
    .on('add', (path) => console.log(colors.blue(`File ${path} has been added.`)))
    .on('ready', () => {
      generateInset().then(() => {
        console.log(colors.green('Initial build complete.'))
        console.log(colors.blue('Watching for changes.'))
      });
    })
    .on('change', () => {
      generateInset()
        .then(() => {
          console.log(colors.green('Rebuild complete.'));
          if (DATA.createFallbackImage) {
            return generateFallback();
          } else {
            return Promise.resolve();
          }
        })
        .then(() => console.log(colors.green('Fallback screenshot created.')));
    });
}

if (argv.deploy) {
  const DATA = JSON.parse(fs.readFileSync('./inset/data.json', 'utf8'));
  console.log(colors.blue('Preparing deployment...'));

  if (!DATA.slug) return console.log(colors.red('Please add a slug to `src/config.json`.'));

  // gather files to deploy
  const files = fs.readdirSync('dist/remote');

  // create requests
  const promises = files.map(file => {
    return request
      .post(`http://int.production.file-uploader.virginia.dj01.onservo.com/api/v2/dice/${DATA.slug}/${file}`)
      .attach('file', `dist/remote/${file}`);
  });

  // send requests
  Promise.all(promises)
    .then(responses => {
      responses
        .filter(response => /inset\.json/ig.test(response.body.urls.cached))
        .forEach(response => {
          console.log('\n----------');
          console.log('Inset URLs');
          console.log(prettyjson.render(response.body.urls));
          console.log('----------\n');
        });

      console.log(colors.blue('Deployment completed.'));
    })
    .catch(error => {
      console.log(colors.red(error));
    });
}