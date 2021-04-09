/* eslint-disable prettier/prettier */
import Reactotron from 'reactotron-react-native';

Reactotron
  .configure() // controls connection & communication settings
  .useReactNative() // add all built-in react native plug
  .connect(); // let's connect!
