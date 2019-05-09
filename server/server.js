import 'babel-polyfill';
import _ from 'lodash';
import axios from 'axios';
import http from 'http';
import express from 'express';
import bodyParser from 'body-parser';
import fs from 'fs';
import { basename, dirname, extname } from 'path';
import mime from 'mime-types';
import exif from 'exif-parser';
import sharp from 'sharp';
import sqlite3 from 'sqlite3';
import ffmpeg from 'fluent-ffmpeg';

const app = express();
app.use(bodyParser.json());

const server = http.createServer(app);
const port = 8090;

function extractFrame(input, output) {
  return new Promise((resolve, reject) => {
    const cmd = ffmpeg(input);

    cmd
      .outputOptions(['-vframes', 1, '-q:v', 2])
      .output(output)
      .on('end', () => resolve())
      .on('error', err => reject(err))
      .run();
  });
}

function loadVideoMeta(file) {
  return new Promise(resolve => {
    ffmpeg.ffprobe(file, (err, metadata) => {
      resolve(err ? null : metadata);
    });
  });
}

function loadImg(file, size) {
  if (!file) {
    return Promise.reject('No file provided');
  }

  const stream = sharp(file);

  return stream
    .metadata()
    .then(meta => {
      const len = parseInt(size) || 1000;
      if (len < Math.max(meta.width, meta.height)) {
        if (meta.width > meta.height) {
          return stream.resize(len, null).toBuffer();
        } else {
          return stream.resize(null, len).toBuffer();
        }
      }

      return stream.toBuffer();
    })
    .catch(err => {
      throw new Error(`Unable to process file '${file}': ${err}`);
    });
}

function checkPath(path, res, has_write) {
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

  /* Check permissions */
  try {
    fs.accessSync(
      path,
      fs.constants.R_OK | (has_write ? fs.constants.W_OK : 0)
    );
  } catch (err) {
    res
      .status(404)
      .json(`No ${has_write ? 'read/write' : 'read'} access to path`);
    return false;
  }

  if (!path.endsWith('/')) {
    path += '/';
  }

  return path;
}

function getDirectoryContents(path) {
  try {
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
  } catch (err) {
    return false;
  }
}

function openDatabase(path) {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(`${path}media.db`);

    db.exec(
      `
        PRAGMA foreign_keys = ON;
        BEGIN EXCLUSIVE;
        CREATE TABLE IF NOT EXISTS media (
          id          INTEGER PRIMARY KEY,
          file        TEXT NOT NULL UNIQUE,
          type        TEXT NOT NULL,
          size        INTEGER NOT NULL,
          length      INTEGER DEFAULT NULL,
          width       INTEGER NOT NULL,
          height      INTEGER NOT NULL,
          timestamp   INTEGER NOT NULL,
          timezone    TEXT NOT NULL,
          tzOffset    INTEGER NOT NULL,
          lat         REAL NOT NULL,
          lng         REAL NOT NULL,
          camera      TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS tag (
          id          INTEGER PRIMARY KEY,
          name        TEXT NOT NULL UNIQUE
        );
        CREATE TABLE IF NOT EXISTS person (
          id          INTEGER PRIMARY KEY,
          name        TEXT NOT NULL UNIQUE
        );
        CREATE TABLE IF NOT EXISTS tag_map (
          media       INTEGER NOT NULL REFERENCES media(id) ON DELETE CASCADE ON UPDATE CASCADE,
          tag         INTEGER NOT NULL REFERENCES tag(id) ON DELETE CASCADE ON UPDATE CASCADE,
          score       INTEGER NOT NULL,
          UNIQUE(media, tag)
        );
        CREATE TABLE IF NOT EXISTS person_map (
          media       INTEGER NOT NULL REFERENCES media(id) ON DELETE CASCADE ON UPDATE CASCADE,
          person      INTEGER NOT NULL REFERENCES person(id) ON DELETE CASCADE ON UPDATE CASCADE,
          UNIQUE(media, person)
        );
        COMMIT;
      `,
      err => {
        if (err) {
          reject(err);
        } else {
          resolve(db);
        }
      }
    );
  });
}

function sqlRun(db, query, ...params) {
  return new Promise((resolve, reject) => {
    const p = params || [];
    db.run(query, ...p, function(err) {
      if (err) {
        console.log(err);
        reject(err);
      } else {
        resolve(this);
      }
    });
  });
}

