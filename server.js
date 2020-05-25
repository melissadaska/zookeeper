const fs = require('fs');
const path = require('path');
// start by requiring the data
const { animals } = require('./data/animals');

const express = require('express');

const PORT = process.env.PORT || 3001;

//instantiate the server... Assign express to app variable so that we can leter chain on methods to the Express.js server
const app = express();


// app.use() mounts a function to the server that our requests will pass through before getting to intended endpoint... the functions we can mount to our server are referred to as middleware

// express.urlencoded({extended: true}) is a method built into Express.js that takes incoming POST data and converts to key/value pairings that can be accessed in the req.body object
// extended:true option informs server that there may be sub-array data nested in it as well so it needs to look deep into POST data to parse all data correctly
// both of these middleware functions need to be setup every time you create a server that's looking to accept POST data

// parse incoming string or array data
app.use(express.urlencoded({ extended: true }));
// takes incoming POSt data in form of JSON and parses it into the req.body
app.use(express.json());

// provide file path to location in our app and instruct server to make these files static resources (can be accessed without having a specific server endpoint)
app.use(express.static('public'));

function filterByQuery(query, animalsArray) {
    let personalityTraitsArray = [];
    // Note that we save the animalsArray as filteredResults here:
    let filteredResults = animalsArray;
    if (query.personalityTraits) {
      // Save personalityTraits as a dedicated array.
      // If personalityTraits is a string, place it into a new array and save.
      if (typeof query.personalityTraits === 'string') {
        personalityTraitsArray = [query.personalityTraits];
      } else {
        personalityTraitsArray = query.personalityTraits;
      }
      // Loop through each trait in the personalityTraits array:
      personalityTraitsArray.forEach(trait => {
        // Check the trait against each animal in the filteredResults array.
        // Remember, it is initially a copy of the animalsArray,
        // but here we're updating it for each trait in the .forEach() loop.
        // For each trait being targeted by the filter, the filteredResults
        // array will then contain only the entries that contain the trait,
        // so at the end we'll have an array of animals that have every one 
        // of the traits when the .forEach() loop is finished.
        filteredResults = filteredResults.filter(
          animal => animal.personalityTraits.indexOf(trait) !== -1
        );
      });
    }
    if (query.diet) {
      filteredResults = filteredResults.filter(animal => animal.diet === query.diet);
    }
    if (query.species) {
      filteredResults = filteredResults.filter(animal => animal.species === query.species);
    }
    if (query.name) {
      filteredResults = filteredResults.filter(animal => animal.name === query.name);
    }
    // return the filtered results:
    return filteredResults;
  }

function findById(id, animalsArray) {
    const result = animalsArray.filter(animal => animal.id === id)[0];
    return result;
}

function createNewAnimal(body, animalsArray) {
  console.log(body);
  // our function's main code will go here!
  const animal = body;
  animalsArray.push(animal);

  fs.writeFileSync(
    path.join(__dirname, './data/animals.json'),
    // null and 2 keep our data formatted... null means we don't want to edit existing data, 2 indicates we want to create white space between our values to make more readable
    JSON.stringify({ animals: animalsArray }, null, 2)
  );

  // return finished code to post route for response
  return animal;
  
}

function validateAnimal(animal) {
  if (!animal.name || typeof animal.name !== 'string') {
    return false;
  }
  if (!animal.species || typeof animal.species !== 'string') {
    return false;
  }
  if (!animal.diet || typeof animal.diet !== 'string') {
    return false;
  }
  if (!animal.personalityTraits || !Array.isArray(animal.personalityTraits)) {
    return false;
  }
  return true;
}

// add the route, req = request, res = response
app.get('/api/animals', (req, res) => {
    let results = animals;
    if (req.query) {
        results = filterByQuery(req.query, results);
    }
    res.json(results);
});

app.get('/api/animals/:id', (req, res) => {
    const result = findById(req.params.id, animals);
    if (results) {
        res.json(result);
    } else {
        res.send(404);
    }
});

// add routes to the three html files... "/" brings us to the root route of the server (route used to create homepage)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, './public/index.html'));
});

app.get('/animals', (req, res) => {
  res.sendFile(path.join(__dirname, './public/animals.html'));
});

app.get('/zookeepers', (req, res) => {
  res.sendFile(path.join(__dirname, './public/zookeepers.html'));
});

// To make our server listen, chain the listen() method onto our server
// Think of the port like a building/classroom at a college; it gives the exact destination on the host
app.listen(PORT, () => {
    console.log(`API server now on port ${PORT}!`);
});

// setup a route on server that accepts data to be used or stored server-side (listens for POST request, not GET requests... POST requests represent the action of a client requesting the server to accept data rather than vice versa)
app.post('/api/animals', (req, res) => {
  // set id based on what the next index of the array will be
  req.body.id = animals.length.toString();


  // if any data in req.body is incorrect, send 400 error back
  if (!validateAnimal(req.body)) {
    res.status(400).send('The animal is not properly formatted.');
  } else {
    // add animal to json file and animals array in this function
    const animal = createNewAnimal(req.body, animals);

    res.json(animal);
  }
});
