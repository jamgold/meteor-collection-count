import { check } from 'meteor/check';

Meteor.CollectionCount = {
  connections: new Meteor.Collection("collection_count"),
  debug: false,
  backwardsCompatibility: true,
  makeBackwardsCompatible(){
    if(Meteor.isClient) {
      Meteor.collection_count = Meteor.CollectionCount.connections;
    } else {
      Meteor.collectionCount = (subscription, cursor, addIds = false) => {
        console.log(`This function is deprecated, please use Meteor.CollectionCount.publish instead`)
        return Meteor.CollectionCount.publish(subscription, cursor, addIds);
      }
    }
  }
};

if(Meteor.isClient) {
  Meteor.subscribe('collection_count');
  Meteor.CollectionCount.get = function (subscriptionName,collectionName) {
    const query = collectionName == undefined
      ? { subscriptionName: subscriptionName }
      : { subscriptionName: subscriptionName, collectionName: collectionName }
    return Meteor.CollectionCount.connections.findOne(query);
  }
  if (Meteor.CollectionCount.backwardsCompatibility) {
    Meteor.CollectionCount.makeBackwardsCompatible()
  }
} else {
  Meteor.publish('collection_count', function () {
    const self = this;
    if(Meteor.CollectionCount.debug) {
      console.log(`Meteor.CollectionCount publishing collection_count for ${self.connection.id}`)
    }
    return Meteor.CollectionCount.connections.find({ connectionId: self.connection.id });
  });

  Meteor.onConnection(function (connection) {
    const connectionId = connection.id;
    // console.log(`onConnection ${connection.id} - ${connection.sessionKey}`);
    connection.onClose(function () {
      let c = Meteor.CollectionCount.connections.remove({ connectionId: connectionId });
      if (Meteor.CollectionCount.debug) console.log(`onClose ${connectionId} removed ${c}`);
    });
  });

  Meteor.startup(function () {
    //
    // clear CollectionCount when server starts
    //
    Meteor.CollectionCount.connections.remove({});
    Meteor.CollectionCount.connections._ensureIndex({ connectionId: 1 });
  });

  Meteor.CollectionCount.publish = (subscription, cursor, addIds = false) => {
    check(subscription?.constructor?.name, 'Subscription');
    check(cursor?.constructor?.name, 'Cursor');
    const connectionId = subscription.connection.id;
    const subscriptionName = subscription._name;
    const cursorDescription = cursor._cursorDescription;
    const collectionName = cursorDescription.collectionName;
    const db = cursor._mongo.db;
    const collections = db.collections().await();
    const collection = collections.filter((c) => {
      const name = c.s.name ? c.s.name : c.s.namespace.collection;
      return name == collectionName
    });
    const maxCount = collection.length == 1 ? collection[0].find(cursorDescription.selector).count().await() : -1;
    if (Meteor.CollectionCount.debug ) {
      console.log(`Meteor.CollectionCount.publish ${subscriptionName} ${connectionId} maxCount=${maxCount} addIds=${addIds}`);
    }
    const query = { connectionId: connectionId, subscriptionName: subscriptionName, collectionName: collectionName };
    const upsert = { connectionId: connectionId, subscriptionName: subscriptionName, collectionName: collectionName, maxCount: maxCount };

    if(addIds) {
      upsert.ids = cursor.fetch().map((r) => {return r._id});
    }
    Meteor.CollectionCount.connections.upsert(query, upsert);

    return cursor;
  }
  if (Meteor.CollectionCount.backwardsCompatibility) {
    Meteor.CollectionCount.makeBackwardsCompatible();
  }
}