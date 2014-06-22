/*!
* This file contains code that is specific to testing AudioParam objects.
*/

/**
* Function that does the actual testing (using an asynchronous test).
* @param {!string} testName - Name of the test case.
* @param {!Array.<number>} inputChannelData - Array-of-arrays containing values for the input channel.
* @param {!Array.<number>} expectedChannelData - Array-of-arrays containing expected results for each of the corresponding inputs.
* @param {!Object} initialNodeValues - Object containing initial values for the node.
* @param {?Function} extraArrangeFn - Optional function that can tweak the Gain properties.
*/
function executeTest(testName, arrangeFn, assertFn) {
	WebAudioTestHarness.runTest(testName, doArrange, doAssert);

	function doArrange(ac) {
		//The gain node's "gain" property provides the AudioParam to test.
		var node=ac.createGain();
		var audioParam=node.gain;
		arrangeFn.call(this, ac, audioParam);
		node.connect(ac.destination);

		//Feed a stream of "1" values to the gain node.
		var src=this.createBufferSource([[1, 1]]);
		src.loop=true;
		src.connect(node);
		src.start(0);

		return audioParam;
	}

	//Test that each of the channels match the exepected data.
	function doAssert(output) {
		var actualData=output.getChannelData(0);
		assertFn.call(this, actualData);
	}
}
