![Fitnetic logo](/images/logo.svg)

## Table of Contents 📘
* [Overview](#overview)
* [Technologies Used](#tech)
* [Tools Required](#tools)
* [Installation Guide](#install)
* [How to use Fitnetic](#using)
* [How the project was made](#how)

# <a name="overview"></a>
## Overview

A fitness tracker built using an [Arduino Nano 33 BLE Sense](https://store.arduino.cc/usa/nano-33-ble-sense). Tracks the user's step count, walking time, sitting time and standing time.

----

# <a name="tech"></a>
## Technologies Used

* [Tensorflow Lite for Microcontrollers](https://www.tensorflow.org/lite/microcontrollers)
* [P5.js](https://p5js.org/)
* [p5.ble.js](https://itpnyu.github.io/p5ble-website/)
* [Chart.js](https://www.chartjs.org/)
* Standard web technologies(HTML, CSS, JavaScript)

----

# <a name="tools"></a>
## Tools Required

* A laptop or phone with Chrome installed
* An [Arduino Nano 33 BLE Sense](https://store.arduino.cc/usa/nano-33-ble-sense)/[Arduino Nano 33 BLE](https://store.arduino.cc/usa/nano-33-ble)
* Micro USB cable
* Portable Battery pack

----

# <a name="install"></a>
## Installation Guide

1. Install the [Arduino IDE](https://www.arduino.cc/en/software)
2. Plug in your Arduino Nano 33 BLE Sense/ Arduino Nano 33 BLE
3. Follow the instructions to set up your board as given [here](https://www.arduino.cc/en/Guide/NANO33BLESense)
4. Install the required libraries:
    * Navigate to Tools > Manage Libraries
    * Search and install the libraries given below:
    * Arduino_LSM9DS1
    * ArduinoBLE
    * Arduino_TensorFlowLite
5. Download this repository
6. Open the [fitness_classify](/fitness_classify) folder and open the [fitness_classify.ino](/fitness_classify/fitness_classify.ino) file.
7. Upload the [fitness_classify.ino](/fitness_classify/fitness_classify.ino) skecth to the board. The upload process might take a few minutes.
8. Once uploaded you are now ready to start using Fitnetic. Go to the [Fitnetic website](https://www.fitnetic.netlify.app) and follow the instructions in the next section.

----

# <a name="using"></a>
## How to use Fitnetic

The [Fitnetic website](https://www.fitnetic.netlify.app) is a web interface that connects to the Arduino Board through BLE. Open the website on your laptop/phone (Using a phone is recommended as it allows you to use Fitnetic while you go about your day with the phone in your pocket). On start up you will get a screen that looks like this.

![Fitnetic settings](/images/fitnetic-1.png)

1. Enter your details in the settings page and save the data. These can be modified any time.
2. Connect your Arduino to a battery pack and clip in onto your waist. Place the battery pack in one of your pant pockets.

![Connect to Bluetooth](/images/fitnetic-2.png)

3. Turn on bluetooth on laptop/phone. Press the Connect to Bluetooth Button and pair with the Fitness_Data device.

![Connected to Bluetooth](/images/fitnetic-3.png)

4. If all goes well, you should see the connect button turn turquoise. This means you're all good to go about using it.

![Press Start Button](/images/fitnetic-4.png)

5. Press the start button, minimize your window to keep the website running and go about your day with your phone or laptop nearby.
    **Important: Keep the website/webapp minimized to keep it connected to the Arduino.**