function sqlGet(db, query, ...params) {
  return new Promise((resolve, reject) => {
    db.get(query, params || [], function(err, row) {
      if (err) {
        console.log(err);
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
}

function sqlAll(db, query, ...params) {
  return new Promise((resolve, reject) => {
    db.all(query, params || [], function(err, rows) {
      if (err) {
        console.log(err);
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

/* Staticly serve the vue app */
app.use(express.static(`${__dirname}/public`));

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

/* Route for loading media data */
app.get('/api/loadPath', async (req, res) => {
  const path = checkPath(req.query.path, res, true);
  const output_path = checkPath(req.query.output, res, true);
  let fd, parser, data, db, rows;
  const buf = Buffer.alloc(65636);

  if (!path || !output_path) return;

  const output = { people: {}, tags: {} };
  const files = getDirectoryContents(path);

  /* Clean out the poster directory */
  const posters = getDirectoryContents('posters/') || [];
  for (const name of posters) {
    fs.unlink(`posters/${name}`, () => {});
  }

  /* Get the image files */
  const photos = files
    .filter(name => mime.lookup(name) === 'image/jpeg')
    .map(name => {
      try {
        fd = fs.openSync(`${path}${name}`, 'r');
        fs.readSync(fd, buf, 0, 65636, 0);
        fs.closeSync(fd);

        parser = exif.create(buf);
        data = parser.parse();
      } catch (err) {
        return null;
      }

      /* Get the camera model */
      const brand = _.get(data, 'tags.Make', null);
      const model = _.get(data, 'tags.Model', null);
      let camera = null;
      if (!brand) camera = model;
      else if (!model) camera = brand;
      else {
        camera = model.toLowerCase().startsWith(brand.toLowerCase())
          ? model
          : `${brand} ${model}`;
      }

      return {
        file: `${path}${name}`,
        type: 'image',
        size: fs.lstatSync(`${path}${name}`).size,
        length: null,
        width: _.get(data, 'imageSize.width', null),
        height: _.get(data, 'imageSize.height', null),
        timestamp: _.get(data, 'tags.DateTimeOriginal', null),
        timezone: null,
        tzOffset: 0,
        lat: _.get(data, 'tags.GPSLatitude', null),
        lng: _.get(data, 'tags.GPSLongitude', null),
        camera,
        tags: [],
        people: [],
        scannedTags: null,
        processingScannedTags: false
      };
    })
    .filter(data => data);

  /* Get popular tags and people */
  try {
    db = await openDatabase(output_path);
    rows = await sqlAll(
      db,
      'SELECT tag.name AS name, COUNT(*) AS count FROM tag_map LEFT JOIN tag ON tag.id = tag_map.tag GROUP BY tag_map.tag ORDER BY count DESC'
    );
    for (const row of rows) {
      output.tags[row.name] = row.count;
    }
    db = await openDatabase(output_path);
    rows = await sqlAll(
      db,
      'SELECT person.name AS name, COUNT(*) AS count FROM person_map LEFT JOIN person ON person.id = person_map.person GROUP BY person_map.person ORDER BY count DESC'
    );
    for (const row of rows) {
      output.people[row.name] = row.count;
    }
    db.close();
  } catch (err) {
    if (db) {
      db.close();
    }
    return res.status(404).json('Unable to get tags/people from database');
  }

  /* Get the video files */
  Promise.all(
    files
      .filter(name => {
        const type = mime.lookup(name);
        return type && type.startsWith('video');
      })
      .map(name => loadVideoMeta(`${path}${name}`))
  ).then(values => {
    const videos = values
      .map(meta => {
        /* Make sure we have the correct format info */
        if (
          !meta ||
          !meta.streams ||
          !meta.format ||
          !meta.format.filename ||
          !meta.format.size ||
          !meta.format.duration
        ) {
          return null;
        }

        /* Make sure we have the correct sizes */
        let stream = null;
        for (const mstr of meta.streams) {
          if (mstr.width && mstr.height) {
            stream = mstr;
            break;
          }
        }

        if (!stream) return null;

        /* Check if we have GPS and timestamp */
        let lat = null;
        let lng = null;
        let timestamp = null;
        if (meta.format.tags) {
          if (meta.format.tags.location) {
            lat = parseFloat(
              meta.format.tags.location.replace(/([+-]?[0-9.]+).*/, '$1')
            );
            lng = parseFloat(
              meta.format.tags.location.replace(
                /[+-]?[0-9.]+([+-][0-9.]+).*/,
                '$1'
              )
            );
          }
          if (meta.format.tags.creation_time) {
            timestamp = Date.parse(meta.format.tags.creation_time) / 1000;
          }
        }

        if (!timestamp) {
          /* Default to the file modify time */
          try {
            timestamp = fs.lstatSync(meta.format.filename).mtimeMs / 1000;
          } catch (err) {
            return null;
          }
        }

        return {
          file: meta.format.filename,
          type: 'video',
          size: meta.format.size,
          length: meta.format.duration,
          width: stream.width,
          height: stream.height,
          timestamp,
          timezone: null,
          tzOffset: 0,
          lat,
          lng,
          camera: null,
          tags: [],
          people: [],
          scannedTags: null,
          processingScannedTags: false
        };
      })
      .filter(meta => meta !== null);

    output.media = [...photos, ...videos].sort((a, b) =>
      a.file < b.file ? -1 : 1
    );
    res.json(output);
  });
});

/* Route for loading image file */
app.get('/api/img', (req, res) => {
  loadImg(req.query.file, req.query.size)
    .then(img => {
      res.writeHead(200, { 'Content-Type': 'image/jpeg' });
      res.end(img, 'binary');
    })
    .catch(err => res.status(404).json(err.message));
});

/* Route for loading video file */
app.get('/api/video', (req, res) => {
  if (!req.query.file) {
    return res.status(404).json('No file provided');
  }

  const stream = fs.createReadStream(req.query.file);
  stream.on('open', function() {
    res.writeHead(200, { 'Content-Type': mime.lookup(req.query.file) });
    stream.pipe(res);
  });

  stream.on('error', err => {
    res.end(err);
  });
});

/* Route for getting image tags */
app.get('/api/annotate', async (req, res) => {
  if (!req.query.file) {
    return res.status(404).json('No file provided');
  } else if (!req.query.key) {
    return res.status(404).json('No key provided');
  }

  let file = req.query.file;
  if (req.query.type && req.query.type !== 'image') {
    file = `posters/${basename(req.query.file)}.jpg`;
  }

  const stream = sharp(file);

  stream
    .metadata()
    .then(meta => {
      const len = parseInt(req.query.size) || 1600;
      if (len < Math.max(meta.width, meta.height)) {
        if (meta.width > meta.height) {
          return stream.resize(len, null).toBuffer();
        } else {
          return stream.resize(null, len).toBuffer();
        }
      }

      return stream.toBuffer();
    })
    .then(img => {
      const url = `https://vision.googleapis.com/v1/images:annotate?key=${
        req.query.key
      }`;
      const data = {
        requests: [
          {
            image: { content: img.toString('base64') },
            features: [{ type: 'LABEL_DETECTION', maxResults: 100 }]
          }
        ]
      };

      return axios.post(url, data);
    })
    .then(resp => {
      const annotations = _.get(
        resp,
        'data.responses[0].labelAnnotations',
        null
      );
      if (!annotations) {
        throw new Error('Invalid annotations response');
      }
      const obj = {};
      for (const val of annotations) {
        obj[val.description.toLowerCase()] = val.score;
      }
      res.json({
        file: req.query.file,
        tags: obj
      });
    })
    .catch(err =>
      res.status(404).json(`Unable to process file '${req.query.file}': ${err}`)
    );
});

/* Route for getting video poster tags */
app.get('/api/poster', (req, res) => {
  if (!req.query.file) {
    return res.status(404).json('No file provided');
  }

  /* Create posters folder */
  try {
    fs.mkdirSync('posters');
  } catch (err) {
    if (err.code !== 'EEXIST') {
      return res.status(404).json("Cannot create 'posters' folder");
    }
  }

  const name = basename(req.query.file);
  const poster = `posters/${name}.jpg`;

  extractFrame(req.query.file, poster)
    .then(() => loadImg(poster, req.query.size))
    .then(img => {
      res.writeHead(200, { 'Content-Type': 'image/jpeg' });
      res.end(img, 'binary');
    })
    .catch(err =>
      res.status(404).json(`Unable to process file '${poster}': ${err}`)
    );
});

/* Route for trashing an image */
app.get('/api/trash', (req, res) => {
  if (!req.query.file) {
    return res.status(404).json('No file provided');
  }

  const path = checkPath(req.query.path, res, true);
  if (!path) {
    return;
  } else if (dirname(req.query.file) === `${path}trash`) {
    return res.status(404).json('Incompatible file and output path');
  }

  /* Create trash folder */
  try {
    fs.mkdirSync(`${path}trash`);
  } catch (err) {
    if (err.code !== 'EEXIST') {
      return res.status(404).json("Cannot create 'trash' folder");
    }
  }

  /* Copy file to trash folder */
  try {
    const name = basename(req.query.file);
    fs.copyFileSync(req.query.file, `${path}trash/${name}`);
  } catch (err) {
    return res.status(404).json("Cannot copy file to 'trash'");
  }

  /* Remove the original file */
  try {
    fs.unlinkSync(req.query.file);
  } catch (err) {
    return res.status(404).json('Cannot remove file');
  }

  return res.json('Successfully trashed file');
});

/* Route for saving an image */
app.post('/api/save', async (req, res) => {
  let db, sqlres, id, row;
  const item = req.body.item;
  const path = checkPath(req.body.path, res, true);
  if (!path) {
    return;
  }

  if (!item || !item.file) {
    return res.status(404).json('No item provided');
  } else if (dirname(item.file) + '/' === path) {
    return res.status(404).json('Incompatible file and output path');
  }

  /* Get a unique name for the file */
  if (!item.timestamp || !item.timezone) {
    return res.status(404).json('No timestamp or timezone in item');
  }
  const ext = extname(item.file).toLowerCase();
  let name = item.timestamp;
  let year, month, date;
  for (let i = 0; ; i++) {
    date = new Date(item.timestamp * 1000);
    year = date.toLocaleString('en-au', {
      year: 'numeric',
      timeZone: item.timezone
    });
    month = date.toLocaleString('en-au', {
      month: 'long',
      timeZone: item.timezone
    });
    try {
      fs.accessSync(`${path}${year}/${month}/${name}${ext}`, fs.constants.R_OK);
    } catch (err) {
      if (err.code === 'ENOENT') {
        break;
      }
      return res.status(404).json('Unable to get unique file name');
    }
    name = `${item.timestamp}_${i}`;
  }

  /* Create output folder */
  try {
    fs.mkdirSync(`${path}${year}/${month}`, { recursive: true });
  } catch (err) {
    if (err.code !== 'EEXIST') {
      return res.status(404).json('Cannot create output folder');
    }
  }

  /* Validate data */
  const mandatory = [
    'type',
    'width',
    'height',
    'timestamp',
    'timezone',
    'tzOffset',
    'lat',
    'lng',
    'camera'
  ];
  for (const key of mandatory) {
    if (!item[key]) {
      return res
        .status(404)
        .json(`Error: Item is missing a value for '${key}'`);
    }
  }

  /* Copy file to folder */
  try {
    fs.copyFileSync(item.file, `${path}${year}/${month}/${name}${ext}`);
  } catch (err) {
    return res
      .status(404)
      .json(`Cannot copy file from ${item.file} to '${path}${name}'`);
  }

  /* Insert data into database */
  try {
    db = await openDatabase(path);
    await sqlRun(db, 'BEGIN EXCLUSIVE');
    sqlres = await sqlRun(
      db,
      'INSERT INTO media VALUES (NULL,?,?,?,?,?,?,?,?,?,?,?,?)',
      `${year}/${month}/${name}${ext}`,
      item.type,
      item.size,
      item.length || null,
      item.width,
      item.height,
      item.timestamp,
      item.timezone,
      item.tzOffset,
      item.lat,
      item.lng,
      item.camera
    );
    id = sqlres.lastID;
    /* Add all the selected tags to the scanned list */
    for (const tag of item.tags) {
      item.scannedTags[tag] = 1;
    }

    /* Insert the tags */
    for (const tag of Object.keys(item.scannedTags)) {
      row = await sqlGet(db, 'SELECT id FROM tag WHERE name = ?', tag);
      if (!row) {
        sqlres = await sqlRun(db, 'INSERT INTO tag VALUES (NULL,?)', tag);
      }
      await sqlRun(
        db,
        'INSERT INTO tag_map VALUES (?,?,?)',
        id,
        row ? row.id : sqlres.lastID,
        item.scannedTags[tag]
      );
    }

    /* Insert the people */
    for (const person of item.people) {
      row = await sqlGet(db, 'SELECT id FROM person WHERE name = ?', person);
      if (!row) {
        sqlres = await sqlRun(db, 'INSERT INTO person VALUES (NULL,?)', person);
      }
      await sqlRun(
        db,
        'INSERT INTO person_map VALUES (?,?)',
        id,
        row ? row.id : sqlres.lastID
      );
    }
    await sqlRun(db, 'COMMIT');
    db.close();
  } catch (err) {
    if (db) {
      await sqlRun(db, 'ROLLBACK');
      db.close();
    }
    return res.status(404).json('Unable to add media to database');
  }

  /* Remove the original file */
  try {
    fs.unlinkSync(item.file);
  } catch (err) {
    return res.status(404).json('Cannot remove file');
  }

  return res.json('Successfully saved file');
});

server.listen(port, () => console.log(`App listening on port ${port}!`));
