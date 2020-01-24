var express = require('express');
var router = express.Router();
var db = require('../db');

/* GET home page. */
router.get('/users', async function(req, res, next) {
  res.json(await db.getResults('SELECT id, created_at, updated_at, first_name, last_name, email FROM user;'));
});

router.get('/posts', async function(req, res, next) {
  res.json(await db.getResults('SELECT id, created_at, updated_at, title FROM post;'));
});

router.get('/posts/:postId', async function(req, res, next) {
  res.json(await db.getResults('SELECT * FROM post WHERE id = ?;', [req.params.postId]));
});

router.post('/posts', async function(req, res, next) {
  const outcome = await db.getResults('INSERT INTO post (title, content, user_id) VALUES(?, ?, 1)', [req.body.title, req.body.content]);
  if(outcome.affectedRows)
  {
    const formUrl = new URL(req.get('referrer'));
    return res.redirect(formUrl.origin);
  }
  res.json(outcome);
});

module.exports = router;
