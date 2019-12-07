import axios from 'axios';

const apiURL = process.env.REACT_APP_APIURL;

export default {
  postRoute: data =>
    axios.post(`${apiURL}/route`, data),

  getRoute: token =>
    axios.get(`${apiURL}/route/${token}`)
}
