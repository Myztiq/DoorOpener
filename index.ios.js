/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
  AsyncStorage,
  ActivityIndicator,
  AppRegistry,
  TextInput,
  StyleSheet,
  Text,
  View,
  Button
} from 'react-native';

export default class DoorOpener extends Component {
  constructor (props) {
    super(props);
    this.state = {
      accessToken: null,
      particleId: null,
      loading: true,
      error: null,
      saved: false
    };
  }

  openDoor = () => {
    window.fetch(`https://api.particle.io/v1/devices/${this.state.particleId}/openDoor?access_token=${this.state.accessToken}&arg=1000`, {
      method: 'POST'
    })
  }

  openOnNextBuzz = () => {
    window.fetch(`https://api.particle.io/v1/devices/${this.state.particleId}/openOnBuzz?access_token=${this.state.accessToken}&arg=1000`, {
      method: 'POST'
    })
  }

  componentDidMount () {
    AsyncStorage.multiGet(['accessToken', 'particleId', 'saved'])
      .then((values) => {
        newState = values.reduce((tmpState = {}, value) => {
          tmpState[value[0]] = value[1]
          return tmpState
        }, {})
        this.setState({
          accessToken: newState.accessToken,
          particleId: newState.particleId,
          loading: false,
          saved: newState.saved === 'true'
        });
      })
      .catch((error) => {
        this.setState({
          loading: false,
          error: error
        })
      })
  }

  saveForm = () => {
    if (this.state.accessToken && this.state.particleId) {
      AsyncStorage.multiSet(
        [
          ['accessToken', this.state.accessToken],
          ['particleId', this.state.particleId],
          ['saved', 'true']
        ]
      )
        .then(() => {
          console.log('STATE SET!');
          this.setState({
            saved: true
          })
        })
        .catch((error) => {
          this.setState({
            saved: true,
            error: error
          })
        })
    }
  }

  resetError = () => {
    this.setState({
      error: null
    })
  }

  triggerEdit = () => {
    this.setState({
      saved: false
    })
  }

  renderLoading () {
    return <ActivityIndicator
      animating
      size='large'
    />;
  }

  renderHasConfiguration () {
    return <View>
      <Text style={styles.welcome}>
        Do you want to open the door?
      </Text>
      <Button
        onPress={this.openDoor}
        title='Open The Door!'
      />
      <Button
        onPress={this.openOnNextBuzz}
        title='Open on next buzz'
      />
      <Button
        onPress={this.triggerEdit}
        title='Change configuration'
      />
    </View>;
  }

  renderHasNoConfiguration() {
    return <View>
      <Text>Welcome!</Text>
      <Text>To get started you need to add your particles device ID and access token.</Text>
      <Text>Access Token</Text>
      <TextInput
        style={{height: 40, borderColor: 'gray', borderWidth: 1}}
        onChangeText={(accessToken) => this.setState({accessToken})}
        value={this.state.accessToken}
        placeholder='Access Token'
      />
      <Text>Particle ID</Text>
      <TextInput
        style={{height: 40, borderColor: 'gray', borderWidth: 1}}
        onChangeText={(particleId) => this.setState({particleId})}
        value={this.state.particleId}
        placeholder='Particle ID'
      />
      <Button
        onPress={this.saveForm}
        title='Save Configuration'
      />
    </View>;
  }

  renderError () {
    return <View>
      <Text>ERROR: {this.state.error.message}</Text>
      <Button
        onPress={this.resetError}
        title='Reset'
      />
    </View>
  }

  render() {
    let content;
    if (this.state.error) {
      content = this.renderError();
    } else if (this.state.loading) {
      content = this.renderLoading();
    } else if (this.state.saved) {
      content = this.renderHasConfiguration();
    } else {
      content = this.renderHasNoConfiguration();
    }
    return <View style={styles.container}>
      {content}
    </View>;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  }
});

AppRegistry.registerComponent('DoorOpener', () => DoorOpener);
