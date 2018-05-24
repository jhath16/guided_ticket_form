let store = {
  renderedViews: [],
};

function removeViewFromRenderedViews(view) {
  var cid = view.cid;
  var index = _.findIndex(store.renderedViews, function (n) {return n.cid === cid});
  store.renderedViews.splice(index,1); //remove from the array
}

function removeAllViews () {
  for (var i = store.renderedViews.length - 1; i >= 0; i--) {
		store.renderedViews[i].removeRenderedView();
	};
};

Backbone.View.prototype.removeRenderedView = _.wrap(
  Backbone.View.prototype.remove,
  function (originalFunction) {
    console.log(this);
    originalFunction.apply(this);
    removeViewFromRenderedViews(this);
  }
);

let AppView = Backbone.View.extend({
  initialize: function () {
    this.render();
  },
  
  el: '#app',
  
  render:function () {
    //nothing to render, just reference #app
  }
});

// Models

let ArticleModel = Backbone.Model.extend({
  defaults: {
    id: 0,
    categoryId: 0,
    title: '',
    description: '',
    url: ''
  },
});

let TopicModel = Backbone.Model.extend({
  defaults: {
    id: 0,
    displayString: '',
    slug: ''
  }
});

let CategoryModel = Backbone.Model.extend({
  defaults: {
    id: 0,
    topicId: 0,
    displayString: '',
    slug: ''
  }
});

let ArticleCollection = Backbone.Collection.extend({
  model: ArticleModel,
  // when moving to production, remove root of URL ('https://vcti.zendesk.com')
  // which will be the route when live
  url:'https://vcti.zendesk.com/api/v2/help_center/en-us/articles'
});

let articleCollection = new ArticleCollection([{
  id:"360000730463.json",
}]);

let Router = Backbone.Router.extend({
  initialize:function () {
    //  These are the only two views that are not removed on route change
    // So don't push them to the store.renderedViews
    // Initialize App View
    let view = new AppView();
    // Initialize Breadcrumb View
    let breadCrumbView = new BreadCrumbView(this);
  },
  
  routes: {
    '' : 'topics',
    ':topic' : 'categories',
    ':topic/:category' : 'articles',
  },
  
  topics: function () {
    // List all topics
    //removeAllViews();
    //store.renderedViews.push(new GeneralListView('topics'))
  },
  
  categories:function (topic) {
    console.log('categories route');
    // List all categories under selected topic
  },
  
  articles: function (topic, category) {
    console.log('articles route');
    // List all articles under selected category
  }
});

let BreadCrumbView = Backbone.View.extend({
  initialize: function (router) {
    this.listenTo(router, 'route', this.render);
  }, 
  
  render: function (routeFunction, args) {
    console.log(routeFunction);
    console.log(args);
  }
});

$(document).ready(function () {
  // Initialize Router
  let router = new Router();
  Backbone.history.start();
});

