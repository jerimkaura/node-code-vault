/**
 * bring in the brain.js dependency
 */
const brain = require('brain.js')

/**
 * Import the data file
 */
const data = require('./data.json')

/**
 * Create the network
 */
const network = new brain.recurrent.LSTM();

/**
 * Create an array of data from the data file
 */
const trainingData = data.map(item => ({
    input: item.text,
    output: item.category
}));

/**
 * Training the model and setting the number 
 * of iteration to make during the training
 */
network.train(trainingData, {
    iterations: 200
})


/**
 * Supply the input to classify
 */
const output = network.run('the api did not work maybe the authentication integration is not well done')

/**
 * Printing the ouput on the console
 */
console.log(`Category: ${output}`)