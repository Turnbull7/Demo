App = {
  web3Provider: null,
  contracts: {},
  account: '0x0',
  hasVoted: false,

  init: function() {
    return App.initWeb3();
  },

  initWeb3: async function() {
    if (ethereum) {
      web3 = new Web3(ethereum);
      App.web3Provider = web3.currentProvider;
      try {
        let accounts = await ethereum.enable();
        App.account = accounts[0];
      } catch (error) {
        console.warn(error);
        console.warn("User likely rejected provider access");
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
      App.contracts.Election = TruffleContract(election);
      App.contracts.Election.setProvider(App.web3Provider);

      App.listenForEvents();
      App.listenForAccountChange();

      return App.render();
    });
  },

  listenForAccountChange: function() {
    if (ethereum) {
      ethereum.on('accountsChanged', function (accounts) {
        console.log('Account changed');
        App.account = accounts[0];
        App.render();
      })
    }
  },

  listenForEvents: function() {
    App.contracts.Election.deployed().then(function(instance) {
      instance.votedEvent({}, {
        fromBlock: 'latest',
        toBlock: 'latest'
      }).watch(function(error, event) {
        console.log("event triggered", event);
        App.render();
      });
    });
  },

  render: function() {
    var electionInstance;
    var electionAddress;
    var numCandidates = 0;
    var numPositions = 0;
    var loader = $("#loader");
    var content = $("#content");

    loader.show();
    content.hide();

    $("#accountAddress").html("Your Account: " + App.account);

    App.contracts.Election.deployed().then(function(instance) {
      electionInstance = instance;
      return electionInstance.address;
    }).then(function(address) { 
      electionAddress = address;
      return electionInstance.candidatesCount();
    }).then(function(candidatesCount) {
      numCandidates = candidatesCount;
      return electionInstance.positionsCount();
    }).then(function(positionsCount) {
      numPositions = positionsCount;
      var tables = $("#tables");
      
      const positionsPromises = [];
      for (var i = 1; i <= numPositions; i++) {
        positionsPromises.push(electionInstance.positions(i));
      }

      const candidatesPromises = [];
      for (var i = 1; i <= numCandidates; i++) {
        candidatesPromises.push(electionInstance.candidates(i));
      }

      const votesPromise = electionInstance.getVotersLength();

      Promise.all(positionsPromises).then(positions => {
        var tables = $("#tables");
        tables.empty();
        positions.forEach(position => {
          var id = position[0];
          var name = position[1];
          var tableData = '<h2>' + name + '</h2>' + 
          '<table class="table">' +
            '<thead>' + 
              '<tr>' +
                '<th scope="col" width="10%">#</th>' +
                '<th class="selections-col" scope="col" width="20%" style="display:none">Selection</th>' +
                '<th class="voting-col" scope="col" width="20%">Selection</th>' +
                '<th scope="col" width="60%">Name</th>' +
                '<th class="votes-col" scope="col" width="10%" style="display:none">Votes</th>' +
              '</tr>' +
            '</thead>' +
            '<tbody id="table-' + id + '"></tbody>' +
          '</table>';
          tables.append(tableData);
        });
      }).then(function() {
        Promise.all(candidatesPromises).then(candidates => {
          candidates.forEach(candidate => {
            var id = candidate[0];
            var position = candidate[1];
            var name = candidate[2];
            var voteCount = candidate[3];
            var rowData = '<tr>' +
            '<th scope="row">' + id + '</th>' +
            '<td class="selections-col" id="select-' + id + '" style="display:none">&nbsp;</td>' +
            '<td class="voting-col"><input type="radio" name="position-' + position + '" value="' + id + '"></td>' +
            '<td>' + name + '</td>' +
            '<td class="votes-col" style="display:none">' + voteCount + '&nbsp;</td>' +
            '</tr>';
            $('#table-' + position).append(rowData);
          });
        })
      }).then(function() {
        votesPromise.then(numVotes => {
          if (numVotes > 0) {
            const selectionsPromises = [];
            for (var i = 0; i < numVotes; i++) {
              selectionsPromises.push(electionInstance.getVotersVote(i));
            }
    
            Promise.all(selectionsPromises).then(candidateIds => {
              candidateIds.forEach(candidateId => {
                $('#select-' + candidateId).html('✅');
              });
              $('.voting-col').hide();
              $('.selections-col').show();
              $('.votes-col').show();
              loader.hide();
              content.show();
            });
            
          } else {
            //$('.voting-col').show();
            $('form button').show();
            loader.hide();
            content.show();
          }
        });
      })
      //return electionInstance.getVotersLength();
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
