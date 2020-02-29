import { check } from 'meteor/check';

Meteor.collection_count = new Meteor.Collection("collection_count");

if(Meteor.isClient) {
  Meteor.subscribe('collection_count');
} else {
  Meteor.publish('collection_count', function () {
    const self = this;
    return Meteor.collection_count.find({ connectionId: self.connection.id });
  });

  Meteor.onConnection(function (connection) {
    const connectionId = connection.id;
    // console.log(`onConnection ${connection.id} - ${connection.sessionKey}`);
    connection.onClose(function () {
      let c = Meteor.collection_count.remove({ connectionId: connectionId });
      if (Meteor.isDevelopment) console.log(`onClose ${connectionId} removed ${c}`);
    });
  });

  Meteor.startup(function () {
    //
    // clear CollectionCount when server starts
    //
    Meteor.collection_count.remove({});
    Meteor.collection_count._ensureIndex({ connectionId: 1 });
  });

  Meteor.collectionCount = (subscription, cursor, addIds = false) => {
    check(subscription?.constructor?.name, 'Subscription');
    check(cursor?.constructor?.name, 'Cursor');
    const connectionId = subscription.connection.id;
    const subscriptionName = subscription._name;
    const cursorDescription = cursor._cursorDescription;
    const collectionName = cursorDescription.collectionName;
    const db = cursor._mongo.db;
    const collections = db.collections().await();
    const collection = collections.filter((c) => {return c.s.name == collectionName});
    const maxCount = collection.length == 1 ? collection[0].find(cursorDescription.selector).count().await() : -1;
    if ( Meteor.isDevelopment ) {
      console.log(`Meteor.CollectionCount ${subscriptionName} ${connectionId} ${maxCount} addIds=${addIds}`);
    }
    if(addIds) {
      const ids = cursor.fetch().map((r) => {return r._id});
      Meteor.collection_count.upsert(
        { connectionId: connectionId, subscriptionName: subscriptionName }
        ,
        {
          connectionId: connectionId,
          subscriptionName: subscriptionName,
          maxCount: maxCount,
          ids: ids
        }
      )
    } else {
      Meteor.collection_count.upsert(
        { connectionId: connectionId, subscriptionName: subscriptionName }
        ,
        {
          connectionId: connectionId,
          subscriptionName: subscriptionName,
          maxCount: maxCount
        }
      )
    }
    return cursor;
  }
}