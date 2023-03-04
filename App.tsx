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
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import DatePicker from 'react-native-date-picker';

const COMPLETED_COLOR = '#479106';
const NOT_COMPLETED_COLOR = '#d92a1a';

function useVW(): (size: number) => number {
  const width = useWindowDimensions().width;
  return size => (size / 100) * width;
}

function useVH(): (size: number) => number {
  const height = useWindowDimensions().height;
  return size => (size / 100) * height;
}

type BlurrModalProps = {
  isVisible: boolean;
  onFocusLost: () => void;
};

function BlurrModal({
  isVisible,
  onFocusLost,
  children,
}: BlurrModalProps & PropsWithChildren): JSX.Element {
  const vw = useVW();
  const vh = useVH();

  return (
    <Modal visible={isVisible} transparent>
      <Pressable
        style={[styles.modalWrapper, {width: vw(100), height: vh(100)}]}
        onPress={onFocusLost}
      />
      <ScrollView
        style={[
          styles.modal,
          {width: vw(90), maxHeight: vh(80), top: vh(10), left: vw(5)},
        ]}>
        {children}
      </ScrollView>
    </Modal>
  );
}

type Reminder = {
  date: Date;
  title: string;
  description: string;
};

type ReminderCreationViewProps = {
  onCreation: (r: Reminder) => void;
  onFocusLost: () => void;
  isVisible: boolean;
};

function ReminderCreationView({
  onCreation,
  onFocusLost,
  isVisible,
}: ReminderCreationViewProps): JSX.Element {
  const [date, setDate] = useState(new Date());
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  return (
    <BlurrModal isVisible={isVisible} onFocusLost={onFocusLost}>
      <Text style={styles.creationViewText}>Create Reminder</Text>
      <Text style={styles.creationViewInputDescription}>Title</Text>
      <TextInput
        placeholder="Title"
        value={title}
        onChangeText={setTitle}
        style={styles.creationViewTextInput}
      />
      <Text style={styles.creationViewInputDescription}>Description</Text>
      <TextInput
        placeholder="Description"
        value={description}
        onChangeText={setDescription}
        style={styles.creationViewTextInput}
      />
      <Text style={styles.creationViewInputDescription}>Date and Time</Text>
      <View style={{alignItems: 'center'}}>
        <DatePicker
          textColor="black"
          date={date}
          onDateChange={setDate}
          mode="datetime"
          key={Date.now()}
        />
      </View>
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
          onFocusLost();
        }}
        style={styles.creationViewButton}>
        <Text style={styles.creationViewButtonText}>Create</Text>
      </TouchableOpacity>
    </BlurrModal>
  );
}

type ReminderViewProps = {
  reminder: Reminder;
  onCompletion?: () => void;
};

function ReminderView({
  reminder,
  onCompletion,
}: ReminderViewProps): JSX.Element {
  return (
    <View
      style={[
        styles.reminderView,
        {
          backgroundColor: onCompletion ? NOT_COMPLETED_COLOR : COMPLETED_COLOR,
        },
      ]}>
      <View style={styles.container}>
        <View style={styles.reminderViewHeader}>
          <View style={styles.reminderViewHeaderLeft}>
            <Text style={styles.reminderViewTitle}>{reminder.title}</Text>
            <Text style={styles.reminderViewDate}>
              {reminder.date.toLocaleDateString()}
            </Text>
          </View>
          <View style={styles.reminderViewHeaderRight}>
            <TouchableOpacity
              onPress={onCompletion}
              style={[
                styles.creationViewButton,
                // eslint-disable-next-line react-native/no-inline-styles
                {display: onCompletion ? 'flex' : 'none'},
              ]}>
              <Text style={styles.creationViewButtonText}>Complete</Text>
            </TouchableOpacity>
          </View>
        </View>
        <Text style={styles.reminderViewDescription}>
          {reminder.description}
        </Text>
      </View>
    </View>
  );
}

function App(): JSX.Element {
  const [showEditView, setShowEditView] = useState(false);
  const [pendingReminders, setPendingReminders] = useState<Reminder[]>([]);
  const [completedReminders, setCompletedReminders] = useState<Reminder[]>([]);

  return (
    <SafeAreaView style={styles.pageContainer}>
      <ReminderCreationView
        onCreation={(reminder: Reminder) => {
          const newReminders = [...pendingReminders, reminder];
          newReminders.sort(
            (a, b) => b.date.getMilliseconds() - a.date.getMilliseconds(),
          );
          setPendingReminders(newReminders);
        }}
        onFocusLost={() => setShowEditView(false)}
        isVisible={showEditView}
      />
      <Text style={styles.reminderPageHeader}>Reminder App</Text>
      <TouchableOpacity
        onPress={() => setShowEditView(true)}
        style={styles.creationViewButton}>
        <Text style={styles.creationViewButtonText}>Create a New Reminder</Text>
      </TouchableOpacity>
      <ScrollView style={styles.reminderListView}>
        <Text style={styles.reminderListText}>
          {pendingReminders.length === 0 ? 'None Pending' : 'Pending'}
        </Text>
        {pendingReminders.map((r, i) => (
          <ReminderView
            reminder={r}
            key={i}
            onCompletion={() => {
              const newPendingReminders = [...pendingReminders];
              newPendingReminders.splice(i);
              setPendingReminders(newPendingReminders);

              const newCompletedReminders = [...completedReminders, r];
              newCompletedReminders.sort(
                (a, b) => b.date.getMilliseconds() - a.date.getMilliseconds(),
              );

              setCompletedReminders(newCompletedReminders);
            }}
          />
        ))}
        <View style={styles.reminderListSeparator} />
        <Text style={styles.reminderListText}>
          {completedReminders.length === 0 ? 'None Completed' : 'Completed'}
        </Text>
        {completedReminders.map((r, i) => (
          <ReminderView reminder={r} key={i} />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  pageContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  reminderPageHeader: {
    color: 'black',
    fontSize: 25,
    fontWeight: 'bold',
    padding: 10,
  },
  modalWrapper: {
    position: 'absolute',
    opacity: 0.4,
    backgroundColor: 'black',
  },
  modal: {
    padding: 10,
    position: 'absolute',
    backgroundColor: 'white',
    borderRadius: 5,
  },
  modalContent: {
    alignItems: 'center',
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  creationViewButtonText: {
    color: 'white',
  },
  creationViewInputDescription: {
    fontSize: 12,
    fontWeight: '400',
    color: 'black',
    marginTop: 2,
  },
  reminderView: {
    padding: 10,
    borderRadius: 5,
    margin: 5,
    flexDirection: 'row',
  },
  reminderViewHeader: {
    flexDirection: 'row',
  },
  reminderViewHeaderLeft: {
    flex: 7,
  },
  reminderViewHeaderRight: {
    flex: 3,
  },
  reminderViewTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  reminderViewDate: {
    color: 'white',
    fontSize: 10,
    fontStyle: 'italic',
  },
  reminderViewDescription: {
    color: 'white',
    fontSize: 15,
  },
  reminderListView: {
    padding: 10,
  },
  reminderListSeparator: {
    backgroundColor: 'black',
    height: 3,
    width: '100%',
  },
  reminderListText: {
    color: 'black',
    fontSize: 20,
    fontStyle: 'italic',
    padding: 5,
  },
});

export default App;
