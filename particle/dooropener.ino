int RELAY1 = D3;
int BUZZER = A1;
bool openOnBuzz = false;
String buzzDuration = "4000";

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
    openDoor(buzzDuration);
  }
}

int openDoor(String data)
{
  Particle.publish("openDoor called");
  int time = 4000;
  if (data.length() > 0) {
    time = atoi(data);
  }
  digitalWrite(RELAY1, HIGH);
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

void setOpenOnNextBuzz(String data)
{
  Particle.publish("setOpenOnNextBuzz called", data);
  Particle.publish(data);
  openOnBuzz = true;
  Particle.variable("openOnBuzz", openOnBuzz);
}

Timer resetOpenOnBuzz(3 * 1000 * 60, unsetOpenOnNextBuzz, true);

int toggleOpenOnNextBuzz(String data)
{
  Particle.publish("toggleOpenOnNextBuzz called", data);
  if (openOnBuzz) {
    unsetOpenOnNextBuzz();
  } else {
    setOpenOnNextBuzz(data);
  }
  return 1;
}
