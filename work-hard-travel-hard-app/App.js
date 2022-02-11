import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  Platform,
} from "react-native";
import { theme } from "./colors";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Fontisto, EvilIcons } from "@expo/vector-icons";
import reactDom from "react-dom";

const STORAGE_KEY_TODO = "@toDos";
const STORAGE_KEY_WORKING = "@working";

export default function App() {
  const [working, setWorking] = useState(true);
  const [text, setText] = useState("");
  const [toDos, setToDos] = useState({});
  const [editText, setEditText] = useState("");

  useEffect(() => {
    loadWorking();
    loadToDos();
  }, []);

  const saveWorking = async (toSave) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY_WORKING, JSON.stringify(toSave));
    } catch (error) {
      console.log(error);
    }
  };

  const loadWorking = async () => {
    try {
      const working = await AsyncStorage.getItem(STORAGE_KEY_WORKING);
      working && setWorking(JSON.parse(working));
    } catch (error) {
      console.log(error);
    }
  };

  const travel = () => {
    setWorking(false);
    saveWorking(false);
  };

  const work = () => {
    setWorking(true);
    saveWorking(true);
  };

  const onChangeText = (payload) => {
    setText(payload);
  };

  const onChangeEditText = (payload) => {
    setEditText(payload);
  };

  const saveToDos = async (toSave) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY_TODO, JSON.stringify(toSave));
    } catch (error) {
      console.log(error);
    }
  };

  const loadToDos = async () => {
    try {
      const toDos = await AsyncStorage.getItem(STORAGE_KEY_TODO);
      toDos && setToDos(JSON.parse(toDos));
    } catch (error) {
      console.log(error);
    }
  };

  const addToDo = async () => {
    if (!text) {
      return;
    }

    // const newToDos = Object.assign({}, toDos, {
    //   [Date.now()]: { text, work: working },
    const newToDos = {
      ...toDos,
      [Date.now()]: { working, text, done: false, editing: false },
    };
    setToDos(newToDos);
    await saveToDos(newToDos);
    setText("");
  };
  const deleteToDo = (key) => {
    const newToDos = { ...toDos };
    delete newToDos[key];
    setToDos(newToDos);
    saveToDos(newToDos);
  };

  const alertByPlatform = (key) => {
    if (Platform.OS === "web") {
      const ok = confirm("Do you want to delete this To Do?");
      ok && deleteToDo(key);
    } else {
      Alert.alert("Delete To Do", "Are you sure?", [
        { text: "Cancel" },
        {
          text: 'I"m sure',
          onPress: () => {
            deleteToDo(key);
          },
        },
      ]);
    }
  };

  const changeDone = (key) => {
    const newToDos = { ...toDos };
    newToDos[key].done = !newToDos[key].done;

    setToDos(newToDos);
    saveToDos(newToDos);
  };

  const changeEditing = (key) => {
    const newToDos = { ...toDos };
    for (let _key of Object.keys(newToDos)) {
      if (_key === key) {
        newToDos[_key].editing = true;
      } else {
        newToDos[_key].editing = false;
      }
    }

    setToDos(newToDos);
    setEditText(newToDos[key].text);
  };

  const saveText = async (key) => {
    const newToDos = { ...toDos };
    for (let _key of Object.keys(newToDos)) {
      if (_key === key) {
        newToDos[_key].editing = false;
      }
    }
    newToDos[key].text = editText;

    setToDos(newToDos);
    await saveToDos(newToDos);
    setEditText("");
  };

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <View style={styles.header}>
        <TouchableOpacity onPress={work}>
          <Text
            style={{
              fontSize: 30,
              fontWeight: "bold",
              color: working ? theme.white : theme.grey,
            }}
          >
            Work
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={travel}>
          <Text
            style={{
              fontSize: 30,
              fontWeight: "bold",
              color: working ? theme.grey : theme.white,
            }}
          >
            Travel
          </Text>
        </TouchableOpacity>
      </View>
      <View>
        <TextInput
          value={text}
          onChangeText={onChangeText}
          onSubmitEditing={addToDo}
          returnKeyType="done"
          placeholder={working ? "Add a To Do" : "Where do you want to go?"}
          style={styles.input}
        />
        <ScrollView>
          {Object.keys(toDos).map((key) =>
            toDos[key].working === working ? (
              <View key={key} style={styles.toDo}>
                <View style={styles.toDoInnerLeft}>
                  <TouchableOpacity onPress={() => changeDone(key)}>
                    <Text>
                      {toDos[key].done ? (
                        <Fontisto
                          name="checkbox-active"
                          size={18}
                          color={theme.grey}
                        />
                      ) : (
                        <Fontisto
                          name="checkbox-passive"
                          size={18}
                          color={theme.grey}
                        />
                      )}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => changeEditing(key)}>
                    {toDos[key].editing ? (
                      <TextInput
                        style={styles.editInput}
                        value={editText}
                        onChangeText={onChangeEditText}
                        onSubmitEditing={() => saveText(key)}
                        returnKeyType="done"
                        autoFocus
                      />
                    ) : (
                      <Text
                        style={
                          toDos[key].done
                            ? styles.toDoTextDone
                            : styles.toDoText
                        }
                      >
                        {toDos[key].text}
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
                <View style={styles.toDoInnerRight}>
                  {toDos[key].editing && (
                    <TouchableOpacity
                      style={styles.editBtn}
                      onPress={() => saveText(key)}
                    >
                      <Text>
                        <EvilIcons name="pencil" size={28} color={theme.grey} />
                      </Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity onPress={() => alertByPlatform(key)}>
                    <Text>
                      <Fontisto name="trash" size={18} color={theme.grey} />
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : null
          )}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg,
    paddingHorizontal: 30,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 100,
  },
  input: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginVertical: 20,
    borderRadius: 30,
    backgroundColor: theme.white,
    fontSize: 18,
  },
  toDo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flex: 1,
    padding: 20,
    marginBottom: 10,
    borderRadius: 10,
    backgroundColor: theme.toDoBg,
  },
  toDoInnerLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  toDoInnerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  editInput: {
    paddingHorizontal: 10,
    marginRight: 20,
    color: theme.white,
    fontSize: 16,
  },
  toDoText: {
    marginLeft: 10,
    color: theme.white,
    fontSize: 16,
    fontWeight: "bold",
  },
  toDoTextDone: {
    marginLeft: 10,
    color: theme.grey,
    fontSize: 16,
    fontWeight: "bold",
    textDecorationLine: "line-through",
  },
  editBtn: {
    marginRight: 10,
  },
});
