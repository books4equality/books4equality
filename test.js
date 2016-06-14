var bcrypt = require('bcryptjs');
    
    var hashed
    bcrypt.compare('benjo1992', '$2a$10$kzqkE32TYapHVWeG1EQuD.8dW2y14bbgIHosAveerzHmyw1gxFe8W',
 function(err, isMatch){
      console.log(isMatch);
    });

