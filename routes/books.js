var express = require('express');
var router = express.Router();
const Book = require('../models').Book;
const Sequelize = require('sequelize');
const Op = Sequelize.Op;


function asyncHandler(cb){
	return async(req, res, next) => {
		try {
			await cb(req, res, next)
		} catch(error){
			res.status(500).send(error);       
		}
	}
}

/* Show full list of books */
router.get("/", asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page)
  
  if (!page || page <= 0) {
    res.redirect('?page=1')
  } else {
    null;
  }
  
  const limit = 15;
  const {count, rows} = await Book.findAndCountAll({
    order: [['title', 'ASC']],
    limit,
    offset: (page -1) *limit
  })
  const pageCount = Math.ceil(count / limit)
  page > pageCount ?
  res.redirect(`?page=${pageCount}`) : null
  let links = 1
  res.render('index', {books: rows, pageCount, links, title: "Books"})
}));

/* Create new book form */
router.get("/new", (req, res) => {
  res.render("newbook", { book: {}, title: "New Book" });
	
});


// Search for book in database
router.get("/search", asyncHandler(async (req, res) => {
  const search = req.query.search.toLowerCase()
  const page = parseInt(req.query.page)
  !page || page <= 0 ? res.redirect(`search?search=${search}&page=1`) : null
  const limit = 10
  const {count, rows} = await Book.findAndCountAll({
    where:{
      [Op.or]:[
        {
          title:{[Op.like]: `%${search}%`}
        },
        {
          author:{[Op.like]: `%${search}%`}
        },
        {
          genre:{[Op.like]: `%${search}%`}
        },
        {
          year:{[Op.like]: `%${search}%`}
        },
      ]
    },
    order: [['title', 'ASC']],
    limit,
    offset: (page -1) *limit
  })
  if(count > 0){
    let links = 1
    const pageCount = Math.ceil(count / limit)
    page > pageCount ?
    res.redirect(`?search=${search}&page=${pageCount}`) : null
    res.render('index', {books: rows, pageCount, links, search, title: "Books Found"})
  }else{
    res.render('page-not-found', {search})
  }
}));

/* Post new book to database */
router.post("/", asyncHandler(async (req, res) => {
    let book;
    try {
      book = await Book.create(req.body);
      res.redirect("/");  
    } catch (error) {
        if (error.name === "SequelizeValidationError"){
          book = await Book.build(req.body);
          res.render("newbook", { book, errors: error.errors, title: "New Book"});
        } else {
          throw error;
        }
    }
}));

/* Shows book detail and update form*/
router.get("/:id", asyncHandler(async (req, res) => {
  let book = await Book.findByPk(req.params.id);
  res.render("update-book", { book, title: "Update Book" });
}));

/* Updates existing book */
router.post("/:id/edit", asyncHandler(async (req, res) => {
  let book;
  try {
    book = await Book.findByPk(req.params.id);
    if (book) {
      await book.update(req.body);
      res.redirect("/");
    } else {
      res.sendStatus(404);
    }
  } catch (error) {
      if (error.name === "SequelizeValidationError"){
        book = await Book.build(req.body);
        book.id = req.params.id;
        res.render("update-book", { book, errors: error.errors, title: "Update Book"});
      } else {
        throw error;
      }
  }
}));

/* Deletes a book */
router.post("/:id/delete", asyncHandler(async (req, res) => {
  let book;
  book = await Book.findByPk(req.params.id);
  if(book) {
    await book.destroy();
    res.redirect("/"); 
  } else {
    res.sendStatus(404);
  }	
}));

module.exports = router;


