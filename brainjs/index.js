const brain = require('brain.js')
const data = require('./data.json')

const network = new brain.NeuralNetwork();

/**
 * 
 * Training data
 */
network.train([
    { input: [1, 2], output: [1] }, 
    { input: [1, 3], output: [1] }, 
    { input: [2, 3], output: [0] }, 
    { input: [2, 4], output: [1] }, 
    { input: [1, 2], output: [0] }, 
    { input: [1, 3], output: [0] }, 
    { input: [3, 4], output: [0] } ,
    { input: [1, 4], output: [0] }   
]);

const result = network.run([1, 4]);
console.log(`Probability: ${result}`)
