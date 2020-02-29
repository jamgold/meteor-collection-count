# Meteor.collectionCount
## How to use this package

### Server side

On your server publications, instead of returning the cursor directly, use the new Meteor.collectionCount method
```
Meteor.publish('items', function(query={}, skip=0){
  const self = this;
  return Meteor.collectionCount(self, Items.find(query, {
     limit:10,
     skip: skip,
     sort:{number:1}
  }));
});
```
### Client Side

On the client we subscribe to the collection_count 

```
Meteor.collection_count = new Meteor.Collection("collection_count");

Meteor.subscribe('collection_count');

Template.items.onCreated(function(){
  const instance = this;
  instance.skip = 0
  instance.subscribe('items', instance.skip);
  
  instance.autorun(function(){
    const c = Meteor.collection_count.findOne({ subscriptionName: 'items' });
    console.log(`items maxCount = ${c?.maxCount}`);
  })
});
```