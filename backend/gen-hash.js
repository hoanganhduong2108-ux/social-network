const bcrypt = require('bcryptjs');

async function gen() {
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash('123456', salt);
  console.log('Hash for "123456":');
  console.log(hash);
  console.log('\nCopy hash này vào database!');
}
gen();