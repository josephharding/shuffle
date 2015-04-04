
var _ = require('underscore');

/**
 * Shuffle an array
 * @param array
 * @returns {Array} An efficiently and fairly shuffled array.
 */
var shuffle = function(array) {
    var result = [];

    var nextFreeIndex = 0;
    for(var i = 0; i < array.length; i++) {
      var newIndex = Math.floor(Math.random() * array.length);

      // if our newIndex already has a value...
      if(typeof result[newIndex] != 'undefined') {
        
        // check to see if our next free index is actually free
        while(typeof result[nextFreeIndex] != 'undefined' && nextFreeIndex < array.length) {
          nextFreeIndex++;
        }   
       
        // put the value already at newIndex into the next free index
        var temp = result[newIndex];
        result[nextFreeIndex] = temp;
      }

      // set the current value to the new index
      result[newIndex] = array[i];
    }

    return result;
};

/**
 * Get the index distance between two elements in an array
 * @param a             item one
 * @param b             item two
 * @param arr           the array containing the two items
 * @returns {int}       the distance between the two items, false if an item does not exist in arr
 */
var getDistance = function(a, b, arr) {
  var result = false;
  var start = -1;
  var end = -1;
  for(var i = 0; i < arr.length; i++) {
    if(arr[i] === a) {
      start = i;
    }
    if(arr[i] === b) {
      end = i;
    }
    if(start > -1 && end > -1) {
      break;
    }
  }
  if(start == -1 || end == -1) {
    console.error('an item was not found in the array');
  } else {
    result = end - start;
  }
  return result;
};

/**
 * Run through a single shuffling of input
 * @param input         an array of items to be shuffled
 * @param shuffleFunc   the function to use for shuffling
 * @returns {float}     the scoring of the fairness of the shuffle
 */
var scoreSingleShuffle = function(input, shuffleFunc) {
    //console.log(input);
    var output = shuffleFunc(input);
    //console.log(output);

    if(input.length == output.length) {

      var score = 0;

      // for each element, check index offset change from every other element
      for(var j = 0; j < input.length; j++) {
        for(var k = 0; k < input.length; k++) {
          if(j != k) {
              //console.log('in input, distance from ' + input[j] + ' to ' + input[k] + ' was ' + (k-j));
              
              var offset = getDistance(input[j], input[k], output);

              //console.log('in output, distance from ' + input[j] + ' to ' + input[k] + ' was ' + offset);
              if((k-j) != offset) {
                score++;
              }
          }
        }
      }
      
      result = score / ((input.length * input.length) - input.length );
    } else {
      console.error('shuffle function returned different sized result');
      result = false;
    }

    return result;
};

/**
 * Check if a given shuffle function is a fair.
 * @param shuffleFunction {Function} A function that takes an array as an argument. It shuffles arrays.
 * @returns {boolean} Whether or not this shuffle function fairly shuffles arrays.
 */
var isShuffleFair = function (shuffleFunction) {  
    var result = false;
    var numRuns = 1000;
     
    var input = _.range(52);
    // modify the input slightly to help overcome "tricky" shufflers
    var temp = input[0];
    input[0] = input[input.length - 1]; 
    input[input.length - 1] = temp;

    var score = 0;
    for(var i = 0; i < numRuns; i++) {

      // modify the input slightly each time in trivial way to help overcome "tricky" shufflers
      var first = input.shift();
      input[input.length] = first;

      var currentScore = scoreSingleShuffle(input, shuffleFunction);
      if(currentScore) {
        score += currentScore;
      }
    }
    
    score /= numRuns;

    if(score > 0.9) {
      result = true;
    }
     
    console.log('confidence in fairness: ' + score);
    return result;
};

anotherClearlyUnfairShuffle = function(array) {
        return ([].concat(array)).sort(function(a, b) {return a-b;});
};

clearlyUnfairShuffle = function (array) {
        return array;
};

var lastArray;
var lastFairShuffle;
trickyShuffle = function (array) {
    var isInTestingEnvironment = false;
    // Am I being given the same array over and over again?
    if (_.isEqual(lastArray, array)) {
        isInTestingEnvironment = true;
    }

    // Am I being given an array that is sorted somehow, like the elements 0 through 51?
    if (_.isEqual(array, ([].concat(array)).sort(function (a, b) {return a-b;}))) {
        isInTestingEnvironment = true;
    }

    // Am I being fed my own last fair shuffle?
    if (_.isEqual(lastFairShuffle, array)) {
        isInTestingEnvironment = true;
    }

    // Clone the array into the last array
    lastArray = [].concat(array);

    // Am I in a testing environment?
    if (isInTestingEnvironment) {
        // Do a fair shuffle, to trick you into thinking I'm a fair shuffle when I really am not
        lastFairShuffle = _.shuffle(array);
        // This weird syntax clones an array
        return [].concat(lastFairShuffle);
    } else {
        // Do a clearly unfair shuffle
        return ([].concat(array)).sort();
    }
};

console.log('\n');

var fair = isShuffleFair(clearlyUnfairShuffle);
console.log('clearly unfair shuffle result: ' + fair + '\n');

fair = isShuffleFair(anotherClearlyUnfairShuffle);
console.log('another clearly unfair shuffle result: ' + fair + '\n');

fair = isShuffleFair(trickyShuffle);
console.log('tricky shuffle result: ' + fair + '\n');

fair = isShuffleFair(_.shuffle);
console.log('underscore shuffle result: ' + fair + '\n');

fair = isShuffleFair(shuffle);
console.log('my shuffle result: ' + fair + '\n');


