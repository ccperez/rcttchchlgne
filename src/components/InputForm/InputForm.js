import React from 'react';
import api from '../../api';

import { MDBRow, MDBCol, MDBCard, MDBCardBody,  MDBBtn, MDBInput } from "mdbreact";

import { withScriptjs } from "react-google-maps";

import validateInput from '../../shared/validations/common';
import Map from '../Map';

export default class InputForm extends React.Component {

  state = this.getInitialState();

  // Use this function to initial state and when onReset click
  getInitialState() {
    return {
      data: { origin: '', destination: '' },
      total: { distance: '', time: '' },
      loading: false, errors: {}
    }
  }

  // It clear user input and each error message
  onFocus = (e) => {
    const { errors } = this.state;
    const { name } = e.target;
    this.setState({ errors: { ...errors, [name]: '' } });
  }

  // It set the value of user input
  onChange = (e) => {
    const { data } = this.state;
    const { name, value } = e.target;
    this.setState({ data: { ...data, [name]: value } });
  }

  onSubmit = (e) => {
    e.preventDefault();
    e.target.className += " was-validated";
    // process onSubmit when user input are valid
    if (this.isValid()) {
      this.setState({ loading: true, errors: {}, total: {} })
      // excute the postRoute api with origin and destination
      api.postRoute(this.state.data).then(res => {
        const token = res.data.token;
        // check if has token received from api then execute getRoute api with token
        if (token) this.getRoute(token);
      }).catch(err => {
        // catch error from api
        this.setState({ errors: err.response.data });
        if (err.response.status === 500) this.setState({ errors: { global: 'Internal Server Error.  Please try again later'} });
        this.setState({ loading: false });
      });
    }
  }

  // process each status response and retry logic for in progress status response
  getRoute = (token) => {
    api.getRoute(token).then(res => {
        console.log(res.data.status, res.data)
        const { status, error, path, total_distance, total_time } = res.data
        if (status === 'in progress') {
            this.getRoute(token);
        } else {
          if (status === 'failure') {
            this.setState({ errors: { global: error } })
          } else if (status === 'success') {
            this.setState({ total: {distance: total_distance, time: total_time} });
            // convert array path data to object data
            const routePath = path.map(data => {
              return {latitude: parseFloat(data[0]), longitude: parseFloat(data[1])}
            });
            // assign to global variable so map component can capture the data
            // it can't pass as props due to component was called as withScriptjs(Map) instead of <Map />
            window.$routePath = routePath;
          }
        }
        this.setState({ loading: false })
    }).catch(err => {
      // catch error from api
      this.setState({ errors: err.response.data });
      if (err.response.status === 500) this.setState({ errors: { global: 'Internal Server Error.  Please try again later'} });
      this.setState({ loading: false });
    });
  }

  // validate user input it is empty
  isValid() {
    const fields = ['origin', 'destination'];
    const { errors, isValid } = validateInput(this.state.data, fields);
    if (!isValid) this.setState({ errors });
    return isValid;
  }

  onReset = (e) => {
    e.preventDefault();
    this.setState(this.getInitialState());
  }

  render() {
    const MapLoader = withScriptjs(Map);
    const { REACT_APP_GMAPIKEY, REACT_APP_GOOGLEMAPURL } = process.env;
    const { loading, errors, data, total } = this.state;

    return(
      <MDBRow>
        <MDBCol lg="5" className="lg-0 mb-4">
          <MDBCard>
            <MDBCardBody>
              <form className="needs-validation" onSubmit={this.onSubmit} noValidate>
                  <div className="md-form">
                    <MDBInput id="origin" label="Location" name="origin" type="text" value={data['origin']} onChange={this.onChange} onFocus={this.onFocus} required>
                      { errors['origin'] && <div className="invalid-feedback">{ errors['origin'] }</div> }
                    </MDBInput>
                  </div>
                  <br/>
                  <div className="md-form">
                    <MDBInput id="destination" label="Drop-off" name="destination" type="text" value={data['destination']} onChange={this.onChange} onFocus={this.onFocus} required>
                      { errors['destination'] && <div className="invalid-feedback">{ errors['destination'] }</div> }
                    </MDBInput>
                  </div>
                  <br/><br/>
                  {/* show the error received from API */}
                  { errors['global'] && <div className="validation" style={{display:'block', color:'red'}}>{ errors['global'] }</div> }
                  {/* show the total distance and time received from API */}
                  {!loading && total['distance'] && (
                    <p className="dark-grey-text">
                      Total Distance: { total['distance'] }<br />
                      Total Time: { total['time'] }
                    </p>
                  )}
                  {/* show Button when loading false */}
                  {!loading && (
                    <div className="text-left">
                      <MDBBtn color="light-blue" type="submit">Submit</MDBBtn>
                      <MDBBtn color="default" type="button" onClick={this.onReset}>Reset</MDBBtn>
                    </div>
                  )}
                  {/* show loading inclicator when loading is true */}
                  { loading && (
                    <div className="d-flex align-items-center">
                      <strong>Loading...</strong>
                      <div className="spinner-border ml-auto" role="status" aria-hidden="true"></div>
                    </div>
                  )}
              </form>
            </MDBCardBody>
          </MDBCard>
        </MDBCol>
        <MDBCol lg="7">
          <div id="map-container" className="rounded z-depth-1-half map-container" style={{ height:"400px"}}>
            {/* Load Map only when success and iframe Map if not success to avoid to much use of google API key */}
            {(!loading && total['distance'])
              ? <MapLoader
                  googleMapURL   = { REACT_APP_GOOGLEMAPURL+REACT_APP_GMAPIKEY }
                  loadingElement = {<div style={{height: `100%`, width: `100%`}} />}
                />
              : <iframe
                  src="https://maps.google.com/maps?q=hong%20kong&t=&z=13&ie=UTF8&iwloc=&output=embed"
                  title="unique title" width="100%" height="100%" frameBorder="0" style={{ border: 0 }} allowFullScreen
               />
            }
          </div>
        </MDBCol>
      </MDBRow>
    )
  }
}
