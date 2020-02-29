Package.describe({
  name: 'jamgold:meteor-collection-count',
  version: '0.0.2',
  // Brief, one-line summary of the package.
  summary: 'Provide Meteor.collectionCount function',
  // URL to the Git repository containing the source code for this package.
  git: 'https://github.com/jamgold/meteor-collection-count.git',
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.8');
  api.use(['ecmascript','check']);
  api.mainModule('collection-count.js');
});
