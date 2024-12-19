const generatePassword = (length) => {
  const lower = 'abcdefghijklmnopqrstuvwxyz';
  const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const special = '!@#$%^&*()_+=-{}][:;\'"<>,.?/~`';

  // Ensure the required characters are included
  const requiredChars = [
    lower[Math.floor(Math.random() * lower.length)],
    upper[Math.floor(Math.random() * upper.length)],
    numbers[Math.floor(Math.random() * numbers.length)],
    special[Math.floor(Math.random() * special.length)]
  ];

  // Generate remaining characters
  const allChars = lower + upper + numbers + special;
  for (let i = requiredChars.length; i < length; i++) {
    requiredChars.push(allChars[Math.floor(Math.random() * allChars.length)]);
  }

  // Shuffle the characters
  const password = requiredChars.sort(() => Math.random() - 0.5).join('');

  return password;
}

const validateRequiredFields = (fieldsObj, requiredFieldsArr, formWhich = "body") => {
  
  const missingFields = requiredFieldsArr.filter(f => !fieldsObj[f]);

  let errorMessage = "";
  if (missingFields.length > 0) {
      if(formWhich == "query") {
          errorMessage = `Please provide required query params: ${missingFields.join(', ')}.`;
      }else{
          errorMessage = `Please provide required fields: ${missingFields.join(', ')}.`;
      }
      return errorMessage;
  }

  return null;

}

module.exports = {
  generatePassword,
  validateRequiredFields
}