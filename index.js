const express = require('express');
const fs = require('fs');
const path = require('path');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');

const config = require('./config');

const getContrastTextColor = require('./contrast.js');

let styling = fs.readFileSync(__dirname+'/style.css', 'utf-8');

const { info, error, success, warn, special, APIResponseError, pageError } = require('./logs');

const PORT = process.env.PORT || 80;

const advancedAdvancedLogging = process.env.ADVANCED_ADVANCED_LOGGING?.toLowerCase() == 'true' || process.argv.includes('--aal');

const advancedLogging =  advancedAdvancedLogging || process.env.ADVANCED_LOGGING?.toLowerCase() == 'true' || process.argv.includes('--al');

module.exports.ADVANCED_LOGGING = advancedLogging;
module.exports.ADVANCED_ADVANCED_LOGGING = advancedAdvancedLogging;

const routeLimiter = rateLimit({ windowMs: 60 * 1000, max: 20 });

const apiLimiter = rateLimit({ windowMs: 60 * 1000, max: 1000 });

const app = express();

console.warn = warn;
console.error = error;
console.info = info;
console.success = success;

app.use(express.json());

app.use(require('cookie-parser')());

app.use((req, res, next) => {
    let fullPath = req.path + (req.query ? '?' + new URLSearchParams(req.query).toString() : '');
    if (fullPath.endsWith('?')) fullPath = fullPath.slice(0, -1);

    if (advancedAdvancedLogging) {
        info(`${req.method} request to ${fullPath} from ${req.hostname}`);
    }

    const isPublic =
        req.path.startsWith('/signin') ||
        req.path.startsWith('/api') ||
        req.path.match(/\.(css|js|png|jpg|jpeg|svg|ico)$/) ||
        req.path.includes('/shared') ||
        req.path.includes('/s/');

    if (isPublic) return next();

    const token = req.cookies.token;

    if (!token) {
        return res.redirect('/signin?redirect=' + encodeURIComponent(req.originalUrl));
    }

    try {
        
        const now = Math.floor(Date.now() / 1000);

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

const lifetime = decoded.exp - decoded.iat;
const timeLeft = decoded.exp - now;

if (timeLeft < lifetime * 0.5) {
    const newToken = jwt.sign(
        { username: decoded.username, role: decoded.role },
        process.env.JWT_SECRET,
        { expiresIn: lifetime }
    );

    res.cookie('token', newToken, {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production'
    });
}

req.user = decoded

        next();
    } catch (err) {
        if (advancedLogging) error(err);
        res.clearCookie('token');
        return res.redirect('/signin?redirect=' + encodeURIComponent(req.originalUrl));
    }
});

app.use(express.urlencoded({ extended: true }));

fs.readdirSync(__dirname+'/routes').filter(e => e.endsWith('.js') || e.endsWith('.ts')).forEach(file => {
    const routePath = path.join(__dirname, 'routes', file);
    const route = require(routePath);
    if (typeof route === 'function') {
       if(process.env.ROUTE_LIMITING === 'true') app.use(routeLimiter, route);
       else app.use(route);
        if(advancedLogging) success(`Route ${file} loaded.`);
    } else {
        error(`Route file ${file} does not export a valid function.`);
    }
});


fs.readdirSync(__dirname+'/internal').filter(e => e.endsWith('.js') || e.endsWith('.ts')).forEach(file => {
    const routePath = path.join(__dirname, 'internal', file);
    const route = require(routePath);
    if (typeof route === 'function') {
        app.use(route);
        if(advancedLogging) success(`Internal route ${file} loaded.`);
    } else {
        error(`Internal route file ${file} does not export a valid function.`);
    }
});

fs.readdirSync(__dirname+'/api').filter(e => e.endsWith('.js') || e.endsWith('.ts')).forEach(file => {
    const routePath = path.join(__dirname, 'api', file);
    const route = require(routePath);
    if (typeof route === 'function') {
        app.use('/api', (req, res, next) => { next() }, apiLimiter, route);   
        if(advancedLogging) success(`API route ${file} loaded.`);
     } else {
       error(`API route file ${file} does not export a valid function.`);
    }
});

app.get('/style.css', (req, res) => {
    if(process.argv.includes('--dev')) styling = fs.readFileSync(__dirname+'/style.css', 'utf-8');
    let customStyling = styling;
    if(req.cookies.background) customStyling = customStyling.split('BACKGROUND_COLOR').join(req.cookies.background);
    else customStyling = customStyling.split('BACKGROUND_COLOR').join('linear-gradient(135deg, #90b8f4 0%, #c3cfe2 100%) no-repeat center center fixed;');
    if(req.cookies.text) customStyling = customStyling.split('TEXT_COLOR').join(req.cookies.text);
    else customStyling = customStyling.split('TEXT_COLOR').join(getContrastTextColor(req.cookies.background || [144, 184, 244]));
    res.setHeader('Content-Type', 'text/css').send(customStyling);
})    

require(__dirname+'/tracksystemhealth.js').init();


app.use(express.static(__dirname+'/static'));


app.listen(PORT, () => {
    special(`Server started on port`, PORT);
})