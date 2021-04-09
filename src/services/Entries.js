import {Alert} from 'react-native';

import moment from '../vendors/moment';

import firestore from '@react-native-firebase/firestore';

export const getEntries = async (days, category) => {
  let querySnapshot;

  if (days > 0) {
    const date = moment()
      .subtract(days, 'days')
      .toDate();

    querySnapshot = await firestore()
      .collection('entries')
      .orderBy('entryAt')
      .startAt(date)
      .get();
  } else {
    querySnapshot = await firestore()
      .collection('entries')
      .orderBy('entryAt')
      .get();
  }

  let entries = querySnapshot.docs.map(documentSnapshot => {
    return {...documentSnapshot.data(), id: documentSnapshot.id};
  });

  if (category && category.id) {
    entries = entries.filter(entry => entry.category.id === category.id);
  }

  return entries;
};

export const addEntry = async entry => {
  let data = {};

  console.log('addEntry :: value: ', JSON.stringify(entry));

  try {
    data = {
      amount: entry.amount,
      description: entry.category.name,
      entryAt: entry.entryAt || new Date(),
      latitude: entry.latitude,
      longitude: entry.longitude,
      address: entry.address,
      photo: entry.photo,
      isInit: entry.isInit || false,
      category: entry.category,
    };

    await firestore()
      .collection('entries')
      .add(data);
  } catch (error) {
    console.error(
      'addEntry :: error on save object: ',
      JSON.stringify(data),
      JSON.stringify(error),
    );
    Alert.alert('Erro', 'Houve um erro ao salvar este lançamento.');
  }

  return data;
};

export const updateEntry = async entry => {
  console.log('updateEntry :: entry object: ' + JSON.stringify(entry));

  let data = {};
  try {
    data = {
      amount: entry.amount,
      description: entry.category.name,
      entryAt: entry.entryAt || new Date(),
      latitude: entry.latitude,
      longitude: entry.longitude,
      address: entry.address,
      photo: entry.photo,
      isInit: entry.isInit || false,
      category: entry.category,
    };

    await firestore()
      .collection('entries')
      .doc(entry.id)
      .update(data);
  } catch (error) {
    console.log(
      'updateEntry :: error on save object: ' + JSON.stringify(this.data),
    );
    console.log('updateEntry :: error on save object: ' + error);

    Alert.alert('Erro', 'Houve um erro ao atualizar este lançamento.');
  }

  return data;
};

export const deleteEntry = async entry => {
  try {
    await firestore()
      .collection('entries')
      .doc(entry.id)
      .delete();
  } catch (error) {
    console.log(
      'deleteEntry :: error on delete object: ' + JSON.stringify(entry),
    );
    console.log('deleteEntry :: error on save delete: ' + error);

    Alert.alert('Erro', 'Houve um erro ao apagar este lançamento.');
  }
};
