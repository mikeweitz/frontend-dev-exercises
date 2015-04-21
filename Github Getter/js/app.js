$(function() {
  App.init();
});

// App module
var App = (function($, _){
  // some vars
  var $app,
    $submit, 
    $back,
    $list,
    $detail,
    $term,
    endpoint = "https://api.github.com/legacy/repos/search/", 
    cache = {},
    repos = [],
    tplList = _.template('<li data-id="<%= index %>"">'+
      '<%= repo.name %> (<%= repo.score %>) ' +
      '</li>'),
    tplDetail = _.template('<h1>Details for <%= name %></h1>' + 
      'url: <a href="<%= url %>" target="_blank"><%= url %></a></p>' +
      '<div class="lang">Lanuage: <%= language %></div>' + 
      '<p>Followers: <%= followers %><br/>' +
      '<p>Description: <%= description %></p>');


  // 
  // setters / getters;
  //
  var setRepos = function(data){
    repos = data;
  }

  var getRepos = function(i){
    return (typeof i !== 'undefined') ? repos[i] : repos;
  }

  var setCache = function(term, results) {
    cache[term] = results;
  }

  var getCache = function(term){
    console.log('searching for '+term+ ' in cache', cache);
    return cache.hasOwnProperty(term) ? cache[term] : false;
  }

  // Initialization
  var init = function(){
    $app = $('#app');
    $submit = $('#submit');
    $back = $('.back');
    $term = $('#search');
    $list = $('#results-container ul');
    $detail = $('#overlay-container .info');
    bindUI();
    $app.removeClass().addClass('search');
  }

  // UI Bindings
  var bindUI = function(){
    // Search
    $submit.on('click', function(event){
      event.preventDefault();
      var term = $term.val();

      if (term.length < 1) {
        return alert('Better enter a search term before searching....');
      }
      doSearch(term);
    });

    // Item
    $list.on('click', 'li', function(event){
      event.preventDefault();
      $(this).addClass('visited');
      showRepo(getRepos($(this).data('id'))); 
    });

    // Back
    $back.on('click', function(event){
      var goTo;

      if ($app.hasClass('list')){
        goTo = "search"
        $term.val('');
      } else {
        goTo = "list"
      }
      $app.removeClass().addClass(goTo);
    });
  };

  // Show results
  var showResults = function(repos){
    var repos = repos || getRepos();

    $app.removeClass().addClass('list');
    $list.empty();
    _.each(repos, function(repo, index){
      $list.append(
        tplList({ index: index, repo: repo })
      );
    }); 
  };

  // Show detail
  var showRepo = function(repo){
    var data = {
      name: repo.name, 
      language: repo.language || 'Not Provided',
      followers: repo.followers || 'None',
      url: repo.url,
      description: repo.description || ''
    }

    $app.removeClass().addClass('detail');
    $detail.html(
      tplDetail(data)
    );
  };

  // Do search
  var doSearch = function(term){
    var cache = getCache(term),
      complete = function(data){
        $list.siblings('h1').html('Serched for: ' + term);
        setRepos(data);
        showResults();      
      };

    // check if cached:
    if (cache){
      complete(cache.repositories);
    } else {
      $.ajax({
        method: "GET",
        url: endpoint + term
      })
      .done(function( results ) {
        setCache(term, results);
        complete(results.repositories);
      });
    }
  };

  //
  // Public API
  // 
  return {
    init: init
  }
 })(jQuery, _);