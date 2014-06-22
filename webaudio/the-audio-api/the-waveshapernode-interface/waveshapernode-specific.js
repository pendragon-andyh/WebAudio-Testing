/*!
* This file contains code that is specific to testing WaveShaperNodes.
*/

/**
* Function that does the actual testing (using an asynchronous test).
* @param {!string} testName - Name of the test case.
* @param {!Array.<number>} inputChannelData - Array-of-arrays containing values for the input channel.
* @param {!Array.<number>} expectedChannelData - Array-of-arrays containing expected results for each of the corresponding inputs.
* @param {!Object} initialNodeValues - Object containing initial values for the node.
* @param {?Function} extraArrangeFn - Optional function that can tweak the WaveShaper properties.
*/
function executeTest(testName, inputChannelData, expectedChannelData, initialNodeValues, extraArrangeFn) {
	var settings={
		numberOfChannelsToTest: expectedChannelData.length,
		numberOfSamplesToTest: expectedChannelData[0].length,
		extraArrangeFn: extraArrangeFn,
		tolerance: 0.01
	};

	//Configure the curve (and a description to make failures more readable).
	var curve=null;
	var curveText="null";
	if(initialNodeValues.curve!=null) {
		if(initialNodeValues.curve.length<20) {
			curveText=[].join.call(initialNodeValues.curve, ",");
		} else {
			curveText="TooBigToDisplay ("+(initialNodeValues.curve.length)+" elements)";
		}
	}

	//Run the test.
	WebAudioTestHarness.runTest(testName, doArrange, doAssert, initialNodeValues, settings);

	//Feed the input-data into a waveshaper.
	function doArrange(ac) {
		var node=ac.createWaveShaper();
		node.connect(ac.destination);

		var src=this.createBufferSource(inputChannelData);
		src.connect(node);
		src.start(0);

		return node;
	}

	//Test that each of the channels match the exepected data.
	function doAssert(output) {
		for(var channelNo=0;channelNo<settings.numberOfChannelsToTest;channelNo++) {
			var actualData=output.getChannelData(channelNo);

			for(var sampleNo=0;sampleNo<settings.numberOfSamplesToTest;sampleNo++) {
				var inputValue=inputChannelData[channelNo][sampleNo];
				var expectedValue=expectedChannelData[channelNo][sampleNo];
				var actualValue=actualData[sampleNo];

				var comment="Channel="+channelNo+", Input="+inputValue+", Curve=["+curveText+"] >>> ";
				assert_approx_equals(actualValue, expectedValue, settings.tolerance, comment);
			}
		}
	}
}
