import axios from 'axios';

const apiURL = process.env.REACT_APP_APIURL;

export default {
  postRoute: data =>
    axios.post(`${apiURL}`, data),

  getRoute: token =>
    axios.get(`${apiURL}/${token}`)
}
