/* algorithmic logic is a variation of Mostasfa Safir's Tic-Tac-Toe Minimax algorithm
 * from https://github.com/Mostafa-Samir/Tic-Tac-Toe-AI
 */

$(document).ready(function() {
  $(".cell").addClass("played");
  $(".cell").click(function() {
    var $this = $(this);
    if (globals.game.status === "running" && globals.game.currentState.turn === "user" && !$this.hasClass('played')) {
      var indx = $this.index();
      var userSymbol = globals.game.currentState.userSymbol;
      var next = new State(globals.game.currentState);
      
      next.board[indx] = userSymbol;
      ui.insertAt(indx, userSymbol);
      next.advanceTurn();
      globals.game.advanceTo(next);
    }
  });
  $(".cell").hover(function() {
    if (globals.game && !$(this).hasClass("played")) {
      var game = globals.game.currentState;
      var symbol = (game.turn === "user") ? game.userSymbol : game.aiSymbol;
      $(this).html(symbol);
    }
  }, function () {
    if (globals.game && !$(this).hasClass("played")) {
       $(this).html("");
    }
  });

  $("#newGame").click(function() {
    console.log(globals.game);  
    ui.resetGrid();
    var starter = $("input[type='radio'][name='turn']:checked").val();
    var userSymbol = $("input[type='radio'][name='icon']:checked").val();
    var difficulty = $("input[type='radio'][name='difficulty']:checked").val();

    var aiPlayer = new AI(difficulty);
    globals.game = new Game(aiPlayer);

    aiPlayer.plays(globals.game);

    globals.game.start(userSymbol, starter);
  });

  $("input[type='radio']").click(function() {
    if (globals.game && globals.game.status === "running") {
      $("#message").html("New settings will apply to the new game.")
    }
  });
});

var State = function(old) {
  this.turn = "";
  this.userSymbol = "";
  this.aiSymbol = "";
  this.oMovesCount = 0;
  this.result = "still running";
  this.board = [];
  this.winners = [];
  
  if (old) {
    var len = old.board.length;
    this.board = new Array(len);
    for (var itr = 0; itr < len; itr++) {
      this.board[itr] = old.board[itr];
    }
    
    this.oMovesCount = old.oMovesCount;
    this.result = old.result;
    this.turn = old.turn;
    this.userSymbol = old.userSymbol;
    this.aiSymbol = old.aiSymbol;
  }
  
  this.advanceTurn = function() {
    this.turn = (this.turn === "user") ? "ai" : "user";
  }
  
  this.emptyCells = function() {
    var indxs = [];
    for (var itr = 0; itr < 9; itr++) {
      if (this.board[itr] === "E") {
        indxs.push(itr);
      }
    }
    return indxs;
  };
  
    this.isTerminal = function() {
        var B = this.board;

        //check rows
        for(var i = 0; i <= 6; i = i + 3) {
            if(B[i] !== "E" && B[i] === B[i + 1] && B[i + 1] === B[i + 2]) {
                this.result = B[i] + "-won"; //update the state result
        this.winners.push(i, i + 1, i + 2);
                return true;
            }
        }

        //check columns
        for(var i = 0; i <= 2 ; i++) {
            if(B[i] !== "E" && B[i] === B[i + 3] && B[i + 3] === B[i + 6]) {
                this.result = B[i] + "-won"; //update the state result
        this.winners.push(i, i + 3, i + 6);
                return true;
            }
        }

        //check diagonals
        for(var i = 0, j = 4; i <= 2 ; i = i + 2, j = j - 2) {
            if(B[i] !== "E" && B[i] === B[i + j] && B[i + j] === B[i + 2*j]) {
                this.result = B[i] + "-won"; //update the state result
        this.winners.push(i, i + j, i + (2 * j));
                return true;
            }
        }

        var available = this.emptyCells();
        if(available.length == 0) {
            //the game is draw
            this.result = "draw"; //update the state result
            return true;
        }
        else {
            return false;
        }
    };
};

var Game = function(autoPlayer) {
  this.ai = autoPlayer;
  this.status = "beginning";
  this.currentState = new State();
  this.currentState.board = ["E", "E", "E",
                           "E", "E", "E",
                           "E", "E", "E"];

  this.advanceTo = function(_state) { 
    this.currentState = _state;
    if (_state.isTerminal()) {
      this.status = "ended";
      ui.endGame(_state);
    } else {
      if (this.currentState.turn === "ai") {
        this.ai.notify(_state.aiSymbol);
      } 
    }
  }
  
  this.start = function(userSymbol, starter) {
    if (this.status = "beginning") {
      this.currentState.userSymbol = userSymbol;
      this.currentState.aiSymbol = (userSymbol === "X") ? "O":"X";
      this.currentState.turn = (starter === "user") ? "user" : "ai"; 
      this.advanceTo(this.currentState);
      this.status = "running";      
    }
  } 
};

Game.score = function(_state) {
  if (_state.result === "draw") {
    return 0;
  } else {
    var score = -10 + _state.oMovesCount;
    if (_state.result[0] === _state.userSymbol) {
      score = -score;
    }
    return score;
  }
}

