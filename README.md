# Meteor.collectionCount
## How to use this package

Starting with version 0.0.4 Meteor.CollectionCount is an object that contains all methods. Meteor.collection_count and Meteor.collectionCount are only for backwards compatibility.

### Server side

On your server publications, instead of returning the cursor directly, use the new Meteor.CollectionCount.publish method

Function signature
```
Meteor.CollectionCount.publish(publication, cursor, addIds = false)
```
Here is an example of a typical publication of a collection
```
Meteor.publish('items', function(query={}, skip=0){
  const self = this;
  const cursor = Items.find(query, {
     limit:10,
     skip: skip,
     sort:{number:1}
  });
  return Meteor.CollectionCount.publish(self, cursor, true);
});
```
### Client Side

On the client we check with Meteor.CollectionCount.get for our subscription
```
Template.items.onCreated(function(){
  const instance = this;
  instance.skip = 0;
  instance.subscribe('items', instance.skip);
  
  instance.autorun(function(){
    const c = Meteor.CollectionCount.get( 'items' );
    console.log(`items maxCount = ${c?.maxCount}`, c?.ids);
  })
});
```