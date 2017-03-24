#include <math.h>

double Thermistor(int RawADC) {
 double Temp;
 Temp = log(10000.0*((1024.0/RawADC-1))); 
 //Temp = log(10000.0/(1024.0/RawADC-1)); // for pull-up configuration
 Temp = 1 / (0.001129148 + (0.000234125 + (0.0000000876741 * Temp * Temp ))* Temp );
 Temp = Temp - 273.15;            // Convert Kelvin to Celcius
 Temp = (Temp * 9.0)/ 5.0 + 32.0; // Convert Celcius to Fahrenheit
 return Temp;
}

double PhotoResistor(int RawADC) {
  double Max = 1023.0;
  double Min = 25.0;
  double Light;
  Light = ((RawADC-Min)/(Max-Min))*100;
  return Light;
}

void setup() {
 Serial.begin(115200);
}

void loop() {
 String temp = "id 0,type temperature,value "+String(int(Thermistor(analogRead(0))));
 Serial.println(temp);  // display Fahrenheit
 delay(50);
 String brightness = "id 0,type brightness,value "+String(double(PhotoResistor(analogRead(1))));
 Serial.println(brightness);
 delay(50);
}
