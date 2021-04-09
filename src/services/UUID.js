import 'react-native-get-random-values';
import {v1 as uuidv1} from 'uuid';

export const getUUID = () => {
  const {v1: uuidv1} = require('uuid');

  return uuidv1();
};
