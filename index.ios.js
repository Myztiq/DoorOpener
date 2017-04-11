/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import Icon from 'react-native-vector-icons/Octicons';
import {
  AsyncStorage,
  ActivityIndicator,
  AppRegistry,
  TextInput,
  StyleSheet,
  Text,
  Switch,
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
      .then(() => {
        this.setState({
          openOnNextBuzzActive: !this.state.openOnNextBuzzActive
        })
        this.pollForNextBuzzStatus()
      })
  }

  updateNextBuzzStatus = () => {
    return window.fetch(`https://api.particle.io/v1/devices/${this.state.particleId}/openOnBuzz?access_token=${this.state.accessToken}`, {
      method: 'GET'
    })
      .then((res) => {
        return res.json();
      })
      .then((openOnBuzz) => {
        const isOpenOnBuzzActive = openOnBuzz.result
        if (isOpenOnBuzzActive !== this.state.openOnNextBuzzActive) {
          this.setState({
            openOnNextBuzzActive: isOpenOnBuzzActive
          })
        }
        return isOpenOnBuzzActive
      })
  }

  pollForNextBuzzStatus = () => {
    this.updateNextBuzzStatus()
    clearInterval(this.fetchStatusInterval)
    this.fetchStatusInterval = setInterval(this.updateNextBuzzStatus, 5000)
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
        if (this.state.accessToken && this.state.particleId) {
          this.updateNextBuzzStatus()
          clearInterval(this.longFetchStatusInterval)
          this.longFetchStatusInterval = setInterval(this.updateNextBuzzStatus, 30000)
        }
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
          if (this.state.accessToken && this.state.particleId) {
            this.updateNextBuzzStatus()
            clearInterval(this.longFetchStatusInterval)
            this.longFetchStatusInterval = setInterval(this.updateNextBuzzStatus, 30000)
          }
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
      <View
        style={styles.buttonSpacer}
      >
        <Icon.Button
          name="sign-in"
          backgroundColor="#FFE066"
          color="#50514F"
          size={50}
          onPress={this.openDoor}
          iconStyle={{marginTop: 24, marginBottom: 24, marginLeft: 8, marginRight: 8}}
        >
          Open Now
        </Icon.Button>
      </View>
      <View
        style={styles.buttonSpacer}
      >
        <Icon.Button
          name={this.state.openOnNextBuzzActive ? 'clock' : 'megaphone'}
          backgroundColor="#FFE066"
          color="#50514F"
          size={50}
          onPress={this.openOnNextBuzz}
          iconStyle={{marginTop: 24, marginBottom: 24, marginLeft: 8, marginRight: 8}}
        >
          {this.state.openOnNextBuzzActive ? 'Cancel Open On Buzz' : 'Open On Next Buzz'}

        </Icon.Button>
      </View>
      <View
        style={styles.buttonSpacer}
      >
        <Icon.Button
          name='gear'
          backgroundColor="#FFE066"
          color="#50514F"
          onPress={this.triggerEdit}
          iconStyle={{marginTop: 4, marginBottom: 4, marginLeft: 8, marginRight: 8}}
        >
          Change Configuration
        </Icon.Button>
      </View>
    </View>;
  }

  renderHasNoConfiguration() {
    return <View>
      <Text style={{fontSize: 30, color: '#70C1B3'}}>Welcome!</Text>
      <Text style={styles.welcomeText}>I need some info to be able to open your door:</Text>
      <Text style={styles.welcomeText}>Access Token</Text>
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
      <View style={{marginTop: 20}}>
        <Icon.Button
          name='check'
          backgroundColor="#FFE066"
          color="#50514F"
          onPress={this.saveForm}
        >
          Save Configuration
        </Icon.Button>
      </View>
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
    let pageStyles = styles.container
    if (this.state.error) {
      content = this.renderError();
    } else if (this.state.loading) {
      content = this.renderLoading();
    } else if (this.state.saved) {
      content = this.renderHasConfiguration();
    } else {
      pageStyles = styles.configureContainer
      content = this.renderHasNoConfiguration();
    }

    return <View style={pageStyles}>
      {content}
    </View>;
  }
}

const styles = StyleSheet.create({
  configureContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#50514F',
  },
  welcomeText: {
    color: '#50514F'
  },
  buttonSpacer: {
    marginBottom: 24,
    width: '80%'
  }
});

AppRegistry.registerComponent('DoorOpener', () => DoorOpener);
