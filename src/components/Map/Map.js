import React, { Component } from "react";
import { withGoogleMap, GoogleMap, DirectionsRenderer } from "react-google-maps";

export default class Map extends Component {

  state = {
    directions: null,
    defaultLatLng: { lat: '', lng: '' }
  };

  componentDidMount() {
    const routePath = window.$routePath;
    // show map when it has routePath
    if (routePath) {
      const google = window.google = window.google ? window.google : {}
      const directionsService = new google.maps.DirectionsService();
      // assign routePath to waypoints
      const waypoints = routePath.map(path => ({
        location: {lat: path.latitude, lng: path.longitude},
        stopover: true
      }));
      // capture origin and destination
      const origin = waypoints.pop().location;
      const destination = waypoints.shift().location;
      this.setState({ defaultLatLng: origin })
      // called the directionsService
      directionsService.route(
        {
          origin: origin,
          destination: destination,
          travelMode: google.maps.TravelMode.DRIVING,
          waypoints: waypoints
        },
        (result, status) => {
          if (status === google.maps.DirectionsStatus.OK) {
            this.setState({ directions: result });
          }
        }
      );
    }
  }

  render() {
    const { defaultLatLng, directions } = this.state;
    const hongkongLatLng = {lat: 22.3193, lng: 114.1694};
    // set default hongkongLatLng when no directions
    const defaultCenter = directions ? defaultLatLng : hongkongLatLng;

    const GoogleMapExample = withGoogleMap(props => (
      <GoogleMap defaultZoom = {8} defaultCenter = {defaultCenter}>
        {directions && <DirectionsRenderer directions={directions} />}
      </GoogleMap>
    ));

    return (
      <div>
        <GoogleMapExample
          mapElement       = {<div style={{ height: `100%`,  width: `100%`  }} />}
          containerElement = {<div style={{ height: `400px`, width: `734px`, position: `absolute`, top: 0, left: 0, right: 0, bottom: 0 }} />}
        />
      </div>
    );
  }
}
