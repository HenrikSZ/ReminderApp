/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {PropsWithChildren, useState} from 'react';
import {
  Keyboard,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';

function useVW(): (size: number) => number {
  const width = useWindowDimensions().width;
  return size => (size / 100) * width;
}

function useVH(): (size: number) => number {
  const height = useWindowDimensions().height;
  return size => (size / 100) * height;
}

type ModalProps = {
  isVisible: boolean;
  onFocusLost: () => void;
};

function Modal({
  isVisible,
  onFocusLost,
  children,
}: ModalProps & PropsWithChildren): JSX.Element {
  const vw = useVW();
  const vh = useVH();

  return (
    // eslint-disable-next-line react-native/no-inline-styles
    <View style={{display: isVisible ? 'flex' : 'none'}}>
      <Pressable
        style={[styles.modalWrapper, {width: vw(100), height: vh(100)}]}
        onPress={onFocusLost}
      />
      <View style={[styles.modal, {width: vw(80), left: vw(10)}]}>
        {children}
      </View>
    </View>
  );
}

type Reminder = {
  date: Date;
  title: string;
  description: string;
};

type ReminderCreationViewProps = {
  onCreation: (r: Reminder) => void;
};

function ReminderCreationView({
  onCreation,
}: ReminderCreationViewProps): JSX.Element {
  const [editVisible, setEditVisible] = useState(false);
  const [date, _setDate] = useState(new Date());
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  return (
    <View>
      <Modal isVisible={editVisible} onFocusLost={() => setEditVisible(false)}>
        <Text style={styles.creationViewText}>Customize your reminder</Text>
        <TextInput
          placeholder="Title"
          value={title}
          onChangeText={setTitle}
          style={styles.creationViewTextInput}
        />
        <TextInput
          placeholder="Description"
          value={description}
          onChangeText={setDescription}
          style={styles.creationViewTextInput}
        />
        <TouchableOpacity
          onPress={() => {
            Keyboard.dismiss();
            onCreation({
              title: title,
              description: description,
              date: date,
            });
            setTitle('');
            setDescription('');
            setEditVisible(false);
          }}
          style={styles.creationViewButton}>
          <Text style={styles.creationViewButtonText}>Create</Text>
        </TouchableOpacity>
      </Modal>
      <TouchableOpacity
        onPress={() => setEditVisible(true)}
        style={styles.creationViewButton}>
        <Text style={styles.creationViewButtonText}>Create a new reminder</Text>
      </TouchableOpacity>
    </View>
  );
}

type ReminderViewProps = {
  reminder: Reminder;
};

function ReminderView({reminder}: ReminderViewProps): JSX.Element {
  return (
    <View style={styles.reminderView}>
      <Text style={styles.reminderViewTitle}>{reminder.title}</Text>
      <Text style={styles.reminderViewDescription}>{reminder.description}</Text>
    </View>
  );
}

function App(): JSX.Element {
  const [reminders, setReminders] = useState<Reminder[]>([]);

  return (
    <SafeAreaView style={styles.container}>
      <ReminderCreationView
        onCreation={(reminder: Reminder) =>
          setReminders([...reminders, reminder])
        }
      />
      <ScrollView style={styles.reminderListView}>
        {reminders.map((r, i) => (
          <ReminderView reminder={r} key={i} />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  modalWrapper: {
    opacity: 0.4,
    backgroundColor: 'black',
  },
  modal: {
    padding: 10,
    position: 'absolute',
    backgroundColor: 'white',
    borderRadius: 5,
    top: '20%',
  },
  creationViewText: {
    color: 'black',
    fontSize: 20,
  },
  creationViewTextInput: {
    color: 'black',
    borderColor: 'black',
    borderWidth: 2,
    margin: 2,
    borderRadius: 5,
  },
  creationViewButton: {
    backgroundColor: 'black',
    borderRadius: 5,
    padding: 10,
    margin: 2,
  },
  creationViewButtonText: {
    color: 'white',
  },
  reminderView: {
    backgroundColor: '#479106',
    padding: 5,
    borderRadius: 5,
    margin: 5,
  },
  reminderViewTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  reminderViewDescription: {
    color: 'white',
    fontSize: 15,
  },
  reminderListView: {
    padding: 10,
  },
});

export default App;
