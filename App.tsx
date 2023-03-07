/**
 * Sample Reminder App in React Native.
 *
 * Author: Henrik Zimmermann
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

/**
 * Sizing hook to make responsive design easier. The number
 * passed will be assessed as percentage of the viewport width (vw).
 *
 * @returns a function that converts a width percentage into the
 * actual dimension.
 */
function useVW(): (size: number) => number {
  const width = useWindowDimensions().width;
  return size => (size / 100) * width;
}

/**
 * Sizing hook to make responsive design easier. The number
 * passed will be assessed as percentage of the viewport height (vh).
 *
 * @returns a function that converts a height percentage into the
 * actual dimension.
 */
function useVH(): (size: number) => number {
  const height = useWindowDimensions().height;
  return size => (size / 100) * height;
}

/**
 * Props for the BlurrModal
 * isVisible determines whether this modal should be visible or hidden.
 * onFocusLost is called when the user navigates away from this modal.
 */
type BlurrModalProps = {
  isVisible: boolean;
  onFocusLost: () => void;
};

/**
 * A modal that is based on the react native default Modal. Blurs the background
 * and exits when the user pressed outside of the Modal window.
 */
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
        <View style={styles.modalContent}>{children}</View>
      </ScrollView>
    </Modal>
  );
}

/**
 * The Reminder object type.
 */
type Reminder = {
  date: Date;
  title: string;
  description: string;
};

/**
 * The Props for the ReminderCreationView.
 * onCreation is called when a reminder is created.
 * onFocusLost is called when the modal is navigated away from.
 * isVisible determines whether this modal should be visible or hidden.
 */
type ReminderCreationViewProps = {
  onCreation: (r: Reminder) => void;
  onFocusLost: () => void;
  isVisible: boolean;
};

/**
 * A Modal that facilitates the creation of a reminder.
 */
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
        onChangeText={setTitle}
        style={styles.creationViewTextInput}
      />
      <Text style={styles.creationViewInputDescription}>Description</Text>
      <TextInput
        placeholder="Description"
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

/**
 * The props for the ReminderView
 * reminder is the reminder that should be displayed.
 * onCompletion is called when this reminder is marked as completed.
 * If onCompletion is undefined or null, the reminder is assumed to be
 * completed.
 */
type ReminderViewProps = {
  reminder: Reminder;
  onCompletion?: () => void;
};

/**
 * A view that displays a reminder and facilitates to mark it as completed.
 */
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
              {`${reminder.date.toLocaleDateString()} - ${reminder.date.toLocaleTimeString()}`}
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

/**
 * The main component of the App.
 */
function App(): JSX.Element {
  const [showEditView, setShowEditView] = useState(false);
  const [pendingReminders, setPendingReminders] = useState<Reminder[]>([]);
  const [completedReminders, setCompletedReminders] = useState<Reminder[]>([]);

  return (
    <SafeAreaView style={styles.pageContainer}>
      <ReminderCreationView
        onCreation={(reminder: Reminder) => {
          const newReminders = [...pendingReminders, reminder];
          newReminders.sort((a, b) => a.date.getTime() - b.date.getTime());
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
      <ScrollView>
        <View style={styles.reminderListView}>
          <Text style={styles.reminderListText}>
            {pendingReminders.length === 0 ? 'None Pending' : 'Pending'}
          </Text>
          {pendingReminders.map((r, i) => (
            <ReminderView
              reminder={r}
              key={i}
              onCompletion={() => {
                const newPendingReminders = [...pendingReminders];
                newPendingReminders.splice(i, 1);
                setPendingReminders(newPendingReminders);

                setCompletedReminders([r, ...completedReminders]);
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
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/**
 * All styles needed for the app.
 */
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
    position: 'absolute',
    backgroundColor: 'white',
    borderRadius: 5,
  },
  modalContent: {
    padding: 10,
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
