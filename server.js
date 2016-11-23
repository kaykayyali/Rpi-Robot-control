var Gpio = require('onoff').Gpio;
var express = require('express');
var app = express();
var Async = require('async');
var rpio = require('rpio'),
  _ = require('underscore'),
  laser_module_one = new Gpio(13, 'out'),
  Pwm_Driver = require('./lib/PWM_DRIVER.js'),
  Pwm_Controller = new Pwm_Driver(0x40, '/dev/i2c-1'),
  Motor_Hat_Driver = require('./lib/motor.js'),
  Motor_Hat = new Motor_Hat_Driver(),
  Servo = require('./lib/servo.js').Servo;

var Manager = function() {
	this.lasers = [laser_module_one];
  this.pan_servo = new Servo({
        position: 0,
        channel: 0,
        name: "pan",
        min: 150,
        max: 700,
        center: 375
      });
  this.tilt_servo =  new Servo({
      position: 0,
      channel: 1,
      name: "tilt",
      min: 150,
      max: 400,
      center: 300
      });
  this.servos = [this.pan_servo, this.tilt_servo];
	this.counter = 0;
  this.motor_controller = Motor_Hat;
  this.default_PWM_FREQ = 60;
  this.default_MOTOR_SPEED = 180;
}

Manager.prototype.set_defaults = function() {
  var self = this;
  Pwm_Controller.setPWMFreq(this.default_PWM_FREQ);
  Robot.motor_controller.motors.forEach(function(motor){
    motor.setSpeed(self.default_MOTOR_SPEED);
  });
  this.reset_servos();
};

Manager.prototype.set_new_speeds = function(options) {
  var self = this;
  var new_pwm_freq = options.pwm_freq;
  var new_motor_speed = options.motor_speed;
  // Change pwm freq, Allows for more precise movements or more abrupt movements
  if (new_pwm_freq) {
    Pwm_Controller.setPWMFreq(new_pwm_freq);
  }
  // Change motor speed, Allows for more precise movements or more abrupt movements (used for turning)
  if (new_motor_speed) {
    Robot.motor_controller.motors.forEach(function(motor){
      motor.setSpeed(new_motor_speed);
    });
  }
};

Manager.prototype.reset_servos = function() {
  var self = this;
  Object.keys(this.servos).forEach(function(key) {
    self.move_servo(self.servos[key].channel, 0);
  });
};

Manager.prototype.stop_motors = function() {
  Robot.motor_controller.motors.forEach(function(motor){
    motor.setSpeed(0);
    motor.run("STOP");
  });
};

Manager.prototype.move_servo = function(servo_number, direction) {
  var self = this;
  this.moving_servo = false;
  var servo = this.servos[servo_number];
  if (direction == 0) {
    servo.center_self();
    return;
  }
  if (direction > 0) {
    direction = 1;
  }
  else if (direction < 0){
    direction = -1;
  }
  var multiplier = 20;
  var delta = direction * multiplier;
  console.log("POSITION BEFORE MOVING ", servo.position);
  var old_position = servo.position;
  var new_position = old_position + delta; 
  console.log("Moving to ", new_position);
  servo.move_to_position(new_position);
};

var Robot = new Manager();

app.get('/move_motor_in_direction/:direction', function (req, res) {
  console.log("Recieved Motor Request.");
  var direction = req.params.direction;
  if (direction == "left" || direction == "right") {
    console.log('LEFT RIGHT');
    return;
  }
  if (direction == "release") {
    direction = "stop"
  } 
  direction = direction.toUpperCase();
  var options = {
    new_motor_speed: 100
  };
  Robot.set_new_speeds(options);
  Robot.motor_controller.motors.forEach(function(motor){
    motor.run(direction);
  });
  res.json({
    response: "Moved motor " + direction
  });
});

app.get('/turn_motor/:direction', function (req, res) {
  console.log("Recieved Motor turn Request.");
  var direction = req.params.direction;
  var motor_map = [];
  if (direction == "left") {
    motor_map = [1,0,0,1];
  }
  else {
    motor_map = [0,1,1,0];
  }
  var options = {
    new_motor_speed: Robot.default_MOTOR_SPEED
  };
  Robot.set_new_speeds(options);
  Robot.motor_controller.motors.forEach(function(motor, index){
    var motors_direction
    if (motor_map[index] == 0) {
      motors_direction = "FORWARD";
    }
    else {
      motors_direction = "BACKWARD";
    }
    motor.run(motors_direction);
  });
  res.json({
    response: "Moved motor " + direction
  });
});

app.get('/servo_reset', function (req, res) {
  Robot.reset_servos();
  res.json({
    response: "Reset all servos"
  });
});

app.get('/move_servo/:servo/:direction', function (req, res) {
  var servo_number = req.params.servo;
  var direction = req.params.direction;
  
  Robot.move_servo(servo_number, direction);

  res.json({
    response: "Moved servo " + Robot.servos[servo_number].name + " to position " + Robot.servos[servo_number].position
  });
});

app.listen(3000, function () {
  console.log('Server Running on 3000');
});

Robot.set_defaults();
// Robot.start_servo_feed();


app.use(express.static(__dirname));

process.on('SIGINT', function () {
  Robot.reset_servos();
  Robot.stop_motors();
  process.exit(1);
});
