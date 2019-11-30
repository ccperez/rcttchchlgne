import isEmpty from 'lodash/isEmpty';

export default function validateInput(data, fields) {
  let errors = {};
  // scan check input if  empty
  for (let field of fields) {
    if (!data[field]) {
      errors[field] = "Can't be blank";
    }
  }

  return { errors, isValid: isEmpty(errors) }
}
