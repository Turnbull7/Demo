App = {
  web3Provider: null,
  contracts: {},
  account: '0x0',
  hasVoted: false,

  init: function() {
    return App.initWeb3();
  },

  initWeb3: function() {
    if (ethereum) {
      web3 = new Web3(ethereum);
      try {
        ethereum.enable();
        App.web3Provider = web3.currentProvider;
      } catch (error) {
        console.warn(error);
      }
    } else if (web3) {
      App.web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider);
    } else {
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
      web3 = new Web3(App.web3Provider);
    }
    return App.initContract();
  },

  initContract: function() {
    $.getJSON("Election.json", function(election) {
      // Instantiate a new truffle contract from the artifact
      App.contracts.Election = TruffleContract(election);
      // Connect provider to interact with contract
      App.contracts.Election.setProvider(App.web3Provider);

      App.listenForEvents();

      return App.render();
    });
  },

  // Listen for events emitted from the contract
  listenForEvents: function() {
    App.contracts.Election.deployed().then(function(instance) {
      instance.votedEvent({}, {
        fromBlock: 'latest',
        toBlock: 'latest'
      }).watch(function(error, event) {
        console.log("event triggered", event)
        // Reload when a new vote is recorded
        App.render();
      });
    });
  },

  render: function() {
    var electionInstance;
    var numCandidates = 0;
    var numPositions = 0;
    var loader = $("#loader");
    var content = $("#content");

    loader.show();
    content.hide();

    // Load account data
    web3.eth.getAccounts(function(err, accounts) {
      App.account = accounts[0];
      $("#accountAddress").html("Your Account: " + App.account);
    });

    // Load contract data
    App.contracts.Election.deployed().then(function(instance) {
      electionInstance = instance;
      return electionInstance.candidatesCount();
    }).then(function(candidatesCount) {
      numCandidates = candidatesCount;
      return electionInstance.positionsCount();
    }).then(function(positionsCount) {
      numPositions = positionsCount;
      var tables = $("#tables");
      tables.empty();
      for (var i = 1; i <= numPositions; i++) {
        electionInstance.positions(i).then(function(position) {
          var id = position[0];
          var name = position[1];
          var tableData = '<h2>' + name + '</h2>' + 
          '<table class="table table-striped">' +
            '<thead>' + 
              '<tr>' +
                '<th scope="col" width="10%">#</th>' +
                '<th scope="col" width="20%" class="radioSelection">Selection</th>' +
                '<th scope="col" width="60%">Name</th>' +
                '<th scope="col" width="10%">Votes</th>' +
              '</tr>' +
            '</thead>' +
            '<tbody id="table-' + id + '"></tbody>' +
          '</table>';
          tables.append(tableData);
        });
      }

      for (var i = 1; i <= numCandidates; i++) {
        electionInstance.candidates(i).then(function(candidate) {
          var id = candidate[0];
          var position = candidate[1];
          var name = candidate[2];
          var voteCount = candidate[3];
          var rowData = '<tr>' +
          '<th scope="row">' + id + '</th>' +
          '<td><input type="radio" name="position-' + position + '" value="' + id + '"></td>' +
          '<td>' + name + '</td>' +
          '<td>' + voteCount + '</td>' +
          '</tr>';
          $('#table-' + position).append(rowData);
        });
      }

      loader.hide();
      content.show();

      return electionInstance.voters(App.account);
    }).then(function(hasVoted) {
      // Do not allow a user to vote
      if(hasVoted) {
        $('form button').hide();
        $('input[type=radio').hide();
        $('.radioSelection').html('');
      }
      loader.hide();
      content.show();
    }).catch(function(error) {
      console.warn(error);
    });
  },

  castVote: function() {
    var selectedCandidates = [];
    $("form :checked").each(function () {
        selectedCandidates.push(parseInt($(this).val()));
    });
    App.contracts.Election.deployed().then(function(instance) {
      return instance.vote(selectedCandidates, { from: App.account });
    }).then(function(result) {
      // Wait for votes to update
      $("#content").hide();
      $("#loader").show();
    }).catch(function(err) {
      console.error(err);
    });
  }
};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
