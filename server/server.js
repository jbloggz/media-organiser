import _ from 'lodash';
import axios from 'axios';
import http from 'http';
import express from 'express';
import bodyParser from 'body-parser';
import fs from 'fs';
import { basename, dirname } from 'path';
import mime from 'mime-types';
import exif from 'exif-parser';
import sharp from 'sharp';
import sqlite3 from 'sqlite3';

const app = express();
app.use(bodyParser.json());

const server = http.createServer(app);
const port = 8090;

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

function openDatabase(path) {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(`${path}photos.db`);

    db.exec(
      `
        PRAGMA foreign_keys = ON;
        BEGIN EXCLUSIVE;
        CREATE TABLE IF NOT EXISTS photo (
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
          photo       INTEGER NOT NULL REFERENCES photo(id) ON DELETE CASCADE ON UPDATE CASCADE,
          tag         INTEGER NOT NULL REFERENCES tag(id) ON DELETE CASCADE ON UPDATE CASCADE,
          UNIQUE(photo, tag)
        );
        CREATE TABLE IF NOT EXISTS person_map (
          photo       INTEGER NOT NULL REFERENCES photo(id) ON DELETE CASCADE ON UPDATE CASCADE,
          person      INTEGER NOT NULL REFERENCES person(id) ON DELETE CASCADE ON UPDATE CASCADE,
          UNIQUE(photo, person)
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

/* Route for loading photo data */
app.get('/api/loadPath', async (req, res) => {
  const path = checkPath(req.query.path, res, true);
  const output_path = checkPath(req.query.output, res, true);
  let fd, parser, data, db, rows;
  const buf = Buffer.alloc(65636);

  if (!path || !output_path) return;

  const output = { people: {}, tags: {} };
  output.photos = getDirectoryContents(path)
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
      const camera = model.toLowerCase().startsWith(brand.toLowerCase())
        ? model
        : `${brand} ${model}`;

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
      res.writeHead(200, { 'Content-Type': 'image/jpeg' });
      res.end(img, 'binary');
    })
    .catch(err =>
      res.status(404).json(`Unable to process file '${req.query.file}': ${err}`)
    );
});

/* Route for loading photo image */
app.get('/api/annotate', async (req, res) => {
  if (!req.query.file) {
    return res.status(404).json('No file provided');
  } else if (!req.query.key) {
    return res.status(404).json('No key provided');
  }

  const stream = sharp(req.query.file);

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
            features: [{ type: 'LABEL_DETECTION' }]
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
      res.json({
        file: req.query.file,
        tags: annotations.map(obj => obj.description.toLowerCase())
      });
    })
    .catch(err =>
      res.status(404).json(`Unable to process file '${req.query.file}': ${err}`)
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
  const photo = req.body.photo;
  const path = checkPath(req.body.path, res, true);
  if (!path) {
    return;
  }

  if (!photo || !photo.file) {
    return res.status(404).json('No photo provided');
  } else if (dirname(photo.file) + '/' === path) {
    return res.status(404).json('Incompatible file and output path');
  }

  /* Get a unique name for the file */
  if (!photo.timestamp || !photo.timezone) {
    return res.status(404).json('No timestamp or timezone in photo');
  }
  let name = photo.timestamp;
  let year, month, date;
  for (let i = 0; ; i++) {
    date = new Date(photo.timestamp * 1000);
    year = date.toLocaleString('en-au', {
      year: 'numeric',
      timeZone: photo.timezone
    });
    month = date.toLocaleString('en-au', {
      month: 'long',
      timeZone: photo.timezone
    });
    try {
      fs.accessSync(`${path}${year}/${month}/${name}.jpg`, fs.constants.R_OK);
    } catch (err) {
      if (err.code === 'ENOENT') {
        break;
      }
      return res.status(404).json('Unable to get unique file name');
    }
    name = `${photo.timestamp}_${i}`;
  }

  /* Create output folder */
  try {
    fs.mkdirSync(`${path}${year}/${month}`, { recursive: true });
  } catch (err) {
    if (err.code !== 'EEXIST') {
      return res.status(404).json('Cannot create output folder');
    }
  }

  /* Validate photo info */
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
    if (!photo[key]) {
      return res
        .status(404)
        .json(`Error: Photo is missing a value for '${key}'`);
    }
  }
  if (!photo.tags || !Array.isArray(photo.tags) || photo.tags.length === 0) {
    return res.status(404).json('Error: At least one tag is required');
  }

  /* Copy file to folder */
  try {
    fs.copyFileSync(photo.file, `${path}${year}/${month}/${name}.jpg`);
  } catch (err) {
    return res
      .status(404)
      .json(`Cannot copy file from ${photo.file} to '${path}${name}'`);
  }

  /* Insert data into database */
  try {
    db = await openDatabase(path);
    await sqlRun(db, 'BEGIN EXCLUSIVE');
    sqlres = await sqlRun(
      db,
      'INSERT INTO photo VALUES (NULL,?,?,?,?,?,?,?,?,?,?,?,?)',
      `${year}/${month}/${name}.jpg`,
      photo.type,
      photo.size,
      photo.length || null,
      photo.width,
      photo.height,
      photo.timestamp,
      photo.timezone,
      photo.tzOffset,
      photo.lat,
      photo.lng,
      photo.camera
    );
    id = sqlres.lastID;
    for (const tag of photo.tags) {
      row = await sqlGet(db, 'SELECT id FROM tag WHERE name = ?', tag);
      if (!row) {
        sqlres = await sqlRun(db, 'INSERT INTO tag VALUES (NULL,?)', tag);
      }
      await sqlRun(
        db,
        'INSERT INTO tag_map VALUES (?,?)',
        id,
        row ? row.id : sqlres.lastID
      );
    }
    for (const person of photo.people) {
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
    return res.status(404).json('Unable to add photo to database');
  }

  /* Remove the original file */
  try {
    fs.unlinkSync(photo.file);
  } catch (err) {
    return res.status(404).json('Cannot remove file');
  }

  return res.json('Successfully saved file');
});

server.listen(port, () => console.log(`App listening on port ${port}!`));
