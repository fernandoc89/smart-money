import _ from 'lodash';
import moment from '../vendors/moment';

import {getUUID} from './UUID';
import firestore from '@react-native-firebase/firestore';

import Colors from '../styles/Colors';

export const getBalance = async (untilDays = 0) => {
  let querySnapshot;

  if (untilDays > 0) {
    const date = moment()
      .subtract(untilDays, 'days')
      .toDate();

    querySnapshot = await firestore()
      .collection('entries')
      .orderBy('entryAt')
      .endBefore(date)
      .get();
  } else {
    querySnapshot = await firestore()
      .collection('entries')
      .get();
  }

  return _(querySnapshot.docs).reduce((total, doc) => {
    return total + doc.data().amount;
  }, 0);
};

export const getBalanceSumByDate = async days => {
  let querySnapshot;

  const startBalance = (await getBalance(days)) || 0;

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

  let entries = querySnapshot.docs.map(documentSnapshot =>
    documentSnapshot.data(),
  );

  entries = _(entries)
    .groupBy(({entryAt}) => moment(entryAt.toDate()).format('YYYYMMDD'))
    .map(entry => _.sumBy(entry, 'amount'))
    .map((amount, index, collection) => {
      return (
        (index === 0 ? startBalance : 0) +
        _.sum(_.slice(collection, 0, index)) +
        amount
      );
    });

  console.log('getBalanceSumByDate :: ', JSON.stringify(entries));

  return entries;
};

export const getBalanceSumByCategory = async (days, showOthers = true) => {
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

  let entries = querySnapshot.docs.map(documentSnapshot =>
    documentSnapshot.data(),
  );

  entries = _(entries)
    .groupBy(({category: {id}}) => id)
    .map(entry => ({
      category: _.omit(entry[0].category, 'entries'),
      amount: Math.abs(_.sumBy(entry, 'amount')),
    }))
    .filter(({amount}) => amount > 0)
    .orderBy('amount', 'desc');

  const othersLimit = 3;

  if (showOthers && _(entries).size() > othersLimit) {
    const data1 = _(entries).slice(0, othersLimit);
    const data2 = [
      {
        category: {id: getUUID(), name: 'Outros', color: Colors.metal},
        amount: _(entries)
          .slice(othersLimit)
          .map(({amount}) => amount)
          .sum(),
      },
    ];

    entries = [...data1, ...data2];
  }

  console.log('getBalanceSumByCategory :: ', JSON.stringify(entries));

  return entries;
};
