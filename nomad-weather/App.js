import { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import * as Location from "expo-location";
import { Fontisto } from "@expo/vector-icons";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const API_KEY = "56dd819787ea339ae6235ad2515a8213";

const icons = {
  Thunderstorm: "lightning",
  Drizzle: "rain",
  Rain: "rains",
  Snow: "snow",
  Atmosphere: "cloudy-gusts",
  Clear: "day-sunny",
  Clouds: "cloudy",
};

export default function App() {
  const [city, setCity] = useState("Loading...");
  const [days, setDays] = useState([]);
  const [ok, setOk] = useState(true);

  const getWether = async () => {
    // Ask Permission
    const { granted } = await Location.requestForegroundPermissionsAsync();
    if (!granted) {
      setOk(false);
    }

    // Get location
    const {
      coords: { latitude, longitude },
    } = await Location.getCurrentPositionAsync({ accuracy: 5 });
    const location = await Location.reverseGeocodeAsync({
      latitude,
      longitude,
    });
    setCity(location[0].city);

    // Get days
    const reponse = await fetch(
      `https://api.openweathermap.org/data/2.5/onecall?lat=${latitude}&lon=${longitude}&exclude=alerts&appid=${API_KEY}&units=metric`
    );
    const json = await reponse.json();
    setDays(json.daily);
  };

  useEffect(() => {
    getWether();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.city}>
        <Text style={styles.cityName}>{city}</Text>
      </View>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.weather}
      >
        {days.length === 0 ? (
          <View style={styles.day}>
            <ActivityIndicator
              size="large"
              color="black"
              style={{ marginTop: 30 }}
            />
          </View>
        ) : (
          days.map((day, i) => (
            <View key={i} style={styles.day}>
              <View style={styles.tempContainer}>
                <Text style={styles.temp}>
                  {parseFloat(day.temp.day).toFixed(1)}
                </Text>
                <Fontisto
                  name={icons[day.weather[0].main]}
                  size={68}
                  color="black"
                />
              </View>
              <Text style={styles.description}>{day.weather[0].main}</Text>
              <Text style={styles.tinyText}>{day.weather[0].description}</Text>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F1D00A",
  },
  city: {
    flex: 1.2,
    justifyContent: "center",
    alignItems: "center",
    // backgroundColor: "red",
  },
  cityName: {
    fontSize: 68,
  },
  weather: {
    // backgroundColor: "blue",
  },
  day: {
    width: SCREEN_WIDTH,
    alignItems: "flex-start",
    paddingHorizontal: 40,
  },
  tempContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },
  temp: {
    marginTop: 30,
    fontSize: 120,
    fontWeight: "bold",
  },
  description: {
    marginTop: -20,
    fontSize: 40,
  },
  tinyText: {
    marginTop: -10,
    fontSize: 30,
  },
});
