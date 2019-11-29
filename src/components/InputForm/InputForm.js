import React from 'react';
import api from '../../api';

import { MDBRow, MDBCol, MDBCard, MDBCardBody,  MDBBtn, MDBInput } from "mdbreact";

import { withScriptjs } from "react-google-maps";
import Map from '../Map';

import validateInput from '../../shared/validations/common';

export default class InputForm extends React.Component {

  state = this.getInitialState();

  getInitialState() {
    return {
      data: { origin: '', destination: '' },
      total: { distance: '', time: '' },
      loading: false, errors: {}
    }
  }

  onFocus = (e) => {
    const { errors } = this.state;
    const { name } = e.target;
    this.setState({ errors: { ...errors, [name]: '' } })
  }

  onChange = (e) => {
    const { data, errors } = this.state;
    const { name, value } = e.target;
    this.setState({
        data: {   ...data, [name]: value },
      errors: { ...errors, [name]: '' }
    });
  }

  onSubmit = (e) => {
    e.preventDefault();
    e.target.className += " was-validated";

    if (this.isValid()) {
      this.setState({ loading: true, errors: {}, total: {} })
      api.postRoute(this.state.data).then(res => {
        const token = res.data.token;
        if (token) this.getRoute(token);
      }).catch(err => {
        this.setState({ errors: err.response.data });
        if (err.response.status === 500) this.setState({ errors: { global: 'Internal Server Error.  Please try again later'} });
        this.setState({ loading: false });
      });
    }
  }

  getRoute = (token) => {
    api.getRoute(token).then(res => {
        console.log(res)
        const { status, error, path, total_distance, total_time } = res.data
        if (status === 'in progress') {
            this.getRoute(token);
        } else {
          if (status === 'failure') {
            this.setState({ errors: { global: error } })
          } else if (status === 'success') {
            this.setState({ total: {distance: total_distance, time: total_time} });

            const routePath = path.map(data => {
              return {latitude: parseFloat(data[0]), longitude: parseFloat(data[1])}
            });

            window.$routePath = routePath;
          }
        }
        this.setState({ loading: false })
    }).catch(err => {
      this.setState({ errors: err.response.data });
      if (err.response.status === 500) this.setState({ errors: { global: 'Internal Server Error.  Please try again later'} });
      this.setState({ loading: false });
    });
  }

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
    const { REACT_APP_GMAPIKEY, REACT_APP_GOOGLEMAPURL } = process.env;
    const MapLoader = withScriptjs(Map);
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
                  { errors['global'] && <div className="validation" style={{display:'block', color:'red'}}>{ errors['global'] }</div> }
                  {!loading && total['distance'] && (
                    <p className="dark-grey-text">
                      Total Distance: { total['distance'] }<br />
                      Total Time: { total['time'] }
                    </p>
                  )}
                  {!loading && (
                    <div className="text-left">
                      <MDBBtn color="light-blue" type="submit">Submit</MDBBtn>
                      <MDBBtn color="default" type="button" onClick={this.onReset}>Reset</MDBBtn>
                    </div>
                  )}
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
