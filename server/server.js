import express from 'express';
import fs from 'fs';

const app = express();
const port = 8090;

/* Staticly serve the vue app */
app.use(express.static('dist'));

/* Route for loading paths */
app.get('/api/folder', (req, res) => {
  let path = req.query.path;
  let stat;

  if (!path) {
    path = '/';
  } else if (!path.endsWith('/')) {
    path += '/';
  }

  try {
    stat = fs.lstatSync(path);
  } catch (err) {
    return res.status(404).json('Invalid path');
  }

  if (!stat.isDirectory()) {
    return res.status(404).json('Path is not a directory');
  }

  /* Get all the subdirectories */
  const getDirectories = source =>
    fs.readdirSync(source).filter(name => {
      if (name.startsWith('.')) {
        return false;
      }
      try {
        fs.accessSync(`${source}${name}`, fs.constants.R_OK);
        return fs.lstatSync(`${source}${name}`).isDirectory();
      } catch (err) {
        return false;
      }
    });

  const dirList = getDirectories(path).map(dir => {
    if (getDirectories(`${path}${dir}/`).length > 0)
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

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
