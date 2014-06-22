/*!
* This file contains framework code that is designed for testing audio functionality.
*/

//Create a JavaScript namespace that contains the framework.
var WebAudioTestHarness=new (function() {
	var This=this;

	this.globalDefaults={
		sampleRate: 48000,
		tolerance: 0.001,
		timeout: 1000,
		numberOfSamplesToTest: 10000,
		numberOfChannelsToTest: 1
	};

	/**
	* Function that does the actual testing (using an asynchronous test).
	* @param (string) testName
	* @param (function) arrangeFn - Function that creates the audio node-graph to be tested.
	* @param (function) assertFn - Function that tests the results of the completed node-graph.
	* @param {!Object} initialNodeValues - Object containing initial values for the node.
	* @param (object?) settings - Optional settings object (see "globalDefaults" for possible options).
	*/
	this.runTest=function(testName, arrangeFn, assertFn, initialNodeValues, settings) {
		var testContext=new this.TestContext(onTestArranged, settings);
		var stTest=async_test(testName); //, testContext.settings); ##todo

		//This runs when the test has been completely arranged (including any dependencies).
		function onTestArranged() {
			testContext.context.startRendering();
		}

		//Create offline audio context.
		var ac=new OfflineAudioContext(
			testContext.settings.numberOfChannelsToTest,
			testContext.settings.numberOfSamplesToTest,
			testContext.settings.sampleRate);
		testContext.context=ac;

		//Schedule assertions to take place when rendering has finished.
		ac.oncomplete=stTest.step_func(function(ev) {
			if(assertFn) { assertFn.call(testContext, ev.renderedBuffer, testContext.context); }
			stTest.done();
		});

		//Arrange the nodes to test.
		stTest.step(function() {
			testContext.beginWait("Arranging test");

			//Initial setup for the test.
			var node=arrangeFn.call(testContext, ac);

			//Initialize values of the node-under-test.
			for(var m in initialNodeValues) {
				if(initialNodeValues.hasOwnProperty(m)) {
					if(node[m]===undefined) {
						throw "Expected node to contain '"+m+"'";
					} else if(node[m]&&node[m].setValueAtTime) {
						node[m].value=initialNodeValues[m];
					} else {
						node[m]=initialNodeValues[m];
					}
				}
			}

			testContext.endWait("Arranging test");
		});
	};

	/**
	* @constructor
	* @param (function) onTestArranged - Callback function to be called when all async dependencies are resolved.
	* @param (object?) settings - Optional settings object (see "globalDefaults" for possible options).
	*/
	this.TestContext=function(onTestArranged, settings) {
		var asyncDependencies=[];

		this.context=null;

		//Coalesce settings.
		var m;
		this.settings={};
		for(m in This.globalDefaults) {
			this.settings[m]=This.globalDefaults[m];
		}
		for(m in settings) {
			this.settings[m]=settings[m];
		}

		/**
		* Check if the test is waiting for an async action to complete.
		*/
		this.isWaiting=function() {
			for(var i=0;i<asyncDependencies.length;i++) {
				if(asyncDependencies[i]!=="") { return true; }
			}
			return false;
		}

		/**
		* Register an async-dependency that needs to be completed before we can render the results.
		* @param (string) dependencyName
		*/
		this.beginWait=function(dependencyName) {
			asyncDependencies.push(dependencyName);
		};

		/**
		* Mark an async-dependency as completed.
		* @param (string) dependencyName
		*/
		this.endWait=function(dependencyName) {
			//Unregister the "wait".
			var exists=false;
			for(var i=0;i<asyncDependencies.length&&!exists;i++) {
				if(asyncDependencies[i]==dependencyName) {
					asyncDependencies[i]="";
					exists=true;
				}
			}

			//Throw error if we were not waiting for this.
			if(!exists) { throw "TestRunner was not waiting for '"+dependencyName+"'"; }

			//If we are not waiting for anything else then callback to render the results.
			if(!this.isWaiting()) { onTestArranged.call(this); }
		};
	};

	var contextPrototype=this.TestContext.prototype;

	contextPrototype.createBufferSource=function(channelArr) {
		var src=this.context.createBufferSource();

		if(channelArr&&channelArr.length) {
			var buf=this.context.createBuffer(channelArr.length, channelArr[0].length, this.context.sampleRate);
			for(var i=0;i<channelArr.length;i++) {
				var channelData=buf.getChannelData(i);
				channelData["set"](channelArr[i]);
			}

			src.buffer=buf;
		}

		return src;
	};

	contextPrototype.nextUpward=function(arr, start, end) {
		for(var i=start;i<end;i++) {
			if(arr[i]<arr[i+1]) { return i; }
		}
		return null;
	};

	contextPrototype.nextDownward=function(arr, start, end) {
		for(var i=start;i<end;i++) {
			if(arr[i]>arr[i+1]) { return i; }
		}
		return null;
	};

	contextPrototype.nextMax=function(arr, start, end) {
		var actualStart=this.nextUpward(arr, start, end);
		if(actualStart!==null) {
			for(var i=actualStart;i<end;i++) {
				if(arr[i]>=arr[i+1]) { return i; }
			}
		}
		return null;
	};

	contextPrototype.nextMin=function(arr, start, end) {
		var actualStart=this.nextDownward(arr, start, end);
		if(actualStart!==null) {
			for(var i=actualStart;i<end;i++) {
				if(arr[i]<=arr[i+1]) { return i; }
			}
		}
		return null;
	};

	contextPrototype.nextPositiveCrossingPoint=function(arr, start, end) {
		for(var i=start;i<end;i++) {
			if(arr[i]<=0&&arr[i+1]>0) { return i; }
		}
		return null;
	};

	contextPrototype.nextNegativeCrossingPoint=function(arr, start, end) {
		for(var i=start;i<end;i++) {
			if(arr[i]>=0&&arr[i+1]<0) { return i; }
		}
		return null;
	};

	contextPrototype.convertSecondsToSamples=function(seconds) {
		return this.settings.sampleRate/seconds;
	};

	contextPrototype.convertSamplesToSeconds=function(samples) {
		return samples/this.settings.sampleRate;
	};
})();
