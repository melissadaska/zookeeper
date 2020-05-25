// user router instead of app so you can declare routes in any files as long as you use proper middleware
const router = require('express').Router();
const { filterByQuery, findById, createNewAnimal, validateAnimal } = require('../../lib/animals');
const { animals } = require('../../data/animals');


// add the route, req = request, res = response
router.get('/animals', (req, res) => {
    let results = animals;
    if (req.query) {
        results = filterByQuery(req.query, results);
    }
    res.json(results);
});

router.get('/animals/:id', (req, res) => {
    const result = findById(req.params.id, animals);
    if (results) {
        res.json(result);
    } else {
        res.send(404);
    }
});

// setup a route on server that accepts data to be used or stored server-side (listens for POST request, not GET requests... POST requests represent the action of a client requesting the server to accept data rather than vice versa)
router.post('/api/animals', (req, res) => {
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

module.exports = router;
