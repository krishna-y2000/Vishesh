var express = require('express');
var router = express.Router();
var {check,validationResult} = require('express-validator');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var User = require("../config/model/User");
var auth = require('../middleware/auth');
var cookie = require('cookies');
/* GET users listing. */
router.get('/signup', function(req, res, next) {
  var titleSignup = "MY REGISTRATION PAGE"
  res.render("../views/authentication/signup.ejs",{title : titleSignup , error : ''});
});
router.get('/login', function(req,res,next) {
  var titleLogin = "Login Page"
  res.render("../views/authentication/login.ejs",{title : titleLogin , error : '' })
} )
router.post('/signup',[check("username","Enter valid username").not().isEmpty(),
       check("email","Please enter valid email-id").isEmail(),
       check("password","Enter valid password").isLength({min:8}) ],
          async (req,res,next) =>{
            const errors = validationResult(req);
            if(!errors.isEmpty())
            {
              return res.render("../views/authentication/signup.ejs" , {error : 'Please fill the password' })
            }
            const {username,email,password} = req.body; 
            try 
            {
              let user = await User.findOne({email})
              if(user)
              {         
                return res.render("../views/authentication/signup.ejs" , {error : 'User already exist' })

              }
              // const hash = bcrypt.hashSync(req.body.password, 10);

              // user = new User({
              //   username,
              //   email,
              //   password:hash
              // })

              // await user.save();
              // console.log(user.password);
              // const hash = await bcrypt.hash(password, 10);
              //  user = new User({
              //   username,
              //   email,
              //   password: hash,
              // });
              
              
                // const userDetails = await user.save();
                
                // console.log(userDetails);
              
              
            // const salt = await bcrypt.genSalt(10);
            // user.password = await bcrypt.hash(password, salt);

            // await user.save();
            bcrypt.genSalt(10, function(err, salt,next) {
              bcrypt.hash(password, salt,  async function(err, hash) {
                  // Store hash in your password DB.
                  
                //  console.log(user);
                 // 

                 user = new User({
                  username,
                  email,
                  password:hash
                })
                
                 
                 await user.save( (req,res) => { console.log("Saved ");} );
                  
              });
              
          });
         
          // const payload = {
          //     user: {
          //         id: user.id
          //     }
          // };


            jwt.sign({ _id : "user._id"},"randomString", async (err,token) => {
              if(err)
                {
                  throw err;
                }
                 res.cookie('token' , token);
               console.log("cookieSign" , req.cookies.token);
              return res.status(200).redirect('/');
            })
          }
              catch(err)
              {
                  console.log(err);
                  res.render("../views/authentication/signup.ejs" , {error : 'Error in saving the account details' })

              }

          } 
       );



router.post('/login',[check("email", "Please enter a valid email").isEmail(),
       check("password", "Please enter a valid password").isLength({
         min: 6
       })  ],
        async (req,res) => {
         const errors = validationResult(req);
     
         if (!errors.isEmpty()) {
           return res.status(400).json({
             errors: errors.array()
           });
         }
         const {email,password} = req.body;
         try 
         {
           let user = await User.findOne({email})
           if(!user)
           {
             return res.status(400).json({
               message : "User not exist"
             })
     
           }
           const match = await bcrypt.compare(password, user.password);
           console.log(match);
           if(!match) {
               return res.status(400).json({
                 message : "Incorrect password"
               })
               
             }
            
           const payload = 
             {
               user: {
                 id: user.id
                }
             };
             jwt.sign( payload,"randomString", (err,token) =>
              {
                 if(err)
                   {
                     throw err;
                   }
                 res.cookie('token' , token);
                 res.status(200).redirect('/');
              })
     
          }
          catch (e) 
          {
           console.error(e);
           res.status(500).json({
             message: "Server Error"
           });
         }
       } 
     )
     
router.get("/me", auth, async (req, res) => 
  {
    try
     {
      // request.user is getting fetched from Middleware after token authentication
      const user = await User.findById(req.user.id);
      res.json(user);
     }
     catch (e)
     {
      res.send({ message: "Error in Fetching user" });
     }
  }
);


router.post('/logout',auth ,async(req,res) => {
  res.clearCookie("token");
  return res.redirect("/");
} )
module.exports = router;
