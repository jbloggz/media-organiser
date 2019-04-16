import _ from 'lodash';
import http from 'http';
import express from 'express';
import socketio from 'socket.io';
import fs from 'fs';
import mime from 'mime-types';
import exif from 'exif-parser';
import sharp from 'sharp';

const app = express();
const server = http.createServer(app);
const io = socketio(server, { path: '/ws' });
const port = 8090;

function checkPath(path, res) {
  let stat;

  if (!path) {
    path = '/';
  }

  try {
    stat = fs.lstatSync(path);
  } catch (err) {
    res.status(404).json('Invalid path');
    return false;
  }

  if (!stat.isDirectory()) {
    res.status(404).json('Path is not a directory');
    return false;
  }

  if (!path.endsWith('/')) {
    path += '/';
  }

  return path;
}

function getDirectoryContents(path) {
  return fs.readdirSync(path).filter(name => {
    if (name.startsWith('.')) {
      return false;
    }
    try {
      fs.accessSync(`${path}${name}`, fs.constants.R_OK);
    } catch (err) {
      return false;
    }
    return true;
  });
}

/* Staticly serve the vue app */
app.use(express.static('public'));

/* Route for listing paths */
app.get('/api/ls', (req, res) => {
  const path = checkPath(req.query.path, res);

  if (!path) return;

  /* Function to get all the subdirectories */
  const getSubDirectories = source =>
    getDirectoryContents(source).filter(name =>
      fs.lstatSync(`${source}${name}`).isDirectory()
    );

  const dirList = getSubDirectories(path).map(dir => {
    if (getSubDirectories(`${path}${dir}/`).length > 0)
      return {
        id: `${path}${dir}/`,
        name: dir,
        children: []
      };
    else
      return {
        id: `${path}${dir}/`,
        name: dir
      };
  });
  res.json(dirList);
});

/* Route for loading photo data */
app.get('/api/loadPath', (req, res) => {
  const path = checkPath(req.query.path, res);
  let fd, parser, data;
  const buf = Buffer.alloc(65636);

  if (!path) return;

  const output = getDirectoryContents(path)
    .filter(name => mime.lookup(name) === 'image/jpeg')
    .map(name => {
      try {
        fd = fs.openSync(`${path}${name}`, 'r');
        fs.readSync(fd, buf, 0, 65636, 0);
        fs.closeSync(fd);

        parser = exif.create(buf);
        data = parser.parse();
      } catch (err) {
        console.log(`Error processing file ${path}${name} (${err})`);
        return null;
      }

      return {
        file: `${path}${name}`,
        size: fs.lstatSync(`${path}${name}`).size,
        width: _.get(data, 'imageSize.width', null),
        height: _.get(data, 'imageSize.height', null),
        timestamp: _.get(data, 'tags.DateTimeOriginal', null),
        timezone: null,
        tzOffset: 0,
        lat: _.get(data, 'tags.GPSLatitude', null),
        lng: _.get(data, 'tags.GPSLongitude', null),
        brand: _.get(data, 'tags.Make', null),
        model: _.get(data, 'tags.Model', null),
        exposure: _.get(data, 'tags.ExposureTime', null),
        iso: _.get(data, 'tags.ISO', null),
        fNumber: _.get(data, 'tags.FNumber', null),
        focalLength: _.get(data, 'tags.FocalLength', null),
        tags: [],
        people: [],
        scannedTags: null
      };
    })
    .filter(data => data);

  res.json(output);
});

/* Route for loading photo image */
app.get('/api/img', (req, res) => {
  if (!req.query.file) {
    return res.status(404).json('No file provided');
  }

  const stream = sharp(req.query.file);

  stream
    .metadata()
    .then(meta => {
      const len = parseInt(req.query.size) || 1000;
      const width = meta.width > meta.length ? len : null;
      const length = meta.width > meta.length ? null : len;

      return stream.resize(width, length).toBuffer();
    })
    .then(img => {
      res.writeHead(200, { 'Content-Type': 'image/jpeg' });
      res.end(img, 'binary');
    })
    .catch(err =>
      res.status(404).json(`Unable to process file '${req.query.file}': ${err}`)
    );
});

/* Socket.io events */
io.on('connection', socket => {
  console.log('Client successfully connected to socket');

  socket.on('startScan', files => {
    console.log(`Starting scan on ${files.length} files`);

    for (let i = 0; i < files.length; i++) {
      setTimeout(() => {
        socket.emit('updateScannedTags', {
          file: files[i],
          tags: ['test', 'hello', `${i}`]
        });
      }, (i + 1) * 5000);
    }
  });
});

server.listen(port, () => console.log(`App listening on port ${port}!`));
