var Pwm_Driver = require('./PWM_DRIVER.js'),
	Async = require('async'),
 	Pwm_Controller = new Pwm_Driver(0x40, '/dev/i2c-1'),
 	_ = require('underscore');

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
	this.name = options.name;
	this.channel = options.channel;
	this.position = options.position;
	this.min = options.min;
	this.max = options.max;
	this.center = options.center;
	Pwm_Controller.setPWMFreq(60);
}

Servo.prototype.move_to_position = function(desired_position) {
	if (desired_position > this.max) {
		desired_position = this.max;
	}
	else if (desired_position < this.min) {
		desired_position = this.min;
	}
	console.log("SERVO ", this.name, " Recieved request to move to ", desired_position);
	Pwm_Controller.setPWM(this.channel, 0, desired_position);
	this.position = desired_position;
};

Servo.prototype.center_self = function() {
	console.log("Centering ", this.name);
	Pwm_Controller.setPWM(this.channel, 0, this.center);
	this.position = this.center;
};

Servo.prototype.set_max = function() {
	console.log("Setting to max ", this.name);
	this.position = this.max;
	Pwm_Controller.setPWM(this.channel, 0, this.position);
};

Servo.prototype.set_min = function() {
	console.log("Setting to Min ", this.name);
	this.position = this.min;
	Pwm_Controller.setPWM(this.channel, 0, this.position);
};


exports.Servo = Servo;