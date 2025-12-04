import { Stack } from 'expo-router';
import React from 'react';
import { Button, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

const TextInputExample = () => {
  const [text, onChangeText] = React.useState('Nama');
  const [number, onChangeNumber] = React.useState('');

  return (
    <SafeAreaProvider>
      <SafeAreaView>
        <Stack.Screen options={{ title: 'Formulir Input' }} />
        <Text style={styles.inputTitle}>Nama</Text>
        <TextInput
          style={styles.input}
          onChangeText={onChangeText}
          placeholder="Isikan Nama"
        />
        <Text style={styles.inputTitle}>Nomor Induk Mahasiswa (NIM)</Text>
        <TextInput
          style={styles.input}
          onChangeText={onChangeNumber}
          value={number}
          placeholder="Isikan NIM"
        />
        <Text style={styles.inputTitle}>Kelas</Text>
        <TextInput
          style={styles.input}
          onChangeText={onChangeText}
          placeholder="Isikan Kelas"
        />
        <View style={styles.button}>
          <Button
            title="Save"
          />
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  input: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 10,
    borderRadius: 5,
  },
  inputTitle: {
    marginLeft: 12,
    marginTop: 10,
    fontSize: 16,
    fontWeight: 600,
  },
  button: {
    margin: 12,
  }
});

export default TextInputExample;