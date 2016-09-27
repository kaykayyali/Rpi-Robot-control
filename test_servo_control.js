var Pwm_Driver = require('./lib/PWM_DRIVER.js'),
	Async = require('async'),
 	Pwm_Controller = new Pwm_Driver(0x40, '/dev/i2c-1'),
 	_ = require('underscore');

 	//Example
    // {
    //   id: 0,
    //   channel: 0,
    //   position: 0,
    //   name: "tilt",
    //   min: 100,
    //   max: 800,
    //   center: 300
    // }


var Servo = function(options) {
	if (_.isUndefined(options.name)){
		return console.log("Failed to initialize Servo. Missing Name.")
	}
	if (_.isUndefined(options.position)){
		return console.log("Failed to initialize Servo. Missing Position.")
	}
	if (_.isUndefined(options.channel)){
		console.log(options)
		return console.log("Failed to initialize Servo. Missing Channel.")
	}
	if (_.isUndefined(options.min)){
		return console.log("Failed to initialize Servo. Missing Min.")
	}
	if (_.isUndefined(options.max)){
		return console.log("Failed to initialize Servo. Missing Max.")
	}
	if (_.isUndefined(options.center)){
		return console.log("Failed to initialize Servo. Missing Center.")
	}
	this.name = options.name
	this.channel = options.channel
	this.position = options.position
	this.min = options.min
	this.max = options.max
	this.center = options.center
}

Servo.prototype.move_to_position = function(desired_position) {
	if (desired_position > this.max) {
		console.log("PAssed Mac")
		desired_position = this.max;
	}
	else if (desired_position < this.min) {
		console.log("PAssed Min")
		desired_position = this.min;
	}
	else {
		Pwm_Controller.setPWM(this.channel, 0, desired_position);
	}
};

// Testing
Servo.prototype.test_run = function() {
	var self = this;
	var begin_point = this.min,
	end_point = this.max,
	start_point = this.center;
	Async.series([
		function(callback){
			setTimeout(function() {
				console.log("Running");
				console.log(self.center);
				Pwm_Controller.setPWM(self.channel, 0, self.center);
				callback();
			},1000);
		},
		function(callback){
			setTimeout(function() {
				Pwm_Controller.setPWM(self.channel, 0, self.min);
				callback();
			},3000);
		},
		function(callback){
			setTimeout(function() {
				Pwm_Controller.setPWM(self.channel, 0, self.max);
				callback();
			},3000);
		}
		], 
	function(err){

	});
};

// GOOD FOR PAN CAMERA
// var options = { 
	// position: 0,
	// channel: 0,
	// name: "pan",
	// min: 150,
	// max: 700,
	// center: 400
// };

// GOOD FOR TILT
var options = { 
	position: 0,
	channel: 1,
	name: "tilt",
	min: 150,
	max: 400,
	center: 300
};
Pwm_Controller.setPWMFreq(60);
var test_servo = new Servo(options);

test_servo.test_run();

// exports.Servo = Servo;