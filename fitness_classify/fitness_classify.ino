/*
 * Machine learning model to classify the actions - walking, sitting, standing
 * The model uses data from the built in IMU of the Arduino Nano 33 BLE Sense and
 * uses the model to predict which action is being done. Using this inference it
 * calculates the number of steps taken, the walking time, sitting time, and standing
 * time. Bluetooth Low Energy(BLE) is used to send the results to the web interface.
 * 
 * Code written by Ushan Fernando June 2021
*/

#include <ArduinoBLE.h>
#include <Arduino_LSM9DS1.h>
#include <TensorFlowLite.h>
#include <tensorflow/lite/micro/all_ops_resolver.h>
#include <tensorflow/lite/micro/micro_error_reporter.h>
#include <tensorflow/lite/micro/micro_interpreter.h>
#include <tensorflow/lite/schema/schema_generated.h>
#include <tensorflow/lite/version.h>

#include "model.h"

#define MOTION_THRESHOLD 0.08
#define CAPTURE_DELAY 200 
#define NUM_SAMPLES 50

BLEService fitnessService("b7fb8e6c-0000-4ee6-9dc8-9c45b99a0356");
BLEStringCharacteristic modelCharacteristic("b7fb8e6c-8000-4ee6-9dc8-9c45b99a0356", BLENotify, 255);

const char *GESTURES[] = {
    "walking", "sitting", "standing"
};

#define NUM_GESTURES (sizeof(GESTURES) / sizeof(GESTURES[0]))

bool isCapturing = false;
int numSamplesRead = 0;
float aX, aY, aZ, gX, gY, gZ;

unsigned int stepCount = 0;
unsigned int prevStepCount = 0;
String myValue = "unknown";

unsigned long curTime = 0;
unsigned long prevTime = 0;
unsigned int totalTime = 0;
unsigned int sittingTime = 0;
unsigned int standingTime = 0;
unsigned int walkingTime = 0;
bool isStepsUpdated = false;

tflite::MicroErrorReporter tflErrorReporter;
tflite::AllOpsResolver tflOpsResolver;

const tflite::Model* tflModel = nullptr;
tflite::MicroInterpreter* tflInterpreter = nullptr;
TfLiteTensor* tflInputTensor = nullptr;
TfLiteTensor* tflOutputTensor = nullptr;

constexpr int tensorArenaSize = 8 * 1024;
byte tensorArena[tensorArenaSize];

void setup() {
  pinMode(LED_BUILTIN, OUTPUT);
        
  Serial.begin(9600);

  if (!IMU.begin()) {
    Serial.println("Failed to initialize IMU!");
    while (1);
  }
  Serial.print("Accelerometer sample rate: ");
  Serial.print(IMU.accelerationSampleRate());
  Serial.println(" Hz");
  Serial.print("Gyroscope sample rate: ");
  Serial.print(IMU.gyroscopeSampleRate());
  Serial.println(" Hz");
  Serial.println();

  if (!BLE.begin()){
    Serial.println("Failed to initialize BLE!");
    while (1);
  }

  BLE.setLocalName("Fitness_Data");
  BLE.setAdvertisedService(fitnessService);
  fitnessService.addCharacteristic(modelCharacteristic);
  BLE.addService(fitnessService);
  BLE.advertise();
  
  tflModel = tflite::GetModel(model);
  if (tflModel->version() != TFLITE_SCHEMA_VERSION) {
    Serial.println("Model schema mismatch!");
    while (1);
  }

  tflInterpreter = new tflite::MicroInterpreter(tflModel, tflOpsResolver, tensorArena, tensorArenaSize, &tflErrorReporter);

  tflInterpreter->AllocateTensors();

  tflInputTensor = tflInterpreter->input(0);
  tflOutputTensor = tflInterpreter->output(0);
}

void loop() {

  BLEDevice central = BLE.central();

  if (central){
    digitalWrite(LED_BUILTIN, HIGH);
    
    while (central.connected()){
      if (modelCharacteristic.subscribed()){
        getData();
        timer();
      }
    }
    
    digitalWrite(LED_BUILTIN, LOW);
  }
}

void getData(){
  if (!isCapturing) {
    if (IMU.accelerationAvailable() && IMU.gyroscopeAvailable()) {
     
      IMU.readAcceleration(aX, aY, aZ);
      IMU.readGyroscope(gX, gY, gZ);

      float average = fabs(aX / 4.0) + fabs(aY / 4.0) + fabs(aZ / 4.0) + fabs(gX/2000.0) + fabs(gY/2000.0) + fabs(gZ/2000.0);
      average /= 6;

      if (average >= MOTION_THRESHOLD) {
        isCapturing = true;
        numSamplesRead = 0;
      }
      else{
        return;
      }
    }
  }

  if (isCapturing) {
    if (IMU.accelerationAvailable() && IMU.gyroscopeAvailable()) {

      IMU.readAcceleration(aX, aY, aZ);
      IMU.readGyroscope(gX, gY, gZ);

      tflInputTensor->data.f[numSamplesRead * 6 + 0] = aX / 4.0;
      tflInputTensor->data.f[numSamplesRead * 6 + 1] = aY / 4.0;
      tflInputTensor->data.f[numSamplesRead * 6 + 2] = aZ / 4.0;
      tflInputTensor->data.f[numSamplesRead * 6 + 3] = gX / 2000.0;
      tflInputTensor->data.f[numSamplesRead * 6 + 4] = gY / 2000.0;
      tflInputTensor->data.f[numSamplesRead * 6 + 5] = gZ / 2000.0;

      numSamplesRead++;

      if (numSamplesRead == NUM_SAMPLES) {
        isCapturing = false;
        
        TfLiteStatus invokeStatus = tflInterpreter->Invoke();
        if (invokeStatus != kTfLiteOk) {
          Serial.println("Error: Invoke failed!");
          return;
        }

        int maxIndex = 0;
        float maxValue = 0;
        for (int i = 0; i < NUM_GESTURES; i++) {
          float _value = tflOutputTensor->data.f[i];
          if(_value > maxValue){
            maxValue = _value;
            maxIndex = i;
          }
        }
        
        if (strcmp(GESTURES[maxIndex], "walking") == 0){
          stepCount++;
        }

        myValue = String(GESTURES[maxIndex]);
      }
    }
  }
}

void timer(){
  // Count number of seconds for each action and set value of BLE characteristic every second
  curTime = millis();
  if(curTime - prevTime >= 1000){
    prevTime = curTime;
    totalTime++;
    Serial.println(totalTime);

    isStepsUpdated = stepCount == prevStepCount ? false : true;
    prevStepCount = stepCount;

    if(myValue == "sitting"){
      sittingTime++;
    }
    else if(myValue == "walking" && isStepsUpdated){
      walkingTime++;
    }
    else{
      if(myValue != "unknown"){
        standingTime++;
      }
    }
    modelCharacteristic.setValue(myValue+"x"+String(stepCount)+"x"+String(walkingTime)+"x"+String(standingTime)+"x"+String(sittingTime)+"x"+String(totalTime));
  }
}
