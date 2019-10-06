# Media Organiser

A helpful tool to organise all you photos/videos. Allows you to add location, date/time, people, tags and more to all of your media files, and stores it in a simple SQLite database.

## Getting Started

In order to use this tool, you need to first have a Google API key, with the following APIs enabled:

* Maps JavaScript API
* Places API
* Time Zone API

See https://developers.google.com/maps/documentation/javascript/get-api-key to get an API key.

### Prerequisites

You will need Node.js installed in order to run Media Organiser (download from https://nodejs.org, or if your distributions provides a package, use that). Then, run the following to install vue-cli:

```
npm install -g @vue/cli
```

### Installing

Start by cloning this repository:

```
git clone https://github.com/jbloggz/media-organiser.git
```

Run the follow to build the dependencies, then the Media Organiser itself:

```
npm install
npm run build
```

Finally, to start Media Organiser, run:

```
npm run run
```
