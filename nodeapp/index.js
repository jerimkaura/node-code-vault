const express = require('express')
const bodyParser = require('body-parser');
const speakeasy = require('speakeasy');
const ejs = require('ejs');
const uuid = require('uuid')
const { JsonDB } = require('node-json-db')
const { Config } = require('node-json-db/dist/lib/JsonDBConfig')
const { response } = require('express')

const app = express()
app.use(express.json())
const db = new JsonDB(new Config('DataBase', true, false, '/'));

//setup template engine
app.set('view-engine', 'html');
app.engine('html', ejs.renderFile);


//body parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));

//secifying the index route
app.get('/api', (request, response) =>{
	response.render('index.html');
})

//Register users and generate secret key
app.post('/api/register', (request, response) =>{
    const id = uuid.v4()
    try {
        const path = `/user/${id}` 
        const temp_secret = speakeasy.generateSecret()
        db.push(path,{id , temp_secret }) 
        response.json({id , secret: temp_secret.base32})
    }catch (error) {
        console.log(error)
        response.status(500).json({message: 'Error generating the secret'})
    }
})

//verify the token and change the secret to permanent
app.post('/api/verify', (req,res) => {
    const {token, userId} = req.body;		
    try {
		// Retrieve user from database
		const path = `/user/${userId}`;
		const user = db.getData(path);
	
		const { base32: secret } = user.temp_secret;
		const verified = speakeasy.totp.verify({
			secret,
			encoding: 'base32',
			token
		});
	
		if (verified) {
			// Update the temporary secret to a permanent
			db.push(path, { id: userId, secret: user.temp_secret });
			res.json({ verified: true })
		} else {
			res.json({ verified: false})
		}
    }catch(error) {
		console.error(error)
		res.status(500).json({ message: "Error retrieving user!"})
    };
  })

  //Validate the token
  app.post('/api/validate', (req,res) => {
	  const {token, userId} = req.body;		
	  try {
		  // Retrieve user from database
		  const path = `/user/${userId}`;
		  const user = db.getData(path);
	  
		  const { base32: secret } = user.secret;
		  const toeknValidate = speakeasy.totp.verify({
			  secret,
			  encoding: 'base32',
			  token, 
			  window:1
		  });
	  
		  if (toeknValidate) {
			  
			  res.json({ validated: true })
		  } else {
			  res.json({ validated: false})
		  }
	  }catch(error) {
		  console.error(error)
		  res.status(500).json({ message: "Error retrieving user!"})
	  };
	})
const PORT = process.env.PORT || 5000
app.listen(PORT, () =>{
    console.log(`Server running on port ${PORT}`);
})