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
    },
    {
      id: 115005707722,
      categoryId: 1,
    }
  ]
};

// ---------------------------------------------------------------------------

function removeViewFromrenderedViews(view) {
  var cid = view.cid;
  var index = _.findIndex(store.app.renderedViews, function (n) {return n.cid === cid});
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

  fetch: function () {
    let url = `/api/v2/help_center/en-us/articles/${this.id}.json`;
    $.get(url)
    .done(function (data) {
      console.log(data);
      // parse description
      // update model (trigger render)
    })
    .fail(function (data) {
      console.log(data);
    })
    .always(function () {
      //remove spinner
    });
  }
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
  },

  el: '#breadcrumb-container',

  findDisplayStringBySlug: function (collection, slug) {
    let displayString = collection.find(function(item) {
      return item.slug == slug;
    }).displayString;
    return displayString;
  },

  getURLByIndex: function (index, array) {
    let url = "#/";
    let deepUrl = _.clone(array).splice(0, index + 1).join('/');
    url += deepUrl;
    return url
  },

  render: function (routeFunction, routes) {
    routes.length -= 1; // remove null arg from end

    let self = this;
    let breadCrumbHTML = "<a href='#/'>Home</a>";
    _.each(routes, function (slug, index, array) {
      if (index == 0) {
        let displayString = self.findDisplayStringBySlug(store.topics, slug);
        let url = self.getURLByIndex(0, array);
        breadCrumbHTML += "<span>/</span>";
        breadCrumbHTML += "<a href='" + url + "'>" + displayString + "</a>";
      } else if (index == 1) {
        let displayString = self.findDisplayStringBySlug(store.categories, slug);
        let url = self.getURLByIndex(1, array);
        breadCrumbHTML += "<span>/</span>";
        breadCrumbHTML += "<a href='" + url + "'>" + displayString + "</a>";
      }
    });
    console.log(breadCrumbHTML);
    this.$el.html(breadCrumbHTML);
  }
});

let GeneralListView = Backbone.View.extend({
  initialize: function () {
    this.render();
  },

  render: function () {
    this.collection.each(function (model) {
      let generalView = new GeneralView({model: model});
      store.app.renderedViews.push(generalView);
      $('#list-container').append(generalView.el);
    });
  }
});

let GeneralView = Backbone.View.extend({
  initialize: function () {
    this.render();
  },

  tagName: 'li',

  className: 'general-view',

  template: _.template($('#general-view-template').text()),

  render: function () {
    this.$el.html(this.template(this.model.attributes));
  }
});

let ArticleListView = Backbone.View.extend({
  initialize: function () {
    this.render();
  },

  render: function () {
    this.collection.each(function (model) {
      let articleView = new ArticleView({model: model});
      store.app.renderedViews.push(articleView);
      $("#list-container").append(articleView.el);
    });
  }
});

let ArticleView = Backbone.View.extend({
  initialize: function () {
    this.listenTo(this.model, 'change', this.render);
    this.render();
    if (this.model.get('isFetched')) {
      // add spinner?
      // this.model.fetch();
    }
  },

  tagName: 'li',

  className: 'article-view',

  template: _.template($('#article-template').text()),

  render: function () {
    this.$el.html(this.template(this.model));
  }
});

let FormView = Backbone.View.extend({
  initialize: function () {
    this.render();
  },

  el: '#form-view',

  render: function () {
    // either
      // render function that accepts options object with fields to show/hide
    // or
      // multiple functions that manipulate form
  },

  show: function () {
    this.$el.show();
  },

  hide: function () {
    this.$el.hide();
  }
});

// End Views
// Router

let Router = Backbone.Router.extend({
  initialize:function () {
    // These are the only views that are not removed on route change
    // So don't push them to the store.app.renderedViews

    // Initialize App View
    let view = new AppView();
    // Initialize Breadcrumb View with router reference
    let breadCrumbView = new BreadCrumbView(this);

    let formView = new FormView();
  },

  routes: {
    '' : 'topics',
    ':topic' : 'categories',
    ':topic/:category' : 'articles',
  },

  topics: function () {
    // List all topics
    removeAllViews();
    let models = _.map(store.topics, function (topic) {
      return new TopicModel(topic);
    });
    let collection = new Backbone.Collection(models);
    store.app.renderedViews.push(new GeneralListView({collection: collection}));
  },

  categories:function (topicSlug) {
    // List all categories under selected topic
    removeAllViews();
    let topicId = store.topics.find(function (i) {
      return i.slug == topicSlug;
    }).id;
    let models = _.map(getModels('categories',topicId), function (category) {
      return new CategoryModel(category);
    });
    let collection = new Backbone.Collection(models);
    store.app.renderedViews.push(new GeneralListView({collection: collection}));
  },

  articles: function (topicSlug, categorySlug) {
    // List all articles under selected categories
    removeAllViews();
    let categoryId = store.categories.find(function (i) {
      return i.slug == categorySlug;
    }).id;
    let models = _.map(getModels('articles', categoryId), function (article) {
      return new ArticleModel(article);
    });
    let collection = new Backbone.Collection(models);
    store.app.renderedViews.push(new ArticleListView({collection: collection}));
  }
});

// End Router
// Init

$(document).ready(function () {
  // Initialize Router
  let router = new Router();
  Backbone.history.start();
});
