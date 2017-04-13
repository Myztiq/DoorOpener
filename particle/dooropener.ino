int RELAY1 = D3;
int BUZZER = A1;
bool openOnBuzz = false;

void setup()
{
  Serial.begin(9600);
  pinMode(RELAY1, OUTPUT);
  digitalWrite(RELAY1, LOW);

  Particle.variable("openOnBuzz", false);
  Particle.function("openDoor", openDoor);
  Particle.function("openOnBuzz", toggleOpenOnNextBuzz);
}
void loop()
{
  if (openOnBuzz && analogRead(BUZZER) > 4000) {
    Particle.variable("openOnBuzz", false);
    openOnBuzz = false;
    openDoor("");
  }
}

int openDoor(String data)
{
  Particle.publish("openDoor called");
  digitalWrite(RELAY1, HIGH);
  int time = 4000;
  if (data.length() > 0) {
      time = atoi(data);
  }
  delay(time);
  digitalWrite(RELAY1, LOW);
  return 1;
}

void unsetOpenOnNextBuzz()
{
  Particle.publish("unsetOpenOnNextBuzz called");
  openOnBuzz = false;
  Particle.variable("openOnBuzz", openOnBuzz);
}

void setOpenOnNextBuzz()
{
  Particle.publish("setOpenOnNextBuzz called");
  openOnBuzz = true;
  Particle.variable("openOnBuzz", openOnBuzz);
}

Timer resetOpenOnBuzz(3 * 1000 * 60, unsetOpenOnNextBuzz, true);

int toggleOpenOnNextBuzz(String data)
{
  Particle.publish("toggleOpenOnNextBuzz called");
  if (openOnBuzz) {
    unsetOpenOnNextBuzz();
  } else {
    setOpenOnNextBuzz();
  }
  return 1;
}
