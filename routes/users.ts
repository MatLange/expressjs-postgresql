import * as Express from "express"; 
var router = Express.Router();

/* GET users listing. */
router.get('/', function(
  req: Express.Request,
  res: Express.Response,
  next: Express.NextFunction
) {
  res.send('respond with a resource');
});

module.exports = router;
