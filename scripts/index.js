let store = {
  app: {
    renderedViews: []
  },
  heirarchyMap: {
    topics: {
      parentType: null,
      parentIdField: null
    },
    categories: {
      parentType: "topics",
      parentIdField: "topicId"
    },
    articles: {
      parentType: "categories",
      parentIdField: "categoryId"
    },
  },
  topics: [
    {
      id: 1,
      displayString: "Account Management",
      slug: "account-management"
    },
    {
      id: 2,
      displayString: "Billing",
      slug: "billing"
    }
  ],
  categories: [
    {
      id: 1,
      topicId: 1,
      displayString: "I have an issue with my Credit Card",
      slug: "i-have-an-issue-with-my-credit-card"
    },
    {
      id: 2,
      topicId: 1,
      displayString: "I need a copy of my pricing",
      slug: "i-need-a-copy-of-my-pricing"
    }
  ],
  articles: [
    {
      id: 115005707723,
      categoryId: 1,
    }
  ]
};

// ---------------------------------------------------------------------------

function removeViewFromrenderedViews(view) {
  var cid = view.cid;
  var index = _.findIndex(store.app.app.renderedViews, function (n) {return n.cid === cid});
  store.app.renderedViews.splice(index,1); //remove from the array
}

function removeAllViews () {
  for (var i = store.app.renderedViews.length - 1; i >= 0; i--) {
		store.app.renderedViews[i].removeRenderedView();
	};
};

Backbone.View.prototype.removeRenderedView = _.wrap(
  Backbone.View.prototype.remove,
  function (originalFunction) {
    originalFunction.apply(this);
    removeViewFromrenderedViews(this);
  }
);

function getModels (type, parentId) {
  let parentIdField = store.heirarchyMap[type].parentIdField;
  let models = store[type].filter(function (i) {
    return i[parentIdField] == parentId;
  });
  return models;
};

let AppView = Backbone.View.extend({
  initialize: function () {
    this.render();
  },

  el: '#app',

  render:function () {
    //nothing to render, just reference #app
  }
});

// End App and Utility
// Models

let ArticleModel = Backbone.Model.extend({
  defaults: {
    id: 0,
    categoryId: 0,
    title: '', //on GET
    description: '', //on GET + parse
    url:'', //on GET
    isFetched:false //on GET
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

// End Models
// Collections

// End Collections
// Views
let BreadCrumbView = Backbone.View.extend({
  initialize: function (router) {
    this.listenTo(router, 'route', this.render);
    this.render();
  },

  el: '#breadcrumb-container',

  render: function (routeFunction, args) {
    //render logic to be inserted
  }
});

let GeneralListView = Backbone.View.extend({
  initialize: function () {
    this.render();
  },

  render: function () {
    this.collection.each(function (model) {
      // append template to #list-container
    });
  }
});

let ArticleListView = Backbone.View.extend({
  initialize: function () {
    this.render();
  },

  render: function () {
    this.collection.each(function (model) {
      store.app.renderedViews.push(new ArticleView({model: model}));
    });
  }
});

let ArticleView = Backbone.View.extend({
  initialize: function () {
    this.listenTo(this.model, 'change', render);
    this.model.fetch();
  },

  render: function () {
    // append to #list-container
    // render template
  }
})

// End Views
// Router

let Router = Backbone.Router.extend({
  initialize:function () {
    // These are the only two views that are not removed on route change
    // So don't push them to the store.app.renderedViews

    // Initialize App View
    let view = new AppView();
    // Initialize Breadcrumb View with router reference
    let breadCrumbView = new BreadCrumbView(this);
  },

  routes: {
    '' : 'topics',
    ':topic' : 'categories',
    ':topic/:category' : 'articles',
  },

  topics: function () {
    console.log('topics route');
    // List all topics
    //removeAllViews();
    let models = _.map(store.topics, function (topic) {
      return new TopicModel(topic);
    });
    console.log(models);
    store.app.renderedViews.push(new GeneralListView({collection: models}));
  },

  categories:function (topicSlug) {
    console.log('categories route');
    let topicId = store.topics.find(function (i) {
      return i.slug == topicSlug;
    }).id;
    let models = _.map(getModels('categories',topicId), function (category) {
      return new CategoryModel(category);
    });
    console.log(models);
    store.app.renderedViews.push(new GeneralListView({collection: models}));
    // List all categories under selected topic
  },

  articles: function (topicSlug, categorySlug) {
    console.log('articles route');
    let categoryId = store.categories.find(function (i) {
      return i.slug == categorySlug;
    }).id;
    let models = _.map(getModels('articles', categoryId), function (article) {
      return new ArticleModel(article);
    });
    console.log(models);
    store.app.renderedViews.push(new ArticleListView({collection: models}));
  }
});

// End Router
// Init

$(document).ready(function () {
  // Initialize Router
  let router = new Router();
  Backbone.history.start();
});
