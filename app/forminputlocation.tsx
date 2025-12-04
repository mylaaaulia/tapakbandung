import { db } from '@/app/firebaseConfig';
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import * as Location from 'expo-location';
import { Stack, useRouter } from 'expo-router';
import { push, ref } from 'firebase/database';
import React, { useState } from 'react';
import {
    Alert,
    ImageBackground,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

const CATEGORIES = ['Jelajah Wisata', 'Akses Kampus & Fasilitas', 'Kuliner & Nugas'];

const categoryPlaceholders: { [key: string]: string } = {
    'Jelajah Wisata': 'Contoh: Jam buka, harga tiket, fasilitas...',
    'Akses Kampus & Fasilitas': 'Contoh: Jam operasional, biaya, detail kontak...',
    'Kuliner & Nugas': 'Contoh: Menu andalan, kisaran harga, kecepatan WiFi...',
};

export default function FormInputLocationScreen() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState<string | null>(null);
    const [latitude, setLatitude] = useState('');
    const [longitude, setLongitude] = useState('');
    const [accuracy, setAccuracy] = useState('');
    const [details, setDetails] = useState('');

    const [isPickerVisible, setPickerVisible] = useState(false);

    const getCurrentLocation = async () => {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Izin Lokasi Ditolak', 'Aplikasi ini memerlukan akses lokasi untuk mengisi koordinat secara otomatis.');
            return;
        }

        try {
            let locationData = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
            setLatitude(String(locationData.coords.latitude));
            setLongitude(String(locationData.coords.longitude));
            setAccuracy(locationData.coords.accuracy ? locationData.coords.accuracy.toFixed(2) : '');
            Alert.alert('Sukses', 'Lokasi saat ini berhasil didapatkan.');
        } catch (error) {
            Alert.alert('Gagal Mendapatkan Lokasi', 'Pastikan GPS aktif lalu coba lagi.');
            console.error(error);
        }
    };

    const handleSave = () => {
        if (!name || !description || !category || !latitude) {
            Alert.alert("Input Tidak Lengkap", "Harap isi semua field wajib.");
            return;
        }

        const newLocation = {
            name,
            description,
            category,
            coordinates: `${latitude},${longitude}`,
            accuracy: accuracy ? parseFloat(accuracy).toFixed(2) : null,
            details,
        };

        push(ref(db, 'points/'), newLocation)
            .then(() => {
                Alert.alert("Sukses", "Data lokasi berhasil disimpan.", [
                    { text: 'OK', onPress: () => router.push('/jelajah') }
                ]);
            })
            .catch((e) => {
                console.error("Firebase save error: ", e);
                Alert.alert("Error", "Gagal menyimpan data.");
            });
    };

    const handleSelectCategory = (selectedCategory: string) => {
        setCategory(selectedCategory);
        setPickerVisible(false);
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
            <ImageBackground
                source={require('@/assets/images/bandung.jpg')}
                style={styles.background}
                imageStyle={{ opacity: 0.80 }}  // 🔥 Transparansi background
            >
                <ScrollView
                    style={styles.overlayContainer}
                    contentContainerStyle={styles.contentContainer}
                    keyboardShouldPersistTaps='handled'
                >
                    <Stack.Screen options={{ title: 'Form Input Lokasi Baru' }} />

                    {/* --- INFORMASI UTAMA --- */}
                    <View style={styles.section}>
                        <ThemedText style={styles.sectionTitle}>Informasi Utama</ThemedText>

                        <ThemedText style={styles.inputLabel}>Nama Lokasi (Wajib)</ThemedText>
                        <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Contoh: Jalan Braga" />

                        <ThemedText style={styles.inputLabel}>Deskripsi Singkat (Wajib)</ThemedText>
                        <TextInput
                            style={[styles.input, styles.multilineInput]}
                            value={description}
                            onChangeText={setDescription}
                            placeholder="Deskripsi singkat..."
                            multiline
                        />

                        <ThemedText style={styles.inputLabel}>Kategori (Wajib)</ThemedText>
                        <Pressable style={styles.pickerButton} onPress={() => setPickerVisible(true)}>
                            <ThemedText style={category ? styles.pickerButtonText : styles.pickerButtonPlaceholder}>
                                {category || 'Pilih Kategori'}
                            </ThemedText>
                        </Pressable>
                    </View>

                    {/* --- KOORDINAT --- */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <ThemedText style={styles.sectionTitle}>Koordinat Lokasi</ThemedText>
                            <TouchableOpacity style={styles.locationButton} onPress={getCurrentLocation}>
                                <ThemedText style={styles.locationButtonText}>Gunakan Lokasi Saat Ini</ThemedText>
                            </TouchableOpacity>
                        </View>

                        <ThemedText style={styles.inputLabel}>Latitude</ThemedText>
                        <TextInput style={styles.input} value={latitude} onChangeText={setLatitude} placeholder="-7.7956" />

                        <ThemedText style={styles.inputLabel}>Longitude</ThemedText>
                        <TextInput style={styles.input} value={longitude} onChangeText={setLongitude} placeholder="110.3695" />

                        <ThemedText style={styles.inputLabel}>Akurasi (meter)</ThemedText>
                        <TextInput 
                            style={styles.input} 
                            value={accuracy} 
                            onChangeText={setAccuracy}
                            placeholder='Contoh: 12.5'
                            keyboardType='numeric'
                            editable={true} 
                        />
                    </View>

                    {/* --- FIELD KHUSUS --- */}
                    {category && (
                        <View style={styles.section}>
                            <ThemedText style={styles.sectionTitle}>Field Khusus: {category}</ThemedText>
                            <ThemedText style={styles.inputLabel}>Keterangan Tambahan</ThemedText>
                            <TextInput
                                style={[styles.input, styles.multilineInput]}
                                value={details}
                                onChangeText={setDetails}
                                placeholder={categoryPlaceholders[category]}
                                multiline
                            />
                        </View>
                    )}

                    <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                        <Text style={styles.saveButtonText}>Simpan Lokasi</Text>
                    </TouchableOpacity>

                    {/* --- MODAL KATEGORI --- */}
                    <Modal transparent={true} visible={isPickerVisible} animationType="fade">
                        <Pressable style={styles.modalOverlay} onPress={() => setPickerVisible(false)}>
                            <View style={styles.modalContent}>
                                {CATEGORIES.map((cat) => (
                                    <TouchableOpacity key={cat} style={styles.modalItem} onPress={() => handleSelectCategory(cat)}>
                                        <Text style={styles.modalItemText}>{cat}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </Pressable>
                    </Modal>

                </ScrollView>
            </ImageBackground>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    background: {
        flex: 1,
    },

    overlayContainer: {
        flex: 1,
        backgroundColor: 'rgba(255,255,255,0.15)', // 🔥 Transparansi keseluruhan
    },

    contentContainer: {
        padding: 20,
        paddingBottom: 80,
    },

    /* --- SECTION CARD --- */
    section: {
        marginBottom: 26,
        backgroundColor: 'rgba(255,255,255,0.78)',  // 🔥 Card semi-transparan
        padding: 18,
        borderRadius: 18,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },

    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 14,
    },

    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.light.tint,
    },

    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 6,
        marginTop: 4,
    },

    input: {
        height: 52,
        borderColor: '#D4D8E0',
        borderWidth: 1.4,
        borderRadius: 12,
        paddingHorizontal: 16,
        backgroundColor: 'rgba(255,255,255,0.9)',
        fontSize: 16,
        marginBottom: 14,
    },

    multilineInput: {
        height: 110,
        textAlignVertical: 'top',
        paddingTop: 14,
    },

    inputDisabled: {
        height: 52,
        borderRadius: 12,
        paddingHorizontal: 16,
        backgroundColor: 'rgba(230,230,230,0.6)',
        fontSize: 16,
        marginBottom: 14,
        color: '#555',
    },

    pickerButton: {
        height: 52,
        borderRadius: 12,
        paddingHorizontal: 16,
        justifyContent: 'center',
        backgroundColor: 'rgba(255,255,255,0.9)',
        borderWidth: 1.4,
        borderColor: '#D4D8E0',
    },

    pickerButtonText: {
        fontSize: 16,
        color: '#222',
    },

    pickerButtonPlaceholder: {
        fontSize: 16,
        color: '#9DA3AF',
    },

    locationButton: {
        backgroundColor: 'rgba(227,244,234,0.9)',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 10,
    },

    locationButtonText: {
        color: '#2F7D32',
        fontWeight: '600',
        fontSize: 13,
    },

    saveButton: {
        backgroundColor: Colors.light.tint,
        paddingVertical: 18,
        borderRadius: 14,
        marginTop: 10,
        marginBottom: 30,
        alignItems: 'center',
    },

    saveButtonText: {
        color: '#FFF',
        fontSize: 17,
        fontWeight: '700',
    },

    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.45)',
        justifyContent: 'center',
        alignItems: 'center',
    },

    modalContent: {
        width: '82%',
        backgroundColor: 'rgba(255,255,255,0.92)',
        borderRadius: 18,
        paddingVertical: 12,
    },

    modalItem: {
        paddingVertical: 18,
        borderBottomColor: '#ECECEC',
        borderBottomWidth: 1,
    },

    modalItemText: {
        fontSize: 17,
        textAlign: 'center',
        fontWeight: '500',
        color: '#333',
    },
});