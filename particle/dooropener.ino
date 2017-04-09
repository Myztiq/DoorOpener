int RELAY1 = D3;
int BUZZER = D1;
bool openOnBuzz = false;

void setup()
{
    Serial.begin(9600);
    pinMode(RELAY1, OUTPUT);
    pinMode(BUZZER, INPUT_PULLDOWN);
    digitalWrite(RELAY1, LOW);

    Particle.function("openDoor", openDoor);
    Particle.function("openOnBuzz", openOnNextBuzz);
}
void loop()
{
    // if (openOnBuzz) {
    //     if (digitalRead(BUZZER) == HIGH) {
    //         openOnBuzz = false;
    //         openDoor("");
    //     }
    // }
}

int openDoor(String data)
{
  digitalWrite(RELAY1, HIGH);
  int time = 10000;
  if (data.length() > 0) {
      time = atoi(data);
  }
  delay(time);
  digitalWrite(RELAY1, LOW);
  return 1;
}


int openOnNextBuzz(String data)
{
    openOnBuzz = true;
    return 1;
}