var AIAction = function(pos) {
  this.movePosition = pos;
  this.minimaxVal = 0;
  
  this.applyTo = function(state) {
    var next = new State(state);
    
    next.board[this.movePosition] = (state.turn === "user") ? state.userSymbol : state.aiSymbol;
    if (state.turn === "ai") {
      next.oMovesCount++;
    }
    next.advanceTurn();
    
    return next;
  }
};

AIAction.ASCENDING = function (firstAction, secondAction) {
  if (firstAction.minimaxVal < secondAction.minimaxVal) {
    return -1;
  } else if (firstAction.minimaxVal > secondAction.minimaxVal) {
    return 1;
  } else {
    return 0;
  }
};

AIAction.DESCENDING = function (firstAction, secondAction) {
  if (firstAction.minimaxVal < secondAction.minimaxVal) {
    return 1;
  } else if (firstAction.minimaxVal > secondAction.minimaxVal) {
    return -1;
  } else {
    return 0;
  }
};

var AI = function(level) {
  var levelOfIntelligence = level;
  var game = {};
  
  function minimaxValue(state) {
    if (state.isTerminal()) {
      return Game.score(state);
    } else {
      var stateScore;
      if (state.turn === "user") {
        stateScore = -1000;
      } else {
        stateScore = 1000;
      }
      var availablePositions = state.emptyCells();
      var availableNextStates = availablePositions.map(function(pos) {
        var action = new AIAction(pos);
        var nextState = action.applyTo(state);
        return nextState;
      });
      
      availableNextStates.forEach(function(nextState) {
        var nextScore = minimaxValue(nextState);
        if (state.turn === "user") {
          if (nextScore > stateScore) {
            stateScore = nextScore;
          }
        } else {
          if (nextScore < stateScore) {
            stateScore = nextScore;
          }
        }
      });
      
      return stateScore;
    }
  }
  
  function takeABlindMove(turn) {
    var available = game.currentState.emptyCells();
    var randomCell = available[Math.floor(Math.random() * available.length)];
    var action = new AIAction(randomCell);
    
    var next = action.applyTo(game.currentState);
    
    ui.insertAt(randomCell, turn);
    
    game.advanceTo(next);
  };
  
  function takeANoviceMove(turn) {
    var available = game.currentState.emptyCells();
    if (available.length === 9) {
      available = [0, 4];
    }
    
    var availableActions = available.map(function(pos) {
      var action = new AIAction(pos);
      var nextState = action.applyTo(game.currentState);
      
      action.minimaxVal = minimaxValue(nextState);
      return action;
    });
    
    if (turn === game.userSymbol) {
      availableActions.sort(AIAction.DESCENDING);
    } else {
      availableActions.sort(AIAction.ASCENDING);
    }
    
    var chosenAction;
    if (Math.random()*100 <= 70 || availableActions.length === 0) {
      chosenAction = availableActions[0];
    } else {
      chosenAction = availableActions[1];
    }
    var next = chosenAction.applyTo(game.currentState);
    
    ui.insertAt(chosenAction.movePosition, turn);
    
    game.advanceTo(next);
  };
  
  function takeAMasterMove(turn) {
    var available = game.currentState.emptyCells();
    if (available.length === 9) {
      available = [0];
    }
    
    var availableActions = available.map(function(pos) {
      var action = new AIAction(pos);
      var nextState = action.applyTo(game.currentState);
      
      action.minimaxVal = minimaxValue(nextState);
      return action;
    });
    
    if (turn === game.userSymbol) {
      availableActions.sort(AIAction.DESCENDING);
    } else {
      availableActions.sort(AIAction.ASCENDING);
    }
    
    var chosenAction = availableActions[0];
    var next = chosenAction.applyTo(game.currentState);
    
    ui.insertAt(chosenAction.movePosition, turn);
    
    game.advanceTo(next);
  };
  
  this.plays = function (_game) {
    game = _game;
  };
  
  this.notify = function (turn) {
    switch(levelOfIntelligence) {
      case "easy": 
        takeABlindMove(turn); 
        break;
      case "medium": 
        takeANoviceMove(turn);
        break;
      case "hard": 
        takeAMasterMove(turn); 
        break;
    }
  };
}

var globals = {
  userScore: 0,
  aiScore: 0
};

var ui = {};

ui.resetGrid = function () {
  $(".cell").html("").show().removeClass("winners played");
  $("#message").html("");
  $("#newGame").html("New Game");
};

ui.insertAt = function (index, symbol) {
  var targetCell =  $(".cell:nth-child("+(index+1)+")");
  if (!targetCell.hasClass('played')) {
    targetCell.html(symbol);
    targetCell.addClass('played');
  }
};

ui.endGame = function (state) {
  var message;
  if (state.result[0] === state.userSymbol) {
    message = "User Wins!"
    globals.userScore++;
  } else if (state.result[0] === state.aiSymbol) {
    message = "AI Wins!"
    globals.aiScore++;
  } else {
    message = "Draw!"
  }
  $("#message").html(message);
  $(".score").html(globals.userScore + " - " + globals.aiScore);
  state.winners.map(function(indx) {
    $(".cell:nth-child("+(indx+1)+")").addClass("winners");
  });
  $(".cell").addClass("played");
};


