const niche = process.env.NICHE || 'yojanasamachar';

let config;
try {
  config = require(`./niches/${niche}.config.js`);
} catch {
  config = require('./niches/yojanasamachar.config.js');
}

module.exports = config;
