'use strict';

import React, { Component } from 'react';

import {StyleSheet, Text, View} from 'react-native';

import {
  ViroARScene,
  ViroText,
  ViroConstants,
  ViroBox,
  ViroMaterials,
  ViroAnimations,
  Viro3DObject,
  ViroNode,
  ViroButton
} from 'react-viro';

import Geolocation from 'react-native-geolocation-service'

import projector from 'ecef-projector'

export default class HelloWorldSceneAR extends Component {


  constructor() {
    super();

    // Set initial state here
    this.state = {
      text : "Initializing AR...",
      latitude: null,
      longitude: null,
      error: null,
      selisih: null,
      xSel: null,
      ySel: null,
      zSel: null,
      distance: null,
      string: '',
      isString: true,
      count: 0,
      _condition: false,
      condition: ''
    };

    // bind 'this' to functions
    this._onInitialized = this._onInitialized.bind(this);
  }

  getCoordinate = () => {
    const userxyz = projector.project(this.state.latitude, this.state.longitude, 0.0);
    const objectxyz = projector.project(-6.260719, 106.781616, 0.0)
    if (this.state.count === 0) {
      this.selisih(userxyz, objectxyz)
    }
    const distance = this.getDistance(this.state.latitude, this.state.longitude, -6.260719, 106.781616)
    this.setState({
      distance: distance
    })
  }

  selisih = (user, object) => {
    let selisih = {
      x: user[0] - object[0],
      y: user[1] - object[1],
      z: user[2] - object[2]
    }
    this.setState({
      xSel: selisih.x,
      ySel: selisih.y,
      zSel: selisih.z,
      count: this.state.count + 1
    })
  }

  getDistance = (lon1, lat1, lon2, lat2) => {
    if (typeof(Number.prototype.toRad) === "undefined") {
      Number.prototype.toRad = function() {
        return this * Math.PI / 180;
      }
    }

    var R = 6371; // Radius of the earth in km
    var dLat = (lat2-lat1).toRad();  // Javascript functions in radians
    var dLon = (lon2-lon1).toRad();
    var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1.toRad()) * Math.cos(lat2.toRad()) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    var d = R * c * 1000 // Distance in km
    return d.toFixed(2)
  }

  componentDidMount() {
    Geolocation.getCurrentPosition(
      (position) => {
        this.setState({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          error: null,
          string: String(position.coords.latitude)
        });
        this.getCoordinate()
      },
      (error) => this.setState({ error: error.message }),
      { enableHighAccuracy: true, timeout: 2000, maximumAge: 2000, distanceFilter: 1 },
    )

    Geolocation.watchPosition(
      (position) => {
        this.setState({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          error: null,
          string: String(position.coords.latitude)
        });
        this.getCoordinate()
      },
      (error) => this.setState({ error: error.message }),
      { enableHighAccuracy: true, timeout: 2000, maximumAge: 2000, distanceFilter: 1 },
    )
  }

  _reload = () => {
    if (this.state.distance < 2) {
      this.setState({
        condition: 'Salam 3 jari enak',
        _condition: true
      })
    } else {
      this.setState({
        condition: 'you are not close enough',
        _condition: true
      })
    }
  }

  render() {
    const numx = this.state.xSel
    const numy = this.state.ySel
    const numz = this.state.zSel
    return (
      <ViroARScene onTrackingUpdated={this._onInitialized}>
        {
          this.state.xSel && this.state.ySel && this.state.zSel &&
            <ViroBox
              position={[numx,0,numz]}
              scale={[1.2, 1.2, 1.2]}
              materials={["grid"]}
              animation={{name: "rotate", run: true, loop: true}}
              onClick={this._reload}
              />
        }
        {
          this.state.distance &&
          <ViroText text={String(this.state.distance)} scale={[3, 3, 3]} position={[numx, -4, numz]} style={styles.helloWorldTextStyle} />
        }
        {
          this.state._condition &&
          <ViroText text={this.state.condition} scale={[1, 1, 1]} position={[numx, -6, numz]} style={styles.helloWorldTextStyle} />
        }

      </ViroARScene>

    )
  }

  _onInitialized(state, reason) {
    if (state == ViroConstants.TRACKING_NORMAL) {
      this.setState({
        text : "Hello World!"
      });
    } else if (state == ViroConstants.TRACKING_NONE) {
      // Handle loss of tracking
    }
  }
}

var styles = StyleSheet.create({
  helloWorldTextStyle: {
    fontFamily: 'Arial',
    fontSize: 30,
    color: '#ffffff',
    textAlignVertical: 'center',
    textAlign: 'center',
  },
})

ViroMaterials.createMaterials({
  grid: {
    diffuseTexture: require('./res/grid_bg.jpg'),
  },
  home: {
     lightingModel: "Blinn",
     diffuseTexture: require('./res/btn_black.png'),
     specularTexture: require('./res/btn_white.png'),
     writesToDepthBuffer: true,
     readsFromDepthBuffer: true,
   },
});

ViroAnimations.registerAnimations({
  rotate: {
    properties: {
      rotateY: "+=90"
    },
    duration: 500, //.25 seconds
  },
});

module.exports = HelloWorldSceneAR;
