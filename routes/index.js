var express = require('express');
var router = express.Router();
const Book = require('../models').Book;

/* Home & Books route */
router.get('/', async function(req, res, next) {
  //res.render('index', { title: 'Express' });
  //const books = await Book.findAll();
  //res.json(books);
  res.redirect("/books");

});




module.exports = router;


