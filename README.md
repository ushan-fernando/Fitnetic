![Fitnetic logo](/images/logo.svg)

## Table of Contents 📘
* [Overview](#overview)
* [Technologies Used](#tech)
* [Tools Required](#tools)
* [Installation Guide](#install)
* [How to use Fitnetic](#using)
* [How the project was made](#how)
* [Future improvements list](#improve)

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
8. Once uploaded you are now ready to start using Fitnetic. Go to the [Fitnetic website](https://fitnetic.netlify.app) and follow the instructions in the next section.

----

# <a name="using"></a>
## How to use Fitnetic

The [Fitnetic website](https://www.fitnetic.netlify.app) is a web interface that connects to the Arduino Board through BLE. Open the website on your laptop/phone (Using a phone is recommended as it allows you to use Fitnetic while you go about your day with the phone in your pocket). On start up you will get a screen that looks like this.

![Fitnetic settings](/images/fitnetic-1.png)

1. Enter your details in the settings page and save the data. These can be modified at any time.
2. Connect your Arduino to a battery pack and clip in onto your waist. Place the battery pack in one of your pant pockets.

![Connect to Bluetooth](/images/fitnetic-2.png)

3. Turn on bluetooth on laptop/phone. Press the Connect to Bluetooth Button and pair with the Fitness_Data device.

![Connected to Bluetooth](/images/fitnetic-3.png)

4. If all goes well, you should see the connect button turn turquoise. This means you're all good to go about using it.

![Press Start Button](/images/fitnetic-4.png)

5. Press the start button, minimize your window to keep the website running and go about your day with your phone or laptop nearby.
    **Important: Keep the website/webapp open or minimized to keep it connected to the Arduino.**

----

# <a name="how"></a>
## How the project was made

* The main aim of the project was to that it is possible to make helpful, cool, and groundbreaking projects with Tensorflow Lite for Microcontrollers. In order to see the project to completion, I divided up the tasks that needed to be done into four sections.
    * Data Collection
    * Training and making the model
    * Writing the Arduino sketch that will use the model to infer on new data
    * Building the user interface
* For **Data Collection** I used the [Tiny Motion Trainer](https://github.com/googlecreativelab/tiny-motion-trainer) by Google Creative Lab. Following their instructions, I connected to their online [interface](https://experiments.withgoogle.com/tiny-motion-trainer/view/)and used the following settings:
    * Capturing threshold: 0.08
    * Number of samples: 50
    * Delay between captures: 0.2s
* I captured 30 data samples for each of walking, sitting, and standing. I then downloaded the csv files to use for training the model.
* I trained my model on Google Colab using the [fitness_model_trainer.ipynb](/train/fitness_model_trainer.ipynb) script I wrote. I could have used the inbuilt trainer in Tiny Motion Trainer, however, I decided to write my own script to try and learn more about using Tensorflow.
* Once the model was trained, I downloaded the [model.h](fitness_classify/model.h) file and put it in the same folder as the Arduino sketch. This part of the project was the longest as I initially faced issues using both the ArduinoBLE and Arduino_TensorFlowLite libraries.
* After checking off three items from my task list, I was left with the final task of building the user interface. I decided to use standard web technologies and P5.js as I'm comfortable with using these technologies. The whole project took me a month to build and it was an amazing learning experience.

----

# <a name="improve"></a>
## Future Improvements

* Build an android app as the user interface
* Build a dynamic site that stores data in a database and stores activity for each day
* Implement more activities eg: running

----

Thank you for taking a look at this repository!

~ Ushan Fernando😀💻