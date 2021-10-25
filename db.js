const Sequelize = require('sequelize');
require('dotenv').config()
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const { STRING } = Sequelize;
const config = {
  logging: false
};

if(process.env.LOGGING){
  delete config.logging;
}
const conn = new Sequelize(process.env.DATABASE_URL || 'postgres://localhost/acme_db', config);

const User = conn.define('user', {
  username: STRING,
  password: STRING
});
//token is undefined
User.byToken = async(token)=> {
  try {
    const pwd = process.env.PWT
    const decodeToken = jwt.verify(token, pwd)
    console.log(decodeToken)
    const user = await User.findByPk(decodeToken.username);
    if(user){
      return user;
    }
    //console.log(token)
    const error = Error('bad credentials 2');
    error.status = 401;
    throw error;
  }
  catch(ex){
    //console.log(ex)
    const error = Error('bad credentials 2');
    error.status = 401;
    throw error;
  }
};

User.authenticate = async({ username, password })=> {
  const pwd = process.env.PWT
  //console.log(pwd)
  const user = await User.findOne({
    where: {
      username,
    }
  });
  if(await bcrypt.compare(password, user.password)){
    console.log("yes you are right its true")
    const token = jwt.sign({username: user.id}, pwd, {algorithm:'HS256'})
  //console.log(token)
    if(user){
      return token; 
  }
  }
  
  const error = Error('bad credentials');
  error.status = 401;
  throw error;
};

User.beforeCreate(async(user) => {

  const salt = bcrypt.genSaltSync()  
  //console.log(await bcrypt.hash(user.password, salt))
  user.password = await bcrypt.hash(user.password, salt)
})

const syncAndSeed = async()=> {
  await conn.sync({ force: true });
  const credentials = [
    { username: 'lucy', password: 'lucy_pw'},
    { username: 'moe', password: 'moe_pw'},
    { username: 'larry', password: 'larry_pw'}
  ];
  //hash here
  const [lucy, moe, larry] = await Promise.all(
    credentials.map( credential => User.create(credential))
  );
  return {
    users: {
      lucy,
      moe,
      larry
    }
  };
};



module.exports = {
  syncAndSeed,
  models: {
    User
  }
};