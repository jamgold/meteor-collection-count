# Meteor.collectionCount
## How to use this package

### Server side

On your server publications, instead of returning the cursor directly, use the new Meteor.collectionCount method

Function signature
```
Meteor.collectionCount(publication, cursor, addIds = false)
```
We publish with collectionCount
```
Meteor.publish('items', function(query={}, skip=0){
  const self = this;
  return Meteor.collectionCount(self, Items.find(query, {
     limit:10,
     skip: skip,
     sort:{number:1}
  }), true);
});
```
### Client Side

On the client we subscribe to the collection_count 

```
Meteor.collection_count = new Meteor.Collection("collection_count");

Template.items.onCreated(function(){
  const instance = this;
  instance.skip = 0
  instance.subscribe('items', instance.skip);
  
  instance.autorun(function(){
    const c = Meteor.collection_count.findOne({ subscriptionName: 'items' });
    console.log(`items maxCount = ${c?.maxCount}`, c?.ids);
  })
});
```