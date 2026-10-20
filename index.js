const express = require('express');
const chalk = require('chalk');
const fs = require('fs');
const cors = require('cors');
const path = require('path');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 5000;

app.enable("trust proxy");
app.set("json spaces", 2);

app.use(express.static(path.join(__dirname, 'src')));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

global.getBuffer = async (url, options = {}) => {
  try {
    const res = await axios({
      method: 'get',
      url,
      headers: {
        'DNT': 1,
        'Upgrade-Insecure-Request': 1
      },
      ...options,
      responseType: 'arraybuffer'
    });
    return res.data;
  } catch (err) {
    return err;
  }
};

global.fetchJson = async (url, options = {}) => {
  try {
    const res = await axios({
      method: 'GET',
      url,
      headers: { 'User-Agent': 'Mozilla/5.0' },
      ...options
    });
    return res.data;
  } catch (err) {
    return err;
  }
};

const settings = {
  name: "CHISA • API",
  description: "Secure API for Chrome-like web reading & automation. Engine: Playwright Core.",
  apiSettings: {
    creator: "KENZ",
    apikey: ["ChisaApi"]
  },
  links: "https://whatsapp.com/channel/0029Vb67uVQJENxzkhDbl52r"
};

global.apikey = settings.apiSettings.apikey;

app.use((req, res, next) => {
  const originalJson = res.json;

  res.json = function (data) {
    if (data && typeof data === 'object') {
      const responseData = {
        status: data.status,
        creator: settings.apiSettings.creator,
        ...data
      };
      return originalJson.call(this, responseData);
    }
    return originalJson.call(this, data);
  };

  next();
});

let totalRoutes = 0;
let rawEndpoints = {};

const apiFolder = path.join(__dirname, './api');

const register = (ep, file) => {
  if (
    ep &&
    ep.name &&
    ep.desc &&
    ep.category &&
    ep.path &&
    typeof ep.run === "function"
  ) {
    const cleanPath = ep.path.split("?")[0];

    app.get(cleanPath, ep.run);

    if (!rawEndpoints[ep.category]) rawEndpoints[ep.category] = [];

    rawEndpoints[ep.category].push({
      name: ep.name,
      desc: ep.desc,
      path: ep.path,
      ...(ep.innerDesc ? { innerDesc: ep.innerDesc } : {})
    });

    totalRoutes++;
    console.log(chalk.bgHex('#FFFF99').hex('#333').bold(` Loaded Route: ${file} → ${ep.name} `));
  }
};

if (fs.existsSync(apiFolder)) {
  fs.readdirSync(apiFolder).forEach((file) => {
    const filePath = path.join(apiFolder, file);

    if (path.extname(file) === '.js') {
      const routeModule = require(filePath);

      if (Array.isArray(routeModule)) {
        routeModule.forEach(ep => register(ep, file));
        return;
      }

      register(routeModule, file);

      if (typeof routeModule === "function") {
        routeModule(app);
      }

      if (routeModule.endpoint) {
        register(routeModule.endpoint, file);
      }

      totalRoutes++;
    }
  });
}

console.log(chalk.bgHex('#90EE90').hex('#333').bold(' Load Complete! ✓ '));
console.log(chalk.bgHex('#90EE90').hex('#333').bold(` Total Routes Loaded: ${totalRoutes} `));

app.get('/settings', (req, res) => {
  const endpoints = {
    categories: Object.keys(rawEndpoints)
      .sort((a, b) => a.localeCompare(b))
      .map(category => ({
        name: category,
        items: rawEndpoints[category].sort((a, b) => a.name.localeCompare(b.name))
      }))
  };

  settings.categories = endpoints.categories;
  res.json(settings);
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'src/index.html'));
});

app.get('/dosc', (req, res) => {
  res.sendFile(path.join(__dirname, 'src/dosc.html'));
});

app.use((req, res, next) => {
  const err404 = path.join(__dirname, 'src', '404.html');
  if (fs.existsSync(err404)) {
    return res.status(404).sendFile(err404);
  }
  res.status(404).json({
    status: false,
    code: 404,
    message: 'Not Found',
    creator: settings.apiSettings.creator
  });
});

app.use((err, req, res, next) => {
  console.error(chalk.bgHex('#FF0000').hex('#FFFFFF').bold(` Server Error: ${err.message} `));

  if (err.status === 505 || err.code === 'HTTP_VERSION_NOT_SUPPORTED') {
    const err505 = path.join(__dirname, 'src', '505.html');
    if (fs.existsSync(err505)) {
      return res.status(505).sendFile(err505);
    }
    return res.status(505).json({
      status: false,
      code: 505,
      message: 'HTTP Version Not Supported',
      creator: settings.apiSettings.creator
    });
  }

  const err500 = path.join(__dirname, 'src', '500.html');
  if (fs.existsSync(err500)) {
    return res.status(500).sendFile(err500);
  }
  res.status(500).json({
    status: false,
    code: 500,
    message: 'Internal Server Error',
    error: err.message,
    creator: settings.apiSettings.creator
  });
});

process.on('uncaughtException', (err) => {
  console.error(chalk.bgHex('#FF0000').hex('#FFFFFF').bold(` Uncaught Exception: ${err.message} `));
});

process.on('unhandledRejection', (reason) => {
  console.error(chalk.bgHex('#FF0000').hex('#FFFFFF').bold(` Unhandled Rejection: ${reason} `));
});

app.listen(PORT, () => {
  console.log(chalk.bgHex('#90EE90').hex('#333').bold(` Server is running on port ${PORT} `));
});

module.exports = app;